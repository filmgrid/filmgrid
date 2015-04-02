// =================================================================================================
// FILMGRID - SIDEBAR
// =================================================================================================


var $search;
var $sort;
var $specialSort;

var specialSortOptions = {
  popularity: 'Popularity',
  stars: 'Stars',
  score: 'Recommended',
  added: 'Date added'
};

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

function handleFilter(type, value) {
  var filter = Session.get('filter') || {};
  filter[type] = value;
  Session.set('filter', filter);
  App.trigger('reload');
}

function clearSearch() {
  Session.set('search', '');
  $search.val('')
  App.trigger('reload');
}

// =================================================================================================

Template.filters.events = {
  'change #sort': handleSort,
  'keyup #search': handleSearch,
  'change #search': handleSearch,
  'click #search-clear': clearSearch
};

Template.filters.helpers({
  searchText: function() {
    return Session.get('type') === 'suggested' ? 'Search all movies' : 'Filter movies';
  },

  searchStr: function() {
    return !!Session.get('search');
  },

  genres: {
    items: ["Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary",
      "Drama", "Family", "Fantasy", "Horror", "Music", "Mystery", "Romance", "Sci-Fi", "Sport",
      "Thriller", "War"],
    multiSelect: true,
    allText: 'All',
    onChange: function(g) { handleFilter('genre', g); }
  },

  streaming: {
    items: ["Netflix US", "Netflix UK", "Netflix Germany", "Netflix France", "Netflix Australia"],
    multiSelect: true,
    allText: 'None',
    onChange: function(s) { handleFilter('streaming', s); }
  }

});

App.on('sortChange', function(sort) {
  // TODO Simplify + Cleanup Special Sort Item
  if ($specialSort) {
    $specialSort.attr('value', sort);
    $specialSort.text(specialSortOptions[sort]);
  }
  Session.set('sort', sort);
});


// =================================================================================================

Template.filters.rendered = function() {
  
  // Global variables
  $search = $('#search');
  $sort = $('#sort');
  $specialSort = $('#special-sort');

  // Set value of page-specific sort option
  $specialSort.attr('value', Session.get('sort'));
  $specialSort.text(specialSortOptions[Session.get('sort')]);


  // ---------------------------------------------------------------------------
  // Release year range slider

  var $released = $("#released");
  $released.noUiSlider({
    start: [1960, 2015],
    connect: true,
    step: 1,
    // behaviour: 'tap',
    // margin: 1,
    range: { min: 1960, max: 2015 }
  });
  $released.on({
    slide: function(e, range){ handleReleased(+range[0], +range[1]) }
  });
  $released.Link('lower').to($('#released-start'), null, wNumb({ decimals: 0 }));
  $released.Link('upper').to($('#released-end'), null, wNumb({ decimals: 0 }));

};
