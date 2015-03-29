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
  rating: function(m) { return -m.score_imdb || 0; },
  popularity: function(m) { return -m.revenue || 0; },
  score: function(m) { /* TODO sort by recommendation score */ return -m.revenue || 0; },
  added: function(m) { return -m.changed; }
};


// -------------------------------------------------------------------------------------------------
// Movie List

var allMovies = [];
var movieCache  = {};
var shownMovies = [];
var shownMoviesPrevious = [];
var publicMovies = [];

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
  
  // If not logged in, load public movies, cache them and repeat
  if (!user && !publicMovies.length) {
    Meteor.call('public', {}, function(error, movies) {
      publicMovies = movies;
      lookupMovies(type, search, sort, filter);
    });
    return;
  }

  var movies = user ? user.profile.movies : publicMovies;
  console.log('Load Movies');

  // Select movies on current page
  var types = type.split('|');
  movies = _.filter(movies, function(m) { return _.contains(types, m.statusType); });

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

  // Remove initial loading
  if (Session.get('loading') && selectedMovies.length > 0)
    setTimeout(function() { Session.set('loading', false); }, 600);

  // Reset all existing movies
  _.each(allMovies, function(m) {
    m.wasShown = m.show;
    m.show = false;
  });

  // Infinite scrolling
  var movies = selectedMovies.slice(0, 50 + scroll * 20);

  // Create or update all selected movies
  shownMoviesPrevious = shownMovies;
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
var resizeTimeout;

function positionMovies(hideOrShow) {
  if (!$list || !gridColumns) return;
  console.log('Position Movies');


  // Compare with previously active movie --------------------------------------

  var lastRatedMovieId = Session.get('lastRatedMovieId');
  var lastRatedMovieIndex =  findIndex(shownMoviesPrevious, function(x) { return x.data.id === lastRatedMovieId });

  var activeMovie = Session.get('activeMovie');
  var activeIndex = activeMovie.id ?
      findIndex(shownMovies, function(x) { return x.data.id === activeMovie.id }) : -1;

  var previousIndex = findIndex(shownMovies, function(x) { return x.data.id === previousActiveId });
  console.log(lastRatedMovieIndex, lastRatedMovieId);
  // We update the position from the lastRatedMovieIndex if possible, or ActiveIndex or lastIndex;
  var slideIndex = lastRatedMovieIndex != -1 ? lastRatedMovieIndex : activeIndex != -1 ? activeIndex : previousIndex; 

  var previousActiveIndex = (activeMovie.id && activeMovie.id !== previousActiveId) ?
      findIndex(shownMovies, function(x) { return x.data.id === previousActiveId }) : -1;
  previousActiveId = activeMovie.id || null;


  // Resize Grid ---------------------------------------------------------------

  var additionalBottomRows = activeIndex >= 0 ? (gridColumns < 5 ? 2 : 1) : 0;
  var rows = Math.ceil(shownMovies.length/gridColumns) + additionalBottomRows;
  var gridHeight = rows * (movieHeight + gapWidth) - gapWidth;
  $noMovies[shownMovies.length ? 'removeClass' : 'addClass']('show');

  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(function() {
    $list.css('height', gridHeight + 'px');
    previousGridHeight = gridHeight;
  }, gridHeight <= previousGridHeight ? 600 : 0);


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
    m.el.css('transition-delay', Math.abs(slideIndex-i)*15+'ms');
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
  var gridWidth = $list ? $list.width() : 900;
  var windowWidth = window.innerWidth;
  
  // Recalculate number of columns
  var oldGridColumns = gridColumns;
  gridColumns = Math.max(3, Math.floor(gridWidth / (movieWidth + gapWidth)));
  if ($list && gridColumns !== oldGridColumns) positionMovies(initial);
  initial = false;

  // Scale movies on mobile
  var transform = (windowWidth < 651) ? 'scale(' + (windowWidth/488) + ')' : 'none';
  $list.css('transform', transform);
}, 300);

Template.moviegrid.helpers({
  favourites: function() {
    return this.nav === 'liked';
  },
  noMoviesText: function() {
    return Session.get('loading') ? 'Loading Movies…' : 'No Movies Found';
  }
});

App.on('reload', function(id) { selectMovies(id); });
App.on('reposition', function(id) { positionMovies(id); });

Template.moviegrid.rendered = function() {
  var $body = $('body');
  var $window = $(window);
  $list = $(this.find('.movie-list'));
  $noMovies = $(this.find('.no-movies'));

  // Reset variables before initialize, if grid is recreated
  allMovies = [];
  movieCache  = {};
  shownMovies = [];
  shownMoviesPrevious = [];
  initialiseMovies();

  $window.on('resize', resize);
  resize();

  $window.scroll(function() {
    if ($window.scrollTop() + $window.height() > $body.height() - 400) loadMore();
  });
};
