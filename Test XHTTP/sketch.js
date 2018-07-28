function start() {
	//						https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0
	var url = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0&origin=*"
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function() {
		console.log(["request not initialized", "server connection established", "request received", "processing request", "request finished and response is ready"][this.readyState])
	}
  xhttp.onload = function() {
    x = this
  }
	xhttp.onerror = function() {
		console.log("failed")
	}
  xhttp.open("GET", url, true)
	xhttp.setRequestHeader("Api-User-Agent", "request")
  xhttp.send()
	
	// $.ajax( {
	//     url: 'https://en.wikipedia.org/w/api.php',
	//     data: queryData,
	//     dataType: 'json',
	//     type: 'POST',
	//     headers: { 'Api-User-Agent': 'Example/1.0' },
	//     success: function(data) {
	//        // do something with data
	//     }
	// } );
}

