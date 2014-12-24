function resetScrolling() {	
	Session.set('scroll', 1);
}


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
	};		
  	resetScrolling();
	this.next();
});

Meteor.startup(function() {
	Session.setDefault('scroll', 1);
  	Session.setDefault('query', { filter: {type : "genre", value : "Drama"}, sortBy : "year"}); 
});
