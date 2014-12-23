var filterType = undefined;
var filterValue = undefined;
var sortType = undefined;

var filters = {
  "genre" : function(e) {
    if (filterType && filterValue)
    {
      if (e.genre.indexOf(filterValue) != -1)       
        return true;      
      else      
        return false;      
    }
    return true;
  }
}

var sortBy = {
  "year" : function(e) {
    return -e.year;
  },
  "stars" : function(e) {    
    return -e.statusScore;
  }
}


function findMovies(type) {
  if (Meteor.user()) {
    var query = Session.get('query');
    
    sortType = query.sortBy;
    filterType = query.filter.type;
    filterValue = query.filter.value;

    var movies = Meteor.user().profile.movies;  
    movies = _.where(movies,{statusType: type});

    if (filterType)
    {
      movies = _.filter(movies, filters[filterType]);
    }
    if (sortType)
    {
      movies = _.sortBy(movies, sortBy[sortType])
    }    

    return movies.slice(0, query.page*10); // infinite scrolling client side
  }
  return null;
}

Template.moviegrid.helpers(
{
  "movies" : function() {
    switch (Session.get('type')) {
      case 'suggested' :
        return findMovies('suggested');
      case 'bookmarked' :
        return findMovies('bookmarked');
      case 'dismissed' :
        return findMovies('dismissed');
      case 'liked' :
        return findMovies('liked');
    }    
  },

  "suggested" : function() {
    return Session.get('type') === 'suggested';
  }
});

Template.moviegrid.events = {
  	'click .load-more': function () {
    	  loadMore(true);
  	},
    'click .suggest-more': function () {
        loadMore(true);
        addToTheJobQueue();
    },
}

function addToTheJobQueue() {

}

// See http://www.meteorpedia.com/read/Infinite_Scrolling
function loadMore(force) {
    var $body = $('body');
    var threshold = $(window).scrollTop() + $(window).height() - $body.height();

    if (force || $body.offset().top < threshold+1 && threshold < 2) {
        var query = Session.get('query');
        query.page = query.page + 1;
        Session.set('query', query);
    }
}

Meteor.startup(function() {
  	$(window).scroll(function() { loadMore(); });
});

