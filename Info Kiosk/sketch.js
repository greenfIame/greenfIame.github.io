svg = `
<defs>
  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
		<stop offset="80%" style="stop-color:#000; stop-opacity:1" />
    <stop offset="100%" style="stop-color:#000; stop-opacity:0" />
  </linearGradient>
	<linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
		<stop offset="80%" style="stop-color:#fff; stop-opacity:1" />
    <stop offset="100%" style="stop-color:#fff; stop-opacity:0" />
  </linearGradient>
</defs>

<path d="M38 59l0 -32a4 4 0 0 1 9 0l0 19a5 5 0 0 1 9 3a5 5 0 0 1 8 3a5 5 0 0 1 7 5l0 10q0 11 -4.5 17l0 9l-26.5 0l0 -13q-8 -8 -13 -22q0 -7 6 -4Z" fill="url(#grad1)" stroke="url(#grad2)" stroke-width="2"/>
<path d="M35 45.5a20 20 0 1 1 19.5 -2.5M35.8 35a11 11 0 1 1 13.4 0" stroke="#fff" stroke-width="4" fill="none"/>
<path d="M35 45.5a20 20 0 1 1 19.5 -2.5M35.8 35a11 11 0 1 1 13.4 0" stroke="#000" stroke-width="2" fill="none"/>
`

function blinkCursor() {
	cursor.style.display = "block"
	setTimeout(function() {
		cursor.style.display = "none"
		setTimeout(blinkCursor, 500)
	}, 1000)
}

function start() {
	//document.body.onclick = function() {if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {f()}}
	var s = buttonArea.querySelectorAll("svg")
	for (var i = 0; i < s.length; i++) {
		s[i].innerHTML = svg
	}

	setInterval(function(){
		backgroundFront.style.opacity = backgroundFront.style.opacity == 0 ? 1 : 0
	}, 5000)


	blinkCursor()

	var keys = "½1234567890½qwertyuiop⌫½asdfghjkl⏎±zxcvbnm±±±±½ "
	for (var i = 0; i < keys.length; i++) {
		d = document.createElement("div")
		d.innerHTML = keys[i].toUpperCase()
		d.className = "key"
		switch (keys[i]) {
			case "⌫":
				d.style.width = "1.5em"
				d.style.lineHeight = "1.1em"
				d.onclick = function() {
					searchBox.innerHTML = searchBox.innerHTML.slice(0, -1)
					placeCursor()
				}
				break
			case "½":
				d.style.width = "0.5em"
				d.innerHTML = ""
				d.style.background = "none"
				break
			case "⏎":
				d.style.width = "2em"
				d.style.lineHeight = "1.1em"
				d.onclick = function() {
					keyboardContainer.style.bottom = "-5.9em"
				}
				break
			case "±":
				d.innerHTML = ""
				d.style.background = "none"
				break
			case " ":
				d.style.width = "8.1em"
			default:
				d.onclick = function(evt) {
					searchBox.innerHTML += this.innerHTML
					placeCursor()
				}
		}

		keyboard.appendChild(d)
	}

}

function placeCursor() {
	textWidth.style.fontSize = "calc((100vw / 16) * 1.5)"
	textWidth.innerHTML = searchBox.innerHTML + "."
	var w1 = textWidth.clientWidth
	textWidth.innerHTML = "."
	cursor.style.left = `calc(10% + ${w1 - textWidth.clientWidth}px)`
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

c('M371.81,376.84s5.85,20.74-3.11,32.36c-10.42,13.52-17.93,15.22-34.06,16.24s-183.5,4.61-183.5,4.61v9.42H86.58l0,9.19H43.33')

function c(str) {
  var values = []
  var b = true
  do {
    x = /[0-9.]+/.exec(str)
    if (!x) {
      break
    }
    str = str.substring(x.index + x[0].length)
    values.push(x[0] / (b ? 595.28 : 841.89) * 100  )
    b = !b
  } while (true)
  values = values.join(" ")
  console.log(values)
  return values
}
