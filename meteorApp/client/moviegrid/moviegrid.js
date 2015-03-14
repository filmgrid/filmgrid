// =================================================================================================
// FILMGRID - MOVIEGRID
// =================================================================================================


// -------------------------------------------------------------------------------------------------
// Setup and Config

var $list;

var filters = {
  genre: function(m, value) { return m.genre.indexOf(value) !== -1; },
  title: function(m, value) {
    // TODO better searching
    // TODO generate search string in db (+ keywords)
    var words = value.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');
    var searchStr = m.title .toLowerCase() + ' ' + m.actors.toLowerCase();
    return _.all(words, function(w) { return searchStr.indexOf(w) !== -1; });
  }
};

var sorts = {
  az: function(m) { return m.title; },
  year:  function(m) { return -m.year; },
  stars: function(m) { return -(m.statusScore || 0); },
  popularity: function(m) { return -m.score_imdb || 0; },
  score: function(m) { /* TODO sort by recommendation score */ return -m.revenue || 0; },
  added: function(m) { /* TODO sort by date added to list */ return -m.year; }
};


// -------------------------------------------------------------------------------------------------
// Movie List

var selectedMovies = [];
var allMovies = [];
var movieCache  = {};
var shownMovies = [];

function searchMovies(search) {
  Meteor.call('searchMovies', search, function(error, result) {
    selectedMovies = _.sortBy(result.score);
    selectedMovies = _.map(result, function(x) { return x.movie; });
    // TODO filtering + sorting
    initialiseMovies();
  });
}

function lookupMovies(type, search, sort, filter) {
  var user = Meteor.user();
  if (!user) return;
  var movies = user.profile.movies;

  // Select movies on current page
  movies = _.filter(movies, function(m) { return m.statusType === type; });

  // Filter movies
  _.each(filter, function(value, type) {
    if (value) movies = _.filter(movies, function(m) { return filter[type](m, value); });
  });

  // Search movies
  if (search > 1) {
    movies = movies.filter(function(m) { return filter.title(m, search); });
  }

  // Sort movies
  if (sort) movies = _.sortBy(movies, sort);

  selectedMovies = movies;
  initialiseMovies();
}

function selectMovies() {
  var type = Session.get('type');
  var search = Session.get('search');
  var sort = Session.get('sort');
  var filter = Session.get('filter') || {};

  // TODO Loading icons, what happens if you search <2 letters

  if (search.length > 1 && type === 'suggested') {
    // Global Search
    searchMovies(search);
  } else {
    lookupMovies(type, search, sort, filter);
  }
}

function initialiseMovies() {
  if (!$list) return;

  // Reset all existing movies
  _.each(allMovies, function(m) {
    m.wasShown = m.show;
    m.show = false;
  });

  // Infinite scrolling
  var scroll = Session.get('scroll');
  selectedMovies.slice(0, 40 + scroll*20);

  // Create or update all selected movies
  shownMovies = _.map(selectedMovies, function(m) {
    if (movieCache[m.id]) {
      m.show = true;
      movieCache[m.id].data = m;
    } else  {
      var dom = UI.renderWithData(Template.movie, m, $list[0]);
      var movie = { data: m, el: $(dom.lastNode()), show: true, wasShown: false };
      allMovies.push(movie);
      movieCache[m.id] = movie;
    }
    return movieCache[m.id];
  });

  positionMovies(true);
}


// -------------------------------------------------------------------------------------------------
// Movie Positioning

var gridWidth = 900;
var movieWidth = 160;
var movieHeight = 220;
var gapWidth = 2;
var gridColumns = 5;

var previousActiveId = null;
var previousGridHeight = null;

function positionMovies(hideOrShow) {
  if (!$list) return;

  // Compare with previously active movie --------------------------------------

  var activeMovie = Session.get('activeMovie');

  var previousActiveIndex = (activeMovie.id && activeMovie.id !== previousActiveId) ?
      findIndex(shownMovies, function(x) { return x.data.id === previousActiveId }) : -1;

  var activeIndex = activeMovie.id ?
      findIndex(shownMovies, function(x) { return x.data.id === activeMovie.id }) : -1;

  var previousActiveId = activeMovie.id || null;


  // Resize Grid ---------------------------------------------------------------

  var rows = Math.ceil((shownMovies.length + (activeIndex >= 0 ? 5 : 0))/gridColumns);
  var gridHeight = rows * (movieHeight + gapWidth) - gapWidth;

  setTimeout(function() {
    $list.css('height', gridHeight + 'px');
  }, gridHeight <= previousGridHeight ? 600 : 0);
  previousGridHeight = gridHeight;


  // Calculate Movie Positions -------------------------------------------------

  var computedActiveIndex = activeIndex;
  if (previousActiveIndex >= 0 && activeIndex > previousActiveIndex) {
    computedActiveIndex += 2;
    if (activeIndex > previousActiveIndex + gridColumns - 3) computedActiveIndex += 3;
    swap(shownMovies, activeIndex, computedActiveIndex);
  }
  activeIndex = computedActiveIndex;

  var activeColumn = activeIndex % gridColumns;
  var shift = Math.max(0, activeColumn - (gridColumns - 3));

  _.each(shownMovies, function(m, i) {

    if (activeIndex >= 0) {
      if (shift > 0) {
        if (i == activeIndex - 1 || (shift == 2 &&  i == activeIndex - 2)) {
          i++;
        } else if (i == activeIndex) {
          i = activeIndex - shift;
          swap(shownMovies, activeIndex, activeIndex - shift);
        }
      }
      if (i > activeIndex - shift) i += 2;
      if (i > activeIndex - shift + gridColumns - 1) i += 3;
    }

    var x = (i % gridColumns) * (movieWidth + gapWidth);
    var y = Math.floor(i / gridColumns) * (movieHeight + gapWidth);

    m.el.css('transform', 'translate(' + x + 'px, ' + y + 'px)');
  });


  // Hide or show movies -------------------------------------------------------

  if (!hideOrShow) return;
  document.body.offsetTop;

  _.each(allMovies, function(m) { 
    if (m.show && !m.wasShown) {
      m.el.addClass('on');
    } else if (!m.show && m.wasShown) {
      m.el.removeClass('on');
    }     
  });
}


// -------------------------------------------------------------------------------------------------
// Template Setup

var loadMore = throttle(function() {
  var scroll = Session.get('scroll');
  Session.set('scroll', scroll + 1);
  initialiseMovies();
}, 300);

var resize = throttle(function() {
  gridWidth = $list ? $($list).width() : 900;
  gridColumns = Math.floor(gridWidth / (movieWidth + gapWidth));
  if ($list.length) positionMovies();
}, 300);

Template.moviegrid.helpers({
  hasMovies: function() { return shownMovies.length > 0; },
  listClass: function() { return (shownMovies.length > 0) ? '' : 'empty'; }
});

App.on('reload', function() { selectMovies(); });
App.on('reposition', function() { positionMovies(); });

Template.moviegrid.rendered = function() {

  var $body = $('body');
  var $window = $(window);
  $list = $(this.find('.movie-list'));

  $window.on('resize', resize);
  resize();

  $window.scroll(function() {
    if ($window.scrollTop() + $window.height() > $body.height() - 400) loadMore();
  });

};
