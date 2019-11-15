$(function(){
	var $box = $('#game');
	$(document).bind("keydown", function(ev){
		if($('*:focus').length) return;
		if(ev.keyCode == 38 /*up*/ && ev.ctrlKey){
			if(!$box.hasClass('impose'))
				$box.addClass('impose').css('margin-top', -100);
			else
				$box.css('margin-top', parseInt($box.css('margin-top')) - 20);
		}
		else
		if(ev.keyCode == 40 /*dw*/ && ev.ctrlKey){
			if($box.hasClass('impose') && parseInt($box.css('margin-top')) >= -100)
				$box.removeClass('impose').css('margin-top', 0);
			else
				$box.css('margin-top', parseInt($box.css('margin-top')) + 20);
		}
		else
		if(ev.keyCode == 107 /*+*/ && ev.ctrlKey && ev.shiftKey){
			$box.css('font-size', parseInt($box.css('font-size')) + 1);
		}
		else
		if(ev.keyCode == 109 /*-*/ && ev.ctrlKey && ev.shiftKey){
			$box.css('font-size', parseInt($box.css('font-size')) - 1);
		}
		else
		if(ev.keyCode == 87 /*+*/ && ev.ctrlKey){
			//$box.css('background-color', parseInt($box.css('font-size')) + 1);
		}
		else
		if(ev.keyCode == 79 /*-*/ && ev.ctrlKey){
			//$box.css('font-size', parseInt($box.css('font-size')) - 1);
		}
	});
});