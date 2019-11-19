self.importScripts('npm_bundle_sw.js');

window = self;
self.importScripts('./lib/md5.js');


var node;
var orbitdb;
var orbit_links;

var cacheName = 'fractal';

self.addEventListener('install', (event) => {
  console.log('install step');

  event.waitUntil(self.skipWaiting());

  caches.keys().then(function(names) {
      for (let name of names)
          caches.delete(name);
  });
});

self.addEventListener('activate', (event) => {
  console.log('activate step')

  node = new IPFS({
    EXPERIMENTAL: {
      pubsub: true
    }
  });

  node.files.add = node.add;
  node.files.cat = node.cat;
  
  node.on('ready', async () => {
    createProxyServer(a => node, {
      addListener: self.addEventListener.bind(self),
      removeListener: self.removeEventListener.bind(self),
      async postMessage (data) {
        const clients = await self.clients.matchAll()
        clients.forEach(client => client.postMessage(data))
      }
    });

      orbitdb = await OrbitDB.createInstance(node)

      orbit_links = await orbitdb.keyvalue('fractal_links')
  });
  
  node.on('error', (err) => console.log('js-ipfs node errored', err))

  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  //console.log(event, event.request.url);
  if(event.request.url.startsWith(self.location.origin + '/ipfs')){
    const multihash = event.request.url.split('/ipfs/')[1]
    event.respondWith(catAndRespond(multihash));
    return;
  }

  console.log(event.request);
  
  let key = md5('fractal_'+event.request.url);
  let item = orbit_links.get(key);
  console.log(key, item);
  event.respondWith(item?
    catAndRespond(item.file):
    fetch(event.request).then((response) => {
       console.log('before ipfs.add', response);
       console.log(response);
       response.arrayBuffer().then(buffer => {
         let buf = IPFS.Buffer.from(buffer);
         node.add(buf).then(r => {
           if(!r || !r[0]) return;
           let hash = r[0]['hash'];

            let item = {
             url: event.request.url,
             file: hash
            };

            console.log('ipfs.add', item)
             orbit_links.put(key, item).then(r => {
               console.log('ipfs', r);
             });
         });
       });
       return response;
    })
  )
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
  const data = await node.cat(hash)
  const headers = { status: 200, statusText: 'OK', headers: {} }
  return new Response(data, headers)
}

console.log(node);