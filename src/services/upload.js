import {DB_promise} from './db.js';


const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);


navigator.serviceWorker.onmessage = function(event) {
	var m = event.data;
	
	var progress = m.progress;
	if(!progress) return;

	console.log(m);

	if(m.cmd = 'uploadStart'){
		
	}

	if(m.cmd = 'uploadProgress'){
		
	}

	if(m.cmd = 'uploadEnd'){
		
	}
};

function upload(files){
	return new Promise((ok, no) => {
		DB_promise.then(db => {	
			for(var i = 0, f; f = files[i]; i++){
				var name = f.name;

				if (f.kind === 'file')
					f = f.getAsFile();

				// Only process video and image files.
				if(
					!f.type.match('image.*') && 
					!f.type.match('video.*')
				) continue;
				  

				let item = {
					id: Math.random().toString(36).substr(7),
					name,
					timeCreated: (new Date).getTime(),
					lastModified: f.lastModified,
					type: f.type,
					size: f.size
				};

				if(account.user)
					item.owner = account.user.email;``

				var reader = new FileReader();
				reader.readAsArrayBuffer(f);

				reader.onload = ev => {
					let trans = db.transaction('files', "readwrite");
		  			let store = trans.objectStore('files');
  					
					item.content = ev.target.result;
					var add = store.add(item);
					
					add.onsuccess = ev => {
				        navigator.serviceWorker.controller.postMessage({
							cmd: 'checkFiles'
				        });

						var link = Link(`mongo://${location.host}/files#${item.id}`);
						link.item = item;
						
						ok(link);
					};
					
  					add.onerror = ev => console.log(ev);
				}
			}
		});
	});
};

document.addEventListener('DOMContentLoaded', ev => {
	var body = document.querySelector('#body');
	
	/*
	document.querySelector('#head-upload').addEventListener('click', ev => {
		fileDialog({multiple: true}).then(files => {
			body.upload(files);
		});
	});
	*/

	function cancel(e){
		if (e.preventDefault) e.preventDefault(); // required by FF + Safari
		e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
		return false; // required by IE
	}

	document.addEventListener('dragstart', (ev) => {
		ev.dataTransfer.setData('text/plain', null);
	});

	document.addEventListener('dragend', (ev) => {
	});

	document.addEventListener('dragover', cancel);
	document.addEventListener('dragenter', cancel);
	document.addEventListener('drop', ev => {
		console.log(ev);


		var files;
		if(ev.type == 'drop')
			files = ev.dataTransfer.files;
		else
		if(ev.type == 'paste')
			files = (ev.clipboardData || ev.originalEvent.clipboardData).items;
		
		body.upload(files);
		
		/*
		if(ev.dataTransfer.files.length)
			return this.upload(ev, $thumb);

		var txt = ev.dataTransfer.getData('URL') || ev.dataTransfer.getData('Text');
		*/
		
		ev.preventDefault();
		return false
	}, false);
});

/*
document.addEventListener('DOMContentLoaded', ev => {
	selectAll('.add').map(button => {
		var axon = Axon({
			...button.dataset
		});
	});
});
*/

export {upload};