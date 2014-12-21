var userMovies = {};

function findMovies(type) {
  if (Meteor.user()) {
    userMovies = Meteor.user().profile.movies;  
    return _.sortBy(_.where(userMovies,{statusType: type}), function(e) { return -e.year; });    
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
  }
});

Template.moviegrid.events = {
  	'click .load-more': function () {
    	  loadMore(true);
  	},
}

// See http://www.meteorpedia.com/read/Infinite_Scrolling
function loadMore(force) {
    var $body = $('body');
    var threshold = $(window).scrollTop() + $(window).height() - $body.height();

    if (force || $body.offset().top < threshold+1 && threshold < 2) {
        var query = Session.get('query');
        Session.set('query', { genre: query.genre, page: query.page + 1 })
    }
}

Meteor.startup(function() {
  	$(window).scroll(function() { loadMore(); });
});

