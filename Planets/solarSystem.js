var solarSystem = [
	new object(0, Infinity, 255, 255, 0, "Sun", 1391400, 1.989e+30),

	new object(57.9e+6, 87.97, 111, 111, 111, "Mercury", 4879, 0.33e+24),
	new object(108.2e+6, 224.70, 150, 90, 34, "Venus", 12104, 4.87e+24),

	new object(149.6e+6, 365.26, 0, 150, 255, "Earth", 12756, 5.97e+24),

	new object(227.9e+6, 686.98, 222, 133, 100, "Mars", 6792, 0.642e+24),
	new object(778.3e+6, 4332.82, 181, 156, 112, "Jupiter", 142984, 1898e+24),
	new object(1427.0e+6, 10755.70, 195, 160, 120, "Saturn", 120536, 568e+24),
	new object(2871.0e+6, 30687.15, 208, 230, 230, "Uranus", 51118, 86.8e+24),
	new object(4497.1e+6, 60190.03, 80, 100, 228, "Neptune", 49528, 102e+24)
	//new object(5906.4e+6, 90560, 224, 200, 156, "Pluto", 5906.4e+6, 0.0146e+24)
]

function object(d, o, r, g, b, Name, diameter, mass) {
  this.dist = d //km
	this.orbitDuration = o //days
	this.name = Name
	this.diameter = diameter //km
	this.mass = mass //kg
	this.volume = (4/3)*Math.PI*Math.pow((this.diameter)/2, 3) //km^3
	this.density = (this.mass*1000)/(this.volume*1e+15) //g/cm^3
	
	this.x
	this.y
	
	this.color = [r, g, b]
	
	this.trail = true
	this.line = false
	
	this.prev = {}
	
	
	this.update = function() {
		angle = map(time%this.orbitDuration, 0, this.orbitDuration, 0, 2*PI)
		this.x = Math.cos(angle)*(this.dist/zoom)
		this.y = Math.sin(angle)*(this.dist/zoom)
	}
	
	this.render = function() {
		push()
		fill(this.color[0], this.color[1], this.color[2])
		stroke(this.color[0], this.color[1], this.color[2])
		if (showOverlay === true) {
			ellipse(this.x, this.y, 20000000/zoom, 20000000/zoom)
			textAlign(CENTER)
			text(this.name, this.x, this.y - (10000000/zoom) - 5)
		} else {
			ellipse(this.x, this.y, this.diameter/zoom, this.diameter/zoom)
			textAlign(CENTER)
			text(this.name, this.x, this.y - (this.diameter/(zoom*2)) - 5)
		}
		pop()
		
		if (this.trail) {
			ctx.beginPath()
			ctx.moveTo(this.prev.x, this.prev.y)
			ctx.strokeStyle= "rgb(" + this.color[0] + ", " + this.color[1] + ", " + this.color[2] + ")"
			ctx.lineTo(this.x + offset.x, this.y + offset.y)
			ctx.stroke()
		
			this.prev.x = this.x + offset.x
			this.prev.y = this.y + offset.y
		}
	}
}