/*
	TO DO: Simon
	Comments

	TO DO: Seb
	Railgun
	Not nasty chickens


	Enemy now calculates health inside constructor function
*/

var theMap = []
//The global declaration of the map variable, 2d array, call space using theMap[x][y]

var keys = {w: false, a: false, s: false, d: false, left: false, right: false, space: false, m: false, click: false}
//Detects key presses, m is a toggle

var things = []
//All the enemies and projectiles
var player
//The variable the player object will be assigned to

var splats = []
//The array containing any blood animation information

var res = 1000
//The variable storing the number of rays to cast

var sensitivity = 2
//The mouse sensitivity

var fov = Math.PI/2
//The field of view for the player

var lvl = 0
//The level

var weapon = 0
var guns = [
	{ammo: Infinity, clip: 10, inClip: 10, delay: 400, dmg: 30, frames: 4, cd: 100, spread: {no: 1, spread: 0}, reload: 1000, rframes: 0},
	{ammo: 90, clip: 30, inClip: 30, delay: 100, dmg: 25, frames: 1, cd: 0, spread: {no: 1, spread: Math.PI/20}, reload: 1000, rframes: 0},
	{ammo: 14, clip: 2, inClip: 2, delay: 800, dmg: 15, frames: 3, cd: 100, spread: {no: 10, spread: Math.PI/4}, reload: 1000, rframes: 0},
	{ammo: 5, clip: 1, inClip: 1, delay: 500, dmg: 150, frames: 1, cd: 0, spread: {no: 1, spread: 0}, reload: 1500, rframes: 6}]
var fireDelay = (new Date()-1000)
var reloading = false

var animationStage = 0
//0 is the static frame

var animations
//contains an array of frams for each weapon in seperate arrays

var ammoPack
var healthPack
//objects containing the health and ammo pack sprites

var reload
var shots
var footsteps = []
var ammoSound
var healSound
var deathSound = []
var nearby
//sound declarations

var footTime
//The deathsounds of the monsters

var cnv
var ctx

var placeHolder
//Place holder image to be used when the appropriate image cant be found

var zoom = 1
//The current zoom in place

var updates = 0
var frames  = 0
var time

var options = false
//Whether the player is in the options
var finished = true
//Whether the player finished a level

function preload() {

	//Preload is loaded before any of the other functions. Here I am loading all the the images I use (as Image objects) and
	//sounds, with the notable exception of the bullet sounds. The exclusion is due to the inability of a single sound object
	//to play over itself (simulatniously).
	placeHolder = new Image()
	placeHolder.src = "greyBlock.png"

	Demon = new Image()
	Demon.src = "assets/Demon.png"
	DemonRed = new Image()
	DemonRed.src = "assets/DemonRed.png"

	DemonMelee = new Image()
	DemonMelee.src = "assets/DemonMelee.png"
	DemonMeleeRed = new Image()
	DemonMeleeRed.src = "assets/DemonMeleeRed.png"

	Dino_ = new Image()
	Dino_.src = "DinoBossAssets/Dino1.png"
	DinoRed = new Image()
	DinoRed.src = "DinoBossAssets/Dino1Red.png"

	egg = new Image()
	egg.src = "assets/egg.png"
	chicken = [new Image(), new Image()]
	chicken[0].src = "assets/bloodyChicken1.png"
	chicken[1].src = "assets/bloodyChicken2.png"
	//Closed chicken is 22 Pixels, Open is 23

	nazi_Animation = []
	nazi_Animation[0] = new Image()
	nazi_Animation[0].src = "DinoBossAssets/stand.png"
	nazi_Animation[1] = new Image()
	nazi_Animation[1].src = "DinoBossAssets/squat.png"
	nazi_Animation[2] = new Image()
	nazi_Animation[2].src = "DinoBossAssets/kick1.png"
	nazi_Animation[3] = new Image()
	nazi_Animation[3].src = "DinoBossAssets/kick2.png"
	nazi_Animation[4] = new Image()
	nazi_Animation[4].src = "DinoBossAssets/kick3.png"
	nazi_Animation[5] = new Image()
	nazi_Animation[5].src = "DinoBossAssets/standRight.png"
	nazi_Animation[6] = new Image()
	nazi_Animation[6].src = "DinoBossAssets/squatRight.png"
	nazi_Animation[7] = new Image()
	nazi_Animation[7].src = "DinoBossAssets/kick1Right.png"
	nazi_Animation[8] = new Image()
	nazi_Animation[8].src = "DinoBossAssets/kick2Right.png"
	nazi_Animation[9] = new Image()
	nazi_Animation[9].src = "DinoBossAssets/kick3Right.png"

	nazi_AnimationRed = []
	nazi_AnimationRed[0] = new Image()
	nazi_AnimationRed[0].src = "DinoBossAssets/standred.png"
	nazi_AnimationRed[1] = new Image()
	nazi_AnimationRed[1].src = "DinoBossAssets/squatred.png"
	nazi_AnimationRed[2] = new Image()
	nazi_AnimationRed[2].src = "DinoBossAssets/kick1red.png"
	nazi_AnimationRed[3] = new Image()
	nazi_AnimationRed[3].src = "DinoBossAssets/kick2red.png"
	nazi_AnimationRed[4] = new Image()
	nazi_AnimationRed[4].src = "DinoBossAssets/kick3red.png"
	nazi_AnimationRed[5] = new Image()
	nazi_AnimationRed[5].src = "DinoBossAssets/standRightred.png"
	nazi_AnimationRed[6] = new Image()
	nazi_AnimationRed[6].src = "DinoBossAssets/squatRightred.png"
	nazi_AnimationRed[7] = new Image()
	nazi_AnimationRed[7].src = "DinoBossAssets/kick1Rightred.png"
	nazi_AnimationRed[8] = new Image()
	nazi_AnimationRed[8].src = "DinoBossAssets/kick2Rightred.png"
	nazi_AnimationRed[9] = new Image()
	nazi_AnimationRed[9].src = "DinoBossAssets/kick3Rightred.png"

	fireball = new Image()
	fireball.src = "assets/Fireball.png"

	FireballLAZER = new Image()
	FireballLAZER.src = "assets/FireballOld.png"

	pistol_Animation = []

	pistol_Animation[0] = new Image()
	pistol_Animation[0].src = "WeaponAssets/pistol_Static.png"
	pistol_Animation[1] = new Image()
	pistol_Animation[1].src = "WeaponAssets/pistol_Animation1.png"
	pistol_Animation[2] = new Image()
	pistol_Animation[2].src = "WeaponAssets/pistol_Animation2.png"
	pistol_Animation[3] = new Image()
	pistol_Animation[3].src = "WeaponAssets/pistol_Animation3.png"
	pistol_Animation[4] = new Image()
	pistol_Animation[4].src = "WeaponAssets/pistol_Animation4.png"

	rifle_Animation = []
	rifle_Animation[0] = new Image()
	rifle_Animation[0].src = "WeaponAssets/machineGun_Static.png"
	rifle_Animation[1] = new Image()
	rifle_Animation[1].src = "WeaponAssets/machineGun_Animation1.png"

	shotgun_Animation = []
	shotgun_Animation[0] = new Image()
	shotgun_Animation[0].src = "WeaponAssets/shotgun_Static.png"
	shotgun_Animation[1] = new Image()
	shotgun_Animation[1].src = "WeaponAssets/shotgun_Animation1.png"
	shotgun_Animation[2] = new Image()
	shotgun_Animation[2].src = "WeaponAssets/shotgun_Animation2.png"
	shotgun_Animation[3] = new Image()
	shotgun_Animation[3].src = "WeaponAssets/shotgun_Animation3.png"

	chargeRifle_Animation = []
	chargeRifle_Animation[0] = new Image()
	chargeRifle_Animation[0].src = "WeaponAssets/Rail_Charge_6.png"
	chargeRifle_Animation[1] = new Image()
	chargeRifle_Animation[1].src = "WeaponAssets/Rail_Charge_7.png"
	chargeRifle_Animation[2] = new Image()
	chargeRifle_Animation[2].src = "WeaponAssets/Rail_Charge_0.png"
	chargeRifle_Animation[3] = new Image()
	chargeRifle_Animation[3].src = "WeaponAssets/Rail_Charge_1.png"
	chargeRifle_Animation[4] = new Image()
	chargeRifle_Animation[4].src = "WeaponAssets/Rail_Charge_2.png"
	chargeRifle_Animation[5] = new Image()
	chargeRifle_Animation[5].src = "WeaponAssets/Rail_Charge_3.png"
	chargeRifle_Animation[6] = new Image()
	chargeRifle_Animation[6].src = "WeaponAssets/Rail_Charge_4.png"
	chargeRifle_Animation[7] = new Image()
	chargeRifle_Animation[7].src = "WeaponAssets/Rail_Charge_5.png"

 	animations = [pistol_Animation, rifle_Animation, shotgun_Animation, chargeRifle_Animation]

	packs = {}
	healthPack = new Image()
	healthPack.src = "WeaponAssets/healthPack.png"
	ammoPack = new Image()
	ammoPack.src = "WeaponAssets/ammoPack.png"

	ammoSound = new Audio('sounds/player/ammoPack.wav')
	healSound = new Audio('sounds/player/healthPack.wav')
	healSound.volume = 0.6
	ammoSound.volume = 0.5

	footsteps[0] = new Audio('sounds/player/footstep1.mov')
	footsteps[1] = new Audio('sounds/player/footstep2.mov')
	footsteps[0].volume = 0.2
	footsteps[1].volume = 0.2

	reload = new Audio('sounds/player/reload.wav')
	reload.volume = 0.9

	shots = [
		new Audio('sounds/Gunshots/shotgunL.mp3'),
		new Audio('sounds/Gunshots/gunshot-louder.mp3'),
		new Audio('sounds/Gunshots/gunshot-louder.mp3'),
		new Audio('sounds/Gunshots/gunshot-louder.mp3')
	]

	shots[0].volume = 0.5

	for (i = 0; i < 18; i++) {
	  deathSound[i] = (new Audio('sounds/monsterSounds/monster-' + (i+1) + '.wav'))
    deathSound[i].volume = 0.4
	}

  chickenDeath = new Audio('sounds/monsterSounds/chickenDeath.mov')
	chicken.volume = 0.3

  eggCrack = new Audio('sounds/monsterSounds/eggCrackalack.mov')
	eggCrack.volume = 0.5

	//spotted = (new Audio('sounds/monsterSounds/spotted.wav'))
	spotted = (new Audio('sounds/monsterSounds/(!).mp3'))
	spotted.volume = 0.4
}

