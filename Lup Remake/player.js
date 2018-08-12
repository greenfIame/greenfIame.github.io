var player = {
  pos: {x: 0.5, y: 0.5},
  heading: 0,
  ms: 0.03,

  update: function() {
    var v = {x: 0, y: 0}
    if (keys.w) {
      v.x += Math.cos(this.heading)*this.ms
      v.y += Math.sin(this.heading)*this.ms
    }
    if (keys.a) {
      v.x += Math.cos(this.heading - Math.PI/2)*this.ms
      v.y += Math.sin(this.heading - Math.PI/2)*this.ms
    }
    if (keys.s) {
      v.x -= Math.cos(this.heading)*this.ms
      v.y -= Math.sin(this.heading)*this.ms
    }
    if (keys.d) {
      v.x += Math.cos(this.heading + Math.PI/2)*this.ms
      v.y += Math.sin(this.heading + Math.PI/2)*this.ms
    }

    if (
      Math.floor(this.pos.x + v.x) == Math.floor(this.pos.x) ||
      !map[Math.floor(this.pos.x) + (v.x > 0 ? 1 : 0)][Math.floor(this.pos.y)].l ||
      map[Math.floor(this.pos.x) + (v.x > 0 ? 1 : 0)][Math.floor(this.pos.y)].l.state <= 0
    ) {
      this.pos.x += v.x
    } else {
      var wall = map[Math.floor(this.pos.x) + (v.x > 0 ? 1 : 0)][Math.floor(this.pos.y)].l
      if (typeof(wall) == "object" && (wall.right === null || wall.right === (v.y > 0))) {
        var relativePos = {x: (Math.floor(this.pos.x) + (v.x > 0 ? 1 : 0)) - (this.pos.x + v.x), y: this.pos.y - Math.floor(this.pos.y)}
        switch(wall.rotate) {
          case "left":
            this.pos.x = wall.x + relativePos.y
            this.pos.y = wall.y + relativePos.x
            this.heading -= Math.PI/2
            break
          case "right":
            this.pos.x = wall.x + 1 - relativePos.y
            this.pos.y = wall.y - relativePos.x
            this.heading += Math.PI/2
            break
          case "reverse":
            this.pos.x = wall.x + relativePos.x
            this.pos.y = wall.y + 1 - relativePos.y
            this.heading += Math.PI
            break
          default:
            this.pos.x = wall.x - relativePos.x
            this.pos.y = wall.y + relativePos.y
        }
      } else if (wall.state) {
        wall.state -= 0.01
      }
    }
    if (
      Math.floor(this.pos.y + v.y) == Math.floor(this.pos.y) ||
      !map[Math.floor(this.pos.x)][Math.floor(this.pos.y) + (v.y > 0 ? 1 : 0)].u ||
      map[Math.floor(this.pos.x)][Math.floor(this.pos.y) + (v.y > 0 ? 1 : 0)].u.state <= 0
    ) {
      this.pos.y += v.y
    } else {
      var wall = map[Math.floor(this.pos.x)][Math.floor(this.pos.y) + (v.y > 0 ? 1 : 0)].u
      if (typeof(wall) == "object" && (wall.down === null || wall.down === (v.y > 0))) {
        var relativePos = {x: this.pos.x - Math.floor(this.pos.x), y: (Math.floor(this.pos.y) + (v.y > 0 ? 1 : 0)) - (this.pos.y + v.y)}
        switch(wall.rotate) {
          case "left":
            this.pos.x = wall.x - relativePos.y
            this.pos.y = wall.y + 1 - relativePos.x
            this.heading -= Math.PI/2
            break
          case "right":
            this.pos.x = wall.x + relativePos.y
            this.pos.y = wall.y + relativePos.x
            this.heading += Math.PI/2
            break
          case "reverse":
            this.pos.x = wall.x + 1 - relativePos.x
            this.pos.y = wall.y + relativePos.y
            this.heading += Math.PI
            break
          default:
            this.pos.x = wall.x + relativePos.x
            this.pos.y = wall.y - relativePos.y
        }
      } else if (wall.state) {
        wall.state -= 0.01
      }
    }
  },

  render3d: function() {
    var a, ray, d, b
    ctx.fillStyle = "#a22"

    for (var i = 0; i < cnv.width; i++) {
      a = this.heading + (Math.PI/2 * (i / (cnv.width - 1)) - Math.PI/4)
      ray = castRay(a, this.pos.x, this.pos.y)
      d = ray.d * Math.cos(Math.PI/2 * (i / (cnv.width - 1)) - Math.PI/4)
      b = ((16 + d*d)/16)
      if (ray.t == "wall") {
        fill(50 + 150/b, 20, 20)
        mapctx.fillStyle = `#000`
      } else {
        fill(20, 150 + 50/b, 150 + 50/b)
        mapctx.fillStyle = `#00f`
      }
      ctx.fillRect(i, cnv.height/2 - (cnv.height * 0.5/d)/2, 1, cnv.height * 0.5/d)
      //minictx.fillRect(Math.round(ray.x*2), Math.round(ray.y*2), 1, 1)
      var x = (player.pos.x + Math.cos(a)*ray.d + (
        Math.abs(Math.round(((player.pos.x + Math.cos(a)*ray.d) % 1)*1000000000)/1000000000)%1 == 0 && Math.cos(a) < 0 ? -1 : 0
      ))*5
      var y = (player.pos.y + Math.sin(a)*ray.d + (
        Math.abs(Math.round(((player.pos.y + Math.sin(a)*ray.d) % 1)*1000000000)/1000000000)%1 == 0 && Math.sin(a) < 0 ? -1 : 0
      ))*5
      if (i == cnv.width/2) {
        console.log()
      }
      mapctx.fillRect(x, y, 5, 5)
    }
  }
}

