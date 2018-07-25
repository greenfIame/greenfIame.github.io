var MainCanvas
var BackCanvas
var MiniCanvas
var FrameTime = new Date()

function setup() {
	var cnvWidth
	var cnvHeight
	if (windowWidth*(9/16) <= windowHeight) {
		cnvWidth = windowWidth
		cnvHeight = windowWidth*(9/16)
	} else {
		cnvWidth = windowHeight*(16/9)
		cnvHeight = windowHeight
	}
	cnvWidth = 400
	cnvHeight = cnvWidth*(9/16)
	var cnv = createCanvas(cnvWidth, cnvHeight)
	cnv.id("Main")
	MainCanvas = document.getElementById("Main")
	BackCanvas = document.getElementById("backCanvas")
	BackCanvas.width = width
	BackCanvas.height = height
	MiniCanvas = document.getElementById("miniCanvas")
	MiniCanvas.width = width
	MiniCanvas.height = height
	MiniCanvas.getContext("2d").fillStyle = "hsl(0, 100%, 50%)"
	
	var ctx = BackCanvas.getContext("2d")
	ctx.beginPath()
	ctx.strokeStyle = "rgb(0, 0, 0)"
	ctx.fillStyle = "rgb(0, 0, 0)"
	ctx.rect(0, 0, width, height)
	ctx.fill()
	ctx.stroke()
	
	for (i = 0; i < height/2; i++) {
		c = Math.floor(map(Math.pow(i, 3), 0, Math.pow(height/2, 3), 240, 20))
		ctx.beginPath()
		ctx.strokeStyle = "rgb(" + c + ", " + c + ", " + c + ")"
		ctx.fillStyle = "rgb(" + c + ", " + c + ", " + c + ")"
		ctx.rect(0, height - i, width, 1)
		ctx.fill()
		ctx.stroke()
	}
	
	document.addEventListener('mousemove', function(event) {
		if(document.pointerLockElement === MainCanvas ||
		document.mozPointerLockElement === MainCanvas ||
		document.webkitRequestPointerLock === MainCanvas) {
			player.heading += event.movementX/500
			player.trueHeading += event.movementX/500
		}
		}, false);
	
  player = new Player()
	
	H = height/theMap[0].length
	W = width/theMap.length
}

var player
var res = 300
var theMap = []

var W
var H

var Frames = 0

function draw() {
	
	Frames++
	if (new Date() - FrameTime >= 1000) {
		console.log(Frames)
		Frames = 0
		FrameTime = new Date()
	}
	
	if (mode === "2d") {
		background(255)
		stroke(0)
	
	  for (i = 0; i < theMap.length; i++) {
		  for (j = 0; j < theMap[i].length; j++) {
			
				if (theMap[i][j].n.v) {
					if (portals[theMap[i][j].n.s]) {
						strokeWeight(2)
						stroke(0, 0, 200)
					} else {
						strokeWeight(1)
						stroke(0)
					}
					line(i*W, j*H, (i+1)*W, j*H)
				}
				if (theMap[i][j].w.v) {
					if (portals[theMap[i][j].w.s]) {
						strokeWeight(2)
						stroke(0, 0, 200)
					} else {
						strokeWeight(1)
						stroke(0)
					}
					line(i*W, j*H, i*W, (j+1)*H)
				}
			
		  }
	  }
	}
	
	player.update(mode)
	
	if (keys.f) {
		keys.f = false
		PortalMode = !PortalMode
	}
	if (keys.c) {
		keys.c = false
		mode = mode == "3d" ? "2d" : "3d"
	}
	if (keys.x) {
		keys.x = false
		player.spd = player.spd == 0.015 ? 0.05 : 0.015
	}
}

var mode = "3d"
var PortalMode = false

