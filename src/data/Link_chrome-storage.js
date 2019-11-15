import LinkMain from './LinkMain.js';
export default class Link_chrome_storage extends LinkMain{
  constructor(url){
    super(url);

    this.url = this.link = url;
    this.own = true;

    this.storage_type = 'sync';

    if(url.indexOf('://')){
      var [protocol, way] = url.split('://');
      if(protocol == 'chrome-local')
        this.storage_type = 'local';

      this.protocol = protocol;
      this.way = '/'+way;
    }
  }

  add(item){
    var doSet = {};
    var path = this.way;
    if(path[path.lenth-1] != '/') path += '/';
    path += item.name;
    doSet[path] = item;
    return new Promise((ok, no) => {
      chrome.storage[this.storage_type].set(doSet, res => {
        let url = this.protocol+'://'+path.substr(1);
        let link = Link(url);
        link.item = item;

        this.load(itm => {
          let children = itm.children || [];
          children.push(item.name);

          this.set({children});

          ok(link);
        });
      });
    });
  }

  upload(data){
    return new Promise((ok, no) => {
      var doSet = {};
      doSet[this.way] = data;
      chrome.storage[this.storage_type].set(doSet);
      ok();
    });
  }

  download(cb){
    chrome.storage[this.storage_type].get(this.way, r => {
      cb(r[this.way]);
    });
  }

  remove(cb){
    chrome.storage[this.storage_type].remove(this.way, cb);
  }

  set(set){
    this.load(item => {
      _.extend(item, set);
      var doSet = {};
      doSet[this.way] = item;
      console.log(doSet, this);
      chrome.storage[this.storage_type].set(doSet);
    });
  }

  load(cb){
    chrome.storage[this.storage_type].get(this.way, r => {
      this.item = r[this.way];
      if(this.item)
        cb(this.item);
      else{
        this.tryDefault(cb);
      }
    });
  }
}