function fill(r, g, b) {
  ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

function castRay(a, x_, y_, ignore, render_) {
  a %= Math.PI*2;
	if (a < 0) {a += Math.PI*2}

  /*
  y = mx + b
  y/m - b = x
  */
  var m = Math.tan(a)
  var b = -m*x_ + y_

  var right = (a > Math.PI * 3/2 || a < Math.PI / 2)
  var down = (a > 0 && a < Math.PI)


  var x = Math[right ? "ceil" : "floor"](x_)
  var y = Math[down ? "ceil" : "floor"](y_)
  var genX = (y - b)/m, genY = m*x + b
  var dist = ignore ? ignore : 0
  var p = {x: x_, y: y_}

  mapctx.fillStyle = "#0f0"

  // if (render_) {
  //   mapctx.beginPath()
  //   mapctx.moveTo(0, b*10)
  //   mapctx.lineTo(map.length*10, (map.length * m + b) * 10)
  //   mapctx.stroke()
  // }

  for (var i = 0; i < 100 && x >= 0 && x < map.length && y >= 0 && y < map[0].length && dist < 60; i++) {
    genY = m*x + b
    genX = (y - b)/m
    if (Math.abs(p.x - x) < Math.abs(p.x - genX)) {

      if (render_) {
        mapctx.beginPath()
        mapctx.moveTo(p.x * render_, p.y * render_)
        mapctx.lineTo(x * render_, genY * render_)
        mapctx.stroke()
        mapctx.fillRect(p.x * render_, p.y * render_, 1, 1)
        mapctx.fillRect(x * render_, genY * render_, 1, 1)
      }
      dist += Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - genY, 2))
      p = {x: x, y: genY}

      if (c(x, genY, l)) {
        if (!ignore) {
          var portal = map[x][Math.floor(genY)].l
          if (typeof(portal) == "object" && portal.state) {
            if (true) {
              return {x: x, y: genY, d: dist, t: "door"}
            }
          } else if (typeof(portal) == "object" && (portal.right === null || portal.right === right)) {
            var relativePos = (genY - Math.floor(genY))
            var ray
            if (!portal.rotate) {
              ray = castRay(a, portal.x, portal.y + relativePos, dist, render_)
            } else if (portal.rotate == "reverse") {
              ray = castRay(a + Math.PI, portal.x, portal.y + 1 - relativePos, dist, render_)
            } else if (portal.rotate == "right") {
              ray = castRay(a + Math.PI/2, portal.x + 1 - relativePos, portal.y, dist, render_)
            } else if (portal.rotate == "left") {
              ray = castRay(a - Math.PI/2, portal.x + relativePos, portal.y, dist, render_)
            }
            return ray//{x: x, y: genY, d: ray.d, t: ray.t}
          } else {
            return {x: x, y: genY, d: dist, t: "wall"}
          }
        } else {
          ignore = false
        }
      }

      x += right ? 1 : -1
    } else {

      if (render_) {
        mapctx.beginPath()
        mapctx.moveTo(p.x * render_, p.y * render_)
        mapctx.lineTo(genX * render_, y * render_)
        mapctx.stroke()
        mapctx.fillRect(p.x * render_, p.y * render_, 1, 1)
        mapctx.fillRect(genX * render_, y * render_, 1, 1)
      }
      dist += Math.sqrt(Math.pow(p.x - genX, 2) + Math.pow(p.y - y, 2))
      p = {x: genX, y: y}

      if (c(genX, y, u)) {
        if (!ignore) {
          var portal = map[Math.floor(genX)][y].u
          var type = portal.state ? "door" : "wall"
          if (typeof(portal) == "object" && portal.state) {
            if (true) {
              return {x: x, y: genY, d: dist, t: "door"}
            }
          } else if (typeof(portal) == "object" && (portal.down === null || portal.down === down)) {
            var relativePos = (genX - Math.floor(genX))
            var ray
            if (!portal.rotate) {
              ray = castRay(a, portal.x + relativePos, portal.y, dist, render_)
            } else if (portal.rotate == "reverse") {
              ray = castRay(a + Math.PI, portal.x + 1 - relativePos, portal.y, dist, render_)
            } else if (portal.rotate == "right") {
              ray = castRay(a + Math.PI/2, portal.x, portal.y + relativePos, dist, render_)
            } else if (portal.rotate == "left") {
              ray = castRay(a - Math.PI/2, portal.x, portal.y + 1 - relativePos, dist, render_)
            }
            return ray
          } else {
            return {x: genX, y: y, d: dist, t: "wall"}
          }
        } else {
          ignore = false
        }
      }

      y += down ? 1 : -1
    }
  }
  return {x: Infinity, y: Infinity}
}

var u = "u"
var l = "l"

function c(x, y, s) {
  x = Math.floor(x)
  y = Math.floor(y)
  return map[x] && map[x][y] && map[x][y][s]
}
