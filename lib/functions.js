window.modal = function(id){
	$('.modal').hide();
	if(id && (id instanceof $ || typeof id == 'string')){
		$('#modal').show();
		var $box = $(id).show(),
			$cont = $box.children('.cont');
		
		if($cont.length>0){
			$box.height($cont.outerHeight());
			$box.width($cont.outerWidth());
		}
		
		return $box;
	}
	else
		$('#modal').hide();
};

$(function(){
	$('.close,#modal').click(modal);
});

$.fn.bindEnter = function(fn){
	var el = this;
	this.bind('keypress', function(e){
		if(e.keyCode==13){
			if(fn) fn.call(this);
			else $(this).blur();
		}
	});
	return this;
};


function addKey(key){
	var keys = ($.cookie('keys') || "").split(';');
	if(keys.indexOf(key) != -1) return;
	keys.push(key);
	
	$.cookie('keys', keys.join(';'))
};

function encode (input){
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                  keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}

Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	return yyyy +'-'+ (mm[1]?mm:"0"+mm[0])+'-' + (dd[1]?dd:"0"+dd[0]); // padding
};

function convertImage(el, type){
	var binary = atob(el.toDataURL("image/"+type, 1).split(',')[1]);
	var array = [];
	for(var i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	return new Blob([new Uint8Array(array)], {type: 'image/'+type});
};

function loadImg(url, cb){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			var bytes = new Uint8Array(this.response);
			
			var img = new Image;
			img.src = 'data:image/jpg;base64,'+encode(bytes);
			cb(img);
		}
	}
	xhr.open('GET', url);
	xhr.responseType = 'arraybuffer';
	xhr.send();
}

function checkEmail(email){
	var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
	return emailPattern.test(email);
}

function randomString(len, charSet) {
    charSet = charSet || 'abcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
};

function fake(){}

(function(){
	function createHandler(divisor,noun,restOfString){
		return function(diff){
			var n = Math.floor(diff/divisor);
			var pluralizedNoun = noun + ( n > 1 ? '' : '' );
			return "" + n + "" + pluralizedNoun + " " + restOfString;
		}
	}

	var formatters = [
		{ threshold: -31535999, handler: createHandler(-31536000,	"year",     "from now" ) },
		{ threshold: -2591999, 	handler: createHandler(-2592000,  	"month",    "from now" ) },
		{ threshold: -604799,  	handler: createHandler(-604800,   	"week",     "from now" ) },
		{ threshold: -172799,   handler: createHandler(-86400,    	"day",      "from now" ) },
		{ threshold: -86399,   	handler: function(){ return      	"tomorrow" } },
		{ threshold: -3599,    	handler: createHandler(-3600,     	"hour",     "from now" ) },
		{ threshold: -59,     	handler: createHandler(-60,       	"minute",   "from now" ) },
		{ threshold: -0.9999,   handler: createHandler(-1,			"second",   "from now" ) },
		{ threshold: 55,       	handler: function(){ return      	"Just now" } },
	//	{ threshold: 60,       	handler: createHandler(1,        	"s",	"ago" ) },
		{ threshold: 3600,     	handler: createHandler(60,       	"m",	"ago" ) },
		{ threshold: 86400,    	handler: createHandler(3600,     	"hr",     "ago" ) },
	//	{ threshold: 172800,   	handler: function(){ return      	"Yesterday" } },
		{ threshold: 604800,   	handler: createHandler(86400,    	"d",      "ago" ) },
		{ threshold: 2592000,  	handler: createHandler(604800,   	"wk",     "ago" ) },
		{ threshold: 31536000, 	handler: createHandler(2592000,  	"mth",    "ago" ) },
		{ threshold: Infinity, 	handler: createHandler(31536000, 	"yr",     "ago" ) }
	];

	Date.prototype.pretty = function(){
		var diff = (((new Date()).getTime() - this.getTime()) / 1000);
		for( var i=0; i<formatters.length; i++ ){
			if( diff < formatters[i].threshold ){
				return formatters[i].handler(diff);
			}
		}
		throw new Error("exhausted all formatter options, none found"); //should never be reached
	}
})();