function setup() {
	//The setup function is run once the page is loaded, it sets variables, establishes event listeners and starts the gameplay loop

	canvas = createCanvas(res, Math.floor((res)/(16/9)))

	//Places the canvas into the sketch-holder div in the page allowing for control of its position and style
	//as well as giving it an ID so it can be found and edited elsewhere in the program
	canvas.parent('sketch-holder')
	canvas.id("myCanvas")
	cnv = document.getElementById("myCanvas")
	ctx = cnv.getContext("2d")

	ctx.imageSmoothingEnabled = false

	//Creates the onclick and release function
	canvas.mousePressed(click)
	canvas.mouseReleased(function(){keys.click = false})

	//Resizes the canvas to fill the correct portions of the page
	resize()

	//Checks if the browser supports mouse inputs and alerts the player if it doesn't
	cnv.requestPointerLock = cnv.requestPointerLock ||
					cnv.mozRequestPointerLock ||
					cnv.webkitRequestPointerLock;

	if (cnv.requestPointerLock === undefined) {
		alert("This browser does not support mouse inputs. \nAs such the aiming can only be controlled by the arrow keys.")
	}

	//Creates the player object
	player = new Player()

	//Gets current time
	time = new Date()

	footTime = new Date()

	//Starts updating and rendering the map and its contents while the player's health is > 0


	setInterval(gamePlayLoop, 20)/** /
	things = [new Dino()]
	theMap = dinoMap
	setInterval(function() {
		noStroke()
		for (i = 0; i < theMap.length; i++) {
			for (j = 0; j < theMap[i].length; j++) {
				if (dinoMap[i][j] == 1) {
					fill(0)
				} else {
					fill(255)
				}
				rect(i*10, j*10, 10, 10)
			}
		}

		player.pos = {x: mouseX, y: mouseY}
		fill(0, 0, 255)
		ellipse(player.pos.x, player.pos.y, 5, 5)
		for (i = 0; i < things.length; i++) {
			things[i].update()
			push()
			translate(things[i].pos.x, things[i].pos.y)
			rotate(things[i].heading)
			fill(200, 200, 0)
			ellipse(0, 0, things[i].r, things[i].r)
			stroke(0)
			line(0, 0, 5, 0)
			pop()
		}
	}, 20)/**/

	//Handles mouse input if applicable
	document.addEventListener('mousemove', function(event) {
		if(document.pointerLockElement === cnv ||
		document.mozPointerLockElement === cnv ||
		document.webkitRequestPointerLock === cnv) {
			player.heading += ((event.movementX/500)*sensitivity)/zoom
		}
		}, false);
}

function lineIntersectLimit(x1,y1,x2,y2, x3,y3,x4,y4) {
	//Finds the intersection of two lines
  var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
  var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
  if (isNaN(x)||isNaN(y)) {
    return false
  } else {
    if (x1>=x2) {
      if (!(x2<=x&&x<=x1)) {return false;}
    } else {
      if (!(x1<=x&&x<=x2)) {return false;}
    }
    if (y1>=y2) {
      if (!(y2<=y&&y<=y1)) {return false;}
    } else {
      if (!(y1<=y&&y<=y2)) {return false;}
    }
    if (x3>=x4) {
      if (!(x4<=x&&x<=x3)) {return false;}
    } else {
			if (!(x3<=x&&x<=x4)) {return false;}
    }
    if (y3>=y4) {
      if (!(y4<=y&&y<=y3)) {return false;}
    } else {
      if (!(y3<=y&&y<=y4)) {return false;}
    }
  }
  return {x: x, y: y}
}

function pointLine(myLine, x, y) {
	//finds the closest point on a line to another point
	lerp_=function(a,b,x){ return(a+x*(b-a)); };
  var dx=myLine.x1-myLine.x0;
  var dy=myLine.y1-myLine.y0;
  var t=((x-myLine.x0)*dx+(y-myLine.y0)*dy)/(dx*dx+dy*dy);
  var myLineX=lerp_(myLine.x0, myLine.x1, t);
  var myLineY=lerp_(myLine.y0, myLine.y1, t);
	if (myLine.x0 < myLine.x1) {
		if (myLineX < myLine.x0) {
			myLineX = myLine.x0
			myLineY = myLine.y0
		} else if (myLineX > myLine.x1) {
			myLineX = myLine.x1
			myLineY = myLine.y1
		}
	} else {
		if (myLineX > myLine.x0) {
			myLineX = myLine.x0
			myLineY = myLine.y0
		} else if (myLineX < myLine.x1) {
			myLineX = myLine.x1
			myLineY = myLine.y1
		}
	}

	return {x: myLineX, y: myLineY, distance: dist(myLineX, myLineY, x, y)}
}

function createMap(mapWidth, mapHeight) {
	//Creates a randomly generated map.
	things = []
	player.pos = {x: 15, y: 15}
	player.heading = PI/2
	theMap = []

	for (i = 0; i < mapWidth; i++) {
		tempArray = []
		for (j = 0; j < mapHeight; j++) {
			if (i == 1 && j != 0 && j != mapHeight-1) {
				tempArray.push(0)
			} else if (i == mapWidth-1) {
				tempArray.push(2)
			} else {
				tempArray.push(1)
			}
		}
		theMap.push(tempArray)
	}

	loc = Math.floor(random(1, mapHeight-2))
	things.push(new Enemy((mapWidth-2)*10 + 5, loc*10 + 5, "ranged", 70 + lvl*10, 5))
	for (i = theMap.length-2; i > 1; i--) {
		theMap[i][loc] = 0
		newloc = Math.floor(random(1, mapHeight-2))
		if (i < 4) {
			newloc = Math.floor(3)
		}
		while (loc !== newloc) {
			if (loc > newloc) {
				loc -= 1
				theMap[i][loc] = 0
			} else {
				loc += 1
				theMap[i][loc] = 0
			}
		}
	}


	emptySpots = []
	for (x = 4; x < theMap.length; x++) {
		for (y = 0; y < theMap[0].length; y++) {
			if (theMap[x][y] === 0) {
				emptySpots.push({x: x, y: y})
			}
		}
	}


	for (i = 0; i < 7 + lvl*4; i++) {
		spot = random(emptySpots)
		if (i < (7 + lvl*4)/3) {
			things.push(new Enemy(spot.x*10 + 5, spot.y*10 + 5, "ranged"))
		} else {
			things.push(new Enemy(spot.x*10 + 5, spot.y*10 + 5, "melee"))
		}

	}
}

