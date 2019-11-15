export default class Link_gaia{
  constructor(url){
    this.url = this.link = url;

    this.supports = ['fs'];
    this.children_key = 'children';
    this.item_file = Cfg.fs.dir_file;

    if(url.indexOf('://')){
      var [protocol, way] = url.split('://');
      this.protocol = protocol;

      if(way){
        var sep = way.indexOf('/');
        if(sep+1){
          this.host = way.substr(0, sep);
          this.path = way.substr(sep+1);
        }
        else{
          this.host = way;
          this.path = this.item_file;
        }

        var [username, host] = this.host.split('@');
        if(host){
          this.username = username;
          this.host = host;
        }


        this.path = this.path.replace(/^\/|\/$/g, '');

        if(this.path.indexOf(':/')<0 && this.path.indexOf(':\\')<0 && this.path[0] != '/')
          this.path = '/'+this.path;

      	this.p = this.path.split(/[\/]+/);
        this.ext = this.path.split('.').pop().toLowerCase();

        this.name = this.path.split('/').pop();
      }
    }

    this.http = 'http://'+this.domain+':'+Cfg.http.port+'/'+protocol+'/'+this.path;
  }

  update(set){
    return new Promise((ok, no) => {
      this.W({
        cmd: 'update',
        id: this.id,
        set,
        collection: this.collection
      }, r => {
        r.item?ok(r.item):no();
      });
    });
  }

  set(set){
    return new Promise((ok, no) => {
      this.load(item => {
        var newItem = _.extend({}, item, set);
        blockstack.putFile(
          JSON.stringify(newItem), 
          {encrypt: false, sign: false}
        ).then(r => {
          this.http = r;
          ok(newItem, r);
        });
  	 });
    });
  }

  download(cb){
    blockstack.getFile(this.path, {
      username: this.username,
      decrypt: false,
      verify: false
    }).then(r => {
      cb(r)
    });
  }

  upload(data){
    return new Promise((ok, no) => {
      blockstack.putFile(
        this.path,
        data, 
        {encrypt: false, sign: false}
      ).then(r => {
        this.http = r;
        this.item = {
          name: this.name
        };
        ok(this.item, r);
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
    blockstack.putFile(
      JSON.stringify(item), 
      {encrypt: false, sign: false}
    ).then(r => {
      this.http = r;
      ok(item, r);
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
        return itm.then(item => cb(item)).catch(err => {
          n(err);
        });
      return cb(itm);
    }

    this.item = new Promise((k, n) => {
      try{
        if(this.ext == 'json')
          blockstack.getFile(this.path, {
            username: this.username,
            decrypt: false,
            verify: false
          }).then(r => {
            if(r && this.ext == 'json'){
              this.item = JSON.parse(r);
              cb(this.item);
              k(this.item);
              return;
            }

            cb(this.item);
            r?k(this.item):n();
          }).catch(err => {
            n(err);
          });
        else{
          this.item = {
            name: this.name
          };
          cb(this.item);
          k(this.item);
        }
      }
      catch(err){
        n(err);
      }
    });
  }
}
