
const default_path = '../components/';
var paths = Cfg.components || {};

window.lazyDefine = (doc) => {
  (doc || document).querySelectorAll('*:not(:defined)').forEach(element => {
  	var brand = element.localName.split('-')[0];
  	const path = paths[element.localName] || paths[brand] || default_path;
    import(path.endsWith('.js')?path:NP.path.join(path, element.localName+'.js'));
  });
}


document.addEventListener('DOMContentLoaded', ev => {
  lazyDefine();
  /*
  document.body.addEventListener( 'DOMNodeInserted', ev => {
    if(event.target.parentNode.localName == 'body'){
      console.dir(ev.target.parentNode);
    };

  }, false );
  */
});