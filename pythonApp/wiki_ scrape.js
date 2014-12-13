function arrayUnique(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
}

function getTitles(year, titles) {
	$.get('http://en.wikipedia.org/wiki/' + year + '_in_film', function(response) {

		var doc = document.implementation.createHTMLDocument('');
	    doc.documentElement.innerHTML = response;

	    var links = doc.querySelectorAll('i a')

		for (var i=0; i<links.length; ++i) {
			var title = links[i].getAttribute('title');
			if (title) titles.push(title.replace(/\(.*\)/g, '').replace(/\"/g, "'").trim());
		};

	    console.log('Done for year ' + year);
	});
}

var titles = [];

for (var i = 1960; i <= 2016; ++i) {
	getTitles(i, titles)
}

// ----------------------------------------------

titles  = arrayUnique(titles);

'["' + titles.join('", "') + '"]'
