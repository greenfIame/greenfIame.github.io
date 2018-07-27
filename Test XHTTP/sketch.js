function start() {
	var u = 	"https://en.wikipedia.org/w/api.php"
	var data = {
		action: 'parse',
		format: 'json',
		page: 'helium',
		section: '0',
		origin: 'https://greenfiame.github.io/Test%20XHTTP/index.html'
	}
	var url = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0"


	$.ajax( {
	    url: 'https://en.wikipedia.org/w/api.php',
	    data: data,
	    xhrFields: {
	        withCredentials: true
	    },
			headers: { 'Api-User-Agent': 'Example/1.0' },
	    dataType: 'json'
	} ).done( function ( data ) {
		alert(data);
	} );
}

