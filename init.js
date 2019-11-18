
//window.self = {};
import './npm_bundle_sw.js';

import './npm.js';


const createProxyClient = NPM['ipfs-postmsg-proxy'].createProxyClient;

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js')
    .then((registration) => {
      console.log('-> Registered the service worker successfuly')

		
      
      window.IPFS_node = createProxyClient({
        addListener: navigator.serviceWorker.addEventListener.bind(navigator.serviceWorker),
        removeListener: navigator.serviceWorker.removeEventListener.bind(navigator.serviceWorker),
        postMessage: (data) => navigator.serviceWorker.controller.postMessage(data)
      });
     
    })
    .catch((err) => {
      console.log('-> Failed to register:', err)
    });
}