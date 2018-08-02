function start() {
	
}

function f() {
	document.fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
	if (document.fullscreenElement) {
		document.exitFullscreen = document.exitFullscreen || document.mozExitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen
		document.exitFullscreen && document.exitFullscreen()
	} else {
		var docElm = document.getElementById("screen")
		docElm.requestFullscreen = docElm.requestFullscreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullScreen || docElm.msRequestFullscreen
		docElm.requestFullscreen && docElm.requestFullscreen()
	}
}
