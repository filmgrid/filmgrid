Template.sidebar.events = {
  	'change #filter-genre': handleFilter,
  	'change #sort-type': handleSort,
    'change #search': handeSearch
};

Template.sidebar.navSelectedIs = function (nav) {
    return this.navSelected === nav;
};

function handleFilter() {
    var genre = $('#filter-genre').val() || undefined;
    var query = Session.get('query');
    query.filter = {type : "genre", value : genre};
    Session.set('query', query);
}

function handleSort() {
    var sort = $('#sort-type').val() || undefined;
    console.log("I am here");
 	var query = Session.get('query');
    query.sortBy = sort;
    Session.set('query', query);
}

function handeSearch() {
    Meteor.call('searchMovies', $('#search').val(), function(error, result) {
        console.log(result.map(function(x) { return [x.obj.title, x.obj.plot]; }));
    });
}