function createBossMap(type) {
	//Creates a map for the boss to spawn. The map itself is custom made and stored in an array.
	things = []

	player.heading = Math.PI/4
	player.pos = {x: 15, y: 15}

	if (type) {

		theMap = dinoMap

		things.push(new Dino())
	} else {

		freeSpots = []
		theMap = chickenMap

		for (var i = 0; i < chickenMap.length; i++) {
		  for (var j = 0; j < chickenMap[i].length; j++) {
				if (chickenMap[i][j] == 0) {
					freeSpots.push([i*10, j*10])
				}
			}
		}

		for (var i = 0; i < (lvl/5)*3; i++) {
			things.push(new Egg(freeSpots, 0))
		}
	}
}

function keyPressed() {
	//Handles all inputs by the user aside from clicks.
	if (key === "W") {
		keys.w = true
	}
	if (key === "A") {
		keys.a = true
	}
	if (key === "S") {
		keys.s = true
	}
	if (key === "D") {
		keys.d = true
	}
	if (key === " ") {
		keys.space = true
	}
	if (keyCode === LEFT_ARROW) {
		keys.left = true
	}
	if (keyCode === RIGHT_ARROW) {
		keys.right = true
	}
	if (key === "M") {
		keys.m = !keys.m
		if (keys.m) {
			document.getElementById("mapDiv").style.zIndex = "1"
    } else {
			document.getElementById("mapDiv").style.zIndex = "-1"
		}
	}
	if (key === "1" && new Date() - fireDelay > guns[weapon].delay+guns[weapon].cd && reloading === false) {
		zoom = 1
		weapon = 0
		animationStage = 0
	}
	if (key === "2" && new Date() - fireDelay > guns[weapon].delay+guns[weapon].cd && reloading === false) {
		zoom = 1
		weapon = 1
		animationStage = 0
	}
	if (key === "3" && new Date() - fireDelay > guns[weapon].delay+guns[weapon].cd && reloading === false) {
		zoom = 1
		weapon = 2
		animationStage = 0
	}
	if (key === "4" && new Date() - fireDelay > guns[weapon].delay+guns[weapon].cd && reloading === false) {
		zoom = 1
		weapon = 3
		animationStage = 0
	}
	if (key === "R" && reloading === false) {
		zoom = 1
		reloading = "ready"
	}
	if (keyCode === 16 && weapon === 3) {
		if (zoom < 4) {
			zoom = zoom*2
		} else {
			zoom = 1
		}
	}
	if (key == "O") {
		options = !options
		if (options) {
			document.getElementById("ui").style.display = 'none'
			document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock
			if (document.exitPointerLock !== undefined) {
				document.exitPointerLock()
			}
			resizeCanvas(1000, Math.floor((1000)/(16/9)))
		} else {
			document.getElementById("ui").style.display = 'block'
			updates = 60
			resize()
			var canvas = document.getElementById("myCanvas")
			canvas.requestPointerLock = canvas.requestPointerLock ||
			        canvas.mozRequestPointerLock ||
			        canvas.webkitRequestPointerLock;

			if (canvas.requestPointerLock !== undefined) {
				canvas.requestPointerLock()
			}
		}
	}

}

function click() {
	//Handles the onclick event tied to the canvas
	if(document.pointerLockElement === cnv ||
	document.mozPointerLockElement === cnv ||
	document.webkitPointerLockElement) {

		keys.click = true

	} else if (options) {

		var wid = width/10

		mX = map(mouseX, 0, parseInt(cnv.style.width), 0, width)
		mY = map(mouseY, 0, parseInt(cnv.style.height), 0, height)

		if (mX > wid*9 - 20 && mX < wid*9 && mY > wid-15 && mY < wid+5) {
			if (isInFullScreen()) {
				document.exitFullscreen = document.exitFullscreen || document.mozExitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen
				if (document.exitFullscreen !== undefined) {
					document.exitFullscreen()
				}
			} else {
				var docElm = document.getElementById("fullGame")
				docElm.requestFullscreen = docElm.requestFullscreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullScreen || docElm.msRequestFullscreen
				if (docElm.requestFullscreen !== undefined) {
					docElm.requestFullscreen()
				}
			}
		}

	} else {
		cnv.requestPointerLock = cnv.requestPointerLock ||
		        cnv.mozRequestPointerLock ||
		        cnv.webkitRequestPointerLock;

		if (cnv.requestPointerLock !== undefined) {
			cnv.requestPointerLock()
		}
	}
}

function keyReleased() {
	//Handles the releasing of keys
	if (key === "W") {
		keys.w = false
	}
	if (key === "A") {
		keys.a = false
	}
	if (key === "S") {
		keys.s = false
	}
	if (key === "D") {
		keys.d = false
	}
	if (key === " ") {
		keys.space = false
	}
	if (keyCode === LEFT_ARROW) {
		keys.left = false
	}
	if (keyCode === RIGHT_ARROW) {
		keys.right = false
	}
}

function gamePlayLoop() {
	
	//The mainline function

	updateDisplays()

	if (player.health === "dead") {
		lvl -= 1
		finished = "died"
		player.health = 200
		keys.click = false
		keys.space = false
	} else if (finished !== false && finished !== "waiting") {
		if (finished == "died") {
			document.getElementById("infoText").innerHTML = "You died <br><small>press space to restart<\small>"
			drawBlood()
			if (keys.click || keys.space) {
				finished = true
				updates = 60
				keys.click = false
				keys.space = false
				splats = []
				document.getElementById("bloodCanvas").getContext("2d").clearRect(0, 0, document.getElementById("bloodCanvas").width, document.getElementById("bloodCanvas").height)
			}
		}
		pop()
		document.getElementById("infoText").style = "z-Index: 4"

		if (finished == true) {
			finished = false
			nextLevel()
			document.getElementById("infoText").value = "Level: " + lvl
			setTimeout(function(){document.getElementById("infoText").style = "z-Index: -1"}, 1000)
		}
	} else if (options) {
		if (isInFullScreen()) {
			cnv.style.width = windowWidth + "px"
			cnv.style.height = windowWidth/(16/9) + "px"
			document.getElementById("sketch-holder").style.height = windowWidth/(16/9) + "px"
		} else {
			cnv.style.width = 1000 + "px"
			cnv.style.height = 563 + "px"
			document.getElementById("sketch-holder").style.height = 563 + "px"
		}
		optionsForm()
	} else {
		Enemies = true
		for (i = 0; i < things.length; i++) {
			switch (things[i].constructor) {
				case Enemy:
				case Chicken:
				case Egg:
				case Dino:
				case Nazi:
				  Enemies = false
				  break
			}
			if (!Enemies) {
				break
			}
		}
		if (Enemies && finished !== "waiting") {
			document.getElementById("infoText").innerHTML = "All enemies slain!"
			document.getElementById("infoText").style = "z-Index: 4"
			if (lvl % 5 == 0) {
				finished = "waiting"
				setTimeout(function(){finished = true}, 1000)
			}
		}
		update()
	}
}

