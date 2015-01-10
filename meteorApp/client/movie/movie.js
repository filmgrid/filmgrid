
Template.movie.events = {
  'click .movie-bookmark' : function (e) {
    updateFromProfile(this.id, {type : 'bookmarked'} );
  },

  'click .movie-like3' : function (e) {
    updateFromProfile(this.id, {type : 'liked', score : 3});
  },

  'click .movie-like2' : function (e) {
    updateFromProfile(this.id, {type : 'liked', score : 2});
  },

  'click .movie-like1' : function (e) {
    updateFromProfile(this.id, {type : 'liked', score : 1});
  },

  'click .movie-dismissed' : function (e) {
    updateFromProfile(this.id, {type : 'dismissed'} );
  },

  'click .movie-details' : function (e, template) {
    template.open();
  },

  'click .movie' : function (e, template) {
    e.stopPropagation();
  }
}


function getTransform (node) {
  var p = node.getBoundingClientRect();
  var x = ($window.width()  - 480) / 2 - p.left;
  var y = ($window.height() - 300) / 2 - p.top;
  return 'translate(' + x + 'px, ' + y + 'px)';
};  

Template.movie.rendered = function() {
  var _this = this;
  var node = this.firstNode;
  var $movie = $(node).find('.movie');

  var isOpen = false;
  this.isTransitioning = false;

  this.open = function() {
    if (isOpen || _this.isTransitioning) return;
    if (window.activeMovie) {
      if (window.activeMovie.isTransitioning) return;
      window.activeMovie.close();
    }
    
    _this.isTransitioning = true;
    isOpen = true;
    window.activeMovie = _this;

    $movie.addClass('transitioning');
    document.body.offsetTop;
    $movie.addClass('expanded');
    $movie.css('transform', getTransform(node));
    $movie.css('z-index', '100');

    setTimeout(function() {
      $movie.removeClass('transitioning');
      $movie.css('transform', 'none');
      $movie.addClass('fixed');
      _this.isTransitioning = false;
    }, 500);
  },

  this.close = function() {
    var _this = this;

    if (!isOpen || _this.isTransitioning) return;
    isOpen = false;
    _this.isTransitioning = true;
    window.activeMovie = null;

    $movie.removeClass('fixed');
    $movie.css('transform', getTransform(node));
    document.body.offsetTop;
    $movie.addClass('transitioning');
    $movie.css('z-index', '50');
    document.body.offsetTop;
    $movie.css('transform', 'none');
    $movie.removeClass('expanded');
    
    setTimeout(function() { 
      $movie.css('z-index', '0');
      _this.isTransitioning = false;
    }, 500);    
  }
};


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

