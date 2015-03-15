// =============================================================================
// FILMGRID - ROUTER
// =============================================================================


Router.onBeforeAction(function() {
  if (Meteor.userId()) {
    this.next();
  } else {
    this.render('login');
  };
});

function configureRoute(that, path, sort) {
  if (Session.get('type') !== path) {
    Session.set('type', path);
    App.trigger('sortChange', sort);
    App.trigger('reload');
  }
  that.render('movies', { data: { nav: path }, waitOn: Meteor.user() });
}

Router.route('/', function() {
  configureRoute(this, 'suggested', 'score');
});

Router.route('/watchlist', function() {
  configureRoute(this, 'bookmarked', 'added');
});

Router.route('/favourites', function() {
  configureRoute(this, 'liked', 'stars');
});

Router.route('/disliked', function() {
  configureRoute(this, 'disliked', 'added');
});

Router.route('/now-playing', function() {
  configureRoute(this, 'playing', 'score');
});

Router.route('/watch-with-friends', function() {
  configureRoute(this, 'friends', 'score');
});

Meteor.startup(function() {
  Session.set('activeMovie', {});
  Session.set('type', null);
  Session.set('search', '');
  Session.set('filter', {});

  Meteor.subscribe('movies').ready(function() {
    App.trigger('reload')
  });
});