function update() {
	//Updates position and actions of all entities in the game.
	updates += 1

	if (new Date() - fireDelay > 300 && guns[weapon].inClip <= 0 && reloading !== true) {
		reloading = "ready"
	}

	if (reloading === "ready") {
		if (guns[weapon].inClip < guns[weapon].clip && guns[weapon].ammo > 0) {
			reloading = true
			keys.space = false
			reload.play()
			rel = setInterval(function() {
				if (guns[weapon].ammo > 0) {
					guns[weapon].ammo -= 1
					guns[weapon].inClip += 1
				} else {
					clearInterval(rel)
					reloading = false
				}
				if (guns[weapon].inClip >= guns[weapon].clip) {
					clearInterval(rel)
					reloading = false
				}
			}, guns[weapon].reload/(guns[weapon].clip - guns[weapon].inClip))

			if (guns[weapon].rframes > 0) {
				animationStage = guns[weapon].frames + 1
				var playRelAnimation = setInterval(function(){
					if (animationStage >= guns[weapon].frames+guns[weapon].rframes) {
						animationStage = 0
						clearInterval(playRelAnimation)
					} else {
						animationStage += 1
					}
				}, (guns[weapon].reload)/(guns[weapon].rframes+1))
			}

		} else {
			if (weapon == 3 && guns[weapon].inClip < guns[weapon].clip) {
				animationStage = guns[weapon].frames + 1
			}
			reloading = false
		}
	}

	if ((keys.space || keys.click) && new Date() - fireDelay > guns[weapon].delay+guns[weapon].cd && guns[weapon].inClip > 0 && reloading === false) {

		shoot()

	}

	player.update()
	for (index = things.length - 1; index >= 0; index--) {
		if (things[index].update !== undefined) {
			things[index].update(index)

			if (things[index].health <= 0) {
				if (Math.random() < 0.2 && things[index].type == "melee" || things[index].type == "ranged") {
					if (Math.random() < 0.5) {
						things.push(new Pack(things[index].pos.x, things[index].pos.y, "healthPack"))
					} else {
						things.push(new Pack(things[index].pos.x, things[index].pos.y, "ammoPack"))
					}
				}

				switch (things[index].constructor) {
					case Enemy:
						(random(deathSound)).play()
						break
					case Chicken:
						chickenDeath.play()
						break
					case Egg:
						eggCrack.play()
						break
					case Dino:
						break
					case Nazi:
						break
					default:
						break
				}

				things.splice(index, 1)
			}

		} else if (dist(things[index].pos.x, things[index].pos.y, player.pos.x, player.pos.y) < 5) {
			if (things[index].type == "healthPack") {
				player.health += 25
				things.splice(index, 1)
				healSound.play()
			} else if (things[index].type == "ammoPack" && weapon !== 0) {
				guns[weapon].ammo += guns[weapon].clip
				things.splice(index, 1)
				ammoSound.play()
			}
		}
	}

	if (new Date() - time > 1000) {
		time = new Date()
		//document.getElementById("fps").innerHTML = frames + "<br>" + updates

		if (Math.floor((res*map(50-updates, 0, 50, 0, 1))/25)*25 > 0) {
			res -= Math.floor((res*map(50-updates, 0, 50, 0, 1))/25)*25
			resize()
		}

		updates = 0
		frames = 0
	}

	updateDisplays()

	render()

}

function render() {
	//Renders the first person perspective onto the screen
	frames += 1

	//fill(81, 51, 51)
	fill(101, 71, 71)
	rect(-1, height/2, width+1, height/2 + 1)
	stroke(0)
	//fill(120, 60, 60)
	fill(140, 80, 80)
	rect(-1, -1, width+1, height/2 + 1)

	things.sort(function(a, b){return dist(b.pos.x, b.pos.y, player.pos.x, player.pos.y) - dist(a.pos.x, a.pos.y, player.pos.x, player.pos.y)})

	for (i = 0; i < things.length; i++) {
		things[i].render = {min: null, max: null, end: null}
	}

	rays = []

	vFov = fov/zoom

	for (i = 1; i <= res; i++) {
		angle = player.heading
		offset = map(i, 1, res, -vFov/2, vFov/2)
		angle = angle + offset
		angle = angle % (2*PI)
		if (angle < 0) {
			angle = (2*PI)+angle
		}
		rays.push(castRay(player.pos.x/10, player.pos.y/10, angle, offset, true))
	}

	for (i = 0; i < rays.length; i++) {
		push()
		rectMode(CENTER)
		noStroke()

		brightness = 80 + dist(player.pos.x, player.pos.y, rays[i].fullRay.x, rays[i].fullRay.y)
		if (brightness < 80) {
			brightness = 80
		}

		switch(rays[i].fullRay.type) {
			case (1):
				c1 = color(150, 20, 20)
				c2 = color(70, 10, 10)
				c3 = lerpColor(c1,c2, map(brightness, 80, 255, 0, 1))
				fill(c3)
				break
			case (2):
				//fill(0, 200-(brightness/2), 0)
				fill(0, 220-(brightness/2), 0)
				break
			default:
				fill(brightness)
				break
		}

		rect((width/rays.length)*(i+0.5), height/2, width/rays.length, rays[i].fullRay.height*zoom)

		pop()

		x = Math.cos(player.heading+PI/2)
		y = Math.sin(player.heading+PI/2)

		for (j = 0; j < things.length; j++) {

			d = dist(player.pos.x, player.pos.y, rays[i].fullRay.x, rays[i].fullRay.y)
			renderMinMax(j, {x: player.pos.x + Math.cos(rays[i].angle)*d, y: player.pos.y + Math.sin(rays[i].angle)*d})

		}
	}

	for (j = 0; j < things.length; j++) {
		drawSprites(j)
	}

	//The UI
	UI()

	//The minimap
	minimap(rays)

	//Red flash

	if (player.injured !== false) {
		if (player.health > 0) {
			if (player.health <= 200){
				fill(255, 0, 0, map(new Date() - player.injured, 0, 400, map(player.health, 200, 0, 100, 255), 0))
			} else {
				fill(255, 0, 0, map(new Date() - player.injured, 0, 400, 100, 0))
			}
			rect(-1, -1, width+1, height+1)
		} else {
			document.getElementById("health").value = 0
		}

		if (new Date() - player.injured > 400 && player.health > 0) {
			player.injured = false
		}
		if (player.health <= 0) {
			player.health = "dead"
		}
	}

	if (map(updates + 1, 0, 50, 0, 1000) - (new Date() - time) > 10) {
		render()
	}

}

function shoot() {
	//This function handles data to do with the action of shooting
	guns[weapon].inClip -= 1

	if (weapon === 2 || weapon === 3) {
		shots[0].play()
	} else {
		if (shots[1].paused) {
			shots[1].play()
		} else if (shots[2].paused) {
			shots[2].play()
		} else {
			shots[3].play()
		}
	}

	fireDelay = new Date()

	animationStage += 1

	var playAnimation = setInterval(function(){
		if (animationStage >= guns[weapon].frames) {
			animationStage = 0
			clearInterval(playAnimation)
		} else {
			animationStage += 1
		}
	}, (guns[weapon].delay-guns[weapon].cd)/(guns[weapon].frames+1))


	for (INDEX = 0; INDEX < guns[weapon].spread.no; INDEX++) {
		Angle = player.heading % (2*PI)
		while (Angle < 0) {
			Angle = (2*PI) + Angle
		}

		bullet = castRay(player.pos.x/10, player.pos.y/10, Angle, 0, false)

		d = {dist: Infinity, index: null}

		for (index = 0; index < things.length; index++) {
			if (things[index].health == undefined || things[index].health == Infinity) {
				continue
			}
			hit = pointLine({x0: player.pos.x, y0: player.pos.y, x1: bullet.fullRay.x, y1: bullet.fullRay.y}, things[index].pos.x, things[index].pos.y)
			if (hit.distance < things[index].hitBox && dist(player.pos.x, player.pos.y, things[index].pos.x, things[index].pos.y) < d.dist) {
				d = {dist: dist(player.pos.x, player.pos.y, things[index].pos.x, things[index].pos.y), index: index}
			}
		}

		if (d.dist !== Infinity) {
			things[d.index].health -= guns[weapon].dmg
			things[d.index].injured = new Date()
		}
	}
}

function UI() {
	//All of the ui is drawn and updated in this function
	if (zoom === 1) {
		try {
			size = (width/5)
			if (weapon === 0) {
				ctx.drawImage(animations[weapon][animationStage], width/2 - (size*0.45), height-size, size, size)
			} else if (animations[weapon] === undefined) {
				ctx.drawImage(placeHolder, width/2 - (size/2), height-size, size, size)
			} else {
				ctx.drawImage(animations[weapon][animationStage], width/2 - ((size*1.5)*0.5), height-size*1.5, size*1.5, size*1.5)
			}
		} catch (err) {
			console.log(err, animations, weapon + " - " + animationStage)
		}
	}


	document.getElementById("clip").value = guns[weapon].inClip + "/" + guns[weapon].clip
	document.getElementById("ammo").value = guns[weapon].ammo
	document.getElementById("health").value = player.health
}

