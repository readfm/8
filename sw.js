window = self;

//self.importScripts('npm_bundle_sw.js');
self.importScripts('npm_bundle.js');

self.importScripts('/config.js');

self.importScripts('/libs/ws.js');

self.importScripts('./lib/zangodb.min.js');

var cacheName = 'fractal';

var sync = () => {

}

self.sendAll = m => {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
        client.postMessage(m);
    })
  })
};

self.syncFiles = () => {
  console.log('syncFiles');

  let files = DB.collection('files');

  files.find({synced: {$exists: false}}).toArray().then(items => {
      console.log(items);

      items.map(item => {
        if(ws.items[item.id]) return;

          var content = item.content;
          delete item.content;

          console.log(item, content);
          ws.upload(content, file => {
            console.log(file);
            files.update({
              $set: {
                synced: (new Date).getTime()
              }
            });
          }, item);
      });
  });
}

self.addEventListener('install', (event) => {
  console.log('install step');

  event.waitUntil(self.skipWaiting());
  
  self.items = {};

  caches.keys().then(function(names) {
      for (let name of names)
          caches.delete(name);
  });
});

self.addEventListener('activate', (event) => {
  console.log('activate step');

  var cfg_ws = {
    server: Cfg.api,
    autoReconnect: true
  };

  let ws = self.ws = new WS(cfg_ws);

  ws.on.session = m => {
    this.sid = ws.sid = m.sid;
    ws.session = m;
  };

  ws.onUploadProgress = m => {
    self.sendAll({
      cmd: 'uploadProgress',
      progress: m
    });
  };

  ws.onUploadStart = m => {
    self.sendAll({
      cmd: 'uploadStart',
      progress: m
    });
  };

  
  ws.onUploadEnd = m => {
    self.sendAll({
      cmd: 'uploadEnd',
      progress: m
    });
  };

  
  self.DB = new zango.Db('fractal', {
      files: ['id', 'domain', 'path', 'owner']
  });
  
  self.DB_req = indexedDB.open("fractal", 3);
  DB_req.onupgradeneeded = () => {
    let DB = DB_req.result;

    if(!DB.objectStoreNames.contains("files")){
      var files_store = DB.createObjectStore("files", { keyPath: "id" });  
      files_store.createIndex("domain", "domain", { unique: false }); 
      files_store.createIndex("path", "path", { unique: false }); 
      files_store.createIndex("id", "id", { unique: true }); 
    }
  };


  /*
  let node = self.node = new IPFS({
    EXPERIMENTAL: {
      pubsub: true
    },
    repo: "ipfs/shared",
    config: {
      "Bootstrap": [
        '/ip4/216.98.11.205/tcp/4003/ws/QmfJiAoAcG2SUePngtGwyiiYDuyfX7m942UsrKe6kZBRQc'
      ]
    }
  });
  */

  /*
  self.node.files.add = self.node.add;
  self.node.files.cat = self.node.cat;
  
  node.on('ready', async () => {
    createProxyServer(a => node, {
      addListener: self.addEventListener.bind(self),
      removeListener: self.removeEventListener.bind(self),
      async postMessage (data) {
        const clients = await self.clients.matchAll()
        clients.forEach(client => client.postMessage(data))
      }
    });
  });
  
  node.on('error', (err) => console.log('js-ipfs node errored', err))

  event.waitUntil(self.clients.claim())
  */
});

self.addEventListener('fetch', (event) => {
  //console.log(event, event.request.url);
  let db = self.DB_req.result;

  if(event.request.url.startsWith(self.location.origin + '/files')){
    let store = db.transaction('files', "readwrite").objectStore('files');
    
    let id = event.request.url.split('/files/')[1];
    console.log(id);
    console.log(store, store.get(id));
	var g = store.get(id);

     var prom = new Promise((ok, no) => {
       g.onsuccess = ev => {
         console.log(ev);
        let item = g.result;
        const head = {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Disposition': `inline; filename="${item.name}"`,
            'Content-Type': item.type,
            'Content-Size': item.size,
          }
        };
        let re = new Response(item.content, head);
        ok(re);
       };
     });
	
	event.respondWith(prom);
  }
  else
  if(event.request.url.startsWith(self.location.origin + '/ipfs')){
    const multihash = event.request.url.split('/ipfs/')[1]
    event.respondWith(catAndRespond(multihash));
    return;
  }
  else
   event.respondWith(
     // Open the cache
     caches.open(cacheName)
       .then((cache) => {
         // Look for matching request in the cache
         return cache.match(event.request)
           .then((matched) => {
             // If a match is found return the cached version first
             if (matched) {
               return matched;
             }
             // Otherwise continue to the network
             let url = event.request.url.replace('http:', 'https:');
             return fetch(url)
               .then((response) => {
                 // Cache the response
                 cache.put(event.request, response.clone());
                 // Return the original response to the page
                 return response;
               });
           });
       })
  );
});

self.addEventListener('message', function(event){
  var m = event.data;

  if(m.cmd == 'checkFiles')
    syncFiles();
});

/*
  console.log(event);

  return;
  event.respondWith(
    caches.open(cacheName).then((cache) => {
       return cache.match(event.request)
         .then((matched) => {
           return matched || fetch(event.request)
             .then((response) => {
               //console.log(response);
               cache.put(event.request, response.clone());
               return response;
             });
         });
     })
  );
});
*/
async function catAndRespond (hash) {
  console.log('respond: ', hash);
  const data = await self.node.cat(hash)
  const headers = { status: 200, statusText: 'OK', headers: {} }
  return new Response(data, headers)
}