function Player() {
	this.pos = {x: 1.8, y: 3.5}
	this.heading = -PI
	this.spd = 0.015
	this.forceDist = 0.02
	this.truePos = {x: 10, y: 10}
	this.trueHeading = this.heading
	this.trueVector = {x: 0, y: 0}
	this.hue = 0
	
	this.update = function(renderMode) {
		
		this.Vector = {x: 0, y: 0}
		this.trueVector = {x: 0, y: 0}
		
		if (keys.w) {
			this.Vector.x += Math.cos(this.heading)*this.spd
			this.Vector.y += Math.sin(this.heading)*this.spd
			
			this.trueVector.x += Math.cos(this.trueHeading)*this.spd
			this.trueVector.y += Math.sin(this.trueHeading)*this.spd
		}
		if (keys.a) {
			this.Vector.x += Math.cos(this.heading - PI/2)*this.spd
			this.Vector.y += Math.sin(this.heading - PI/2)*this.spd
			
			this.trueVector.x += Math.cos(this.trueHeading - PI/2)*this.spd
			this.trueVector.y += Math.sin(this.trueHeading - PI/2)*this.spd
		}
		if (keys.s) {
			this.Vector.x -= Math.cos(this.heading)*this.spd
			this.Vector.y -= Math.sin(this.heading)*this.spd
			
			this.trueVector.x -= Math.cos(this.trueHeading)*this.spd
			this.trueVector.y -= Math.sin(this.trueHeading)*this.spd
		}
		if (keys.d) {
			this.Vector.x += Math.cos(this.heading + PI/2)*this.spd
			this.Vector.y += Math.sin(this.heading + PI/2)*this.spd
			
			this.trueVector.x += Math.cos(this.trueHeading + PI/2)*this.spd
			this.trueVector.y += Math.sin(this.trueHeading + PI/2)*this.spd
		}
		
		this.validateMove()
		
		if (keys[LEFT_ARROW]) {
			this.heading -= 0.05
			this.trueHeading -= 0.05
		}
		if (keys[RIGHT_ARROW]) {
			this.heading += 0.05
			this.trueHeading += 0.05
		}
		
		if (renderMode == "2d") {
			
			this.render2d()
		} else {
			this.render3d()
		}
	}
	
	this.validateMove = function() {
		this.proposed = {x: this.pos.x + this.Vector.x}
		if (this.moveX()) {
			this.truePos.x += this.trueVector.x
		}
		this.proposed.y = this.pos.y + this.Vector.y
		if (this.moveY()) {
			this.truePos.y += this.trueVector.y
		}
		var ctx = MiniCanvas.getContext("2d")
		var miniMapMult = 2
		ctx.beginPath()
		ctx.rect(Math.floor(this.truePos.x*10)*miniMapMult, Math.floor(this.truePos.y*10)*miniMapMult, miniMapMult, miniMapMult)
		ctx.fill()
		ctx.fillStyle = "hsl(" + Math.floor(this.hue) + ", 100%, 50%)"
		this.hue += 0.5
		if (evts[0] && evts[0].c(Math.floor(this.pos.x), Math.floor(this.pos.y))) {
			evts[0].f()
			evts.splice(0, 1)
		}
	}
	
	this.moveX = function() {
		var valid = false
		var tp = null
		
		if (Math.floor(this.proposed.x) == Math.floor(this.pos.x) && Math.floor(this.proposed.x - this.forceDist) == Math.floor(this.pos.x)) {
			valid = true
		} else if (this.proposed.x < this.pos.x) {
			if (!theMap[Math.floor(this.pos.x)][Math.floor(this.pos.y)].w.v) {
				valid = true
			}
		} else {
			if (!theMap[Math.floor(this.proposed.x)][Math.floor(this.pos.y)].w.v) {
				valid = true
			}
		}
		
		if (valid) {
			this.pos.x = this.proposed.x
			return true
		} else {
			var portalItem = null
			var direction
			if (this.proposed.x < this.pos.x) {
				portalItem = portals[theMap[Math.floor(this.pos.x)][Math.floor(this.pos.y)].w.s]
				direction = "west"
			} else {
				portalItem = portals[theMap[Math.floor(this.proposed.x)][Math.floor(this.pos.y)].w.s]
				direction = "east"
			}
			if (portalItem && (portalItem.r == undefined || portalItem.r({side: direction}))) {
				var relativePos = this.pos.y - Math.floor(this.pos.y)
				switch (portalItem.a) {
					case false:
						player.pos.x = portalItem.x + (this.proposed.x < this.pos.x ? -this.forceDist : this.forceDist)
						player.pos.y = portalItem.y + relativePos
						break
					case "left":
						player.pos.y = portalItem.y + (this.proposed.x < this.pos.x ? this.forceDist : -this.forceDist)
						player.pos.x = portalItem.x + relativePos
						this.Vector.y = -this.Vector.x
						player.heading -= PI/2
						break
					case "right":
						player.pos.y = portalItem.y + (this.proposed.x < this.pos.x ? -this.forceDist : this.forceDist)
						player.pos.x = portalItem.x + (1-relativePos)
						this.Vector.y = this.Vector.x
						player.heading += PI/2
						break
					default:
						player.pos.x = portalItem.x + (this.proposed.x < this.pos.x ? this.forceDist : -this.forceDist)
						player.pos.y = portalItem.y + (1-relativePos)
						player.heading += PI
				}
				return true
			}
		}
	}
	
	this.moveY = function() {
		var valid = false
		
		if (Math.floor(this.proposed.y) == Math.floor(this.pos.y) && Math.floor(this.proposed.y - this.forceDist) == Math.floor(this.pos.y)) {
			valid = true
		} else if (this.proposed.y < this.pos.y) {
			if (!theMap[Math.floor(this.pos.x)][Math.floor(this.pos.y)].n.v) {
				valid = true
			}
		} else {
			if (!theMap[Math.floor(this.pos.x)][Math.floor(this.proposed.y)].n.v) {
				valid = true
			}
		}
		
		if (valid) {
			this.pos.y = this.proposed.y
			return true
		} else {
			var portalItem = null
			var direction
			if (this.proposed.y < this.pos.y) {
				portalItem = portals[theMap[Math.floor(this.pos.x)][Math.floor(this.pos.y)].n.s]
				direction = "south"
			} else {
				portalItem = portals[theMap[Math.floor(this.pos.x)][Math.floor(this.proposed.y)].n.s]
				direction = "north"
			}
			if (portalItem && (portalItem.r == undefined || portalItem.r({side: direction}))) {
				var relativePos = this.pos.x - Math.floor(this.pos.x)
				switch (portalItem.a) {
					case false:
						player.pos.x = portalItem.x + relativePos
						player.pos.y = portalItem.y + (this.proposed.y < this.pos.y ? -this.forceDist : this.forceDist)
						break
					case "left":
						player.pos.x = portalItem.x + (this.proposed.y < this.pos.y ? -this.forceDist : this.forceDist)
						player.pos.y = portalItem.y + (1-relativePos)
						player.heading -= PI/2
						break
					case "right":
						player.pos.x = portalItem.x + (this.proposed.y < this.pos.y ? this.forceDist : -this.forceDist)
						player.pos.y = portalItem.y + relativePos
						player.heading += PI/2
						break
					default:
						player.pos.x = portalItem.x + (1-relativePos)
						player.pos.y = portalItem.y + (this.proposed.y < this.pos.y ? this.forceDist : -this.forceDist)
						player.heading += PI
				}
				return true
			}
		}
	}
	
	this.render2d = function() {
		ellipse(this.pos.x*W, this.pos.y*H, 5, 5)
		
		ray = castRay(this.pos.x, this.pos.y, this.heading, checkFunction)
		
	}
	
	this.render3d = function() {
		clear()
		
	  for (i = 0; i < res; i++) {
	    diff = map(i , 0, res-1, -PI/4, PI/4)
	    var ray = castRay(this.pos.x, this.pos.y, this.heading + diff, checkFunction)
	    ray.height = 1/(ray.distance*Math.cos(diff))
	    ray.height *= height/4
	    c = (1/ray.distance*255)
			if (c > 240) {
				c = 240
			}
	    fill(c)
	    stroke(c)
	    rect((width/res)*i, height/2 - ray.height/2, width/res - 0.5, ray.height)
			for (j = 0; j < ray.Pdist.length; j++) {
				ray.height = 1/(ray.Pdist[j].dist*Math.cos(diff))
				ray.height *= height/4
				if (ray.Pdist[j].col == 'blue') {
					fill(0, 0, 250, 30)
				} else {
					fill(255, 130, 0, 50)
					
				}
				noStroke()
				rect((width/res)*i, height/2 - ray.height/2, width/res, ray.height)
			}
	  }
		
		if (PortalMode) {
			push()
			noFill()
			stroke(0)
			strokeWeight(3)
			ellipse(width/2, height/2, width/100, width/90)
			ellipse(width/2, height/2, 1, 1)
			stroke(150)
			strokeWeight(2)
			ellipse(width/2, height/2, width/100, width/90)
			ellipse(width/2, height/2, 1, 1)
			pop()
		}
		
		if (dispTextAlpha > 0) {
			push()
			fill(235, 100, 0, dispTextAlpha)
			stroke(255, 120, 0, dispTextAlpha)
			strokeWeight(2)
			textSize(width/40)
			textAlign(CENTER)
			noStroke()
			if (dispTextCharCount < dispText.length) {
				dispTextCharCount += 0.2
			} else {
				dispTextAlpha -= 2
			}
			text(dispText.substr(0, Math.floor(dispTextCharCount)), width/2, height/2)
			pop()
		}
		
	}
}

