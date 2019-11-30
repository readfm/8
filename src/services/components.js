import '../../components/pineal/pineal-tree.js';
import '../../components/pineal/pineal-auth.js';
import '../../components/pineal/pineal-account.js';
import '../../components/pineal/pineal-user.js';
//import './components/pin-catalog.js';
//import './components/pin-item.js';
import '../../components/pineal/pineal-item.js';
//import './components/pineal-htm.js';
import '../../components/fractal/fractal-media.js';
import '../../components/fractal/fractal-options.js';
import '../../components/fractal/fractal-publish.js';
import '../../components/pineal/pineal-gallery.js';
import '../../components/fractal/fractal-rate.js';
import '../../components/pineal/pineal-nav.js';

//import './components/pineal-colors.js';

const default_path = '../components/';
var paths = Cfg.components || {};

window.lazyDefine = (doc) => {
  (doc || document).querySelectorAll('*:not(:defined)').forEach(element => {
  	var brand = element.localName.split('-')[0];
  	const path = paths[element.localName] || paths[brand] || default_path;
    import(path.endsWith('.js')?path:NPM.path.join(path, element.localName+'.js'));
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