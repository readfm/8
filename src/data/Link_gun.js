import LinkMain from './LinkMain.js';
export default class Link_gun extends LinkMain{
  constructor(url){
    super(url);

    this.url = url;
    //this.own = true;

    console.log(url);
    if(url.indexOf('://')){
      var [protocol, way] = url.split('://');
      this.protocol = protocol;
      this.p = way.split('/');
      
      this.gun = gun;
      this.p.forEach((path, i) => {
      	if(i) this.gun = this.gun.get('sub');
      	console.log(i);
      	this.gun = this.gun.path(path);
      });

      this.sub = this.gun.get('sub');
    }
  }

  add(item){
  	return new Promise((ok, no) => {
    	this.sub.set(item).once((item, name) => {
	  		let link = new Link(this.url+'/'+name);
	  		link.item = item;
	  		ok(link);
	  	});
    });
  }

  children(cb){
  	var links = [];
  	return new Promise((ok, no) => {
  		this.sub.once(sub => {
  			if(!sub) return cb([]);

	  		var n = Object.keys(sub).length - 1;

	    	this.sub.map().once((item, name) => {
	    		if(!item) return n--;
	    		item.name = item.name || name || item.id;
	    		let link = new Link(this.url+'/'+name);
	    		link.load(itm => {
	    			n--;
	    			if(itm) links.push(link);
	    			if(!n) cb(links);
	    		});
	    	});
  		});
    });
  }

  upload(data){
  	console.log(data);
    return new Promise((ok, no) => {
    	ipfs.add(Buffer.from(data), (err, h) => {
    		console.log(h);
    		if(h && h[0] && h[0].hash){
    			var hash = h[0].hash;
    			this.set({
    				file: 'ipfs://'+hash,
    				size: h[0].size
    			});
    		}
    	});
    });
  }

  download(cb){
    this.load(item => {
	    console.log(item);
    	if(item.file && item.file.indexOf('://')+1){
    		this.link4file = new Link(item.file);

    		console.log(this.link4file);
    		this.link4file.download((data, res) => {
    			console.log(data);
    			cb(data, res);
    		});
    	};
    });
  }

  remove(cb){
  	this.gun.put(null);
  }

  set(set){
    var set = _.clone(set);
    delete set._;
  	this.gun.put(set);
  }

  load(cb){
  	console.log(this);
  	this.gun.once(item => {
  		console.log(item);
  		this.item = _.clone(item);
      if(
        typeof item.file == 'string' && 
        item.file.indexOf('ipfs://')+1
      ){
        this.file_link = Link(item.file);
        this.http = this.file_link.http;
      }

  		cb(this.item);
  	});
  }
}
