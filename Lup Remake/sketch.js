var cnv, ctx, mapctx, minictx, updater, paused, map, keys = {}
var sensitivity = 1

function start() {
	cnv = maincanvas
	ctx = cnv.getContext("2d")
	mapctx = mapcanvas.getContext("2d")
	minictx = minimap.getContext("2d")

	document.addEventListener("mousemove", mousemove)
	document.addEventListener("keydown", keydown)
	document.addEventListener("keyup", keyup)
	document.addEventListener("mousedown", mousedown)
	document.addEventListener("mouseup", mouseup)
	if ("onpointerlockchange" in document) {
		document.addEventListener("pointerlockchange", plc)
	} else if ("onmozpointerlockchange" in document) {
		document.addEventListener("mozpointerlockchange", plc)
	} else if ("onwebkitpointerlockchange" in document) {
		document.addEventListener("webkitpointerlockchange", plc)
	}

	createMap()
	render2d()
	update()
	render()
}

function pl() {return document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement}

function pointerLock() {
	if (!pl()) {
		cnv.requestPointerLock = cnv.requestPointerLock || cnv.mozRequestPointerLock || cnv.webkitRequestPointerLock
		cnv.requestPointerLock && cnv.requestPointerLock()
	}
}

function plc() {

}

function fullscreen() {
	if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
		game.requestFullscreen = game.requestFullscreen || game.mozRequestFullScreen || game.webkitRequestFullScreen || game.msRequestFullscreen
		game.requestFullscreen && game.requestFullscreen()
	}
}

function mousemove(evt) {
	if (pl()) {
		player.heading += evt.movementX * 0.004 * sensitivity
	}
}

function keydown(evt) {
	switch (evt.key) {
		case "f":
			fullscreen()
			break
		case "p":
			paused = !paused
			if (!paused) {
				update()
				render()
			}
			break
		default:
			keys[evt.key] = true
	}
}

function keyup(evt) {
	keys[evt.key] = false
}

function mousedown() {
	pointerLock()
}

function mouseup() {

}

function update() {
	player.update()
	if (!paused) {
		setTimeout(update, 1000/60)
	}
}

function updateMinimap() {
	pos = {x: (player.pos.x + 0.15)/map.length, y: (player.pos.y + 0.23)/map[0].length, zoom: 4}
	minimap.style.width = `${pos.zoom * 100}%`
	minimap.style.height = `${pos.zoom * 100}%`
	minimap.style.left = `calc(50% - ${pos.zoom*pos.x} * 100%)`
	minimap.style.top = `calc(50% - ${pos.zoom*pos.y} * 100%)`
	minimapWrapper.style.transform = `rotate(${-player.heading - Math.PI/2}rad)`
}

function render() {
	render3d()
	//render2d()
	//updateMinimap()
	if (!paused) {
		requestAnimationFrame(render)
	}
}

function render3d() {
	ctx.fillStyle = "#aaa"
	ctx.fillRect(0, 0, cnv.width, cnv.height)
	player.render3d()
}

function render2d() {
	mapctx.clearRect(0, 0, mapcanvas.width, mapcanvas.height)

	var m = 5

	mapctx.fillStyle = "#fff"
	mapctx.beginPath()
	for (var i = 0; i < map.length; i++) {
		for (var j = 0; j < map[i].length; j++) {
			if (map[i][j].u) {
				mapctx.rect(i * m, j * m, m + 1, 1)
			}
			if (map[i][j].l) {
				mapctx.rect(i * m, j * m, 1, m + 1)
			}
		}
	}
	mapctx.fill()

	mapctx.fillStyle = "#f00"
	//mapctx.fillRect(player.pos.x * m - 1, player.pos.y * m - 1, 3, 3)
	mapctx.strokeStyle = "#000"

	//var r = castRay(player.heading, player.pos.x, player.pos.y, false, m)

}

function createMap() {
	var x = 0, y = 0, temp = {}

	mapData = mapData.split("\n")

	for (var i = 0; i < mapData[0].length; i++) {
		for (var j = 0; j < mapData.length; j++) {
			if (" |¯".indexOf(mapData[j][i]) === -1) {
				temp[mapData[j][i]] = {x: Math.floor(i/2), y: j}
			}
		}
	}
	var keys = Object.keys(temp)
	for (var i = 0; i < keys.length; i++) {
		for (var j = i + 1; j < keys.length; j++) {
			if (keys[j].toLowerCase() == keys[i].toLowerCase()) {
				break
			}
		}
		if (j < keys.length) {
			portals[keys[i].toLowerCase()].x = temp[keys[i].toUpperCase()].x
			portals[keys[i].toLowerCase()].y = temp[keys[i].toUpperCase()].y

			portals[keys[i].toUpperCase()] = portals[keys[i].toUpperCase()] ? portals[keys[i].toUpperCase()] : {}
			var r = portals[keys[i].toLowerCase()].rotate
			portals[keys[i].toUpperCase()].rotate = !r ? false : (r == "reverse" ? "reverse" : (r == "left" ? "right" : "left"))
			var s = portals[keys[i].toLowerCase()][i % 2 == 1 ? "down" : "right"]
			portals[keys[i].toUpperCase()][portals[keys[i].toLowerCase()].right ? "right" : "down"] = null
			portals[keys[i].toUpperCase()].x = temp[keys[i].toLowerCase()].x
			portals[keys[i].toUpperCase()].y = temp[keys[i].toLowerCase()].y
		}
	}
	map = Array.apply(null, Array(mapData[0].length/2)).map(i => [])

	for (var i = 0; i < mapData[0].length; i += 2) {
		for (var j = 0; j < mapData.length; j++) {
			if (mapData[j][i + 1] == "@") {
				mapData[j][i + 1] = "¯"
				player.pos.x = i/2 + 0.5
				player.pos.y = j + 0.5
			} else if (mapData[j][i] == "@") {
				mapData[j][i] = "¯"
				player.pos.x = i/2 + 0.5
				player.pos.y = j + 0.5
			}
			map[i/2][j] = {
				l: mapData[j][i] == "|" || {D: {state: 1}}[mapData[j][i]] || portals[mapData[j][i]],
				u: mapData[j][i + 1] == "¯" || {D: {state: 1}}[mapData[j][i + 1]] || portals[mapData[j][i + 1]],
			}
		}
	}

	mapcanvas.width = map.length * 5
	mapcanvas.height = map[0].length * 5
	minimap.width = map.length * 2
	minimap.height = map[0].length * 2
}
