Template.movie.events = {
    'click .movie-bookmark' : function (e) {
      updateFromProfile(this.id, {type : 'bookmarked'} );
      //e.stopPropagation();
    },

    'click .movie-like3' : function (e) {
      updateFromProfile(this.id, {type : 'liked', score : 3});
      //e.stopPropagation();
    },

    'click .movie-like2' : function (e) {
      updateFromProfile(this.id, {type : 'liked', score : 2});
      //e.stopPropagation();
    },

    'click .movie-like1' : function (e) {
      updateFromProfile(this.id, {type : 'liked', score : 1});
      //e.stopPropagation();
    },

    'click .movie-dismissed' : function (e) {
      updateFromProfile(this.id, {type : 'dismissed'} );
      //e.stopPropagation();
    }
}

Template.movie.rendered = function() {

  var node = this.firstNode;

  var $movie = $(node).find('.movie');
  var $body = $('body');
  var $window = $(window);

  var isExpanded = false;

  var getTransform = function() {
    var p = node.getBoundingClientRect();
    var x = ($window.width()  - 480) / 2 - p.left;
    var y = ($window.height() - 300) / 2 - p.top;
    return 'translate(' + x + 'px, ' + y + 'px)';
  };

  var propagating = false;

  $movie.click(function(e) {
    if (isExpanded) {
      e.stopPropagation();
    } else {
      $movie.addClass('transitioning');
      document.body.offsetTop;
      $movie.addClass('expanded');
      $movie.css('transform', getTransform());
      setTimeout(function() {
        $movie.removeClass('transitioning');
        $movie.css('transform', 'none');
        $movie.addClass('fixed');
      }, 500);
      $movie.css('z-index', '100');
      isExpanded = true;
      propagating = true;
    }
  });

  $body.click(function() {
    if (isExpanded && !propagating) {
      $movie.removeClass('fixed');
      console.log(getTransform());
      $movie.css('transform', getTransform());
      document.body.offsetTop;
      $movie.addClass('transitioning');
      $movie.css('z-index', '50');
      document.body.offsetTop;
      $movie.css('transform', 'none');
      $movie.removeClass('expanded');
      setTimeout(function() { $movie.css('z-index', '0'); }, 500);
      isExpanded = false;
    }
    propagating = false;
  });
}

function updateFromProfile(id, status)
{   
  var $set = {};
  var statusType = Meteor.user().profile.movies[id].statusType;
  
  // Let's check that we can access the current status
  if (!statusType) {
    console.log("This is strange Dr Watson, the id you asked for is not referenced in the user profile");
    return;
  } 

  // Let's put it back in suggested if it is unclicked from dismissed or bookmarked
  if (status.type === statusType && status.type != 'liked' ) {
    $set['profile.movies.' + id + '.statusType' ]  = 'suggested';
    $set['profile.movies.' + id + '.statusScore' ] = '';        
  }
  else
  {
    // Otherwise let's simply update
    $set['profile.movies.' + id + '.statusType' ]  = status.type;
    $set['profile.movies.' + id + '.statusScore' ] = status.score ? status.score : '';
  }
    
  Meteor.users.update(
     {_id : Meteor.userId()},
      {$set : $set }
    );      
}

