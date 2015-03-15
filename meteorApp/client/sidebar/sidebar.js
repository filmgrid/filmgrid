// =================================================================================================
// FILMGRID - SIDEBAR
// =================================================================================================


var $search;
var $genre;
var $sort;
var $specialSort;

var specialSortOptions = {
  stars: 'Stars',
  score: 'Recommended',
  added: 'Date added'
};

function handleGenre() {
  console.log('handle genre');
  var genre = $genre.val().replace('All', '') || null;

  var query = Session.get('filter') || {};
  query.genre = genre;
  Session.set('filter', query);

  App.trigger('reload');
}

function handleSort() {
  console.log('handle sort');
  var sort = $sort.val() || null;
  Session.set('sort', sort);
  App.trigger('reload');
}

function handleSearch() {
  console.log('handle search');
  var search = $search.val() || '';
  Session.set('search', search);
  App.trigger('reload');
}

function toggleSidebar() {
  Session.set('showSidebar', !Session.get('showSidebar'));
}

// =================================================================================================

Template.sidebar.events = {
  'change #genre': handleGenre,
  'change #sort': handleSort,
  'keyup #search': handleSearch,
  'change #search': handleSearch,
  'click #mobile-menu': toggleSidebar
};

Template.sidebar.helpers({
  navSelectedIs: function(nav) {
    return nav.split('|').indexOf(this.nav) >= 0;
  },
  filtersClass: function() {
    return this.nav == 'about' ? 'hidden' : '';
  },
  sidebarClass: function() {
    return Session.get('showSidebar') ? 'show' : '';
  }
});

Template.sidebar.rendered = function() {
  $search = $('#search');
  $genre = $('#genre');
  $sort = $('#sort');
  $specialSort = $('#special-sort');

  $specialSort.attr('value', Session.get('sort'));
  $specialSort.text(specialSortOptions[Session.get('sort')]);
};

App.on('sortChange', function(sort) {
  // TODO Simplify + Cleanup Special Sort Item
  if ($specialSort) {
    $specialSort.attr('value', sort);
    $specialSort.text(specialSortOptions[sort]);
  }
  Session.set('sort', sort);
});
