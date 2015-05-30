// =================================================================================================
// FILMGRID - SIDEBAR
// =================================================================================================


var $search;
var $released;
var tempSearch;

function handleSearch() {
  var search = $search.val() || '';
  tempSearch = search;
  setTimeout(function() {
    if (tempSearch == search) {
      Session.set('search', search);
      App.trigger('reload');  
    }
  }, 200);
}

function clearSearch() {
  Session.set('search', '');
  $search.val('')
  App.trigger('reload');
}

function handleSort(sort) {
  Session.set('sort', sort);
  App.trigger('reload');
}

function handleFilter(type, value) {
  var filter = Session.get('filter') || {};
  filter[type] = value;
  Session.set('filter', filter);
  App.trigger('reload');
}

// =================================================================================================

Template.filters.events = {
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

  sort: {
    items: ['', 'Rating', 'Year', 'A-Z'],
    dynamic: { index: 0, event: 'sortChange', initial: 'sort' },
    onChange: function(s) { handleSort(s[0]); }
  },

  genres: {
    items: ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
      'Family', 'Fantasy', 'Foreign', 'History', 'Horror', 'Music', 'Mystery', 'Romance',
      'Science Fiction', 'Thriller', 'War', 'Western'],
    multiSelect: 'All',
    onChange: function(g) { handleFilter('genre', g); }
  },

  streaming: {
    items: ['netflix'/*, 'amazonPrime', 'hulu', 'Youtube', 'iTunes', 'Vudu'*/],
    colours: { netflix: '#681014', amazonPrime: '#8F5601', hulu: '#526E23' },
    images: { netflix: '/assets/netflix.png', amazonPrime: '/assets/amazon.png', hulu: '/assets/hulu.png' },
    select: { netflix: ['US', 'UK', 'Germany', 'France'/*, 'Australia', 'New Zealand'*/] },
    multiSelect: 'None',
    footer: 'More services coming soon!',
    onChange: function(services, countries) {
      Session.set('streamingCountries', countries);
      handleFilter('streaming', services);
    }
  }

});

// =================================================================================================

Template.filters.rendered = function() {
  
  $search = $('#search');
  $released = $("#released");

  $released.noUiSlider({
    start: [1960, 2015],
    connect: true,
    step: 1,
    // behaviour: 'tap',
    // margin: 1,
    range: { min: 1960, max: 2015 }
  });

  $released.on({
    slide: function(e, range){ handleFilter('released', [+range[0], +range[1]]); }
  });

  $released.Link('lower').to($('#released-start'), null, wNumb({ decimals: 0 }));
  $released.Link('upper').to($('#released-end'), null, wNumb({ decimals: 0 }));

};
