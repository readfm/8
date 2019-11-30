/*
window.DB = new Dexie('fractal');
	db.version(1).stores({
	files: '++id, name, age'
});
*/


var DB_req = indexedDB.open("fractal", 3);
DB_req.onupgradeneeded = () => {
  let DB = DB_req.result;

  if(!DB.objectStoreNames.contains("files")){
    var files_store = DB.createObjectStore("files", { keyPath: "id" });  
	files_store.createIndex("domain", "domain", { unique: false }); 
	files_store.createIndex("path", "path", { unique: false }); 
	files_store.createIndex("id", "id", { unique: true }); 
  }
};

var DB_promise = new Promise((ok, no) => {
	DB_req.onsuccess = ev => {
	  ok(DB_req.result);
	};
});

export {DB_promise};