
// Load movies from JSON
// Movies.remove({})

if (Movies.find().count() === 0) {
    var movies = JSON.parse(Assets.getText("movie_data.json"));
	for (i=0; i<movies.length; ++i) {
	    Movies.insert(movies[i]);
	    if (i % 1000 === 0) console.log('inserted 1000 movies');
	}
}