/*
Date.prototype.pretty = function(format){
	var diff = (((new Date()).getTime() - this.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);

	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		return this.format(format || '{Mon} {dd} {12hr}:{mm} {TT}');
	

	return day_diff == 0 && (
			diff < 60 && "Just now" ||
			diff < 120 && "1m ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + "m ago" ||
			diff < 7200 && "1hr ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + "hr ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + "d ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + "wk ago" ||
		day_diff < 7 && day_diff + "d ago";
}
*/

$.fn.date = function(time){
	var date = new Date(time);
	var $t = this;

	var intr = $t.data('_interval');
	if(intr) clearInterval(intr)

	var upd = function(){
		$t.text(date.pretty());
	}
	$t.data('_interval', setInterval(upd, 60000));
	upd();

	return $t;
}

$.fn.cc = function(c, speed){
	if(!speed) speed = 600;
	if(c)
		this.data('_c', c).each(function(){
			var $el = $(this);
			if($(this).data('_cc')) clearInterval($(this).data('_cc'));
			$el.data('_cc',setInterval(function(){$el.toggleClass(c);},speed));
		});
	else this.each(function(){
		if($(this).data('_cc')){
			$(this).removeClass($(this).data('_c'));
			clearInterval($(this).data('_cc'));
			$(this).data({_c: null, _cc:null});
		}
	});
	return this;
};

$.fn.inp = function(clean){
	var data = {};
	this.find('input.changed, .inp.changed, textarea.changed, .ap').each(function (i){
		var $el = $(this);
		data[$el.attr('name')] = $el.hasClass('check')?($el.hasClass('v')?1:0):$el.val();
		if(clean)$el.removeClass('changed').val('');
	});
	return data;
};

$.fn.blink = function(cls, time, cb){
	cls = cls || 'wrong';
	time = time || 1200;
	var $el = this.addClass(cls);
	setTimeout(function(){
		$el.removeClass(cls);
		if(cb)cb();
	},time);
	return this;
};

$.fn.err = function(msg){
	if(msg){
		$(this).addClass('err');
		if(typeof msg == 'string') $(this).attr('title',msg);
	}
	else if($(this).hasClass('err'))$(this).removeClass('err').removeAttr('title');
	return this;
}

$.fn.extend({
	columnsWidth: function(){
	    // append an empty <span>
	    $this = $(this).append('<span></span>');
	    
	    // grab left position
	    var pos = $this.find('span:last-of-type').position().left;
	    
	    // get prefix for css3
	    var prefix;
	    if (jQuery.browser.webkit) prefix = '-webkit-';
	    else if (jQuery.browser.opera) prefix = '-o-';
	    else if (jQuery.browser.mozilla) prefix = '-moz-';
	    else if (jQuery.browser.msie) prefix = '-ms-';
	   
	    // add the width of the final column
	    pos += parseInt($this.css(prefix + 'column-width'), 10);
	 
	    // subtract one column gap (not sure why this is necessary?)
	    pos -= parseInt($this.css(prefix + 'column-gap'),10);
	    
	    // remove empty <span>
	    $(this).find('span:last-of-type').remove();

	    // return position
	    return pos;
	}
});



var q = {
	txt: function(a){return a?a:''},
	sh: function(a){return a?'show':'hide'},
	ar: function(a){return a?'addClass':'removeClass'},
	sUD: function(a){return a?'slideDown':'slideUp'},
	f: function(){return false},
	p: function(e){
		e.preventDefault();
	}
}

jQuery.extend({
	query: function(url, data, callback) {
		return jQuery.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(data),
			success: callback,
			dataType: "json",
			contentType: "application/json",
			processData: false
		});
	},
	
	disableSelection: function(){
		return this.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
	},
	
	sort: function(comp){
		Array.prototype.sort.call(this, comp).each(function(){
			this.parentElement.appendChild(this);
		});
		return this;
	},
});

jQuery.fn.reverse = [].reverse

