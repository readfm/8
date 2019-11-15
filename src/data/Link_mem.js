import LinkMain from './LinkMain.js';

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

  load(cb){
    if(this.host == 'self'){
      console.log(this);
      var item = eval(this.path);
      cb(item);
    }
  }
}
