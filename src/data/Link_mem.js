import LinkMain from './LinkMain.js';
const J = NPM.urljoin;

export default class Link_mem extends LinkMain{
  constructor(url){
    super(url);

    this.url = this.link = url;

    this.children_key = 'children';

    if(url.indexOf('://')){
      var [protocol, way] = url.split('://');
      this.protocol = protocol;


      if(way){
        var sep = way.indexOf('/');
        if(sep+1){
          this.host = way.substr(0, sep);
          this.path = way.substr(sep+1);
        }
      }
    }
  }

  /*
  set(set){
    if(this.host == 'self'){
      var item = eval(this.path);
      _.extend(item, set);
    }
  }
  */

  children(cb){
    this.load(item => {
      let items = [];

      var sub = item.sub || item.children;

      if(!sub) return cb([]);

      if(sub.length)
        items = sub;
      else
        for(let key in sub){
          let itm = sub[key];
          if(itm.name) itm.name = key;
          items.push(itm);
        }

      items = items.sort((a, b) => {
        if(!a.order && !b.order) return 0;
        if(!a.order && b.order) return 1;
        if(a.order && !b.order) return -1;
        return a.order - b.order;
      });

      let links = [];

      items.map(itm => {
        let link;
        if(typeof itm == 'string')
          link = Link(itm);
        else{
          link = Link(J(this.url, itm.name));
          link.item = itm;
        }
        
        links.push(link);
      });

      cb(links);
    });
  }

  load(cb){
    if(this.item) return cb(this.item);
    if(this.host == 'self'){
      let path = this.path;
      path.replace(/\//g, ".sub.");
      var item = eval(path);
      cb(item);
    }  
  }
}
