
Template.sidebar.events = {
  	'change #filter-genre': handleFilter
};

function handleFilter() {
    var genre = $('#filter-genre').val() || undefined;
    Session.set('query', { page: 1, genre: genre });
}
