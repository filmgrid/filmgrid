Template.moviegrid.helpers(
{
  "suggestedMovies" : function() {
    return Movies.find({
      _id : { $in : Meteor.user().profile.movies.suggested }
      }, { sort: { year: -1 } });
  }
});

Template.moviegrid.events = {
  	'click .load-more': function () {
    	  loadMore(true);
  	},

}

Template.movie.events = {
    'click .bookmark' : function () {
      Meteor.users.update({_id : Meteor.userId()}, { $pull : { 'profile.movies.suggested' : this._id }});
      Meteor.users.update({_id : Meteor.userId()}, { $push : { 'profile.movies.starred' : this._id }});
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

