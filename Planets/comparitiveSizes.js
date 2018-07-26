var zoom = 3

function setup() {
  cnv = createCanvas(windowWidth, windowHeight)
	solarSystem.sort(function(a, b){
		return a.diameter - b.diameter
	})
	textAlign(CENTER)
	noStroke()
}

function draw() {
  background(0)
	zoom *= 1.005
	shove = (solarSystem[0].diameter/zoom)/2
	for (i = 0; i < solarSystem.length; i++) {
		x = (solarSystem[i].diameter/zoom)/2
		fill(solarSystem[i].color)
		stroke(solarSystem[i].color)
		ellipse(shove, height-x, solarSystem[i].diameter/zoom)
		fill(255 - solarSystem[i].color[0], 255 - solarSystem[i].color[1], 255 - solarSystem[i].color[2])
		textSize(x/2)
		text(solarSystem[i].name, shove, height - x*0.9)
		//(r + R)^2 = x^2 + (R - r)^2
		if (i + 1 < solarSystem.length) {
			r = x
			R = (solarSystem[i+1].diameter/zoom)/2
			z = Math.pow(Math.pow(r + R, 2) - Math.pow(R - r, 2), 1/2)
		}
		shove += z + 1
	}
}