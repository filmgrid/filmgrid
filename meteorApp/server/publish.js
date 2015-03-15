// =================================================================================================
// FILMGRID - PUBLISHING
// =================================================================================================


// Table Config ------------------------------------------------------------------------------------

var fields = ['title', 'plot', 'genre', 'runtime', 'budget', 'revenue', 'year', 'released',
'languages', 'country', 'score_rtaudience', 'score_rtcritics', 'score_imdb', 'score_metascore',
'votes_imdb', 'awards', 'rating', 'actors', 'directors', 'studio', 'link_rt', 'link_imdb',
'homepage', 'trailer_youtube', 'poster', 'poster_1', 'background'];

var findFields = { _id: 1 };
_.each(fields, function(f) { findFields[f] = 1 });


// Subscribe to Movies -----------------------------------------------------------------------------

function getInitialSuggestions() {
    var suggestions = Movies
    .find({
        poster: { $ne: 'N/A' },
        imdb_votes: { $ne: 'N/A' }
    }, {
        sort: { revenue: -1 },
        fields: findFields
    })
    .fetch()
    .slice(0, 500)
    .map(function(e) {
        var mapFields = { id: e._id, statusType:'suggested', statusScore: '', score : 1 };
        _.each(fields, function(f) { mapFields[f] = e[f] });
        return [e._id, mapFields];
    });

    return _.object(suggestions);
}

Meteor.publish('movies', function() {

    if (!Meteor.users.findOne({_id: this.userId})) return;

    var movies = Meteor.users.findOne({ _id: this.userId }).profile.movies;

    if (!movies) {
        // Initial Insert
        var suggestions = getInitialSuggestions();
        Meteor.users.update({ _id : this.userId }, { $set : { 'profile.movies': suggestions }});
    }

});


// Public Methods ----------------------------------------------------------------------------------

var driver = new MongoInternals.RemoteCollectionDriver(process.env.MONGO_URL);

Meteor.methods({
    search: function(str) {
        var asyncDb = Meteor.wrapAsync(driver.mongo.db.executeDbCommand, driver.mongo.db);
        var result = asyncDb({
            text: 'movies',
            search: str || '',
            project: findFields,
            limit: 25
        });

        return (result && result.documents[0].ok === 1) ? result.documents[0].results : [];
    }
});
