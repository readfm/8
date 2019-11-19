window.Cfg = {
	port: 4251,
	host: 'io.cx',
	server: 'localhost:8080',
	gun: {
		path: 'http://gun.io.cx:8765/gun'
	},
	
	components: {
		pix8: '../../components/pix8'
	},

	http:{
		port: 3000
	},

	fs: {
		dir_file: 'item.json'
	},

	ipfs: {
		host: 'localhost',
		port: '5001',
		protocol: 'http' 
	},

	files: 'http://files.io.cx/'
};


Cfg.api = 'io.cx:443/ws';

if(location.host.indexOf('.lh')+1){
	Cfg.server = 'pineal.lh';
	//Cfg.api = 'localhost';
}
