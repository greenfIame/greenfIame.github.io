var points = [
	{x: 40, y: 20, c: [1, 2]}, 
	{x: 20, y: 40, c: [0, 3]}, 
	{x: 60, y: 40, c: [0, 4, 5]}, 
	{x: 20, y: 60, c: [1]}, 
	{x: 50, y: 60, c: [2]}, 
	{x: 70, y: 60, c: [2]}
]

var ctx, path

function start() {
	
	ctx = cnv.getContext("2d")
	
	for (var i = 0; i < points.length; i++) {
		ctx.beginPath()
		ctx.arc(points[i].x, points[i].y, 5, 0, 2*Math.PI)
		ctx.fill()
		ctx.beginPath()
		for (var j = 0; j < points[i].c.length; j++) {
			ctx.moveTo(points[i].x, points[i].y)
			ctx.lineTo(points[points[i].c[j]].x, points[points[i].c[j]].y)
		}
		ctx.stroke()
	}
	
	console.log(findPath(0, 4))
}

function findPath(start, end) {
	var lookAt = [{pos: start, path: []}]
	var lookTo = []
	var beenTo = [start]
	for (var j = 0; j < 10; j++) {
		
		for (var i = 0; i < lookAt.length; i++) {
			var point = points[lookAt[i].pos]
			for (var k = 0; k < point.c.length; k++) {
				if (beenTo.indexOf(point.c[k]) == -1) {
					beenTo.push(point.c[k])
					lookTo.push({pos: point.c[k], path: lookAt[i].path.concat([lookAt[i].pos])})
				}
			}
				
		}
		lookAt = lookTo.slice(0)
		
		for (var i = 0; i < lookAt.length; i++) {
			if (lookAt[i].pos == end) {
				return lookAt[i].path.concat([lookAt[i].pos])
			}
		}
	}
}