var keys = {}

function keyPressed() {
	keys[key.toLowerCase()] = true
	keys[keyCode] = true
}
function keyReleased() {
	keys[key.toLowerCase()] = false
	keys[keyCode] = false
}
function mousePressed(evt) {
	MainCanvas.requestPointerLock = MainCanvas.requestPointerLock || MainCanvas.mozRequestPointerLock || MainCanvas.webkitRequestPointerLock
	if (MainCanvas.requestPointerLock === undefined || document.pointerLockElement === MainCanvas || 
	 document.mozPointerLockElement === MainCanvas || document.webkitRequestPointerLock === MainCanvas
	) {
		var portalRay = castRay(player.pos.x, player.pos.y, player.heading, checkFunction)
		if (portalRay.f < 20) {
			var target
			if (portalRay.checkItem.side == "north") {
				target = theMap[portalRay.checkItem.x][portalRay.checkItem.y].n
			} else {
				target = theMap[portalRay.checkItem.x][portalRay.checkItem.y].w
			}
			if (evt.buttons == 1) {
				if (portal1) {
					portal1.s = "`"
				}
				portal1 = target
				portal1.s = "portal1"
				portals.portal1.r = function(p){return p.side == portalRay.checkItem.dside}
				portals.portal1.dside = portalRay.checkItem.dside
			} else {
				if (portal2) {
					portal2.s = "`"
				}
				portal2 = target
				portal2.s = "portal2"
				portals.portal2.r = function(p){return p.side == portalRay.checkItem.dside}
				portals.portal2.dside = portalRay.checkItem.dside
			}
			if (portal2 && portal1) {
				portals.portal1.x = portal2.x
				portals.portal1.y = portal2.y
				portals.portal2.x = portal1.x
				portals.portal2.y = portal1.y
				if (portals.portal1.dside == portals.portal2.dside) {
					portals.portal1.a = "reverse"
					portals.portal2.a = "reverse"
				} else if (
					(portals.portal1.dside == "north" && portals.portal2.dside == "west") || 
					(portals.portal1.dside == "east" && portals.portal2.dside == "north") || 
					(portals.portal1.dside == "south" && portals.portal2.dside == "east") || 
					(portals.portal1.dside == "west" && portals.portal2.dside == "south")
				) {
					portals.portal1.a = "left"
					portals.portal2.a = "right"
				} else if (
					(portals.portal1.dside == "north" && portals.portal2.dside == "east") || 
					(portals.portal1.dside == "west" && portals.portal2.dside == "north") || 
					(portals.portal1.dside == "south" && portals.portal2.dside == "west") || 
					(portals.portal1.dside == "east" && portals.portal2.dside == "south")
				) {
					portals.portal1.a = "right"
					portals.portal2.a = "left"
				} else {
					portals.portal1.a = false
					portals.portal2.a = false
				}
			}
			
		}
		
	} else if (MainCanvas.requestPointerLock !== undefined) {
		MainCanvas.requestPointerLock()
	}
}
var portal1
var portal2

