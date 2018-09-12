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

var paths = []

function blinkCursor() {
	cursor.style.display = "block"
	setTimeout(function() {
		cursor.style.display = "none"
		setTimeout(blinkCursor, 500)
	}, 1000)
}

function roadsToNodes() {
  var s = roads.getAttribute("d")
  var x = s.replace(/\s(?![0-9])/g, "")
  x = x.split(/(?=[a-zA-Z])/)
  for (var i = 1; i < x.length; i++) {
    if (x[i][0] != "M" && x[i - 1][0] != "M") {
      x.splice(i, 0, "M" + x[i - 1].match(/[0-9\.\-]+\s*[0-9\.\-]+\s*$/)[0])
    }
  }
  var p1, p2
  for (var i = 0; i < x.length; i += 2) {
    p1 = x[i].match(/[0-9\.\-]+\s*[0-9\.\-]+\s*$/)[0].split(" ")
    p2 = x[i + 1].match(/[0-9\.\-]+\s*[0-9\.\-]+\s*$/)[0].split(" ")
    p1[0] = parseFloat(p1[0])
    p1[1] = parseFloat(p1[1])
    p2[0] = parseFloat(p2[0])
    p2[1] = parseFloat(p2[1])
    tempPath.setAttribute("d", x[i] + " " + x[i + 1])
    paths.push({points: [{x: p1[0], y: p1[1]}, {x: p2[0], y: p2[1]}], distance: tempPath.getTotalLength(), text: x[i + 1].match(/^.+?(?=(\s*[0-9\.\-]+\s*){2}$)/)})
  }
  console.log(paths)

  pathTo({x: 63.7, y: 23.9}, {x: 63.8, y: 26.4})
}

function pathTo(start, target) {
  var startNode
  for (var i = 0; i < paths.length; i++) {
    for (var j = 0; j < paths[i].points.length; j++) {
      if (paths[i].points[j].x == start.x && paths[i].points[j].y == start.y) {
        startNode = {i: i, p: j}
        break
      }
    }
  }
  var lookAts = [{path: [], current: startNode}]
  var lookTos = []
  var max_distance = Infinity
  var path = []
  while (lookAts.length > 0) {
    lookTos = []
    for (var j = 0; j < lookAts.length; j++) {
      for (var i = 0; i < paths.length; i++) {
        for (var p = 0; p < paths[i].points.length; p++) {
          var I = lookAts[j].current.i, P = lookAts[j].current.p
          if (i == I && p == P) {
            continue
          }
          ZZXCX = paths[I].points[P].x
          if (paths[i].points[p].x == paths[I].points[P].x && paths[i].points[p].y == paths[I].points[P].y) {
            var inPath = false
            for (var v = 0; v < lookAts[j].path.length; v++) {
              if (lookAts[j].path[v].i == i && lookAts[j].path[v].p == p) {
                inPath = true
                break
              }
            }
            if (!inPath) {
              lookTos.push({
                path: lookAts[j].path.concat([lookAts[j].current]),
                current: {i: i, p: p}
              })
            }
          }
        }
      }
      var inPath = false
      for (var i = 0; i < lookAts[j].path.length; i++) {
        if (lookAts[j].path[i].i == lookAts[j].current.i && lookAts[j].path[i].p == (lookAts[j].current.p ? 0 : 1)) {
          inPath = true
          break
        }
      }
      if (!inPath) {
        lookTos.push({
          path: lookAts[j].path.concat([lookAts[j].current]),
          current: {i: lookAts[j].current.i, p: (lookAts[j].current.p ? 0 : 1)}
        })
      }
    }
    for (var i = 0; i < lookTos.length; i++) {
      //max_distance
      if (getDistance(lookTos[i].path.concat(lookTos[i].current)) > max_distance) {
        lookTos.splice(i, 1)
        i -= 1
      } else {
        let point = paths[lookTos[i].current.i].points[lookTos[i].current.p]
        if (point.x == target.x && point.y == target.y) {
          path = lookTos[i].path.concat(lookTos[i].current)
          max_distance = getDistance(path)
          lookTos.splice(i, 1)
          i = 0
          //lookTos = []
        }
      }
    }
    lookAts = lookTos.slice(0)
  }
  console.log(path)
  var Path = "M" + paths[path[0].i].points[path[0].p].x + " " + paths[path[0].i].points[path[0].p].y + " "
  for (var i = 0; i < path.length; i += 1) {
    var p = paths[path[i].i].points[path[i].p]
    Path += p.x + " " + p.y + " "
  }
  console.log(Path)
  route.setAttribute("d", Path)
  return path
}

