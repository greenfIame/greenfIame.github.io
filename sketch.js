var scrollShowing = false

function start() {
	window.addEventListener('resize', resize)
	window.addEventListener('scroll', scroll_)
	resize()
	scroll_()
}

function resize() {
	var w = window.innerWidth > 1000 ? window.innerWidth : 1000
	w = w * 2/3 < window.innerHeight ? window.innerHeight * 3/2 : w
	staticBGI.style.width = w + "px"
	staticBGI.style.height = w * 2/3 + "px"
	staticBGI.style.left = -(w - window.innerWidth)/2 + "px"
	staticBGI.style.top = -(w * 2/3 - window.innerHeight)/2 + "px"
}

function scroll_() {
	var s = document.documentElement.scrollTop || document.body.scrollTop
	if (s > window.innerHeight * 2/3) {
		if (!scrollShowing) {
			toTop.className = ""
			scrollShowing = true
		}
	} else if (scrollShowing) {
		toTop.className = "inactive"
		scrollShowing = false
	}
}


function scrollTo(v) {
	document.body.scrollTop = v; // For Safari
	document.documentElement.scrollTop = v; // For Chrome, Firefox, IE and Opera
}

function scrollToTop() {
	var p
	for (var i = 1; i <= 100; i++) {
		p = Math.floor(1/(1 + Math.exp(12*(i/100) - 5))*1000)/1000
		setTimeout(scrollTo.bind(null, (document.documentElement.scrollTop || document.body.scrollTop)*p), i * 10)
	}
}