var tmap = '\
|`|`|` ` ` ` `b`|`|`|`|g|`|`|`|`|`|`j`|`|`|`|`|`|`|`|`|`|`|`|`|`0/\
|`|`|  ` ` `|`|` ` ` `  |`|` `|`|` i  |`|`|`|`|`|`|`|`|`|`|`|`|`1/\
|`|`|`|`|`| |`| |`|`|`|  `    h`|     |`|`|`|`|`|`|`|`|`|`|`|`|`2/\
a` `|`|`|c  |`|` `e`|`|f|`|     |`|`| |`|`|`|`|`|`|`|`|`|`|`|`|`3/\
|`|`|`|`|`|`|`| |`|`|`|`|`|`|`|`|`k`|`|`|`|`|`|`|`|`|`|`|`|`|`|`4/\
|`|`|`|`|`|`|`|d|`|`|`|`|`|`|`|`|`| l`|` `m`|`|`|`|`|`|`|`|`|`|`5/\
|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|   | |`|`|`|`|`|`|`|`|`|`|`|`6/\
|`|`|`|`|`|`|`|`|`|`|`|`|`|`|` ` ` ` `|n|`|`|`|`|`|`|`|`|`|`|`|`7/\
|`|`|`|`|`|`|`|`|`|`|  `s`|o  t` ` `| |`|`|`|`|`|`|`|`|`|`|`|`|`8/\
|`|`|`|`|`|`|`|`|`|`| |`|`|p  |     |`|`|`|`|`|`|`|`|`|`|`|`|`|`9/\
|`|`|`|`|`|`|`|`|`|`|r|`|`|q  |     |`|`|`|`|`|`|`|`|`|`|`|`|`|`0/\
|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`|`1'
/*                  1 1 1 1 1 1 1 1 1 1 2 2 2 2 2 2 2 2 2 2 3 3 
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 
*/

