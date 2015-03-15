// Load movies from JSON
// Movies.remove({})

if (Movies.find().count() === 0) {
    var movies = JSON.parse(Assets.getText("movie_data.json"));
	for (i=0; i<movies.length; ++i) {
	    Movies.insert(movies[i]);
	    if (i % 1000 === 0) console.log('inserted 1000 movies');
	}
}

Meteor.startup(function () {
    var search_index_name = 'title_'

    // Remove old indexes as you can only have one text index and if you add 
    // more fields to your index then you will need to recreate it.
    // Movies._dropIndex(search_index_name);

    // Movies._ensureIndex({
    //     title: 'text',
    //     actors: 'text'
    // }, {
    //     name: search_index_name,
    //     default_language: 'none'
    // });
});

// mongod --setParameter textSearchEnabled=true
