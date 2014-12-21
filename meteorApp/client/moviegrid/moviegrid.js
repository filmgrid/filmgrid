function findMovies(type, sort) {
  var movies = _.filter(Meteor.user().profile.movies, (function(e) { return e.status.type === type; }));
  var moviesIds = movies.map(function(e) { return e.id; });

  return Movies.find(
    {_id : { $in : moviesIds}}, sort
    );
}

Template.moviegrid.helpers(
{
  "movies" : function() {
    switch (Session.get('type')) {
      case 'suggested' :
        return findMovies('suggested', { sort: { year: -1 } } );
      case 'bookmarked' :
        return findMovies('bookmarked', { sort: { year: -1 } } );
      case 'dismissed' :
        return findMovies('dismissed', { sort: { year: -1 } } );
      case 'liked' :
        return findMovies('liked', { sort: { year: -1 } } );
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

