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
  Session.set('type', path);
  that.render('movies', { data: { nav: path }, waitOn: Meteor.user() });
  App.trigger('sortChange', sort);
  App.trigger('reload')
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
  this.render('now-playing', { data: { nav: 'playing' } });
  App.trigger('clean')
});

Router.route('/watch-with-friends', function() {
  this.render('watch-with-friends', { data: { nav: 'friends' } });
  App.trigger('clean')
});

Meteor.startup(function() {
  Session.set('activeMovie', {});
  Session.set('search', '');
  Session.set('filter', {});

  Meteor.subscribe('movies').ready(function() {
    App.trigger('reload')
  });
});
