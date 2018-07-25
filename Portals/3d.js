function draw3d() {
  render(player.pos.x, player.pos.y, player.heading)
}

var walls

function render(playerX, playerY, playerH, playerColour) {
  background(20)
  res = 400
  proj = []
  for (i = 0; i < res; i++) {
    diff = map(i , 0, res-1, -PI/4, PI/4)
    var ray = castRay(playerX, playerY, playerH + diff, function(x, y, s){
      return theMap[x][y][s]
    })
    ray.height = 1/(dist(playerX, playerY, ray.x, ray.y)*Math.cos(diff))
    ray.height *= 100
    c = 1/dist(playerX, playerY, ray.x, ray.y)*255
    fill(c)
    stroke(c)
    rect((width/res)*i, height/2 - ray.height/2, width/res, ray.height)
  }
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

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
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

function castRay(x, y, h, check) {
  m = Math.tan(h)
  stepX = Math.cos(h)
  stepY = Math.sin(h)
  for (f = 0; f < 20; f++) {
    Xdist = stepX > 0 ? Math.floor(x) + 1 - x : Math.floor(x-0.01) - x
    Ydist = stepY > 0 ? Math.floor(y) + 1 - y : Math.floor(y-0.01) - y
    addX = Ydist/m	//Amount on the x axis that would have to be added to result in reaching y
    addY = Xdist*m

		dist1 = dist(0, 0, Xdist, addY)//The distance each of these proposed moves would cover
		dist2 = dist(0, 0, Ydist, addX)

		if (abs(dist2) < abs(dist1)) {
			x+=addX
			y+=Ydist
      if (stepY < 0) {
        side = "d"
      } else {
        side = "u"
      }
		} else {
			x+=Xdist
			y+=addY
      if (stepX < 0) {
        side = "r"
      } else {
        side = "l"
      }
		}

		if (stepX < 0 && x == Math.floor(x)) {
			checkX = Math.floor(x-1)
		} else {
			checkX = Math.floor(x)
		}
		if (stepY < 0 && y == Math.floor(y)) {
			checkY = Math.floor(y-1)
		} else {
			checkY = Math.floor(y)
		}

    try {
      if (check(checkX, checkY, side)) {
  			break
  		}
		} catch(err) {
			f = 20
			break
		}
  }
	return {x: x, y: y, angle: h}
}
