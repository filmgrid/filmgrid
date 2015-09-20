// =================================================================================================
// FILMGRID - MOVIE
// =================================================================================================


var $window = $(window);
var interactions = 0;

var moviesCache = {};

var countries = {
  de: 'Germany',
  ca: 'Canada',
  fr: 'France',
  au: 'Australia',
  nz: 'New Zealand',
  uk: 'United Kingdom',
  us: 'United States'
};

Template.movie.events = {

    'click .movie-bookmark' : function (e) {
        updateProfile(this, { type: 'bookmarked' });
    },

    'click .movie-like3' : function (e) {
        $(e.target.parentNode.parentNode).removeClass('status-liked1 status-liked2').addClass('status-liked3');
        updateProfile(this, { type: 'liked', score: 3 });
    },

    'click .movie-like2' : function (e) {
        $(e.target.parentNode.parentNode).removeClass('status-liked1 status-liked3').addClass('status-liked2');
        updateProfile(this, { type: 'liked', score: 2 });
    },

    'click .movie-like1' : function (e) {
        $(e.target.parentNode.parentNode).removeClass('status-liked3 status-liked2').addClass('status-liked1');
        updateProfile(this, { type: 'liked', score: 1 });
    },

    'click .movie-dislike': function(e) {
        updateProfile(this, { type: 'disliked' });
    },

    'click .movie-hide': function(e) {
        updateProfile(this, { type: 'hidden' });
    },

    'click .movie-poster-shadow': function(e) {
      var activeMovie = Session.get('activeMovie');
      if (this.id === activeMovie.id) {
        Session.set('activeMovie', {});
        Session.set('activeMovie'+this.id, false);
      } else {
        if (activeMovie) Session.set('activeMovie'+activeMovie.id, false);
        Session.set('activeMovie', this);
        Session.set('activeMovie'+this.id, true);
      }
      App.trigger('reposition');
      Session.set('flipped', false);

      var id = this.id;
      if (!(id in moviesCache)) {
        Session.set('reloadMovie'+id, false);
        moviesCache[id] = null;  // avoid repeated loading
        Meteor.call('getData', { id: id}, function(error, result) {
          console.log('load data for ' + result.title);
          moviesCache[id] = result;
          Session.set('reloadMovie'+id, true);
        });
      }
    },

    'click .trailer': function(e) {
      Session.set('flipped', true);
    },

    'click .trailer-return': function(e) {
      Session.set('flipped', false);
    }
};

Template.movie.helpers({
  openClass: function() {
    return Session.get('activeMovie' + this.id) ? 'open' : '';
  },

  data: function(value) {
    Session.get('reloadMovie'+this.id);
    var m = moviesCache[this.id];
    return m ? m[value] : null;
  },

  flippedClass: function() {
    return Session.get('activeMovie' + this.id) && Session.get('flipped') ? 'flipped' : '';
  },

  showTrailer: function() {
    return Session.get('activeMovie' + this.id) && Session.get('flipped');
  },

  status: function() {
    Session.get('movieStatus'+this.id);
    return this.statusType + this.statusScore;
  },

  loggedIn: function() {
    return Session.get('loggedIn');
  },

  movieGenres: function() {
    Session.get('reloadMovie'+this.id);
    if (!moviesCache[this.id]) return;
    return moviesCache[this.id].genres.join(', ');
  },

  countries: function() {
    Session.get('reloadMovie'+this.id);
    if (!moviesCache[this.id]) return;
    return _.map(moviesCache[this.id].streaming.netflix.countries, function(c) { return { name: countries[c] } });
  },

  numberOfVotes: function() {
    Session.get('reloadMovie'+this.id);
    if (!moviesCache[this.id]) return;

    var v = '' + moviesCache[this.id].votes_imdb;
    if (v < 999) return v;
    if (v < 9999) return v[0] + ',' + v.substring(1,4);
    if (v < 999999) return Math.round(moviesCache[this.id].votes_imdb/1000) + 'k';
    return Math.round(moviesCache[this.id].votes_imdb/1000000) + 'm';
  },

  moviePlot: function() {
    Session.get('reloadMovie'+this.id);
    if (!moviesCache[this.id]) return;

    return moviesCache[this.id].plot.replace(/\s\-\-\s/g, '—')
               .replace(/\s\"/g, ' “')
               .replace(/\"\s/g, '” ')
               .replace(/\s\'/g, ' ‘')
               .replace(/\'\s/g, '’ ')
               .replace(/\'/g, '’');
  },

  netflixCountries: function() {
    Session.get('reloadMovie'+this.id);
    if (!moviesCache[this.id]) return;

    return moviesCache[this.id].streaming.netflix.countries.join(', ')
  },

  and: function(a, b) { return a && b; },
  or:  function(a, b) { return a || b; }
});

function updateProfile(movie, status) {

  var statusType = movie.statusType;
  if (!statusType) throw new Error('This is strange Dr Watson, this movie has no status type...');

  if (status.type === statusType && status.type != 'liked') {
    // Let's put it back in suggested if it is unclicked from dismissed or bookmarked
    movie.statusType = 'suggested';
    movie.statusScore = '';
    flash($('#nav-link-suggested'), 'bounce', 600);
  } else {
    movie.statusType = status.type;
    movie.statusScore = status.score ? status.score : '';
    if (!(status.type === statusType && status.type == 'liked')) flash($('#nav-link-' + status.type), 'bounce', 600);
  }

  // Remember time of last action
  movie.changed = new Date();

  // Re position : the clicked stuff should disappear
  if (Session.get('activeMovie').id === movie.id) {
    Session.set('activeMovie' + movie.id, false);
    Session.set('activeMovie', {});
  }

  // Update Db
  var user = Meteor.user();
  if (user) {
    var newActionCount = (user.profile.actions || 0) + 1
    Session.set('actionCount', newActionCount);
    var $set = {};
    $set['profile.movies.' + movie.id]  = movie;
    Meteor.users.update({ _id: Meteor.userId()}, { $set: $set, $inc : {'profile.actions' : 1} });
  }

  Session.set('lastRatedMovieId', movie.id);
  App.trigger('reload');
  Session.set('movieStatus'+movie.id, movie.statusType+movie.statusScore);

  // Recompute recommendations at regular intervals
  interactions++;
  if (interactions % 3 == 0) Meteor.call('recomputePreferences');
}
