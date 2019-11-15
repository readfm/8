tippy.setDefaults({
  placement: 'bottom',
  animation: 'perspective',
  arrow: true
});

var qs = q => document.querySelector(q);

if(Cookies.get('devMode')){
  //Cfg.server = '';
  Cfg.api = 'localhost:4251';
}


import './chrome.js';

import types from './neuro/types.js';

//import './data/wysiwyg.js';

//import stack from './services/blockstack.js';

//import "/node_modules/time-elements/dist/time-elements-legacy.js";

var domain = location.host.split('.').slice(-2).join('.');


window.Index = {
  apps: {},
  types
};


//import './styling.js';

import {setColor} from './services/colors.js';
Index.setColor = setColor;

import './data/Link.js';


//import icons from './data/fa.js';
//Index.fa = icons;

//import image from './items/image.js';
//import item from './items/item.js';

//import FA_pick from './modals/FA_pick.js';

import './datas.js';

import './body/mobile.js';

import './services/components.js';
import './services/side.js';
import './services/upload.js';

import './account.js';

$(ev => {
  window.addEventListener('hashchange', ev => {
    var app = qs(window.location.hash);
    $(app).addClass('selected').siblings().removeClass('selected');
  });
});

window.addEventListener('DOMContentLoaded', (event) => {
  let eve = new CustomEvent('pineal_ready', { detail: {}});
  document.dispatchEvent(eve);
});