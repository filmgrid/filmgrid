Meteor.publish("allMovies", function(opts) {
  	var opts = opts || {};
  	var page = opts.page || 1;

  	// TODO For now, only show movies with poster
  	// TODO Add additional filters
  	// TODO Sort by match certainty instead of year
  	var search = { poster: { $ne: 'N/A' } }
  	if (opts.genre) search.genre = { $regex: '.*' + opts.genre + '.*' };
  	
  	var res = Movies.find(search, { limit: page * 10, sort: { year: -1 } });
  	return res;
});
