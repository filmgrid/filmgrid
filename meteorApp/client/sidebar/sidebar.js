// =================================================================================================
// FILMGRID - SIDEBAR
// =================================================================================================


var $sidebar;
var $search;
var $genre;
var $sort;
var $specialSort;

var specialSortOptions = {
  popularity: 'Popularity',
  stars: 'Stars',
  score: 'Recommended',
  added: 'Date added'
};

function handleGenre() {
  var genre = $genre.val().replace('All', '') || null;

  var query = Session.get('filter') || {};
  query.genre = genre;
  Session.set('filter', query);

  App.trigger('reload');
}

function handleReleased(from, to) {
  var query = Session.get('filter') || {};
  query.released = [from, to];
  Session.set('filter', query);
  App.trigger('reload');  
}

function handleSort() {
  var sort = $sort.val() || null;
  Session.set('sort', sort);
  App.trigger('reload');
}

function handleSearch() {
  var search = $search.val() || '';
  Session.set('search', search);
  App.trigger('reload');
}

function clearSearch() {
  Session.set('search', '');
  $search.val('')
  App.trigger('reload');
}

function toggleSidebar() {
  Session.set('showSidebar', !Session.get('showSidebar'));
}

function toggleSubnav() {
  Session.set('showSubnav', !Session.get('showSubnav'));
}

// =================================================================================================

Deps.autorun(function() {
  var show = Session.get('showSidebar');
  if (!$sidebar || show === 'sliding') return;

  $sidebar.css('transition', 'transform .4s');
  $sidebar.one('transitionend webkitTransitionEnd', function() { $sidebar.css('transition', ''); });

  document.body.offsetTop;
  $sidebar.css('transform', 'translateX(' + (show ? '-240' : '0') + 'px)');
});

// =================================================================================================

Template.sidebar.events = {
  'change #genre': handleGenre,
  'change #sort': handleSort,
  'keyup #search': handleSearch,
  'change #search': handleSearch,
  'click #search-clear': clearSearch,
  'click #mobile-menu': toggleSidebar,
  'click #subnav-link': toggleSubnav,
  'click #logout-button': function() { Meteor.logout(); }
};

Template.sidebar.helpers({
  navSelectedIs: function(nav) {
    return nav === this.nav;
  },
  filtersClass: function() {
    return this.nav == 'about' ? 'hidden' : '';
  },
  subnavClass: function() {
    return Session.get('showSubnav') ? 'open' : '';
  },
  showSidebar: function() {
    return Session.get('showSidebar') === true;
  },
  services: function() {
    // Hack to get access to internal function in accounts-ui-unstyled
    return Template._loginButtonsLoggedOutAllServices.__helpers[' services']();
  },
  isNotLoading: function() {
    return !Session.get('loading');
  },
  searchText: function() {
    return Session.get('type') === 'suggested' ? 'Search all movies' : 'Filter movies';
  },
  searchStr: function() {
    return !!Session.get('search');
  }
});

Template.sidebar.rendered = function() {
  
  // Global variables
  $sidebar = $('#sidebar');
  $search = $('#search');
  $genre = $('#genre');
  $sort = $('#sort');
  $specialSort = $('#special-sort');

  // Set value of page-specific sort option
  $specialSort.attr('value', Session.get('sort'));
  $specialSort.text(specialSortOptions[Session.get('sort')]);

  // Release year range slider
  var $released = $("#released");
  $released.noUiSlider({
    start: [1960, 2015],
    connect: true,
    // behaviour: 'tap',
    step: 1,
    // margin: 1,
    range: { min: 1960, max: 2015 }
  });
  $released.on({
    slide: function(e, range){ handleReleased(+range[0], +range[1]) }
  });
  $released.Link('lower').to($('#released-start'), null, wNumb({ decimals: 0 }));
  $released.Link('upper').to($('#released-end'), null, wNumb({ decimals: 0 }));

  // Create sliders for mobile sidebar
  touchSlider($('#sidebar-in-target'), {
    onMove: function(x) {
      Session.set('showSidebar', 'sliding');
      $sidebar.css('transform', 'translateX(' + bound(x, -240, 0) + 'px)')
    },
    onEnd: function(x) {
      Session.set('showSidebar', x < -100)
    }
  });
  
  touchSlider($('#sidebar-out-target'), {
    onMove: function(x) {
      Session.set('showSidebar', 'sliding');
      $sidebar.css('transform', 'translateX(' + bound(x - 240, -240, 0) + 'px)')
    },
    onEnd: function(x) {
      Session.set('showSidebar', Math.abs(x) > 5 && x < 60)
    }
  });

};

App.on('sortChange', function(sort) {
  // TODO Simplify + Cleanup Special Sort Item
  if ($specialSort) {
    $specialSort.attr('value', sort);
    $specialSort.text(specialSortOptions[sort]);
  }
  Session.set('sort', sort);
});
