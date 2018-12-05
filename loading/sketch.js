function start() {
	x = loading
	y = document.createElement("div")
	for (var i = 0; i < 20; i++) {
		z = document.createElement("img")
		z.className = i == 0 ? "a" : ""
		z.id = i + "i"
		z.src = `Final${(i+"").length - 1 ? i : "0" + i}.png`
		y.appendChild(z)
	}
	x.appendChild(y)
	setInterval(function(){
		var a = document.querySelector(".a")
		a.className = ""
		window[(parseFloat(a.id) + 1) % 20 + "i"].className = "a"
	}, 50)
}