function drawSprites(j) {
	//Correctly draws the image from the corresponding item onto the screen.
	push()
	noStroke()
	if (things[j].render.min !== null) {
		switch (things[j].type) {
			case "ranged":
				if (things[j].injured !== false) {
					if (new Date() - things[j].injured < 150) {
						drawImage(DemonRed, things[j])
					} else {
						things[j].injured = false
						drawImage(Demon, things[j])
					}
				} else {
					drawImage(Demon, things[j])
				}
				break
			case "melee":
				if (things[j].injured !== false) {
					if (new Date() - things[j].injured < 150) {
						drawImage(DemonMeleeRed, things[j])
					} else {
						things[j].injured = false
						drawImage(DemonMelee, things[j])
					}
				} else {
					drawImage(DemonMelee, things[j])
				}
				break
			case "egg":
				drawImage(egg, things[j])
				break
			case "chicken":
				drawImage(chicken[things[j].img], things[j])
				break
			case "orb":
				drawImage(fireball, things[j])
				break
			case "LAZER":
				drawImage(FireballLAZER, things[j])
				break
			case "healthPack":
				drawImage(healthPack, things[j])
				break
			case "ammoPack":
				drawImage(ammoPack, things[j])
				break
			case "dino":
				drawImage(Dino_, things[j])
				break
			case "nazi":
				drawImage(nazi_Animation[things[j].animationSequence[Math.floor(things[j].stage)]], things[j])
				break
			default:
				drawImage(placeHolder, things[j])
		}
	}
	pop()
}

function Player() {
	//The constructor function for the player
	this.pos = {x: 15, y: 15}
	this.newPos = {x: 15, y: 15}
	this.heading = PI/2
	this.moveSpeed = 0.4
	this.health = 200
	this.render = {min: null, max: null}
	this.injured = false
	this.mouse = mouseX

	this.update = function() {
		//Handles movement of the player
		if (keys.left) {
			this.heading -= 0.03/zoom
		}
		if (keys.right) {
			this.heading += 0.03/zoom
		}

		if (this.heading === PI/2 || this.heading === PI + PI/2) {
			this.heading += 0.001
		}

		this.newPos.x = this.pos.x
		this.newPos.y = this.pos.y
		if (keys.w) {
			this.newPos.x += Math.cos(this.heading)*this.moveSpeed
			this.newPos.y += Math.sin(this.heading)*this.moveSpeed
		}
		if (keys.a) {
			this.newPos.x += Math.cos(this.heading-PI/2)*this.moveSpeed/1.5
			this.newPos.y += Math.sin(this.heading-PI/2)*this.moveSpeed/1.5
		}
		if (keys.s) {
			this.newPos.x -= Math.cos(this.heading)*this.moveSpeed
			this.newPos.y -= Math.sin(this.heading)*this.moveSpeed
		}
		if (keys.d) {
			this.newPos.x += Math.cos(this.heading+PI/2)*this.moveSpeed/1.5
			this.newPos.y += Math.sin(this.heading+PI/2)*this.moveSpeed/1.5
		}
		if (keys.w || keys.a || keys.s || keys.d) {
			if (new Date() - footTime > 1000) {
				footTime = new Date()
				footsteps[1].play()
			} else if (new Date() - footTime > 500 && new Date() - footTime < 750) {
				footsteps[0].play()
			}
		}

		if (checkSpace(this.newPos.x, this.pos.y) < 1) {
			if (checkSpace(this.newPos.x-0.5, this.pos.y) < 1) {
				if (checkSpace(this.newPos.x+0.5, this.pos.y) < 1) {
					if (checkSpace(this.newPos.x, this.pos.y+0.5) < 1) {
						if (checkSpace(this.newPos.x, this.pos.y-0.5) < 1) {
							this.pos.x = this.newPos.x
						}
					}
				}
			}
		}

		if (checkSpace(this.pos.x, this.newPos.y) < 1) {
			if (checkSpace(this.pos.x, this.newPos.y-0.5) < 1) {
				if (checkSpace(this.pos.x, this.newPos.y+0.5) < 1) {
					if (checkSpace(this.pos.x-0.5, this.newPos.y) < 1) {
						if (checkSpace(this.pos.x+0.5, this.newPos.y) < 1) {
							this.pos.y = this.newPos.y
						}
					}
				}
			}
		}

		if (checkSpace(this.pos.x + 1, this.pos.y) === 2) {
			finished = true
		} else {
			theMap[Math.floor(this.pos.x/10)][Math.floor(this.pos.y/10)] = 0.1
		}

	}
}

function Enemy(x, y, type) {
	//Enemy constructor function
	this.pos = {x: x, y: y}
	this.origin = {x: x, y: y}
	this.type = type
	this.r = 5
	this.hitBox = 7
	this.newPos = {x: this.pos.x, y: this.pos.y}
	this.state = false
	this.heading = 0
	if (type == "melee") {
		this.health = lvl * 5 + 80
	} else {
		this.health = lvl * 10 + 50
	}
	/*
	|1|2|3|4|5|6|7|8|9|
	|3|3|4|4|4|4|4|4|5|
	|2|3|3|3|4|4|4|5|5|
	*/
	this.maxHealth = this.health
	this.injured = false
	this.render = {min: null, max: null, end: null}
	this.flip = false

	this.update = function() {
		this.newPos = {x: this.pos.x, y: this.pos.y}

		if (this.state !== false) {

			if (this.type == "melee") {
				this.meleeAI()
			} else {
				this.rangedAI()
			}
		} else {

			ang = Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x) % (2*PI)
			if (ang < 0) {
				ang = (2*PI) + ang
			}

			ray = castRay(this.pos.x/10, this.pos.y/10, ang)
			if (pointLine({x0: this.pos.x, y0: this.pos.y, x1: ray.fullRay.x, y1: ray.fullRay.y}, player.pos.x, player.pos.y).distance < 10) {
				this.state = true
				spotted.play()
			}

		}



		if (checkMove(this.newPos.x, this.pos.y, 2, this) === 0 || checkMove(this.newPos.x, this.pos.y, 2, this) === 0.1) {
			this.pos.x = this.newPos.x
		} else {
			this.flip = true
		}

		if (checkMove(this.pos.x, this.newPos.y, 2, this) === 0 || checkMove(this.pos.x, this.newPos.y, 2, this) === 0.1) {
			this.pos.y = this.newPos.y
		} else {
			this.flip = true
		}
	}

	this.meleeAI = function () {
		this.heading = Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x)

		if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < 6.5 && this.state === true) {
			player.health -= 25
			player.injured = new Date()
			this.state = new Date()
		}
		if (new Date() - this.state > 750) {
			this.state = true
		}

		var m = (Math.pow(dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y)/6, 2))/2
		if (m > 0.5) {
			m = 0.5
		}

		if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) > 3) {
			this.newPos.x += Math.cos(this.heading)*m
			this.newPos.y += Math.sin(this.heading)*m
		}
	}

	this.rangedAI = function () {
		this.heading += random(-0.05, 0.05)

		if (this.flip) {
			this.heading = random(0, 2*PI)
			this.flip = false
		}

		if (dist(this.pos.x, this.pos.y, this.origin.x, this.origin.y) > 20) {
			this.heading = Math.atan2(this.origin.y - this.pos.y, this.origin.x - this.pos.x)
		}

		this.newPos.x += Math.cos(this.heading)*0.25
		this.newPos.y += Math.sin(this.heading)*0.25

		if (this.state === true) {
			this.state = new Date()
			things.push(new projectile(this.pos.x, this.pos.y, Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x), "orb"))
		}
		if (new Date() - this.state > 1000) {
			this.state = true
		}
	}
}

function projectile(x, y, heading, type) {
	//The projectile constructor function
	this.pos = {x: x, y: y}
	this.heading = heading
	this.render = {min: null, max: null}
	this.r = 3
	this.type = type
	if (this.type === "orb") {
		this.moveSpeed = 1.8
	} else {
		this.moveSpeed = 0.8
	}

	this.update = function() {
		if (this.type === "orb") {
			amt = 0.005
			ang = Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x)
			if (ang < 0) {
				ang = (2*PI) + ang
			}
		}

		this.heading = this.heading%(2*PI)
		if (this.heading < 0) {
			this.heading = (2*PI) + this.heading
		}

		if (this.type === "orb") {
			cpu_facing = degrees(this.heading)
		  player_degree = degrees(ang)

		  if ((cpu_facing-player_degree+360)%360>180) {
		    this.heading += amt
		  } else {
		    this.heading -= amt
		  }
		}
		this.pos.x += Math.cos(this.heading)*this.moveSpeed
		this.pos.y += Math.sin(this.heading)*this.moveSpeed

		if (checkSpace(this.pos.x, this.pos.y) == 1) {
			this.health = 0
		}

		d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y)
		if (this.type === "orb" && d < 2) {
			player.health -= 30
			player.injured = new Date()
			this.health = 0
		} else if (d < 3 && this.type !== "orb") {
			player.health -= 5
			player.injured = new Date()
			this.health = 0
		}
	}
}

