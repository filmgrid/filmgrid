// =================================================================================================
// FILMGRID - MOVIEGRID
// =================================================================================================


// -------------------------------------------------------------------------------------------------
// Setup and Config

var $list;
var $noMovies;

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

var allMovies = [];
var movieCache  = {};
var shownMovies = [];

var selectedMovies = [];
var queryCache = '';
var scroll = 0;

// Handles global search
function searchMovies(str) {
  console.log('Search Movies');
  Meteor.call('search', str, function(error, result) {
    selectedMovies = _.sortBy(result, function(x) { return -x.score * x.revenue; });
    selectedMovies = _.map(selectedMovies, function(x) { return x.obj; });
    
    _.each(selectedMovies, function(m) { m.id = m._id });  // TODO fix this

    // TODO sorting + filtering options ?

    initialiseMovies();
  });
}

// Finds and filter user movies
function lookupMovies(type, search, sort, filter) {
  var user = Meteor.user();
  if (!user) return;
  var movies = user.profile.movies;
  console.log('Load Movies');

  // Select movies on current page
  movies = _.filter(movies, function(m) { return m.statusType === type; });

  // Filter movies
  _.each(filter, function(value, type) {
    if (value) movies = _.filter(movies, function(m) { return filters[type](m, value); });
  });

  // Search movies
  if (search.length > 1) {
    movies = movies.filter(function(m) { return filters.title(m, search); });
  }

  // Sort movies
  if (sort) movies = _.sortBy(movies, sorts[sort]);

  selectedMovies = movies;
  initialiseMovies();
}

// Finds an array of selected movies (search, filters, etc.)
function selectMovies() {
  var type = Session.get('type');
  var search = Session.get('search');
  var sort = Session.get('sort');
  var filter = Session.get('filter') || {};


  // Update scroll position when the query changes -----------------------------

  var query = [type, search, sort, filter.genre].join('|');
  if (query !== queryCache) {
    scroll = 0;
    scrollTo(0, 600);
    queryCache = query;
  }


  // TODO Loading icons, what happens if you search <2 letters


  // Load Data -----------------------------------------------------------------

  if (search.length > 1 && type === 'suggested') {
    // Global Search
    searchMovies(search);
  } else {
    lookupMovies(type, search, sort, filter);
  }
}

// Creates the movie objects and dom elements for all requred movies
function initialiseMovies() {
  if (!$list) return;
  console.log('Initialise Movies');

  // Reset all existing movies
  _.each(allMovies, function(m) {
    m.wasShown = m.show;
    m.show = false;
  });

  // Infinite scrolling
  var movies = selectedMovies.slice(0, 40 + scroll * 20);

  // Create or update all selected movies
  shownMovies = _.map(movies, function(m) {
    if (movieCache[m.id]) {
      movieCache[m.id].data = m;
      movieCache[m.id].show = true;
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

var movieWidth = 160;
var movieHeight = 220;
var gapWidth = 2;
var gridColumns;

var previousActiveId = null;
var previousGridHeight = null;

function positionMovies(hideOrShow) {
  if (!$list || !gridColumns) return;
  console.log('Position Movies');


  // Compare with previously active movie --------------------------------------

  var activeMovie = Session.get('activeMovie');

  var previousActiveIndex = (activeMovie.id && activeMovie.id !== previousActiveId) ?
      findIndex(shownMovies, function(x) { return x.data.id === previousActiveId }) : -1;

  var activeIndex = activeMovie.id ?
      findIndex(shownMovies, function(x) { return x.data.id === activeMovie.id }) : -1;

  previousActiveId = activeMovie.id || null;


  // Resize Grid ---------------------------------------------------------------

  var rows = Math.ceil(shownMovies.length/gridColumns);
  var gridHeight = rows * (movieHeight + gapWidth) - gapWidth + (activeIndex >= 0 ? 1 : 0);
  $noMovies[shownMovies.length ? 'removeClass' : 'addClass']('show');

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

var initial = true;

var loadMore = throttle(function() {
  scroll += 1;
  initialiseMovies();
}, 300);

var resize = throttle(function() {
  var oldGridColumns = gridColumns;
  var gridWidth = $list ? $list.width() : 900;
  gridColumns = Math.floor(gridWidth / (movieWidth + gapWidth));
  if ($list && gridColumns !== oldGridColumns) positionMovies(initial);
  initial = false;
}, 300);

Template.moviegrid.helpers({
  favourites: function() { return this.nav === 'liked'; }
});

App.on('reload', function() { selectMovies(); });
App.on('reposition', function() { positionMovies(); });

App.on('clear', function() {
  selectedMovies = [];
  allMovies = [];
  movieCache  = {};
  shownMovies = [];
});

Template.moviegrid.rendered = function() {
  var $body = $('body');
  var $window = $(window);
  $list = $(this.find('.movie-list'));
  $noMovies = $(this.find('.no-movies'));

  initialiseMovies();

  $window.on('resize', resize);
  resize();

  $window.scroll(function() {
    if ($window.scrollTop() + $window.height() > $body.height() - 400) loadMore();
  });
};
