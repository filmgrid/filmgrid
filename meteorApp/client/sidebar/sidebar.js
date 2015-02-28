Template.sidebar.events = {
  	'change #filter-genre': handleFilter,
  	'change #sort-type': handleSort,
    'keyup #search': handleSearch,
    'change #search': handleSearch
};

Template.sidebar.helpers({
    navSelectedIs : function (nav) {
        return this.navSelected === nav;
    }
});

function handleFilter() 
{
    var genre = $('#filter-genre').val().replace('All', '') || undefined;
    var query = Session.get('query') || {};
    query.filter = { genre: genre };
    Session.set('query', query);
}

function handleSort() 
{
    var sort = $('#sort-type').val() || undefined;
 	var query = Session.get('query') || {};
    query.sortBy = sort;
    Session.set('query', query);
}

function handleSearch(e) 
{
    var val = $('#search').val() || undefined;
    handleSearchLocal(val);
    if (Session.get('type') === 'suggested')
    {
        if (val && val.length > 2 || e.keyCode == 13)
            handleSearchGlobal(val);   
        else
            Session.set('searchResults', undefined);
    }
}

function handleSearchGlobal(val) 
{
    Meteor.call('searchMovies', val , function(error, result) {
        Session.set('searchResults', result);
    });
}

function handleSearchLocal(val)
{
    Session.set('searchString', val);
}