window.acc = window.Acc = {
	user: false,
	avatar: new Image,
	onAvatar: [],
	u: {},
	uN: {},
	users: function(ids, cb){
		if(typeof ids != 'object') return false;
		
		var find = [],
			 fNames = [];
		ids.forEach(function(id, i){
			if(isNaN(id)){
				if(!acc.uN[id])
					fNames.push(id);
			}
			else{
				if(!acc.u[id])
					find.push(id);
			}
		});
		
		if(find.length || fNames.length)
			ws.send({
				cmd: 'load',
				collection: 'acc',
				filter: {
					$or : [
						{id: {$in: find}},
						{name: {$in: fNames}}
					]
				},
				sort: {time: -1}
			}, function(r){
				(r.items || []).forEach(function(u){
					acc.u[u.id] = u;
					acc.uN[u.name] = u;
				});
				cb(acc.u);
			});
		else cb(acc.u);
	},
	
	updateList: function(users){
		users.forEach(function(u){
			acc.u[u.id] = u;
			acc.uN[u.name] = u;
		});
	},
	
	on: [],
	ok: function(user){		
		if(user) acc.user = user;

		$('#acc').show();
		
		if(user.avatar)
			$('#user-avatar').css('background-image', 'url('+Cfg.files+user.avatar+')');

		$('#user-title').text(user.title || user.fullName || user.name || ('#'+user.id));

		$('.a').show();
		$('.na').hide();

		if(user.super)
			$('.super').show();

		acc.u[acc.user.id] = acc.user;
		acc.uN[acc.user.name] = acc.user;
		acc.on.forEach(function(f){
			f(acc.user);
		});
	},

	off: [],
	out: function(){
		console.log('out');
		$('.na').show();
		$('.a').hide();
		acc.user = false;
		$.cookie('sid', null, {path: '/'});

		$('.super').hide();

		acc.off.forEach(function(f){
			f();
		});
	}
}


Site.on.session = function(p){
	$.cookie('sid', p[1], {path: '/'});
	
	location.href = 'http://'+location.host+'#changePassword';
	location.reload();
};

Site.ready.push(function(sid){
	$('#user-auth').attr('src', Cfg.auth.avatar+'?sid='+sid);


	ws.on.updateProfile = function(m){
		if(m.profile && Acc.user)
			Acc.user = m.profile;
	}

	S.acc = function(m){
		if(m.user) acc.ok(m.user);
	}
});

$(function(){
	$('.a,.super').hide();
	
	if(Acc.user) Acc.ok();

	$('#user-login').click(function(){
		window.open(Cfg.auth.site, '_blank', {
			height: 200,
			width: 700,
			status: false
		});
	});


	$('#avatar').click(function(){
		$('#uplAvatar').click();
	});


	$('#acc-logOut').click(function(){
		Acc.out();
	});


	$('.a').hide();
});