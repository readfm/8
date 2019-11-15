class element extends HTMLElement{
  static get is(){
    return 'pix8-gallery';
  }

  static get template(){
    return`
      <style>
        main{
          display: block;
        }

        :host{
          display: block;
        }


        @media screen and (max-width: 1400px){
          pix8-item {
            awidth: calc(50% - 20px);
          }
        }
      </style>

      <link rel="stylesheet" href="//${Cfg.server}/design/components/fractal-gallery.css">

      <style>
        :host([view='fill']) #list, :host([view='carousel']) #list{
          display: block;
          white-space: nowrap;
          overflow: auto;
        }

        
        :host([view='fill']) ::slotted(*), :host([view='carousel']) ::slotted(*){
          margin-bottom: 1px;
          height: calc(100% - 3px);
          width: unset;
        }


        :host([view='fill']) ::slotted(*){
        	width: 100%;
        }
      </style>

      <div id='list'>
        <slot></slot>
      </div>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = element.template;

    var list = this;
    list.addEventListener('drop', ev => {
        var before;

        var path = ev.composedPath();
        for(var i=0; i<path.length; i++){
          let node = path[i];
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

  connectedCallback(){
	const src = this.getAttribute('src');
	if(src)	this.load(src);
  }

  load(src){
  	if(this.link) return;

	this.link = Link(src);
	
	this.link.children(links => {
	  this.placeLinks(links);
	});
  }


  static get observedAttributes(){
    return ['src', 'view'];
  }

  attributeChangedCallback(name, oldValue, value){
    switch(name){
      case 'src':
		this.load(value);
        break;

      case 'view':
        this.changeView(value);
        break;
    }
  }

  changeView(name){

  }

  upload(files, before, cb){
  	return new Promise((ok, no) => {
		for(var i = 0, f; f = files[i]; i++){
			var fileName = f.name;

			if (f.kind === 'file'){
				f = f.getAsFile();
			}

			//if(!f.type.match('image.*')) continue;

			var reader = new FileReader();
			reader.onload = (ev2) => {
				if(this.link.protocol == 'fs'){
				  const url = this.link.url +'/'+ fileName;

				  var link_file = new Link(url);
				  link_file.upload(ev2.target.result).then(r => {
					this.append(link_file, before).then($item => {
					  this.saveOrder();
					});

					if(cb) cb(link_file);
				  });
				}
			}
			reader.readAsArrayBuffer(f);
		};
  	});
  }

  append(link, before){
    let div = document.createElement('div');
    
    var list = this;
    
    if(before === true) list.insertBefore(div, list.firstChild);
    else if(before instanceof HTMLElement) list.insertBefore(div, before);
    else list.appendChild(div);
    
    return new Promise((ok, no) => {
      link.load(item => {
        if(!item) return div.remove();
        let $item = $('<fractal-media>', {
          src: link.url
        });

        $item[0].classList.add('item');
        
        $(div).replaceWith($item);

        ok();
      });
    });
  }
  
  saveOrder(){
    var links = [];

    var list = this;
    
    for(let i = 0; i<list.children.length; i++){
        let node = list.children[i];
        
        links.push(node.link);
    }

    this.link.order(links);
  }

  placeLinks(links){
    var list = this;
    while(list.firstChild){
      list.removeChild(list.firstChild);
    };

    links.forEach(link => this.append(link));
	
	if(this.getAttribute('view') != 'fill')
		this.includeAdd();
  }

  includeAdd(){
  	this.link.can('add').then(() => {
		var upl = document.createElement('button');
		upl.id = 'upload';
		upl.classList.add('fas');
		upl.classList.add('fa-plus');
    	this.appendChild(upl);

    	upl.addEventListener('click', ev => {
			fileDialog().then(files => {
				console.log(files);
				this.upload(files, upl);
			});
    	});
	});
  }
};


window.customElements.define(element.is, element);
