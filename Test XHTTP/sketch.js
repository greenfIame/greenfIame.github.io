function start() {
	//						https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0
	// var url = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0&origin=https://greenfiame.github.io/Test%20XHTTP/index.html"
// 	console.log(url)
// 	var xhttp = new XMLHttpRequest()
// 	xhttp.onreadystatechange = function() {
// 		console.log(["request not initialized", "server connection established", "request received", "processing request", "request finished and response is ready"][this.readyState])
// 	}
//   xhttp.onload = function() {
//     console.log(this)
//   }
// 	xhttp.onerror = function() {
// 		console.log("failed")
// 	}
//   xhttp.open("GET", url, true)
//   xhttp.send()
	/*
	$.ajax( {
	    url: 'https://en.wikipedia.org/w/api.php',
	    data: {
				action: 'parse',
				format: 'json',
				page: 'helium',
				section: '0'
				origin: 'https://greenfiame.github.io/Test%20XHTTP/index.html'
	    },
	    xhrFields: {
	       withCredentials: true
	    },
	    dataType: 'json'
	} ).done( function ( data ) {
		alert(data);
	} );
	*/
	$.ajax( {
    url: 'https://en.wikipedia.org/w/api.php',
    data: {
			action: 'parse',
			format: 'json',
			page: 'helium',
			section: '0'
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

