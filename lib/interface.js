window.ui = window.UI = {
	modal: function(selector){
		ui.closeModals();
		$('#modal').show();

		var $modal = $(selector),
				modal = $modal.data();

		$modal.height(50);
		$modal.fadeIn('fast');
		$modal.height(Math.min($modal[0].scrollHeight + 15, $('body').height() - 50));

		(modal.onOpen || CB)(modal);

		return $modal;
	},

	closeModals: function(){
		$('#modal').css('opacity', 0.7).hide();
		$('.modal').hide();
		console.trace();
	},

	side: function(selector, right){
		var $side = $(selector);

		//ui.closeSides();
		setTimeout(function(){
			$side.show().css({
				right: right || 0
			}).trigger('open');
		}, 50);

		return $side;
	},

	closeSides: function(sel){
		if(!sel) sel = '.side';
		$(sel).each(function(){
			var $side = $(this);
			$side.css($side.hasClass('right')?'right':'left', -($side.outerWidth()+10));

			setTimeout(function(){
				if(parseInt($side.css('right')) < -100)
					$side.trigger('close');
			}, 700);
		});
	},

	openApp: function(selector){
		$('.app').hide();
		return $(selector).show();
	}
}

$(function(){
	ui.closeModals();
	ui.closeSides();
	$('.side > .x').click(function(){
		ui.closeSides(this.parentNode);
	});

	/*
	$(window).resize(function(ev){
		var $modal = $('.modal:visible');
		console.log(ev);
		if(!$modal.length) return;
		$modal.height(50);
		console.log($modal[0].scrollHeight);
		$modal.height(Math.min($modal[0].scrollHeight+15, $('body').height() - 50));
	});
	*/

	$(document).on('click', '.x', function(event){
		if($(event.target).parents('.slide').length)
			$(event.target).parents('.slide').slideUp();
	});

	$(document).ajaxSend(function(){
		$('#logo').addClass('spin');
	})
	.ajaxStop(function(){
		$('#logo').removeClass('spin');
	});


	$('#modal').click(ev => {
		UI.closeModals();
	});

	$(document).on('click', '.modal .x', ev => {
		UI.closeModals();
	});

	$(document).click(function(ev){
		//console.log(ev.target);
		if(
			!$(ev.target).parents('.side').length &&
			!$(ev.target).hasClass('side') &&
			$(ev.target).is(':visible') &&
			!$(ev.target).parents('.tip').length &&
			!$(ev.target).hasClass('tip') &&
			!$(ev.target).parents('.modal').length &&
			!$(ev.target).parents('.options').length &&
			!$(ev.target).parents('.stay').length &&
			$(ev.target).attr('id') != 'modal'
		){
			ui.closeSides();
		}
	});

	document.addEventListener('dragover', ev => ev.preventDefault(), false);


	$(document).on('click', '.select', function(){
		$(this).addClass('active').siblings('.select').removeClass('active');
	});

	$(document).on('click', '.check, .bub', function(ev){
		ev.preventDefault();
		var $bub = $(this);
		ev.stopPropagation();
		if($bub.hasClass('disabled')) return;
		$bub.toggleClass('v');
		return false;
	});
});
