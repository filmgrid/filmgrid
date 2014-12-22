Router.route('/', function () {
  Session.set('type','suggested');  
  this.render('homepage', {
	data : {
	 	"navSelected" : "suggested" }
	});
});

Router.route('/bookmarked', function () {
  Session.set('type','bookmarked');
  this.render('homepage', {
	data : {
	 	"navSelected" : "bookmarked" }
	});
});

Router.route('/liked', function () {
  Session.set('type','liked');
  this.render('homepage', {
	data : {
	 	"navSelected" : "liked" }
	});
});
Router.route('/dismissed', function () {
  Session.set('type','dismissed');
  this.render('homepage', {
	data : {
	 	"navSelected" : "dismissed" }
	});
});

Router.onBeforeAction(function() {
	if (!Meteor.userId()) {
		this.render('login');
		return;
	}
	this.next();
});

Router.waitOn(function() {
	Meteor.subscribe('movies', Session.get('query'));
});

Meteor.startup(function() {
  	Session.setDefault('query', { genre: undefined, page: 1 });
});
