// This wrapper can be used to ensure that a function is only triggered once ever t ms.
function delay(fn, t) {
  var delay = false;
  var repeat = false;
  return function() {
    if (delay) {
      repeat = true;
    } else {
      fn.apply(null, arguments);
      delay = true;
      setTimeout(function() {
        if (repeat) fn.apply(null, arguments);
        delay = false;
        repeat = false;
      }, t);
    }
  }
};

function findIndex(array, fn) {
  for (var i=0; i<array.length; ++i) {
    if (fn(array[i])) return i;
  }
  return -1;
}

function compareMovies(m1,m2)
{
  return (m1.statusType+m1.statusScore) == (m2.statusType+m2.statusScore);
}

// --------------------------------------------------------------------------
// Setup and Config

var $list;

var gridWidth = 900;
var movieWidth = 160;
var movieHeight = 220;
var gapWidth = 2;
var lastAction = ""; //dirty hack to prevent double reload

var filter = {
  genre: function(m, value) { return m.genre.indexOf(value) !== -1; },
  title: function(m, value) {
    // TODO better searching
    var words = value.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');
    var searchStr = m.title .toLowerCase() + ' ' + m.actors.toLowerCase();
    return _.all(words, function(w) { return searchStr.indexOf(w) !== -1; });      
  }
};

var sort = {
  year:  function(m) { return -m.year; },
  stars: function(m) { return -(m.statusScore || m.year); }
};


// --------------------------------------------------------------------------
// Movie List

var movieCache  = {};
var allMovies   = [];
var shownMovies = [];
var firstInit   = true;

function loadMovies() {
  if (lastAction == "loadMovies") return;
  lastAction = "loadMovies";

  console.log("RELOAD MOVIES");

  // Reactive variable;
  u = Meteor.user();

  if (!u || !$list) return;

  var movies = u.profile.movies;
  _.each(movies, function(m) {

    if (!movieCache[m.id]) {
      var movie = { data: m, el: null, show: false };
      allMovies.push(movie);
      movieCache[m.id] = movie;
      console.log("INITIALISE SESSION VARIABLES");
      Session.set('activeMovie'+m.id,false); //initialise the activeMovie to false;
    }
    else if (!compareMovies(movieCache[m.id].data,m)) {
      movieCache[m.id].data = m;
      Session.set('activeMovie'+m.id,false); //initialise the activeMovie to false;
      console.log("CHANGE DATA FROM USER");
    }
  });
  if (firstInit)
  {
    firstInit = false
    recomputeMovies();
    positionMovies();
  }
}

function recomputeMovies() {
  lastAction = "recomputeMovies";

  if (!allMovies.length) return;
  console.log("RECOMPUTE MOVIES");

  // Reactive variables
  var query = Session.get('query') || {};
  var searchString = Session.get('searchString');
  var nav = Session.get('type');
  var scroll = Session.get('scroll');
  var recompute = Session.get('reCompute');

  _.each(allMovies, function(m) {
      m.wasShown = m.show;
      m.show = false;
    });

    // Select movies on current page
    var movies = _.filter(allMovies, function(m) { return m.data.statusType === nav; });
    // Filter movies
    if (query.filter) {
      _.each(query.filter, function(value, type) {
        if (value) movies = _.filter(movies, function(m) { return filter[type](m.data, value); });
      });
    }

    // Search movies
    if (searchString) {
      movies = _.filter(movies, function(m) { return filter.title(m.data, searchString); });
    }

    // Sort movies
    if (query.sortBy) {
      movies = _.sortBy(movies, function(m) { return sort[query.sortBy](m.data); });
    }

    // Infinite Scrolling
    movies = movies.slice(0, 40 + scroll*20);

    _.each(movies, function(m) { m.show = true; });

    _.each(allMovies, function(m) { 
      if (m.show && !m.wasShown) {
        if (!m.el) {
          var dom = UI.renderWithData(Template.movie, m.data, $list);
          m.el = $(dom.lastNode());
        }
        m.el.addClass('on');
      } else if (m.el && !m.show && m.wasShown) {
        m.el.removeClass('on');
        m.el.css('transform', m.el.css('transform'));
      }
    });

    shownMovies = movies;
}

