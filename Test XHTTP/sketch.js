function start() {
	//						https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0
	$.ajax( {
		url: 'https://en.wikipedia.org/w/api.php',
		data: {
			action: 'parse',
			format: 'json',
			page: 'helium',
			section: '0',
			origin: 'https://greenfiame.github.io/Test%20XHTTP/index.html'
    },
		dataType: 'json',
		type: 'GET',
		headers: { 'Api-User-Agent': 'Example/1.0' },
		success: function(data) {
			console.log(data)
       // do something with data
    }
	} );
}

