export default class Link_ipfs{
  constructor(u){
    this.supports = ['ipfs'];

    if(typeof u == 'string'){
      if(u.indexOf('://')){
        this.url = this.link = u;

        var [protocol, way] = u.split('://');
        this.protocol = protocol;

        if(way){
          this.uri = way.replace(/^\/+|[^A-Za-z0-9_.:\/~ @-]|\/+$/g, '');

          this.p = this.uri.split(/[\/]+/);
          this.hash = this.p.shift();
          this.path = this.p.join('/');

          this.ext = this.path.split('.').pop();
        }
      }
    }
    else if(typeof u == 'object'){
      $.extend(this, u);
    }

    this.http = 'http://'+Cfg.ipfs.host+':8080/ipfs/'+way;
  }

  static init(){
    return new Promise((ok, no) => {
      import("/libs/ipfs.js").then(r => {
        window.Ipfs.create().then(node => {
          this.node = node;
        });
      });
    });
  }


  upload(data){
    return new Promise((ok, no) => {
      ipfs.add(Buffer.from(data), (err, h) => {
        console.log(h);
        if(h && h[0] && h[0].hash){
          var hash = h[0].hash;
          this.set({
            file: 'ipfs://'+hash
          });
        }
      });
    });
  }

  download(cb){
    console.log(this.hash);
    ipfs.get(this.hash).then(r => {
      console.log(r);
      var res = r[0];
      if(res.content){
        console.log(res.content);
        var doc = new TextDecoder("utf-8").decode(res.content);
        console.log(doc);
        cb(doc, res);
      }
    });
  }
}