function checkSpace(x, y) {
	//Checks a specific place on the map

	x = Math.floor(x/10)
	y = Math.floor(y/10)

	return theMap[x][y]
}

function checkMove(x, y, radius, that) {
	//Checks a space and nearby areas on the map
	var result = checkSpace(x, y)
	if (checkSpace(x+radius, y) === result) {
		if (checkSpace(x-radius, y) === result) {
			if (checkSpace(x, y+radius) === result) {
				if (checkSpace(x, y-radius) === result) {

					for (var z = 0; z < things.length; z++) {
						if (dist(x, y, things[z].pos.x, things[z].pos.y) < 2 && things[z] !== that && things[z].constructor !== projectile) {
							return 1
						}
					}

					return result

				}
			}
		}
	}
	return 1
}

function castRay(x, y, heading, diff, p) {
	//Casts a ray which returns data relating to its passage through the map.
	this.angle = heading
	this.angleDiff = diff
	this.origin = {x: x, y: y}
	this.wallType
	this.grad = Math.tan(this.angle)

	this.myCatch = 0
	while (this.myCatch < 80) {
		this.myCatch += 1

		if (this.angle >= 0 && this.angle < PI/2) {
			Xdist = (Math.floor(this.origin.x)+1) - this.origin.x //Distance to the next X line
			Ydist = (Math.floor(this.origin.y)+1) - this.origin.y //Distance to the next Y line
		} else if (this.angle >= PI/2 && this.angle < PI) {
			Xdist = (Math.floor(this.origin.x-0.01)) - this.origin.x //Distance to the next X line
			Ydist = (Math.floor(this.origin.y)+1) - this.origin.y //Distance to the next Y line
		} else if (this.angle >= PI && this.angle < 3*PI/2) {
			Xdist = (Math.floor(this.origin.x-0.01)) - this.origin.x //Distance to the next X line
			Ydist = (Math.floor(this.origin.y-0.01)) - this.origin.y //Distance to the next Y line
		} else {
			Xdist = (Math.floor(this.origin.x)+1) - this.origin.x //Distance to the next X line
			Ydist = (Math.floor(this.origin.y-0.01)) - this.origin.y //Distance to the next Y line
		}
		stepX = Ydist/this.grad //Amount of X the proposed move on y would cover
		stepY = this.grad*Xdist //Amount of X the proposed move on y would cover

		dist1 = dist(0, 0, Xdist, stepY)//The distance each of these proposed moves would cover
		dist2 = dist(0, 0, Ydist, stepX)

		if (abs(dist2) > abs(dist1)) {
			this.origin.x += Xdist
			this.origin.y += stepY

			//push(); fill(0, 255, 0); ellipse(this.origin.x*10, this.origin.y*10, 3); pop()

		} else {
			this.origin.x += stepX
			this.origin.y += Ydist

			//push(); fill(255, 0, 0); ellipse(this.origin.x*10, this.origin.y*10, 3); pop()

		}

		if (this.angle >= 0 && this.angle < PI/2) {
			try {
			if (theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y)] >= 1) {
				this.wallType = theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y)]
				break
			} else if (p && theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y)] !== undefined) {
				theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y)] = 0.1
			}} catch(err) {}

		} else if (this.angle >= PI/2 && this.angle < PI) {
			try {
			if (theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y)] >= 1) {
				this.wallType = theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y)]
				break
			} else if (p && theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y)] !== undefined) {
				theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y)] = 0.1
			}} catch(err) {}

		} else if (this.angle >= PI && this.angle < 3*PI/2) {
			try {
			if (theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y-0.01)] >= 1) {
				this.wallType = theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y-0.01)]
				break
			} else if (p && theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y-0.01)] !== undefined) {
				theMap[Math.floor(this.origin.x-0.01)][Math.floor(this.origin.y-0.01)] = 0.1
			}} catch(err) {}

		} else {
			try {
			if (theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y-0.01)] >= 1) {
				this.wallType = theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y-0.01)]
				break
			} else if (p && theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y-0.01)] !== undefined) {
				theMap[Math.floor(this.origin.x)][Math.floor(this.origin.y-0.01)] = 0.1
			}} catch(err) {}

		}

	}

	if (fov > PI/2) {
		theDistance = dist(player.pos.x, player.pos.y, this.origin.x*10, this.origin.y*10)
	} else {
		theDistance = dist(player.pos.x, player.pos.y, this.origin.x*10, this.origin.y*10)*Math.cos(this.angleDiff)
	}
	theDistance = (60/theDistance)*(60)
	theDistance = map(theDistance, 0, 655, 0, height)

	return {fullRay: {x: this.origin.x*10, y: this.origin.y*10, height: theDistance, type: this.wallType, angleDiff: this.angleDiff}, angle: this.angle}
}

function drawImage(src, item) {
	//Draws the individual images and health bars for each entity
	start = map(item.render.min.imgStart, 0, 2*item.r, 0, src.width)
	end = map(item.render.max.imgEnd, 0, 2*item.r, 0, src.width)
	try {

		//            Img| clipping| clipping width     | clipping  |   x position                 | y position                                |  width                             | height
		//							 |	 start |                    | height    |                              |                                           |                                    |
		ctx.drawImage(src, start, 0, src.width-start-end, src.height, Math.round(item.render.min.x), Math.round(height/2 - item.render.min.h/2), item.render.max.x-item.render.min.x, item.render.min.h)
		push()

		if (item.health !== Infinity && item.health !== undefined) {
			if (start/src.width > 0.3) {
				xValue = map(start/src.width, start/src.width, (src.width-end)/src.width, item.render.min.x, item.render.max.x)
			} else {
				xValue = map(0.3, start/src.width, (src.width-end)/src.width, item.render.min.x, item.render.max.x)
			}

			if ((src.width-end)/src.width < 0.7) {
				xValue2 = map((src.width-end)/src.width, start/src.width, (src.width-end)/src.width, item.render.min.x, item.render.max.x)
			} else {
				xValue2 = map(0.7, start/src.width, (src.width-end)/src.width, item.render.min.x, item.render.max.x)
			}

			if (start/src.width < 0.7 && (src.width-end)/src.width > 0.3) {
				fill(255, 0, 0)
				rect(xValue, height/2 - item.render.min.h/2, xValue2-xValue, item.render.min.h/20)
				fill(0, 255, 0)
				rect(xValue, height/2 - item.render.min.h/2, map(item.health, 0, item.maxHealth, 0, xValue2-xValue), item.render.min.h/20)
			}
		}
		pop()

	} catch (err) {
		console.log(err, start + ":" + end, src)
	}
}

function resize(numb) {
	//resizes the canvas
	resizeCanvas(res, Math.floor((res)/(16/9)))
}

function Chicken(pos, gen) {
	//The chicken constructor function
	this.pos = pos

	this.gen = gen + 1

	this.type = "chicken"
	this.img = 0
	this.sequence = new Date()
	this.r = 2
	this.hitBox = 2
	this.health = 500/(this.gen)
	this.maxHealth = this.health
	this.render = {min: null, max: null, end: null}

	this.spawn = new Date()

	this.newPos = {x: this.pos.x, y: this.pos.y}

	this.active = true

	this.update = function() {

		if (new Date() - this.sequence > 500) {
			this.sequence = new Date()
			this.img += 1
			this.img = this.img % 2
		}



		if (new Date - this.spawn > this.gen * 2000) {
			this.spawn = Infinity
			things.push(new Egg([[this.pos.x, this.pos.y]], this.gen))
		}

		if (this.active == true || new Date() - this.active > 1000) {

			this.newPos = {x: this.pos.x, y: this.pos.y}

			m = Math.pow(1.01, dist(player.pos.x, player.pos.y, this.pos.x, this.pos.y)) - 0.8

			this.newPos.x += Math.cos(Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x))*m
			this.newPos.y += Math.sin(Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x))*m

			if (checkMove(this.newPos.x, this.pos.y, 2, this) === 0 || checkMove(this.newPos.x, this.pos.y, 2, this) === 0.1) {
				this.pos.x = this.newPos.x
			}
			//theMap[this.pos.x] [this.newPos.y]
			if (checkMove(this.pos.x, this.newPos.y, 2, this) === 0 || checkMove(this.pos.x, this.newPos.y, 2, this) === 0.1) {
				this.pos.y = this.newPos.y
			}

			if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < 5) {
				this.active = new Date()
				player.health -= 15
				player.injured = new Date()
			}
		}

	}
}

