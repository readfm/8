import account from '../account.js';
const authenticated = account.authenticated;
var Emitter = NPM.Emitter;

export default class Link_fs{
  constructor(url){
    this.url = this.link = url;

    this.supports = ['fs'];
    this.children_key = 'children';
    this.item_file = Cfg.fs.dir_file || 'item.json';

    if(url.indexOf('://')){
      var [protocol, way] = url.split('://');
      this.protocol = protocol;

      var hash_index = way.indexOf('#');
      if(hash_index + 1){
        this.id = way.substr(hash_index+1);
        way = way.substr(0, hash_index);
      }

      if(way){
        var sep = way.indexOf('/');
        this.host = this.hash = sep<0?way:way.substr(0, sep);
		
        var index4port = this.host.indexOf(':');
        if(index4port + 1){
          this.domain = way.substr(0, index4port);
          this.port = way.substr(index4port + 1);
        }
        else{
          this.domain = this.host;
          if(Cookies.get('devMode') == 'on' && this.domain == document.location.host)
          	this.domain = 'localhost';
          this.port = Cfg.port;
          this.host = this.domain + ':' + this.port;
        }

        this.path = sep<0?'/':way.substr(sep+1);

        if(false && this.path.indexOf(':/')<0 && this.path.indexOf(':\\')<0 && this.path[0] != '/')
          this.path = '/'+this.path;

        this.uri = this.path.replace(/^\/+|[^A-Za-z0-9_.:\/~ @-]|\/+$/g, '');

      	this.p = this.uri.split(/[\/]+/);
        this.ext = this.path.split('.').pop().toLowerCase();

        this.name = this.path.split('/').pop();
      }
    }

    if(way.indexOf('localhost/') + 1)
    	way = way.replace('localhost/', 'localhost:8080/');

    this.http = 'http://'+way;

    Emitter(this);
  }

  W(m, cb){
    this.constructor.servers.connect(Cfg.api).then(ws => ws.send(m, cb));
  }

  update(set){
    return new Promise((ok, no) => {
      this.W({
        cmd: 'update',
        id: this.id,
        set,
        domain: this.domain,
        collection: this.collection
      }, r => {
        r.item?ok(r.item):no();
      });
    });
  }

  can(what){
  	return new Promise((ok, no) => {
  		if(what == 'add' || what == 'edit')
			this.load(item => {
				if(!item) return ok();
				
				account.own(item).then(ok,no);
			});
  	});
  }


  set(set, value){
  	this.load(item => {
      if(typeof set == 'string'){
        this.load(item => {
          _.set(item, set, value);
          var varName = set.split('.')[0];
          set = {};
          set[varName] = item[varName];

          this.W({
            cmd: 'set',
            path: this.path,
        	domain: this.domain,
            set
          });

          this.emit('updated');
        });
      }
      else
  	 	if(item.type != 'directory'){
  			this.W({
  				cmd: 'set',
  				path: this.path,
				domain: this.domain,
  				way: ['items', item.name],
  				set
  			});

        	this.emit('updated');
  		}
  		else{
			this.W({
			  cmd: 'set',
			  path: this.path,
			  domain: this.domain,
			  set
			});

        	this.emit('updated');
  		}
	 });
  }

  download(cb){
    this.constructor.servers.connect(this.host).then(ws => {
      ws.download(this.path).then(function(data, file){
        cb(data, file);
      }, r => {cb()});
    });
  }

  upload_url(url, name){
    var path = url;
    if(name){
      var p = path.split('/');
      p.pop();
      p.push(name);
      path = p.join('/');
    }

    return new Promise((ok, no) => {
      this.constructor.servers.connect(Cfg.api).then(ws => {
        this.W({
          cmd: 'fs.download',
          url,
          domain: this.domain,
          path: this.path
        }, r => {
          r.done?ok(r):no(r);
        });
      });
    });
  }

  upload(data){
    return new Promise((ok, no) => {
      this.load(item => {
        this.constructor.servers.connect(Cfg.api).then(ws => {
          ws.upload(data, file => {
            this.info = file;
            this.item = this.format(file);
            ok(file);
          }, {path: this.path});
        });
      });
    });
  }

  order(links){
    var children = [];
    links.forEach(link => {
      var p = link.url.split('/');
      p.pop();
      var folder = p.join('/').replace(/^\/|\/$/g, '');

      var isParent = (this.url.replace(/^\/|\/$/g, '') == folder);

      children.push(isParent?link.name:link.url);
    });

    var set = {};
    set[this.children_key] = children;
    this.set(set);
  }

  save(item){
    if(!item.id) item.id = this.id;
    return new Promise((ok, no) => {
      this.W({cmd: 'set', item, domain: this.domain, path: this.path}, r => {
      	if(!r.done) return no();
        this.item = item;
        ok(item);
        
       	this.emit('updated');
      });
    });
  }

  format(info){
    var item = {
      type: info.type,
      name: this.name,
      time: info.mtimeMs,
      size: info.size
    };

    return item;
  }

  load(cb){
    var itm = this.item;
    if(itm){
      if(itm instanceof Promise)
        return itm.then(item => cb(item));
      return cb(itm);
    }

    this.item = new Promise((k, n) => {
      this.W({
        cmd: 'fs.info',
        mkdirp: true,
        domain: this.domain,
        path: this.path
      }, r => {
        if(r.info){
          this.info = r.info;
          this.item = this.format(r.info);

          if(this.item.type == 'directory'){
            this.W({
              cmd: 'get',
        		domain: this.domain,
              path: this.path,
            }, r => {
    		//	this.item.type = 'folder';
              $.extend(this.item, r.item);
              cb(this.item);
              k(this.item);
            });
          }
          else{
			 	var p = this.path.split(/[\/]+/),
					 fileName = p.pop(),
					 dirPath = p.join('/');
					 
			 	this.parent = Link(this.protocol +'://'+ this.domain + '/' + dirPath);
				this.parent.load(item => {
					if(item.items && item.items[fileName])
						$.extend(this.item, item.items[fileName]);
					
					cb(this.item);
					k(this.item);
				});
          }
        }
        else{
          cb();
          k();
        }
      });
    });
  }

  children(cb){
    this.load(item => {
      this.W({
        cmd: 'fs.list',
        path: this.path,
        domain: this.domain,
        mkdirp: true
      }, r => {
        var links = [],
            sub = {};

        (r.list || []).forEach(name => {
          if(name == this.item_file) return;
          
          let link = sub[name] = Link(this.protocol +'://'+ this.domain + '/' + this.uri + '/' + name);
          links.push(link);
        });

        if(item && item[this.children_key]){
          var newLinks = [];
          item[this.children_key].forEach(url => {
            var link = (url.indexOf('://')+1)?
              L(url):
              Link(this.protocol +'://'+ this.domain + '/' + this.uri + '/' + url);

            var indx = r.list.indexOf(url);
            if(indx+1){
              r.list.splice(indx, 1);
              newLinks.push(link);
            }
            else
            if(url.indexOf('://')+1)
              newLinks.push(link);
          });

          (r.list || []).forEach(name => {
            let link = Link(this.protocol +'://'+ this.domain + '/' + this.uri + '/' + name);
            newLinks.push(link);
          });

          cb(newLinks);
          return;
        }

        cb(links);
      });
    });
  }

  load2Promise(cb){
    return new Promise((ok, no) => {
      this.load(item => {
        item?ok(item):no();
      });
    });
  }
}
