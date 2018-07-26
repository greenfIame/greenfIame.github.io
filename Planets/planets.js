var time = 0
var speed = 30
var target = 0
var zoom = 1000000
var ctx
var selected = 3
var showOverlay = true

function setup() {
  cnv = createCanvas(windowWidth, windowHeight)
	cnv.id("mainCanvas")
	
	document.getElementById("mainCanvas").onclick = click
	cnv = document.getElementById("myCanvas")
	cnv.width = windowWidth
	cnv.height = windowHeight
	ctx = cnv.getContext("2d")
	cnv = document.getElementById("temp")
	cnv.width = windowWidth
	cnv.height = windowHeight
	solarSystem[3].line = "start"
	solarSystem[2].line = "end"
}

function keyPressed() {
	if (keyCode >= 49 && keyCode <= 57) {
		target = keyCode - 49
		selected = keyCode - 49
		update()
		Clear()
	} else if (keyCode == 187) {
		zoom /= 1.5
		document.getElementById("temp").getContext("2d").drawImage(document.getElementById("myCanvas"), (width-(width*1.5))/2, (height-(height*1.5))/2, width*1.5, height*1.5)
		Clear()
		document.getElementById("myCanvas").getContext("2d").drawImage(document.getElementById("temp"), 0, 0)
		document.getElementById("temp").getContext("2d").clearRect(0, 0, width, height)
	} else if (keyCode == 189) {
		zoom *= 1.5
		document.getElementById("temp").getContext("2d").drawImage(document.getElementById("myCanvas"), (width-(width/1.5))/2, (height-(height/1.5))/2, width/1.5, height/1.5)
		Clear()
		document.getElementById("myCanvas").getContext("2d").drawImage(document.getElementById("temp"), 0, 0)
		document.getElementById("temp").getContext("2d").clearRect(0, 0, width, height)
	} else if (keyCode == 219) {
		speed -= 1
	} else if (keyCode == 221) {
		speed += 1
	} else if (key == "O") {
		speed -= 100
	} else if (key == "P") {
		speed += 100
	}
}

function draw() {
	time += speed/60
  background(0)
	fill(255)
	noStroke()
	
	text(Math.floor(time/365) + " years, " + Math.round(time % 365) + " days", 0, 20)
	text(speed + " days per second", 0, 10)
	text(zoom, 0, 30)
	
  push()
  translate(width/2, height/2)
  
	offset = {x: width/2 -solarSystem[target].x, y: height/2 -solarSystem[target].y}
	
	for (i = 0; i < solarSystem.length; i++) {
		solarSystem[i].update()
	}
	translate(-solarSystem[target].x, -solarSystem[target].y)
	
	for (i = 0; i < solarSystem.length; i++) {
		solarSystem[i].render()
	}
	
	stroke(255, 0, 255)
	for (i = 0; i < solarSystem.length; i++) {
		if (solarSystem[i].line == "start") {
			for (j = 0; j < solarSystem.length; j++) {
				if (solarSystem[j].line == "end") {
					push()
					translate(solarSystem[i].x, solarSystem[i].y)
					angle = Math.atan2(solarSystem[j].y - solarSystem[i].y, solarSystem[j].x - solarSystem[i].x)
					rotate(angle)
					line(0, 0, Math.max(windowWidth, windowHeight), 0)
					pop()
				}
			}
		}
	}
	
  pop()
	
	//distance/zoom = pixels
	push()
	rect(0, height-10, width, 15)
	
	fill(0)
	
	amt = roundIt((width*zoom)/2, 2)
	textAlign(CENTER)
	text(amt, (amt/zoom)/2, height-1)
	text(amt, (amt/zoom)*1.5, height-1)
	
	stroke(255, 0, 0)
	line(amt/zoom, height-10, amt/zoom, height)
	line(amt/zoom*2, height-10, amt/zoom*2, height)

	pop()
}

function click() {
	if (mouseY < height) {
		x = mouseX - offset.x
		y = mouseY - offset.y
		item = {index: null, dist: 100}
		for (z = 0; z < solarSystem.length; z++) {
			d = dist(solarSystem[z].x, solarSystem[z].y, x, y)
			if (d < item.dist) {
				item.dist = d
				item.index = z
			}
		}
		if (item.index !== null) {
			selected = item.index
			update()
		} else {
			document.getElementById("info").innerHTML = ""
		}
	}
}

//–––––––––––//–––––––––––//–––––––––––//–––––––––––//–––––––––––//–––––––––––//–––––––––––//–––––––––––//–––––––––––//–––––––––––//

function update() {
	if (solarSystem[selected].trail) {
		trailColour = "green"
	} else {
		trailColour = "red"
	}
	if (showOverlay) {
		overlayColour = "green"
	} else {
		overlayColour = "red"
	}
	if (solarSystem[selected].line == "start") {
		lineColour = "lightblue"
	} else if (solarSystem[selected].line == "end") {
		lineColour = "orange"
	} else {
		lineColour = "red"
	}

	document.getElementById("info").innerHTML = solarSystem[selected].name + ":<br>"
	
	if (selected !== 0) {
		document.getElementById("info").innerHTML +=
		(solarSystem[selected].dist)/1000000 + " million km from the sun.<br>" + 
		solarSystem[selected].orbitDuration + " Earth days in one orbit.<br>"
	}
	
	document.getElementById("info").innerHTML +=
	solarSystem[selected].diameter + " km diameter.<br>" +
	Math.round(solarSystem[selected].density*10000)/10000 + " g/cm^3 density.<br>" +
	
	"<p onclick=\"editTrail()\" style=\"background-color: " + trailColour + "; padding: 0; margin: 0; \">Trails.</p>" +
	"<p onclick=\"editLine()\" style=\"background-color: " + lineColour + "; padding: 0; margin: 0; \">" + solarSystem[selected].line + "</p>" +
	"<p onclick=\"showOverlay = !showOverlay; update()\" style=\"background-color: " + overlayColour + "; padding: 0; margin: 0; \">Show planet overlays.</p>"
}

function editTrail() {
	solarSystem[selected].trail = !solarSystem[selected].trail
	solarSystem[selected].prev = {}
	solarSystem[selected].x = undefined
	solarSystem[selected].y = undefined
	update()
}

function editLine() {
	if (solarSystem[selected].line == false) {
		solarSystem[selected].line = "start"
	} else if (solarSystem[selected].line == "start") {
		solarSystem[selected].line = "end"
	} else {
		solarSystem[selected].line = false
	}
	update()
}

function Clear() {
	for (j = 0; j < solarSystem.length; j++) {
		solarSystem[j].prev = {}
		solarSystem[j].x = undefined
		solarSystem[j].y = undefined
	}
	ctx.clearRect(0, 0, width, height)
}

function roundIt(number, accuracyTo) {
	roundTo = Math.pow(10, Math.floor(number).toString().length-accuracyTo)
	return Math.round(number/roundTo)*roundTo
}

function spaceNumb(inp) {
	out = ""
	inp = inp.toString()
	up = 0
	for (y = inp.length-1; y >= 0; y--) {
		if (up % 3 == 0 && up !== 0) {
			out = inp[y] + "," + out
		} else {
			out = inp[y] + out
		}
		up += 1
	}
	return out
}