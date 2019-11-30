import Link_fs from './Link_fs.js';
import Link_http from './Link_http.js';
import Link_mongo from './Link_mongo.js';
import Link_ipfs from './Link_ipfs.js';
import Link_gaia from './Link_gaia.js';
import Link_mem from './Link_mem.js';
import Link_gun from './Link_gun.js';
import Link_local_storage from './Link_local-storage.js';
import Link_chrome_storage from './Link_chrome-storage.js';
import Link_chrome_b from './Link_chrome-bookmark.js';

import Axon from '../neuro/Axon.js';

import servers from './servers.js';

Link_mongo.servers = Link_fs.servers = Link_http.servers = servers;

var links = {

};

window.Link = window.L = function(u){
  if(typeof u == 'string'){
    var url = u;

    if(url[0] == '/'){
      document.location.origin + url;
    }

    if(links[url])
      return links[url];

    if(url.indexOf('://')){
      let [protocol, way] = url.split('://');

      var link;

      if(protocol == 'mongo')
        link = new Link_mongo(url);
      else
      if(protocol == 'fs' || protocol == '')
        link = new Link_fs(url);
      else
      if(protocol == 'http')
        link = new Link_http(url);
      else
      if(protocol == 'ipfs')
        link = new Link_ipfs(url);
      else
      if(protocol == 'gaia')
        link = new Link_gaia(url);
      else
      if(protocol == 'gun')
        link = new Link_gun(url);
      else
      if(protocol == 'mem')
        link = new Link_mem(url);
      else
      if(protocol == 'local-storage')
        link = new Link_local_storage(url);
      else
      if(protocol == 'chrome-storage' || protocol == 'chrome-local')
        link = new Link_chrome_storage(url);
      if(protocol == 'chrome-bookmark')
        link = new Link_chrome_b(url);

      
      links[url] = link;
      return link;
    }
  }
  else
  if(typeof u == 'object'){
    if(u.protocol == 'mongo'){
      return new Link_mongo(u);
    }
  }
};
