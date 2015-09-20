// =================================================================================================
// FILMGRID - PUBLISHING
// =================================================================================================


// Table Config ------------------------------------------------------------------------------------

var findFields = ['_id', 'title', 'poster', 'year', 'released', 'score', 'revenue',
    'genres', 'search_str'];

var fetchFields = ['_id', 'title', 'plot', 'genres', 'keywords', 'runtime', 'budget',
    'revenue', 'tagline', 'year', 'released', 'languages', 'country', 'studio', 'cast',
    'directors', 'homepage', 'awards', 'rating', 'score_rtaudience', 'score_rtcritics',
    'score_metacritic', 'score_imdb', 'votes_imdb', 'score', 'poster', 'background',
    'link_rt', 'link_imdb', 'trailer_youtube'];

var findFields = {};
_.each(findFields, function(f) { findFields[f] = 1 });

var fetchFields = {};
_.each(fetchFields, function(f) { fetchFields[f] = 1 });


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
    search: function(input) {
        var sort = {};
        sort['released'] = '-1';
        var asyncDb = Meteor.wrapAsync(driver.mongo.db.executeDbCommand, driver.mongo.db);
        var result = asyncDb({
            text: 'movies',
            search: input.string || '',
            project: findFields,
            limit: 250
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
    },

    getData: function(input) {
        return Movies.findOne({ _id: input.id }, { fields: fetchFields });
    }
});