var evts = [
	{c: function(x, y){return (x == 0 && y == 3)}, f: function(){dispTextAlpha = 255; dispTextCharCount = 0;
		dispText = "Please enjoy your experience with SMDT™\n(Seamless Multi-Dimensional Travel)"
	}},
	{c: function(x, y){return (x == 16 && y == 7)}, f: function(){dispTextAlpha = 255; dispTextCharCount = 0; PortalMode = true;
		dispText = "For legal reasons SMDT™ now is visible to the naked eye.\n(to toggle visbility use 'f')"
	}},
	{c: function(x, y){return (x == 15 && y == 8)}, f: function(){dispTextAlpha = 255; dispTextCharCount = 0;
		dispText = "Congradulations on being selected out of the [1] candidates\nto test out the new SMDT™ brand portable portal!\n(use left and right click)"
	}},
]
var dispText = ""
var dispTextAlpha = 0
var dispTextCharCount = 0

var portals = {
	a: {x: 7, y: 0, a: false, col: "blue"},
	b: {x: 0, y: 3, a: false, col: "blue"},
	c: {x: 7, y: 5, a: false, col: "blue"},
	d: {x: 4, y: 3, a: false, col: "blue"},
	e: {x: 9, y: 1, a: false, col: "blue"},
	f: {x: 11, y: 0, a: false, col: "blue"},
	g: {x: 11, y: 3, a: false, col: "blue"},
	h: {x: 17, y: 1, a: "left", col: "blue"},
	i: {x: 15, y: 2, a: "right", col: "blue"},
	j: {x: 17, y: 4, a: "reverse", col: "blue"},
	k: {x: 18, y: 0, a: "reverse", col: "blue"},
	l: {x: 21, y: 5, a: false, col: "blue", r: function(p){return p.side == "west"}},
	m: {x: 18, y: 5, a: false, col: "blue"},
	n: {x: 17, y: 7, a: "right", col: "blue"},
	o: {x: 10, y: 10, a: false, col: "blue"},
	p: {x: 10, y: 10, a: false, col: "blue", r: function(p){return p.side == "south"}},
	q: {x: 10, y: 10, a: false, col: "blue", r: function(p){return p.side == "south"}},
	r: {x: 13, y: 9, a: false, col: "blue"},
	s: {x: 15, y: 8, a: false, col: "blue"},
	t: {x: 12, y: 8, a: false, col: "blue", r: function(p){return p.side == "east"}},
	
	portal1: {x: false, y: false, a: false, col: "blue"},
	portal2: {x: false, y: false, a: false, col: "orange"}
}

