function setup() {
  cnv = createCanvas(windowWidth, windowHeight - 80)
	cnv.elt.onmousedown = mPressed
	cnv.elt.onmouseup = mReleased
	updateText()
	render()
}

var projectile = false

var gravity = 9.81
var angle = Math.PI/4
var magnitude = 4
var origin = 0
var uy
var ux

var t1
var sypeak
var t2
var sytotal
var sx

var Scale = 2
var speed = 1
var timeSinceLanded = null
var grid = false

function windowResized() {
	resizeCanvas(windowWidth, windowHeight - 80)
	render()
}

function updateText() {
	uy = magnitude*Math.sin(angle)
	ux = magnitude*Math.cos(angle)
	t1 = (magnitude*Math.sin(angle) / gravity)
	sypeak = (uy * t1) + (-gravity*t1*t1)/2
	sytotal = sypeak + origin
	t2 = Math.sqrt(sytotal/(gravity/2))
	sx = ux*(t1 + t2)
	document.getElementById("equation").innerHTML = `
	<br>
	<sup> </sup><br>
	<sub> </sub><br>
	<br>
	u<sub>y</sub> = ` + magnitude.toFixed(2) + `⋅sin(` + degrees(angle).toFixed(1) + `) = ` + (uy).toFixed(2) + `<br>
	u<sub>x</sub> = ` + magnitude.toFixed(2) + `⋅cos(` + degrees(angle).toFixed(1) + `) = ` + (ux).toFixed(2) + `<br>

	<br>
	Calculation for time to reach peak:<br>

	v<sub>y</sub> = u<sub>y</sub> + a<sub>y</sub>t<sub>1</sub><br>
	0 = u<sub>y</sub> + a<sub>y</sub>t<sub>1</sub><br>
	t<sub>1</sub> = u<sub>y</sub>÷a<sub>y</sub><br>
	t<sub>1</sub> = ` + (uy / gravity).toFixed(4) + `s<br>
	
	<br>`
	document.getElementById("equation").innerHTML += `Calculation for peak height:<br>
	s<sub>p</sub> = u<sub>y</sub>t<sub>1</sub> + ½a<sub>y</sub>t<sub>1</sub><sup>2</sup><br>
	s<sub>p</sub> = ` + (uy * t1).toFixed(4) + ` - ` + (abs(-gravity*t1*t1)/2).toFixed(4) + `<br> 
	s<sub>p</sub> = ` + (sypeak).toFixed(4) + `m<br>
	
	<br>
	Total displacement in y:<br>
	s<sub>y</sub> = s<sub>p</sub> + origin<br>
	s<sub>y</sub> = ` + sypeak.toFixed(4) + ` + ` + origin + `<br>
	s<sub>y</sub> = ` + (sytotal).toFixed(4) + `m<br>
	
	<br>`
	document.getElementById("equation").innerHTML += `Calculation for remaining flight time:<br>
	s<sub>total</sub> = u<sub>y</sub>t + ½a<sub>y</sub>t<sup>2</sup><br>
	` + sytotal.toFixed(4) + ` = 0⋅t + ½⋅` + gravity + `t<sup>2</sup><br>
	` + sytotal.toFixed(4) + ` ÷ ` + (gravity/2) + ` = t<sup>2</sup><br>
	√` + (sytotal/(gravity/2)).toFixed(4) + ` = t<br>
	t<sub>2</sub> = ` + (t2).toFixed(4) + `s<br>
	
	<br>
	Calculation for range:<br>
	s<sub>x</sub> = u<sub>x</sub>(t<sub>1</sub> + t<sub>2</sub>)<br>
	s<sub>x</sub> = ` + ux.toFixed(2) + `⋅(` + t1.toFixed(4) + ` + ` + t2.toFixed(4) + `)<br>
	s<sub>x</sub> = ` + ux.toFixed(2) + `⋅(` + (t1 + t2).toFixed(4) + `)<br>
	s<sub>x</sub> = ` + sx.toFixed(4) + `m`
}

/*
v = u + at
v^2 = u^2 + 2as
s = ut + ½ at^2
s = ½ (v+u) t
*/

var aimEdit = false
var originEdit = false
var renderer

function mReleased() {
	if (renderer) {
		clearInterval(renderer)
		renderer = false
	}
	aimEdit = false
	originEdit = false
}
function mPressed() {
	if (!renderer) {
		renderer = setInterval(render, 1000/60)
	}
	if (projectile !== false && mouseY < height) {
		projectile = false
		timeSinceLanded = null
	}
	if (mouseY < height) {
		if (mouseX > 80) {
			aimEdit = true
		} else {
			originEdit = true
		}
	}
}

