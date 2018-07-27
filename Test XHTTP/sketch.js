function start() {
	//https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0
	var xhttp = new XMLHttpRequest()
		xhttp.onreadystatechange = function() {
			console.log(["request not initialized", "server connection established", "request received", "processing request", "request finished and response is ready"][this.readyState])
		}
	  xhttp.onload = function() {
	    console.log(this)
	  }
		xhttp.onerror = function() {
			console.log("failed")
		}
	  xhttp.open("GET", 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0', true)
	  xhttp.send()
}