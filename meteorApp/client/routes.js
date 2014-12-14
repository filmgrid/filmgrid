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

Meteor.startup(function() {
  	Session.setDefault('query', { genre: undefined, page: 1 });
});