portals['`'] = false
portals['|'] = false

tmap = tmap.split("/")

theMap = []
for (i = 0; i < tmap[0].length - 1; i+=2) {
	theMap[Math.floor(i/2)] = []
	for (j = 0; j < tmap.length; j++) {
		theMap[Math.floor(i/2)][j] = {
			n: {v: tmap[j][i+1] != ' ', s: tmap[j][i+1], x: Math.floor(i/2), y: j, side: "n"}, 
			w: {v: tmap[j][i] != ' ', s: tmap[j][i], x: Math.floor(i/2), y: j, side: "w"},
		}
	}
}

var checkFunction = function(x, y, s, vector) {
	if (s == "north") {
		if (portals[theMap[x][y].n.s] && portals[theMap[x][y].n.s].x === false) {
			return [0, 0, 0, portals[theMap[x][y].n.s].col]
		}
		if (portals[theMap[x][y].n.s] && vector && (portals[theMap[x][y].n.s].r == undefined || portals[theMap[x][y].n.s].r(vector))) {
			if (portals[theMap[x][y].n.s].a) {
				var X = vector.x - x
				var Y = vector.y - y
				
				if (X > 0.99) {
					X = 0.99
				}
				if (Y > 0.99) {
					Y = 0.99
				}
				
				if (portals[theMap[x][y].n.s].a == "right") {
					return [portals[theMap[x][y].n.s].x - x - X, portals[theMap[x][y].n.s].y - y + X, PI/2, portals[theMap[x][y].n.s].col]
				} else if (portals[theMap[x][y].n.s].a == "left") {
					return [portals[theMap[x][y].n.s].x - x - X, portals[theMap[x][y].n.s].y - y - X + 1, -PI/2, portals[theMap[x][y].n.s].col]
				} else {
					return [portals[theMap[x][y].n.s].x - x - X - X + 1, portals[theMap[x][y].n.s].y - y, PI, portals[theMap[x][y].n.s].col]
				}
			} else {
				return [portals[theMap[x][y].n.s].x - x, portals[theMap[x][y].n.s].y - y, 0, portals[theMap[x][y].n.s].col]
			}
			
		} else {
			return theMap[x][y].n.v
		}
	} else if (s == "west") {
		if (portals[theMap[x][y].w.s] && portals[theMap[x][y].w.s].x === false) {
			return [0, 0, 0, portals[theMap[x][y].w.s].col]
		}
		if (portals[theMap[x][y].w.s] && vector && (portals[theMap[x][y].w.s].r == undefined || portals[theMap[x][y].w.s].r(vector))) {
			if (portals[theMap[x][y].w.s].a) {
				var X = vector.x - x
				var Y = vector.y - y
				
				if (X > 0.99) {
					X = 0.99
				}
				if (Y > 0.99) {
					Y = 0.99
				}
				
				if (portals[theMap[x][y].w.s].a == "right") {
					return [portals[theMap[x][y].w.s].x - x - Y + 1, portals[theMap[x][y].w.s].y - y - Y, PI/2, portals[theMap[x][y].w.s].col]
				} else if (portals[theMap[x][y].w.s].a == "left") {
					return [portals[theMap[x][y].w.s].x - x + Y, portals[theMap[x][y].w.s].y - y - Y, -PI/2, portals[theMap[x][y].w.s].col]
				} else {//reversed
					return [portals[theMap[x][y].w.s].x - x, (portals[theMap[x][y].w.s].y - y) - Y - Y + 1, PI, portals[theMap[x][y].w.s].col]
				}
			} else {
				return [portals[theMap[x][y].w.s].x - x, portals[theMap[x][y].w.s].y - y, 0, portals[theMap[x][y].w.s].col]
			}
		} else {
			return theMap[x][y].w.v
		}
	}
}

