Template.searchResults.helpers(
{
  "movies" : function() {
    console.log("search");
      var results = Session.get('searchResults');
     if (Session.get('type') === 'suggested' && results) 
     {
        return _.map(
          _.filter(
            results,
            function(e) {
              if (e.score > 2) 
                return true;
              else
                return false ;
            }
          ), function (e) { return e.obj});
     }
  },
  "suggested" : function() {
    return Session.get('type') === 'suggested';
  }
});