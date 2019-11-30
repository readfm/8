class Servers{
  constructor(){
      this.list = {};
  }

  connect(host){
    var pp = host.indexOf(':');

    if(host.substr(pp) == ':80')
      host = host.substr(0, pp);
    
    return new Promise((ok, no) => {
      var wsp = this.list[host];
      if(wsp){
        if(wsp instanceof Promise)
          return wsp.then(ws => {
            ok(ws);
          });

          return ok(wsp);
      }

      this.list[host] = new Promise((k, n) => {
        let ws = new WS({
          server: host,
          sid: Cookies.get('sid_'+md5(host))
          //autoReconnect: true
        });

        ws.on.session = m => {
          this.sid = ws.sid = m.sid;
          ws.session = m;
          Cookies.set('sid_'+md5(host), this.sid);
          this.list[host] = ws;
          ok(ws);
          k(ws)
        };
      });
    });
  }
}

let servers = new Servers();
export default servers;