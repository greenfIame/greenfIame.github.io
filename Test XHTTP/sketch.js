function start() {
	//https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0
	// var xhttp = new XMLHttpRequest()
	// 	xhttp.onreadystatechange = function() {
	// 		console.log(["request not initialized", "server connection established", "request received", "processing request", "request finished and response is ready"][this.readyState])
	// 	}
	//   xhttp.onload = function() {
	//     console.log(this)
	//   }
	// 	xhttp.onerror = function() {
	// 		console.log("failed")
	// 	}
	//   xhttp.open("GET", 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0&origin=null', true)
	//   xhttp.send()
	
	$.ajax( {
	    url: 'https://en.wikipedia.org/w/api.php',
	    data: {
	        action: 'query',
	        meta: 'userinfo',
	        format: 'json',
	        origin: 'https://greenfiame.github.io/Test%20XHTTP/index.html'
	    },
	    xhrFields: {
	        withCredentials: true
	    },
	    dataType: 'json'
	} ).done( function ( data ) {
	    alert( 'Foreign user ' + data.query.userinfo.name +
	        ' (ID ' + data.query.userinfo.id + ')' );
	} );
}

