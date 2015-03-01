function resetVariables() {	
	$('#search').val('');
	Session.set('searchString', "");
	Session.set('searchResults', undefined);
	Session.set('scroll', 1);
	Session.set('previousActiveId',null);
}

function configureRoute(route, that) {
  if (Session.get('type') != route)
  {
  	resetVariables();
  	Session.set('type',route);  
  	console.log("ROUTE CHANGED")
  }
  that.render('homepage', {
	data : {
	 	"navSelected" : route },
	waitOn : Meteor.user()
	});
}

Router.route('/', function () {
  configureRoute('suggested', this);
});

Router.route('/bookmarked', function () {
  configureRoute('bookmarked', this);
});

Router.route('/liked', function () {
  configureRoute('liked', this);
});
Router.route('/dismissed', function () {
  configureRoute('dismissed', this);
});

Router.onBeforeAction(function() {
	if (!Meteor.userId()) {
		this.render('login');
		return;
	};		
	this.next();
});

Meteor.startup(function() {
	Session.setDefault('previousActiveId',null);
	Session.setDefault('activeMovie', {});
  	Session.setDefault('query', { filter: {}, sortBy : "year" }); 
  	Session.setDefault('rePosition', null); 
  	Session.setDefault('scroll', 1);
  	resetVariables();
});
