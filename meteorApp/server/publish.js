// =================================================================================================
// FILMGRID - PUBLISHING
// =================================================================================================


// Table Config ------------------------------------------------------------------------------------

var fields = ['title', 'plot', 'genres', 'runtime', 'budget', 'revenue', 'year', 'released',
'languages', 'country', 'score_rtaudience', 'score_rtcritics', 'score_imdb', 'score_metascore',
'votes_imdb', 'awards', 'rating', 'actors', 'directors', 'studio', 'link_rt', 'link_imdb',
'homepage', 'trailer_youtube', 'poster', 'poster_1', 'background', 'streaming'];

var findFields = { _id: 1 };
_.each(fields, function(f) { findFields[f] = 1 });


// Subscribe to Movies -----------------------------------------------------------------------------

function getInitialSuggestions() {
    var movies = Movies
        .find({
            poster: { $ne: 'N/A' }
        }, {
            sort: { revenue: -1 },
            fields: findFields,
            limit: 500
        })
        .fetch();

    var now = new Date();

    movies.forEach(function(m) {
        m.id = m._id;
        m.statusType = 'suggested';
        m.statusScore =  '';
        m.score = 1;
        m.changed = now;
    });

    return movies;
}

// Public Methods ----------------------------------------------------------------------------------

var driver = new MongoInternals.RemoteCollectionDriver(process.env.MONGO_URL);

Meteor.methods({
    search: function(str) {
        var asyncDb = Meteor.wrapAsync(driver.mongo.db.executeDbCommand, driver.mongo.db);
        var result = asyncDb({
            text: 'movies',
            search: str || '',
            project: findFields,
            limit: 50
        });

        return (result && result.documents[0].ok === 1) ? result.documents[0].results : [];
    },
    public: function() {
        return getInitialSuggestions();
    },
    initialInsert: function() {
        if (!Meteor.users.findOne({_id: this.userId})) return;

        var movies = Meteor.users.findOne({ _id: this.userId }).profile.movies;

        if (!movies) {
            // Initial Insert
            var suggestions = getInitialSuggestions().map(function(m) { return [m.id, m] });
            Meteor.users.update({ _id : this.userId }, { $set : { 'profile.movies': _.object(suggestions) }});
        }
    }
});
