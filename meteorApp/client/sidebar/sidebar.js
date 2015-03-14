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
  var genre = $genre.val().replace('All', '') || null;

  var query = Session.get('filter') || {};
  query.filter = { genre: genre };
  Session.set('filter', query);

  App.trigger('reload');
}

function handleSort() {
  var sort = $sort.val() || null;
  Session.set('sort', sort);
  App.trigger('reload');
}

function handleSearch() {
  var search = $search.val() || null;
  Session.set('search', search);
  App.trigger('reload');
}

// =================================================================================================

Template.sidebar.events = {
  'change #genre': handleGenre,
  'change #sort': handleSort,
  'keyup #search': handleSearch,
  'change #search': handleSearch
};

Template.sidebar.helpers({
  navSelectedIs: function(nav) {
    return nav.split('|').indexOf(this.nav) >= 0;
  },
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