function Egg(free, gen) {
	//The egg constructor function
	//Q: What came first? The chicken or the egg? 
	//A: The egg.
	this.gen = gen
	freeVals = random(free)
	this.pos = {x: freeVals[0] + 5, y: freeVals[1] + 5}

	this.type = "egg"
	this.r = 2
	this.hitBox = 2
	this.health = 1
	this.maxHealth = 200
	this.render = {min: null, max: null, end: null}
	this.spawn = new Date()

	this.addedHp = new Date()

	this.update = function(myIndex) {
		if (this.health >= this.maxHealth) {
			things[myIndex] = (new Chicken(this.pos, this.gen))
		} else if (new Date() - this.spawn > 5000) {
			this.health = -50
		} else {
			this.r += 0.01
			this.hitBox += 0.01
			this.health += (50/1000)*(new Date() - this.addedHp)
			this.addedHp = new Date()
		}
	}
}

function nextLevel() {
	//moves onto the next level
	lvl += 1

	if (lvl % 5 == 0) {
		if (lvl % 10 == 0) {
			createBossMap(true)
		} else {
			createBossMap(false)
		}
	} else {
		createMap(80, 10 + lvl)
	}

	document.getElementById("mapCanvas").width = (1000)
	document.getElementById("mapCanvas").height = (1000/theMap.length)*(theMap[0].length)
	document.getElementById("PlayerCanvas").width = (1000)
	document.getElementById("PlayerCanvas").height = (1000/theMap.length)*(theMap[0].length)
}

function minimap(pointsArray) {
	//Draws the minimap
	var cnv = document.getElementById("mapCanvas")
	var ctx = cnv.getContext("2d")

	var addAmount = Math.floor(pointsArray.length/50) + 1

	for (i = 0; i < pointsArray.length; i += addAmount) {
		ctx.beginPath()
		//ctx.arc((pointsArray[i].fullRay.x), (pointsArray[i].fullRay.y), 0.1, 0, 2*Math.PI)
		ctx.rect((pointsArray[i].fullRay.x), (pointsArray[i].fullRay.y), 0.1, 0.1)
		ctx.strokeWeight="0.1"
		ctx.stroke()
	}

	if (keys.m) {
		var cnvPlayerMap = document.getElementById("PlayerCanvas")
		var ctxPlayerMap = cnvPlayerMap.getContext("2d")
		ctxPlayerMap.clearRect(0, 0, cnvPlayerMap.width, cnvPlayerMap.height)

		ctxPlayerMap.beginPath()
		ctxPlayerMap.moveTo(player.pos.x, player.pos.y)
		for (i = 0; i < pointsArray.length; i++) {
			ctxPlayerMap.lineTo((pointsArray[i].fullRay.x), (pointsArray[i].fullRay.y))
		}
		ctxPlayerMap.closePath()
		ctxPlayerMap.fillStyle = "rgba(0, 255, 0, 0.3)"
		ctxPlayerMap.fill()

		ctxPlayerMap.beginPath()
		ctxPlayerMap.arc(player.pos.x, player.pos.y, 1, 0, 2*Math.PI)
		ctxPlayerMap.strokeStyle="green"
		ctxPlayerMap.stroke()
		ctxPlayerMap.fill()

		for (i = 0; i < things.length; i++) {
			if (things[i].type != "orb" && (things[i].state == undefined || things[i].state == true)) {
				ctxPlayerMap.beginPath()
				ctxPlayerMap.arc(things[i].pos.x, things[i].pos.y, 1, 0, 2*Math.PI)
				ctxPlayerMap.strokeStyle="orange"
				ctxPlayerMap.stroke()
				ctxPlayerMap.fill()
			}
		}

		rAngle = player.heading % (2*PI)
		while (rAngle < 0) {
			rAngle = (2*PI) + rAngle
		}


		aimRay = castRay(player.pos.x/10, player.pos.y/10, rAngle, 0, false)

		ctxPlayerMap.beginPath()
		ctxPlayerMap.moveTo(player.pos.x, player.pos.y)
		ctxPlayerMap.lineTo(aimRay.fullRay.x, aimRay.fullRay.y)
		ctxPlayerMap.strokeStyle="turquoise"
		ctxPlayerMap.stroke()

	}
}

function renderMinMax(j, xy) {
	//Calculates what parts of an entities image needs to be drawn
	pointOnLine = lineIntersectLimit(player.pos.x, player.pos.y, xy.x, xy.y, things[j].pos.x + x*things[j].r, things[j].pos.y + y*things[j].r, things[j].pos.x - x*things[j].r, things[j].pos.y - y*things[j].r)

	if (pointOnLine !== false && things[j].render.end === null) {
		theDistance = dist(player.pos.x, player.pos.y, pointOnLine.x, pointOnLine.y)*Math.cos(rays[i].fullRay.angleDiff)
		theHeight = (60/theDistance)*(60)
		theHeight = map(theHeight, 0, 655, 0, height)*zoom

		if (things[j].render.min === null) {
			things[j].render.min = {x: (width/rays.length)*(i), h: theHeight, imgStart: dist(pointOnLine.x, pointOnLine.y, things[j].pos.x - x*things[j].r, things[j].pos.y - y*things[j].r)}
		}
		things[j].render.max = {x: (width/rays.length)*(i+1), imgEnd: dist(pointOnLine.x, pointOnLine.y, things[j].pos.x + x*things[j].r, things[j].pos.y + y*things[j].r)}
	} else if (things[j].render.max !== null) {
		things[j].render.end = true
	}
}

