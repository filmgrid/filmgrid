Template.sidebar.events = {
  	'change #filter-genre': handleFilter,
  	'change #sort-type': handleSort
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