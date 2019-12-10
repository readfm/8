import {DB_promise} from '../../src/services/db.js';
import {upload} from '../../src/services/upload.js';
import account from '../../src/account.js';
import servers from '../../src/data/servers.js';

import '/node_modules/interactjs/dist/interact.min.js';

import '/libs/jquery.event.drag.js';

import { LitElement, html, css } from "../../node_mod/lit-element/lit-element.js";
const extend = NPM.extend;

class element extends LitElement{
  static get is(){
    return 'pix8-container';
  }

  static get styles(){
    return [css`
        main{
          display: block;
        }

        :host{
			display: block;
			width: 100%;
			position: relative;
			overflow: hidden;
        }

		::slotted(button:hover){
			opacity: 1;
		}

		::-webkit-scrollbar {
			height: 2px;
			background-color: transparent;
		}

		::-webkit-scrollbar-thumb {
			background-color: #9f9f9f80;
			border-radius: 5px;
		}

		*{
			outline: none;
		}

		#nav{
			width: 100%;
			position: absolute;
			bottom: 0;
			height: 32px;
			background: #1119;
			backdrop-filter: blur(4px);
			border: 0;
			opacity: 0;
			transition: opacity .5s;
			touch-action: none;
		}

		#nav:hover, #nav:focus-within{
			opacity: 1;
		}

		#name{
			width: 100%;
			border: 0;
			height: 100%;
			font-size: 16px;
			color: white;
			padding: 4px 6px;
			background: transparent;
		}
     `]
  }

	render(){
		console.log('render');
		return html`
			<div id='list'>
				<slot></slot>
			</div>
			<div id='nav'>			
				<input id='name' @change='${this.changeName}' value='${this.view.name || ''}'/>
			</div>
		`;
	}

	constructor(){
		super();

		this.api = 'io.cx';
		this.view = {};
		this.links = {};
		this.list = [];
	}

	connectedCallback(){
		super.connectedCallback();
		//this.findView(this.name);
	}


	firstUpdated(){
		this.init_resize();
	}

	 static get properties() {
		return {
			name: {
				type: String
			}
		}
	  }


	changeName(ev){
		var tag = this.select('#name').value;
		
		var carousel = document.createElement('pix8-carousel');
		carousel.name = tag;
		this.append(carousel);
	}

	upload(files, before, cb){
		upload(files).then(link => {
			this.append(link, before);
			this.saveOrder();

			if(cb) cb(link);
		});
	}

	init_resize(){
		var $tag = this.$('#name');

		var lastCarousel;
		interact(this.select('#nav')).draggable({
			onstart: ev => {
				lastCarousel = this.querySelector('pix8-carousel:last-of-type');
			},
			onmove: ev => {
				lastCarousel.style.height =  lastCarousel.offsetHeight + ev.dy;
			},
			onend: ev => {
				console.log(ev);
			}
		});

		return;

		var $cover = this.$('#cover');
		var container = this;
		jQuery.event.special.drag.defaults.not = '';
		$tag.drag("start", function(ev, dd){
			dd.height = parseInt($(container).height());
			var $carousel = $(container).children('pix8-carousel').last();
			console.log($(container).children('pix8-carousel'));
			dd.carouselHeight = $carousel.height();
			dd.left = $carousel[0].scrollLeft;
			dd.clientX = ev.clientX;
			dd.done = 0;

			$cover.show();
		}, {click: true}).drag(function(ev, dd){
			var onTop = !($(this).css('top') == 'auto'),
				delta = dd.deltaY * (onTop?1:(-1));

			var dif = dd.deltaY - dd.done;
			dd.done = dd.deltaY;


			var $carousel = $(container).children('pix8-carousel').last(),
				carousel = $carousel[0];

			var height = $carousel.height() + dif;
			if(height){
				$carousel.height(height);
				carousel.resize();
			}

			if(!$carousel.height())
				carousel.$t.remove();

			//Site.resizeNext(Pix.$pic.next(), -dif);

			var newL = (dd.left + dd.clientX) * $carousel.height() / dd.carouselHeight,
				dif = newL - dd.left - dd.clientX;
			carousel.scrollLeft = dd.left + dif;
		}).drag("end", function(ev, dd){
			$cover.hide();
			var height = $(container).height();
			//chrome.storage.local.set({height: height});
			//chrome.runtime.sendMessage({cmd: 'resize', height: height});
			//Pix.leaveGap(height);
			//onScroll();
		});
	}



	select(selector){
		return this.shadowRoot.querySelector(selector);
	}

	$(selector){
		return $(this.shadowRoot).find(selector);
	}

  appenda(link, before){
  	console.log(link, before);
    let div = document.createElement('div');
    
    var list = this.select('#list');

    var upl = this.select('#upload');
    
    if(before === true) list.insertBefore(div, list.firstChild);
    else if(before instanceof HTMLElement) list.insertBefore(div, before);
    else upl?list.insertBefore(div, upl):list.appendChild(div);
    
    return new Promise((ok, no) => {
      link.load(item => {
        if(!item) return div.remove();
        let $item = $('<fractal-media>', {
          src: link.url
        });

        $item[0].classList.add('item');
        if(this.getAttribute('view') == 'fill')
        	$item[0].classList.add('fill');
        
        $(div).replaceWith($item);

        ok();
      });
    });
  }
  
  saveOrder(){
    var links = [];

    var list = this.select('#list');
    
    for(let i = 0; i<list.children.length; i++){
        let node = list.children[i];
        
        links.push(node.link);
    }

    this.link.order(links);
  }

  placeLinks(links){
    var list = this.select('#list');;

    while(list.firstChild){
      list.removeChild(list.firstChild);
    };

    links.forEach(link => this.append(link));
	
	//if(this.getAttribute('view') != 'fill')
  }

  includeAdd(){  		
	var upl = document.createElement('button');
	upl.id = 'upload';
	upl.textContent = '+';
	this.select('#list').appendChild(upl);

	upl.addEventListener('click', ev => {
		fileDialog().then(files => {
			console.log(files);
			this.upload(files, upl);
		});
	});
  }
};


window.customElements.define(element.is, element);