function isInFullScreen() {
	//Returns whether the page is in fullscreen
	return (document.fullscreenElement && document.fullscreenElement !== null) ||
	(document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
	(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
	(document.msFullscreenElement && document.msFullscreenElement !== null)
}

function optionsForm() {
	//Shows the options form
	push()
	background(51)
	wid = width/10
	//Resolution
	textAlign(LEFT)
	stroke(255)
	fill(255)
	text("Resolution", wid, height/4 - 30)
	text("Sensitivity", wid, height/2 - 30)
	text("Field of view", wid, height*3/4 - 30)

	stroke(0)
	ellipse(map(res/25, 1, 40, wid, wid*9), height/4, 8, 10)
	ellipse(map(sensitivity, 1, 10, wid, wid*9), height/2, 8, 10)
	ellipse(map(fov, Math.PI/6, 2*Math.PI, wid, wid*9), height*3/4, 8, 10)

	stroke(255)

	textAlign(CENTER)
	text(res, map(res/25, 1, 40, wid, wid*9), height/4 - 10)
	text(sensitivity, map(sensitivity, 1, 10, wid, wid*9), height/2 - 10)
	text(Math.round(degrees(fov)), map(fov, Math.PI/6, 2*Math.PI, wid, wid*9), height*3/4 - 10)

	line(wid, height/4, (wid)*9, height/4)
	line(wid, height/2, (wid)*9, height/2)
	line(wid, height*3/4, (wid)*9, height*3/4)

	text("Fullscreen:", wid*8 + 40, wid)

	//Fullscreen button, the code for changing it's value is located in the click function
	if (isInFullScreen()) {
		fill(0, 255, 0)
	} else {
		fill(255, 0, 0)
	}
	rect(wid*9 - 20, wid-15, 20, 20)



	if (mouseX > (parseInt(cnv.style.width)/10) - 30 && mouseX < ((parseInt(cnv.style.width)/10)*9) + 30 && mouseIsPressed) {
		//Resolution
		if (abs(mouseY-parseInt(cnv.style.height)/4) < 30) {
			val = (Math.round(mouseX/(parseInt(cnv.style.width)/48.75))-4)*25

			if (val < 25) {
				val = 25
			} else if (val > 1000) {
				val = 1000
			}
			res = val

		}
		//Sensitivity
		if (abs(mouseY-parseInt(cnv.style.height)/2) < 30) {
			val = (Math.round((mouseX/(parseInt(cnv.style.width)/11.25))*10-1)/10)

			if (val < 1) {
				val = 1
			} else if (val > 10) {
				val = 10
			}
			sensitivity = val

		}
		//FOV
		if (abs(mouseY-parseInt(cnv.style.height)*3/4) < 30) {
			val = Math.round(mouseX/(parseInt(cnv.style.width)/413.75))-12

			if (val < 30) {
				val = 30
			} else if (val > 360) {
				val = 360
			}
			fov = radians(val)

		}
	}
	pop()
}

function drawBlood() {
	//Draws the blood onto the canvas when they player dies
	bloodCnv = document.getElementById("bloodCanvas")
	bloodCnv.style.width = cnv.style.width
	bloodCnv.style.height = cnv.style.height
	bloodCtx = bloodCnv.getContext("2d")

	for (am = 0; am < 3; am++) {

		bloodX = random(0, bloodCnv.width)

		if (bloodX <= bloodCnv.width/2) {
			bloodYmin = map(bloodX, 0, bloodCnv.width/2, -100, 0)
		} else {
			bloodYmin = map(bloodX, bloodCnv.width/2, bloodCnv.width, 0, -100)
		}
		splats.push({x: bloodX, y: random(bloodYmin, bloodYmin*2), s: 10})

		for (i = 0; i < splats.length; i++) {
				bloodCtx.beginPath()
				bloodCtx.arc(splats[i].x, splats[i].y, splats[i].s, 0, 2*Math.PI)
				bloodCtx.fillStyle = "rgb(171, 6, 6)"
				bloodCtx.fill()

				splats[i].s = splats[i].s/1.005



			splats[i].x += (Math.random() - 1/2)*bloodCnv.height/400
			splats[i].y += (Math.random())*bloodCnv.height/400
		}
	}
}

function updateDisplays() {
	//Updates all non-canvas ui elements to match the size and shape of the page
	if (isInFullScreen()) {
		cnv.style.width = windowWidth + "px"
		cnv.style.height = windowWidth/(16/9) + "px"
		document.getElementById("health").style.top = (windowHeight - parseInt(cnv.style.height))/2 + parseInt(cnv.style.height) - 90 + "px"
		document.getElementById("clip").style.top = (windowHeight - parseInt(cnv.style.height))/2 + parseInt(cnv.style.height) - 105 + "px"
		document.getElementById("ammo").style.top = (windowHeight - parseInt(cnv.style.height))/2 + parseInt(cnv.style.height) - 120 + "px"
		document.getElementById("circle").style.top = (windowHeight/2-8) + "px"
		document.getElementById("infoText").className = "centredTextFullscreen"
	} else {
		cnv.style.width = 1000 + "px"
		cnv.style.height = 563 + "px"
		document.getElementById("health").style.top = 563-90 + "px"
		document.getElementById("clip").style.top = 563-100 + "px"
		document.getElementById("ammo").style.top = 563-115 + "px"
		document.getElementById("circle").style.top = (275/563 * parseInt(cnv.style.height)) + "px"
		document.getElementById("infoText").className = "centredTextWindow"
	}
	document.getElementById("circle").style.left = (windowWidth/2 -6) + "px"
	document.getElementById("health").style.left = (windowWidth/2) - (parseInt(cnv.style.width)/2) + 5 + "px"
	document.getElementById("clip").style.left = (windowWidth/2) - (parseInt(cnv.style.width)/2) + 5 + "px"
	document.getElementById("ammo").style.left = (windowWidth/2) - (parseInt(cnv.style.width)/2) + 5 + "px"
}

function Dino(x, y, hp) {
	//The dino constructor function
	if (x == undefined) {
		this.pos = {x: 75, y: 75}
		this.naziHp = 300*(lvl/10)
	} else {
		this.pos = {x: x, y: y}
		this.naziHp = hp
	}
	this.heading = random(0, 2*PI)
	this.newPos = {x: this.pos.x, y: this.pos.y}
	this.health = 500*Math.pow(1.5, lvl/10)
	this.maxHealth = this.health
	this.r = 5
	this.hitBox = 7
	this.deltaH = 0
	this.type = "dino"

	this.timeout = new Date()

	this.update = function(myIndex) {
		this.deltaH += random(map(this.deltaH, 0, 0.1, 0.01, 0), map(this.deltaH, 0, -0.1, -0.01, 0))
		this.heading += this.deltaH

		this.newPos = {x: this.pos.x, y: this.pos.y}

		if (dist(this.pos.x, this.pos.y, 75, 75) > 35) {
			this.heading = Math.atan2(75 - this.pos.y, 75 - this.pos.x)
		}

		this.newPos.x += Math.cos(this.heading)*0.3
		this.newPos.y += Math.sin(this.heading)*0.2

		if (checkMove(this.newPos.x, this.pos.y, 1, this) === 0 || checkMove(this.newPos.x, this.pos.y, 1, this) === 0.1) {
			this.pos.x = this.newPos.x
		}

		if (checkMove(this.pos.x, this.newPos.y, 1, this) === 0 || checkMove(this.pos.x, this.newPos.y, 1, this) === 0.1) {
			this.pos.y = this.newPos.y
		}

		if (this.health <= 0) {
			things[myIndex] = new Nazi(this.pos.x, this.pos.y, this.naziHp)
		}

		if (new Date() - this.timeout > 30) {
			this.timeout = new Date()
			this.shoot()
		}

	}

	this.shoot = function() {
		things.push(new projectile(this.pos.x, this.pos.y, Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x), "LAZER"))
	}
}

function Nazi(x, y, hp) {
	//The Nazi constructor function
	this.animationSequence = [1, 2, 3, 4,/**/3, 2, 1,/**/ 6, 7, 8, 9,/**/8, 7]
	this.stage = 0

	this.heading = 0
	this.delay = new Date()

	this.type = "nazi"
	this.r = 5
	this.hitBox = 3

	this.health = hp
	this.maxHealth = 300*(lvl/10)
	this.pos = {x: x, y: y}
	this.newPos = {x: x, y: y}

	this.update = function(myIndex) {
		this.stage = (this.stage + 0.5) % this.animationSequence.length
		if (new Date() - this.delay < 3000) {
			this.newPos = {x: this.pos.x, y: this.pos.y}
			this.heading = Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x)
			this.newPos.x += Math.cos(this.heading)*-1
			this.newPos.y += Math.sin(this.heading)*-1

			if (checkMove(this.newPos.x, this.pos.y, 3, this) === 0 || checkMove(this.newPos.x, this.pos.y, 3, this) === 0.1) {
				this.pos.x = this.newPos.x
			}

			if (checkMove(this.pos.x, this.newPos.y, 3, this) === 0 || checkMove(this.pos.x, this.newPos.y, 3, this) === 0.1) {
				this.pos.y = this.newPos.y
			}
		} else {
			things[myIndex] = new Dino(this.pos.x, this.pos.y, this.health)
		}
	}

}

function Pack(x, y, type) {
	//Health/Ammo pack constructor function
	this.pos = {x: x, y: y}
	this.render = {min: null, max: null, end: null}
	this.r = 1
	this.type = type
}

function mapMyMap() {
	//Fills out the minimap. This is never called aside from through the console where it can be used as a cheat.
	var cnv = document.getElementById("mapCanvas")
	var ctx = cnv.getContext("2d")
	for (i = 0; i < theMap.length; i++) {
		for (j = 0; j < theMap[i].length; j++) {
			if (theMap[i][j] == 1) {
				ctx.beginPath()
				ctx.fillStyle = "rgb(255, 0, 0)"
				ctx.rect(i*10, j*10, 10, 10)
				ctx.fill()
			} else if (theMap[i][j] == 2) {
				ctx.beginPath()
				ctx.fillStyle = "rgb(0, 255, 0)"
				ctx.rect(i*10, j*10, 10, 10)
				ctx.fill()
			}
		}
	}
	for (i = 0; i < things.length; i++) {
		switch (things[i].constructor) {
			case Enemy:
				if (things[i].type == "ranged") {
					ctx.fillStyle = "rgb(255, 0, 255)"
					ctx.beginPath()
					ctx.arc(things[i].pos.x, things[i].pos.y, 2, 0, 2*PI)
					ctx.fill()
				} else {
					ctx.fillStyle = "rgb(255, 255, 0)"
					ctx.beginPath()
					ctx.arc(things[i].pos.x, things[i].pos.y, 2, 0, 2*PI)
					ctx.fill()
				}
				break
		}
	}
}

//The map for the chicken level
var chickenMap = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1], [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]

//The map for the dino/nazi level
var dinoMap = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
