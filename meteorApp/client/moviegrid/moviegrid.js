
Template.moviegrid.allMovies = function (argument) {
  	return Movies.find({}, { sort: { year: -1 } });
}

Template.moviegrid.events = {
  	'click .load-more': function () {
    	  loadMore(true);
  	}
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