function castRay(x, y, h, check) {
  var m = Math.tan(h)
  var stepX = Math.cos(h)
  var stepY = Math.sin(h)
	var Distance = 0
	var Prev = {x: x, y: y}
	var Pdist = []
	var detailedSide
	
	stroke(255, 0, 0)
	fill(255, 0, 0)
  for (f = 0; f < 20; f++) {
    var Xdist = stepX > 0 ? Math.floor(x) + 1 - x : Math.floor(x-0.01) - x
    var Ydist = stepY > 0 ? Math.floor(y) + 1 - y : Math.floor(y-0.01) - y
    var addX = Ydist/m	//Amount on the x axis that would have to be added to result in reaching y
    var addY = Xdist*m

		var dist1 = dist(0, 0, Xdist, addY)//The distance each of these proposed moves would cover
		var dist2 = dist(0, 0, Ydist, addX)

		if (abs(dist2) < abs(dist1)) {
			x+=addX
			y+=Ydist
      side = "north"
      if (stepY < 0) {
        detailedSide = "south"
      } else {
        detailedSide = "north"
      }
		} else {
			x+=Xdist
			y+=addY
      side = "west"
      if (stepX < 0) {
        detailedSide = "west"
      } else {
        detailedSide = "east"
      }
		}
		
		Distance += dist(x, y, Prev.x, Prev.y)
		
		if (mode == "2d") {
			push()
			if (side == "west") {
				fill(0, 0, 255)
				stroke(0, 0, 255)
			}
			ellipse(x*W, y*H, 4, 4)
			pop()
			line(x*W, y*H, Prev.x*W, Prev.y*H)
		}
		
		Prev = {x: x, y: y}
		
		var ac = 95
		var sx = Math.floor(x*ac)/ac
		var sy = Math.floor(y*ac)/ac
		
		if (sx == Math.floor(x) && sy == Math.floor(y)) {
			
	    try {
	      if ( 
					check(Math.floor(x), Math.floor(y) - 1, "west") || 
					check(Math.floor(x) - 1, Math.floor(y), "north") || 
					check(Math.floor(x), Math.floor(y), "west") ||
					check(Math.floor(x), Math.floor(y), "north")
				) {
	  			break
	  		}
			} catch(err) {
				f = 20
				break
			}
			
		} else {
			checkX = Math.floor(x)
			checkY = Math.floor(y)
			
	    try {
				Check = check(checkX, checkY, side, {x: x, y: y, h: h, side: detailedSide})
				if (Check === true) {
	  			break
	  		} else if (Check[0] !== undefined) {
	  			x += Check[0]
					y += Check[1]
					h += Check[2]
					
					m = Math.tan(h)
					stepX = Math.cos(h)
					stepY = Math.sin(h)
					
					Prev = {x: x, y: y}
					
					if (PortalMode) {
						Pdist.push({dist: Distance, col: Check[3]})
					}
					
					if (Check[0] == 0 && Check[1] == 0 && Check[2] == 0) {
						break
					}
					
	  		}
			} catch(err) {
				f = 20
				break
			}
			
		}
		
  }
	
	return {x: x, y: y, angle: h, distance: Distance, Pdist: Pdist, checkItem: {x: checkX, y: checkY, side: side, dside: detailedSide}, f: f}
}