import "/libs/ipfs.js";
if(window.IpfsHttpClient){
  window.ipfs = new IpfsHttpClient(Cfg.ipfs);
}