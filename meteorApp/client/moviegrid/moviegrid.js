(function() {

  // --------------------------------------------------------------------------
  // Setup and Config

  var $list;

  var gridWidth = 900;
  var movieWidth = 160;
  var movieHeight = 300;
  var gapWidth = 15;

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

  var allMovies = [];
  var shownMovies = [];

  function loadMovies() {
    if (!Meteor.user()) return;
    var movies = Meteor.user().profile.movies;
    _.each(movies, function(m) {
      allMovies.push({ data: m, el: null, show: false });
    });
  }

  function positionMovies() {
    var columns = Math.floor(gridWidth / (movieWidth + gapWidth));

    var height = Math.ceil(shownMovies.length/columns) * (movieHeight + gapWidth) - gapWidth;
    if ($list) $($list).css('height', height + 'px');

    _.each(shownMovies, function(m, i) {
      if (!m.show) return;
      var x = (i % columns) * (movieWidth + gapWidth);
      var y = Math.floor(i / columns) * (movieHeight + gapWidth);
      m.el.css('transform', 'translate(' + x + 'px, ' + y + 'px)');
    });
  }

  function selectMovies() {

    if (!allMovies.length) loadMovies();
    
    var query = Session.get('query') || {};
    var searchString = Session.get('searchString');

    _.each(allMovies, function(m) {
      m.wasShown = m.show;
      m.show = false;
    });

    // Select movies on current page
    var movies = _.filter(allMovies, function(m) { return m.data.statusType === Session.get('type'); });

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
    var scroll = Session.get('scroll');
    movies = movies.slice(0, 30 + scroll*10);

    _.each(movies, function(m) { m.show = true; });
    Session.set('moviesLength', movies.length);

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
    positionMovies();
  }


  // --------------------------------------------------------------------------
  // Template Setup

  function loadMore(force) {
    // See http://www.meteorpedia.com/read/Infinite_Scrolling
    var scroll = Session.get('scroll');
    Session.set('scroll', scroll + 1);
  }

  function resize() {
    gridWidth = $list ? $($list).width() : 900;
    positionMovies();
  }

  Template.moviegrid.helpers({
    movies: selectMovies,
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

    $window.scroll(function() {
      var threshold = $window.scrollTop() + $window.height() - $body.height();
      if ($body.offset().top < threshold+1 && threshold < 2) loadMore();
    });

    window.activeMovie = null;
    $body.click(function() {
      if (window.activeMovie) window.activeMovie.close();
    });
  };

})();