// {i: 68, p: 1}
// {i: 68, p: 0}
// {i: 67, p: 1}
// {i: 67, p: 0}

function getDistance(path) {
  var distance = 0
  for (var i = 1; i < path.length; i++) {
    if (path[i - 1].i == path[i].i) {
      distance += paths[path[i].i].distance
    }
  }
  return distance
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

  roadsToNodes()

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

var down_ = false

function down(evt) {
  down_ = true
  evt.preventDefault()
  move(evt)
}
function up(evt) {
  down_ = false
  evt.preventDefault()
}

function move(evt) {
  if (down_) {
    var s = Math.min(mapSvg.clientHeight, mapSvg.clientWidth)
    var x, y
    if (mapSvg.clientHeight < mapSvg.clientWidth) {
      x = (evt.clientX - (mapSvg.clientWidth - s)/2) / s    * 100
      y = evt.clientY / s                                   * 100
    } else {
      x = evt.clientX / s                                   * 100
      y = (evt.clientY - (mapSvg.clientHeight - s)/2) / s   * 100
    }
    x = Math.round(x * 10)/10
    y = Math.round(y * 10)/10

    //console.log(x, y)

    // if (
    //   Math.sqrt(Math.pow(x - blue.cx.baseVal.value, 2) + Math.pow(y - blue.cy.baseVal.value, 2)) <
    //   Math.sqrt(Math.pow(x - green.cx.baseVal.value, 2) + Math.pow(y - green.cy.baseVal.value, 2))
    // ) {
    //   blue.cx.baseVal.value = x
    //   blue.cy.baseVal.value = y
    // } else {
    //   green.cx.baseVal.value = x
    //   green.cy.baseVal.value = y
    // }
    // curve.setAttribute("d", `M72 56.9 C${blue.cx.baseVal.value} ${blue.cy.baseVal.value} ${green.cx.baseVal.value} ${green.cy.baseVal.value} 74 64.5`)
  }
  evt.preventDefault()
}

function placeAt(target, x, y, mult, points) {
  var z = makeArray(points, mult, target)
  z = z.split(" ")
  for (var i = 0; i < z.length; i += 2) {
    z[i] = parseFloat(z[i]) + x
    z[i + 1] = parseFloat(z[i + 1]) + y
  }
  var t = "M" + Math.round(z[0]*100)/100 + " " + Math.round(z[1]*100)/100
  var vals = {x: z[0], y: z[1]}
  for (var i = 0; i < z.length - 2; i += 2) {
    t += "l" + Math.round((z[i] - vals.x) * 100)/100 + " " + Math.round((z[i + 1] - vals.y) * 100)/100
    vals = {x: z[i], y: z[i + 1]}
  }
  t+="z"
  console.log(t)
  target.setAttribute("d", t)
}

function makeArray(s, mult, target) {
  s = s.split(" ")
  for (var i = 0; i < s.length; i++) {
    s[i] = parseFloat(s[i])
  }
  var x = []
  var y = []
  for (var i = 0; i < s.length; i++) {
    (i % 2 ? y : x).push(s[i])
  }
  mx = Math.min.apply(false, x)
  my = Math.min.apply(false, y)
  for (var i = 0; i < x.length; i++) {
    x[i] = (x[i] - mx)
    y[i] = (y[i] - my)
  }
  M = Math.max.apply(true, s)
  for (var i = 0; i < x.length; i++) {
    x[i] = x[i]/M * mult
    y[i] = y[i]/M * mult
  }
  for (var i = 0; i < x.length; i++) {
    x[i] = Math.round(x[i] * 100)/100
    y[i] = Math.round(y[i] * 100)/100
  }
  s = []
  for (var i = 0; i < x.length; i++) {
    s.push(x[i])
    s.push(y[i])
  }
  s = s.join(" ")
  return s
}

function getPoint(s) {
  var z = s.split(/[^0-9\.-]/).slice(1)
  console.log(z)
  var tx = 0, ty = 0
  for (var i = 0; i < z.length; i += 2) {
    tx += parseFloat(z[i])
    ty += parseFloat(z[i + 1])
  }
  console.log(tx, ty)
}
