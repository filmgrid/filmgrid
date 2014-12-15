Router.route('/', function () {
  this.render('homepage');
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