function render() {
	background(0)
	
	col(255)
	var z = 10
	for (i = 0.5; i < map(width, 0, height, 0, Scale); i += 0.5) {
		if (grid) {
			stroke(100)
			line(mapX(i) + 30, 0, mapX(i) + 30, height)
		}
		
		strokeWeight(2)
		stroke(255)
		line(mapX(i) + 30, height - 30, mapX(i) + 30, height - 40)
		
		noStroke()
		text(Math.round(i*z)/z, mapX(i) + 30, height - 40)
		stroke(255)
		
		strokeWeight(1)
	}
	
	if (grid) {
		for (i = 0; i < map(width, 0, height, 0, Scale); i += 0.5) {
				stroke(100)
				line(0, height - 30 - mapX(i), width, height - 30 - mapX(i))
		}
	}
	
	if (projectile === false) {
		
		if (mouseY < height) {
			if (aimEdit) {
				angle = Math.atan2((height- 30 - mapX(origin)) - mouseY, mouseX - 40)
				magnitude = dist(30, height - 30, mouseX, mouseY)/100
				angle = angle < 0 ? 0 : angle > PI/2 ? PI/2 : angle
				document.getElementById("mg").value = magnitude
				document.getElementById("an").value = degrees(angle)
			}
			if (originEdit) {
				origin = Math.floor(map(height-mouseY-30, 0, height, 0, Scale)*100)/100
				if (origin < 0) {
					origin = 0
				}
				col(200,0,200)
				line(0, height-mapX(origin)-28, width, height-mapX(origin)-28)
				document.getElementById("or").value = origin
			}
			updateText()
		}
		
		push()
		for (i = 0; i < magnitude*10; i++) {
			col(255, 255-(i*4), 0)
			ellipse(30+(i*4*Math.cos(angle))/Scale + (100/Scale)*Math.cos(angle),height-30-(i*4*Math.sin(angle))/Scale - (100/Scale)*Math.sin(angle) - mapX(origin), (2*i)/Scale)
		}
		pop()
	}
	
	if (projectile !== false) {
		push()
		translate(30, height - 30)
	  scale(1, -1)
		
		var x
		var y
		
		var t = 0
		col(255, 0, 0)
		while (t < projectile && t < t1 + t2) {
			
			x = ux*t
			y = uy*t + (-gravity*(t*t))/2 + origin
			
			ell(x, y, 3, 3)
			
			t += 0.01
		}
		
		if (projectile > t1) {
			col(0, 255, 0)
			x = ux*t1
			y = uy*t1 + (-gravity*(t1*t1))/2 + origin
			ell(x, y, 5, 5)
		}
		
		if (projectile < t1 + t2) {
			x = ux*projectile
			y = uy*projectile + (-gravity*(projectile*projectile))/2 + origin
			projectile += speed/60
		} else {
			if (timeSinceLanded === null) {
				timeSinceLanded = new Date()
			}
			x = sx
			y = 0
			flag(x)
		}
		col(255)
		ell(x, y, 5, 5)
		
		pop()
	}
	
	drawCannon()
}

function drawCannon() {
	push()
	translate(30, height - 30 - mapX(origin))
	rotate(-angle)
	col(150)
	beginShape()
	vertex(80/Scale, -20/Scale)
	bezierVertex(-60/Scale, -60/Scale, -60/Scale, 60/Scale, 80/Scale, 20/Scale)
	endShape()
	rotate(angle)
	col(130, 82, 1)
	beginShape()
	vertex(-40/Scale, 30/Scale)
	bezierVertex(-40/Scale, -40/Scale, 40/Scale, -40/Scale, 40/Scale, 30/Scale)
	endShape()
	stroke(0)
	line(-10/Scale, 0, 10/Scale, 0)
	line(0, -10/Scale, 0, 10/Scale)
	pop()
	
	col(0, 200, 0)
	rect(0, (height-30) + 2.5, width, height)
	col(0, 220, 0)
	rect(0, (height-30) + 2.5 - mapX(origin), 30 + 40/Scale, height)
}

function mapX(x) {
	return map(x, 0, Scale, 0, height)
}

function ell(x, y, w, h) {
	ellipse(mapX(x), mapX(y), w, h)
}

function col(r, g, b, a){
	if (g === undefined) {
		fill(r)
		stroke(r)
	} else if (a === undefined) {
		fill(r, g, b)
		stroke(r, g, b)
	} else {
		fill(r, g, b, a)
		stroke(r, g, b, a)
	}
}

function flag(x) {
	col(130, 82, 1)
	var mappedX = mapX(x)
	var mappedY = map(new Date() - timeSinceLanded, 0, 1000, 0, 1)
	mappedY = mappedY > 1 ? 1 : mappedY
	line(mappedX, 0, mappedX, height/15*mappedY)
	
	if (renderer && mappedY == 1) {
		clearInterval(renderer)
		renderer = false
	}
	
	col(200, 82, 1)
	var h = height/30
	var w = map(new Date() - this.timeSinceLanded, 0, 1000, 0, h/2)
	w = w > h/2 ? h/2 : w
	var a = h/10
	col(0, 255, 255)
	for (v = 0; v < 4; v++) {
		beginShape()
		vertex(mappedX + v*w, 2*h*mappedY)
		bezierVertex(mappedX + v*w, 2*h*mappedY - a, mappedX + (v+1)*w, 2*h*mappedY - a, mappedX + (v+1)*w, 2*h*mappedY)
	
		vertex(mappedX + (v+1)*w, h*mappedY)
		bezierVertex(mappedX + (v+1)*w, h*mappedY - a, mappedX + v*w, h*mappedY - a, mappedX + v*w, h*mappedY)
		endShape()
		a = -a
	}
	push()
	scale(1, -1)
	fill(0)
	noStroke()
	textSize(height/50*mappedY)
	text(sx.toFixed(4), mappedX + 2, -2*h*mappedY + h*0.7*mappedY)
	pop()
}

function speedInput(that) {
	speed = that.value
	document.getElementById('speedLabel').style.left = "calc(180px + (50% - 180px)*" + that.value + ")"
	document.getElementById('speedLabel').innerHTML = Math.round(that.value*100)+"%"
}

function cor(that) {
	origin = float(that.value)
	render()
	updateText()
	cxx()
}
function cgr(that) {
	gravity = float(that.value)
	render()
	updateText()
	cxx()
}
function can(that) {
	angle = radians(float(that.value))
	render()
	updateText()
	cxx()
}
function cma(that) {
	magnitude = float(that.value)
	render()
	updateText()
	cxx()
}

function cxx() {
	if (!renderer) {
		renderer = setInterval(render, 1000/60)
	}
	timeSinceLanded = null; 
	projectile = 0; 
}