function positionMovies() {
  if (!shownMovies.length) return;

  console.log("REPOSITION MOVIES");

  // Reactive variables
  var activeMovie      = Session.get('activeMovie');
  var previousActiveId = Session.get('previousActiveId');
  var scroll           = Session.get('scroll');
  var rePosition       = Session.get('rePosition');
  var query            = Session.get('query');
  var searchString     = Session.get('searchString');
  

  var columns = Math.floor(gridWidth / (movieWidth + gapWidth));
  
  var previousActiveIndex = activeMovie.id ? findIndex(shownMovies, function(x) {
    return x.data.id === previousActiveId
  }) : -1;
  var activeMovieIndex = activeMovie.id ? findIndex(shownMovies, function(x) {
    return x.data.id === activeMovie.id
  }) : -1;

  var rows = Math.ceil((shownMovies.length + (activeMovieIndex >= 0 ? 5 : 0))/columns);
  if ($list) $($list).css('height', (rows * (movieHeight + gapWidth) - gapWidth) + 'px');

  computedActiveMovieIndex = activeMovieIndex;
  if (previousActiveIndex >= 0 && activeMovieIndex > previousActiveIndex)
  {
    computedActiveMovieIndex += 2;
    if (activeMovieIndex > previousActiveIndex + columns - 3 )
    {
      computedActiveMovieIndex += 3;
    }
    swapMovies(activeMovieIndex, computedActiveMovieIndex);
  }
  activeMovieIndex = computedActiveMovieIndex;

  var activeMovieColumn = activeMovieIndex % columns;
  var shift = Math.max(0, activeMovieColumn - (columns - 3));

  _.each(shownMovies, function(m, i) {
    if (!m.show) return;
    if (activeMovieIndex >= 0) {
      if (shift > 0) {
        if (i == activeMovieIndex - 1 || (shift == 2 &&  i == activeMovieIndex - 2)) {
          i++; 
        } else if (i == activeMovieIndex) {
          i = activeMovieIndex - shift;
          swapMovies(activeMovieIndex, activeMovieIndex - shift);
        }
      }
      if (i > activeMovieIndex - shift) i += 2;
      if (i > activeMovieIndex - shift + columns - 1) i += 3;
    }

    var x = (i % columns) * (movieWidth + gapWidth);
    var y = Math.floor(i / columns) * (movieHeight + gapWidth);

    m.el.css('transform', 'translate(' + x + 'px, ' + y + 'px)');
  });
}

function swapMovies(i,j){
  if (j < shownMovies.length && i < shownMovies.length)
  {
    var buff = shownMovies[i]
    shownMovies[i] = shownMovies[j]
    shownMovies[j] = buff;
  }
}

function refreshMovies()
{
  loadMovies();
  recomputeMovies();
  positionMovies();
}

// --------------------------------------------------------------------------
// Template Setup

var loadMore = delay(function() {
  // See http://www.meteorpedia.com/read/Infinite_Scrolling
  var scroll = Session.get('scroll');
  Session.set('scroll', scroll + 1);
  console.log("SCROLL IS NOW ", scroll + 1);
}, 300);

var resize = delay(function() {
  gridWidth = $list ? $($list).width() : 900;
  refreshMovies();
}, 300);

Template.moviegrid.helpers({
  reload: loadMovies,
  reCompute: recomputeMovies,
  rePosition: positionMovies,
  hasMovies: function() { return shownMovies.length > 0; },
  suggested: function() { return Session.get('type') === 'suggested'; }
});

Template.moviegrid.events = {
  'click .load-more': function() {
      loadMore(true);
  },
  'click .suggest-more': function () {
      loadMore(true);
      // TODO addToTheJobQueue
  }
}

Template.moviegrid.rendered = function() {
  var $body = $('body');
  var $window = $(window);
  $list = this.find('.movie-list');

  // TODO use timeout to delay
  $window.on('resize', resize);
  resize();

  $window.scroll(function() {
    if ($window.scrollTop() + $window.height() > $body.height() - 400) loadMore();
  });

  window.activeMovie = null;
  $body.click(function() {
    if (window.activeMovie) window.activeMovie.close();
  });
};

