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