String.prototype.url = function () {
	var url = this;
	var preserveNormalForm = /[,_`;\':-]+/gi
	url = url.replace(preserveNormalForm, ' ');

	for(var letter in diacritics)
		url = url.replace(diacritics[letter], letter);

	url = url.replace(/[^a-z|^0-9|^-|\s]/gi, '').trim();
	url = url.replace(/\s+/gi, '-');
	return url;
}

String.prototype.nl2br = function(){
  return (this + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br/>' + '$2');
}

function isNum(num){
	return num == parseInt(num);
}

function dec2rgb(c){
	return (((c & 0xff0000) >> 16)+','+((c & 0x00ff00) >> 8)+','+(c & 0x0000ff));
}

function rgb2dec(r,g,b){
	return (r << 16) + (g << 8) + b;;
}

function rgb2hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function dec2hex(c){
    return "#" + ((1 << 24) + (c & 0xff0000) + (c & 0x00ff00) + (c & 0x0000ff)).toString(16).slice(1);
}

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function color(str){
	if (str.charAt(0) == '#')
		str = str.substr(1,6);

    str = str.replace(/ /g,'').toLowerCase();
	
	var bits;
	if(bits = (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/).exec(str))
		return rgb2dec(parseInt(bits[1]),parseInt(bits[2]),parseInt(bits[3]));
	
	if(bits = (/^(\w{2})(\w{2})(\w{2})$/).exec(str))
		return rgb2dec(parseInt(bits[1],16),parseInt(bits[2],16),parseInt(bits[3],16));
		
	if(bits = (/^(\w{1})(\w{1})(\w{1})$/).exec(str))
		return rgb2dec(parseInt(bits[1] + bits[1], 16),parseInt(bits[2] + bits[2], 16),parseInt(bits[2] + bits[2], 16));
}

function isTransp(str){
	str = (''+str).replace(/\s+/g,'');
	return (str == 'transparent' || str == 'rgba(0,0,0,0)');
}

CanvasRenderingContext2D.prototype.findColors = function(pat){
	var colors = []
	var d = this.getImageData(0, 0, this.canvas.width, this.canvas.height);

	var co = [0,0,0,0,0,0,0];
	for(var i=0;i<d.data.length;i+=4){
		var color = rgb2dec(d.data[i], d.data[i+1], d.data[i+2]);
		co[pat.indexOf(color)]++;
		colors.push(pat.indexOf(color));
	}
	//console.log(co);
	return colors;
};

CanvasRenderingContext2D.prototype.upload = function(cb){
	this.canvas.toBlob(function(blob){
		console.log(blob);
		$.ajax('/', {
			data: blob,
			processData: false,
			success: function(r){
				cb(r.name);
			},
			type: 'PUT'
		});
	});
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(document).scroll(function(){
	$('.fcs').removeClass('fcs');
	$('.tip').hide();
});

$.fn.palette = function(cb){
	var ctx = $(this)[0].getContext('2d');
	var gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
	gradient.addColorStop(0,    "rgb(255,   0,   0)");
	gradient.addColorStop(0.15, "rgb(255,   0, 255)");
	gradient.addColorStop(0.33, "rgb(0,     0, 255)");
	gradient.addColorStop(0.49, "rgb(0,   255, 255)");
	gradient.addColorStop(0.67, "rgb(0,   255,   0)");
	gradient.addColorStop(0.84, "rgb(255, 255,   0)");
	gradient.addColorStop(0.90, "rgb(255,   0,   0)");
	gradient.addColorStop(1, "rgb(100, 100, 100)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
	gradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
	gradient.addColorStop(0.5,  "rgba(0, 0, 0, 0)");
	gradient.addColorStop(1,   "rgba(0, 0, 0, 1)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	function pick(e){
		var pos = $(this).offset(),
			x = e.pageX - pos.left,
			y = e.pageY - pos.top;
		if(x<1 || y<1 || x>this.clientWidth-1 || y>this.clientHeight)return;
		
		var pix = ctx.getImageData(x,y,1,1).data;
		var c = rgb2dec(pix[0],pix[1],pix[2]);
		cb(c);
	}
	return $(this).mousedown(pick).drag(pick);
};

function stripHTML(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

$.fn.hideIf = function(so){
	return this.each(function(){
		if(so)
			$(this).hide();
	});
}

$.fn.showIf = function(so){
	return this.each(function(){
		$(this)[so?'show':'hide']();
	});
}

$.fn.classIf = function(cl, so){
	return this.each(function(){
		$(this)[so?'addClass':'removeClass'](cl);
	});
}

$.fn.upl = function(conf){
	var cfg = {
		multi: false,
		onlyImg: false
	}
	$.extend(cfg, conf);
	
	var n = 0,
		 queue = [],
		 uploading = false;
		 	
	var upload = function(){
		if(uploading || !queue.length){
			if(typeof cfg.onFinish == 'function')
				cfg.onFinish(n);
			return;
		}

		var f = queue.shift();
		uploading = true;
	
		$.ajax('/', {
			data: f,
			processData: false,
			success: function(r){
				if(r.file && typeof cfg.onSuccess == 'function'){						
					cfg.onSuccess({
						fid: r.file.id,
						f: f,
						file: r.file,
						name: f.name,
						type: f.type,
						owner: r.file.owner,
						created: r.file.created,
						size: r.file.size
					});
				}
			},
			complete: function(){
				n++;
				if(typeof cfg.onComplete == 'function')
					cfg.onComplete();
				uploading = false;
				upload()
			},
			type: 'PUT'
		});
	};
		
	return this.each(function(){
		var $upl = $("<input type='file' name='file'/>").appendTo('#uploaders');
		if(cfg.multi)
			$upl.attr('multiple', true);
		
		$upl.bind('change', function(evt){
			evt.preventDefault();
		
			if(typeof cfg.onStart == 'function')
				cfg.onStart();
				
			var files = (evt.target.files || evt.dataTransfer.files);
			if(!files) return false;
			
			for (var i = 0, f; f = files[i]; i++){
				if(cfg.onlyImg && !f.type.match('image.*')) continue;
				queue.push(f);
			}
			this.value = '';
			upload();
		});
		
		$(this).click(function(){
			$upl.click();
		});
	});
}

Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

 $.fn.serializeObject = function(){
     var self = this,
         json = {},
         push_counters = {},
         patterns = {
             "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
             "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
             "push":     /^$/,
             "fixed":    /^\d+$/,
             "named":    /^[a-zA-Z0-9_]+$/
         };


     this.build = function(base, key, value){
         base[key] = value;
         return base;
     };

     this.push_counter = function(key){
         if(push_counters[key] === undefined){
             push_counters[key] = 0;
         }
         return push_counters[key]++;
     };

     $.each($(this).serializeArray(), function(){

         // skip invalid keys
         if(!patterns.validate.test(this.name)){
             return;
         }

         var k,
             keys = this.name.match(patterns.key),
             merge = this.value,
             reverse_key = this.name;

         while((k = keys.pop()) !== undefined){

             // adjust reverse_key
             reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

             // push
             if(k.match(patterns.push)){
                 merge = self.build([], self.push_counter(reverse_key), merge);
             }

             // fixed
             else if(k.match(patterns.fixed)){
                 merge = self.build([], k, merge);
             }

             // named
             else if(k.match(patterns.named)){
                 merge = self.build({}, k, merge);
             }
         }

         json = $.extend(true, json, merge);
     });

     return json;
};

jQuery.uaMatch = function( ua ) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ /]([w.]+)/.exec( ua ) ||
            /(webkit)[ /]([w.]+)/.exec( ua ) ||
            /(opera)(?:.*version|)[ /]([w.]+)/.exec( ua ) ||
            /(msie) ([w.]+)/.exec( ua ) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([w.]+)|)/.exec( ua ) ||
            [];

    return {
            browser: match[ 1 ] || "",
            version: match[ 2 ] || "0"
    };
};

// Don't clobber any existing jQuery.browser in case it's different
if (!jQuery.browser){
    matched = jQuery.uaMatch( navigator.userAgent );
    browser = {};

    if ( matched.browser ) {
            browser[ matched.browser ] = true;
            browser.version = matched.version;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if ( browser.chrome ) {
            browser.webkit = true;
    } else if ( browser.webkit ) {
            browser.safari = true;
    }

    jQuery.browser = browser;
}