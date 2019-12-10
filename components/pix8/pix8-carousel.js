import {DB_promise} from '../../src/services/db.js';
import {upload} from '../../src/services/upload.js';
import account from '../../src/account.js';
import servers from '../../src/data/servers.js';
import pix8_item from './pix8-item.js';

import { LitElement, html, css } from "../../node_mod/lit-element/lit-element.js";
const extend = NPM.extend;

class element extends LitElement{
  static get is(){
    return 'pix8-carousel';
  }

  static get styles(){
    return [css`
        main{
          display: block;
        }

        :host{
          display: block;
          width: 100vw;
          height: 128px;
          position: relative;
          overflow: hidden;
        }

        #list{
			display: flex;
			flex-wrap: nowrap;
			height: 100%;
			width: 100%;
			overflow: auto;
			grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
			scroll-snap-type: x mandatory;
			overflow: auto;
		}

		#list > item{
			margin: 0;
			padding: 0 1px 0 0;
		}

		::slotted(*){
			scroll-snap-align: start;
			vertical-align: middle;
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
     `]
  }

	render(){
		console.log('render', this.view);
		return html`
		  <link rel="stylesheet" href="//var.best/design/components/pix8-carousel.css">

		  <div contentEditable id='name' @change='${this.changeName}'>${this.view.path}</div>
		  <div id='list'>
			${this.srcs().map(src => html`
				<pix8-item src='${src}'></pix8-item>
			`)}
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
		console.log(this.name);
		this.findView(this.name);
	}

	 static get properties() {
		return {
		  name: {
			type: String
		  }
		}
	  }


	changeName(ev){
		var tag = this.select('#name').textContent;
		this.findView(tag);
	}

	findView(path){
		var q = {
			cmd: "get",
			filter: {
				path: path,
				owner: "dukecr",
				type: "view"
			},
			collection: "pix8"
		};
		
		console.log(q);
		servers.connect(this.api).then(ws => {
			ws.send(q, async r => {
				if(r.item){
					extend(this.view, r.item);
					console.log(await this.requestUpdate());
				}
			});
		});
	}
	
	srcs(){
		return (this.view.items || []).map(id => ('mongo://io.cx/pix8#'+id));
	}


	loadItems(){
		var q = {
			cmd: 'load',
			filter: {
				id: {$in: ids}
			},
			collection: 'pix8'
		};

		var srcs = this.generateLinks();


		servers.connect(this.api).then(ws => {
			ws.send(q, r => {
				(r.items || []).map(item => {
					this.links[item.id].item = item;
				});
			});
		});
	}

  init(){
    var list = this.select('#list');
    list.addEventListener('drop', ev => {
        var before;
        for(var i=0; i<ev.composedPath().length; i++){
          let node = ev.composedPath()[i];
          if(node === list) break;
          else if(
            node.classList && 
            node.classList.contains('item')
          )
            before = node;
        };

		var files;
		if(ev.type == 'drop')
			files = ev.dataTransfer.files;
		
		this.upload(files, before);

		ev.stopPropagation();
		ev.preventDefault();
		return false
	}, false);
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }


  upload(files, before, cb){
	upload(files).then(link => {
		this.append(link, before);
		this.saveOrder();

		if(cb) cb(link);
	});
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
