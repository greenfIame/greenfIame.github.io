var vw, vh, vmin

var networkDiagramContext, dataDisplayContext

var countArr = []
var count = 0
var INDEX = 0
var delay = 1000

var nn

var trainer

function start() {
	vw = window.innerWidth/100
	vh = window.innerHeight/100
	vmin = Math.min(vw, vh)
	networkDiagram.width = 100*vw
	networkDiagram.height = 200*vh
	dataDisplay.width = 28
	dataDisplay.height = 28
	
	dataDisplayContext = dataDisplay.getContext("2d")
	
	nn = new network(
		[28*28, 20, 20, 10]
		, networkDiagram
	)
	
	var table = ""
	for (var i = 0; i < nn.outputs; i++){
		table += `<td></td>`
	}
	outputs.innerHTML = outputs.innerHTML = `<tr>${table}</tr>`
	
	train()
}

function train() {
	draw(Data[INDEX], Solutions[INDEX], nn.train(Data[INDEX], Solutions[INDEX]))
	INDEX = (INDEX + 1) % Math.min(Data.length, Solutions.length)
	trainer = setTimeout(train, delay)
}

function draw(data, solution, output) {
	var imageData = new ImageData(28, 28)
	for (var i = 0; i < 28*28; i++) {
		imageData.data[i * 4] = 255*data[i]
		imageData.data[i * 4 + 1] = 255*data[i]
		imageData.data[i * 4 + 2] = 255*data[i]
		imageData.data[i * 4 + 3] = 255
	}
	dataDisplayContext.putImageData(imageData, 0, 0)
	
	answer.innerText = solution.maxIndex()
	guess.innerText = output.maxIndex()
	guess.style.color = answer.innerText == guess.innerText ? "#afa" : "#faa"
	
	for (var i = 0; i < output.length; i++) {
		var y = solution[i]*100
		outputs.children[0].children[0].children[i].style.background = `linear-gradient(0deg, #333 ${y - 1}%, #bfb ${y - 1}%, #bfb ${y + 1}%, #333 ${y + 1}%)`
		y = output[i]*100
		outputs.children[0].children[0].children[i].innerHTML = `<div style="width: 100%; height: 100%; background: linear-gradient(0deg, rgba(0, 0, 0, 0) ${y - 1}%, #cdf ${y - 1}%, #cdf ${y + 1}%, rgba(0, 0, 0, 0) ${y + 1}%);"></div>`
	}
	
	count++
	countArr.push(answer.innerText == guess.innerText)
	if (countArr.length > 10000) {
		countArr.splice(0, 1)
	}
	var oneHundred = 0, oneThousand = 0, tenThousand = 0
	for (var i = countArr.length - 1; i >= 0; i--) {
		if (countArr[i]) {
			if (i >= countArr.length - 100) {
				oneHundred++
			}
			if (i >= countArr.length - 1000) {
				oneThousand++
			}
			tenThousand++
		}
	}
	oneHundred = (oneHundred/Math.min(100, countArr.length)*100).toFixed(2)
	oneThousand = (oneThousand/Math.min(1000, countArr.length)*100).toFixed(2)
	tenThousand = (tenThousand/Math.min(10000, countArr.length)*100).toFixed(2)
	
	stats.children[0].children[1].innerHTML = `<td>${oneHundred}%</td><td>${oneThousand}%</td><td>${tenThousand}%</td><td>${count}</td>`
}

Array.prototype.maxIndex = function() {
	var I, m = -Infinity
	for (var i = 0; i < this.length; i++) {
		if (this[i] > m) {
			m = this[i]
			I = i
		}
	}
	return I
}

Array.prototype.avg = function() {
	return this.reduce((t, a) => t + a)/this.length
}

//Constuctor function for the neural network (often abbreviated to nn or neural net)
function network(map, svg) {
	//Variables containing information about the network used in rendering and in some cases the training
	this.inputs = map[0]
	this.layers = map.length
	this.neurons = Math.max.apply(null, map)
	this.outputs = map[map.length - 1]
	
	this.svg = svg
	
	//Handles the activation functions that may be parsed
	this.activation = function(value){return 1/(1 + Math.exp(-value))}
	this.derive = function(output) {return output * (1.0 - output)}
	
	//The rate at which the networks adjusts its weights
	this.learningRate = 1
	
	//Initializing 3-dimension array in the form this.network[layer][neuron][weight]
	this.network = []
	for (var layer = 0; layer < map.length; layer++) {
		this.network[layer] = []
		for (var neuron = 0; neuron < map[layer]; neuron++) {
			this.network[layer][neuron] = [0]
			if (layer > 0) {
				for (var weight = 0; weight < map[layer - 1]; weight++) {
					this.network[layer][neuron][weight + 1] = Math.random()*2 - 1
				}
				
			}
		}
	}
	
	//The values that each of the neurons produce and the deltas for each weight
	this.values = []
	this.deltas = []
	for (var layer = 0; layer < map.length; layer++) {
		this.values[layer] = []
		this.deltas[layer] = []
		for (var neuron = 0; neuron < map[layer]; neuron++) {
			this.deltas[layer][neuron] = []
		}
	}
	
	//Creates the svg elements upon which the network is drawn
	this.createSVG = function() {
		var svgNeurons = ``
		var svgWeights = ``
		var svgHiddens = ``
		
		var yDiv = `((85%) / (${Math.min(20, this.neurons) - 1}))`
		
		var r = `1.5vmin`
		
		for (var layer = 0; layer < this.layers; layer++) {
			var x = `${1 + (layer + 0.5) * (98/this.layers)}%`
			
			if (this.network[layer].length > 20) {
				svgHiddens += `<circle cx="calc(${x})" cy="calc(50% - ${this.network[layer].length % 2 == 0 ? 10.6 : 10.1} * ${yDiv})" r="calc(${r} / 4)" fill="#fff" />`
				svgHiddens += `<circle cx="calc(${x})" cy="calc(50% - ${this.network[layer].length % 2 == 0 ? 10.35 : 9.85} * ${yDiv})" r="calc(${r} / 4)" fill="#fff" />`
				svgHiddens += `<circle cx="calc(${x})" cy="calc(50% - ${this.network[layer].length % 2 == 0 ? 10.1 : 9.6} * ${yDiv})" r="calc(${r} / 4)" fill="#fff" />`
				svgHiddens += `<circle cx="calc(${x})" cy="calc(50% + ${this.network[layer].length % 2 == 0 ? 10.6 : 10.1} * ${yDiv})" r="calc(${r} / 4)" fill="#fff" />`
				svgHiddens += `<circle cx="calc(${x})" cy="calc(50% + ${this.network[layer].length % 2 == 0 ? 10.35 : 9.85} * ${yDiv})" r="calc(${r} / 4)" fill="#fff" />`
				svgHiddens += `<circle cx="calc(${x})" cy="calc(50% + ${this.network[layer].length % 2 == 0 ? 10.1 : 9.6} * ${yDiv})" r="calc(${r} / 4)" fill="#fff" />`
			}
					
			for (var neuron = 0; neuron < this.network[layer].length; neuron++) {
				if (Math.abs(neuron - (this.network[layer].length - 1)/2) >= 10) {
					continue
				}
				var y = `calc(50% - (${(this.network[layer].length - 1)/2} * ${yDiv}) + ${neuron} * ${yDiv})`
				svgNeurons += `<circle cx="calc(${x})" cy="${y}" r="${r}" stroke="white" stroke-width="1" fill="#000" />`
				if (layer > 0) {
					var x_ = `1% + ${layer - 0.5} * ((98%) / ${this.layers})`
					for (var weight = 1; weight < this.network[layer][neuron].length; weight++) {
						if (Math.abs(weight - (this.network[layer][neuron].length)/2) >= 10) {
							continue
						}
						var weight_ = 1/(1 + Math.exp(this.network[layer][neuron][weight]))
						c = {
							r: Math.round(weight_*255), 
							g: Math.round((1 - weight_)*255), 
							b: Math.round((1 - weight_)*255)
						}
						var y_ = `calc(50% - (${(this.network[layer - 1].length - 1)/2} * ${yDiv}) + ${weight - 1} * ${yDiv})`
						
						svgWeights += `<line x1="calc(${x_} + ${r} + 1px)" y1="${y_}" x2="calc(${x} - ${r} - 1px)" y2="${y}" stroke="rgba(${c.r}, ${c.g}, ${c.b}, 0.3)" />`
					}
				}
				
				y = `${50 - ((this.network[layer].length - 1)/2 * (85 / (Math.min(20, this.neurons) - 1))) + neuron * (85 / (Math.min(20, this.neurons) - 1))}%`
				svgNeurons += `<text x="${x}" y="${y}" font-size="1.4vmin" text-anchor="middle" fill="#fff" style="transform: translate(0, calc(${r}/3))">0.00</text>`
				if (layer > 0) {
					svgNeurons += `<text x="${x}" y="${y}" font-size="0.8vmin" text-anchor="end" fill="#fff" style="transform: translate(-${r}, -${r})">${this.network[layer][neuron][0].toFixed(2)}</text>`
				}
				
			}
		}
		
		this.svg.innerHTML = `<g stroke-width="1">${svgWeights}</g><g>${svgNeurons}</g><g>${svgHiddens}}</g>`
	}
	
	//Updates the svg elements to represent the current status of the network
	this.update = function() {
		var i = 0, j = 0
		for (var layer = 0; layer < this.layers; layer++) {
			for (var neuron = 0; neuron < this.network[layer].length; neuron++) {

				if (Math.abs(neuron - (this.network[layer].length - 1)/2) < 10) {
					var c = "123456789abcdef"[Math.floor(14*this.values[layer][neuron])].repeat(3)
					nn.svg.children[1].children[i].style.fill = c
					nn.svg.children[1].children[i + 1].style.fill = this.values[layer][neuron] > 0.5 ? "#000" : "#fff"
					nn.svg.children[1].children[i + 1].innerHTML = this.values[layer][neuron].toFixed(2)
					if (layer > 0) {
						nn.svg.children[1].children[i + 2].innerHTML = this.network[layer][neuron][0].toFixed(2)
						for (var weight = 0; weight < this.network[layer][neuron].length - 1; weight++) {
							if (Math.abs(weight - (this.network[layer - 1].length - 1)/2) < 10) {
								var weight_ = 1/(1 + Math.exp(this.network[layer][neuron][weight]))
								c = {
									r: Math.round(weight_*255), 
									g: Math.round((1 - weight_)*255), 
									b: Math.round((1 - weight_)*255), 
									a: Math.abs(this.network[layer][neuron][weight]*this.values[layer - 1][weight])*0.9 + 0.1
								}
								nn.svg.children[0].children[j].style.stroke = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
								j++
							}
						}
					}
					i += layer == 0 ? 2 : 3
				}
				
			}
		}
	}
	
	//Forward propagate the input through the network returning the value(s) of the output neurons
	this.guess = function(inputs) {
		
		for (var layer = 0; layer < this.network.length; layer++) {
			for (var neuron = 0; neuron < this.network[layer].length; neuron++) {
				if (layer > 0) {
					
					//The value of a neuron active(Sum(weights*inputs) + bias)
					var sum = this.network[layer][neuron][0]
					for (var i = 0; i < this.network[layer - 1].length; i++) {
						sum += this.values[layer - 1][i]*this.network[layer][neuron][i + 1]
					}
					
					this.values[layer][neuron] = this.activation(sum)
				} else {
					this.values[layer][neuron] = inputs[neuron]
				}
			}
		}
		
		this.update()
		
		return this.values[layer - 1]
	}
	
	//Train the network by propagating backwards through it
	this.train = function(inputs, ideal) {
		var output = this.guess(inputs)
		//Code is based on the example discussed here:
		//https://mattmazur.com/2015/03/17/a-step-by-step-backpropagation-example/
		var NetworkError = []
		for (var i = 0; i < output.length; i++) {
			NetworkError[i] = 1/2*Math.pow(ideal[i] - output[i], 2)
		}
		errorDiv.innerHTML = NetworkError.reduce((total, amount) => total + amount)
		
		//Initializing an array to store the errors of neurons
		var error = []
		for (var i = 0; i < this.network.length; i++) {
			error[i] = []
		}
		
		//Backpropagation algorithm
		for (var layer = this.network.length - 1; layer > 0; layer--) {
			for (var neuron = 0; neuron < this.network[layer].length; neuron++) {
				
				//Calculate the error for each neuron
				if (layer == this.network.length - 1) {
					error[layer][neuron] = - (ideal[neuron] - this.values[layer][neuron]) * this.derive(this.values[layer][neuron])
				} else {
					var totalWithRespectToOut = 0
					for (var neuron_ = 0; neuron_ < this.network[layer + 1].length; neuron_++) {
						totalWithRespectToOut += this.network[layer + 1][neuron_][neuron + 1] * error[layer + 1][neuron_]
					}
					error[layer][neuron] = totalWithRespectToOut * this.derive(this.values[layer][neuron])
				}
				
				//Calculate the change required in each weight
				this.deltas[layer][neuron][0] = error[layer][neuron]
				for (var weight = 1; weight < this.network[layer][neuron].length; weight++) {
					var weightErr = error[layer][neuron] * this.values[layer - 1][weight - 1]
					this.deltas[layer][neuron][weight] = weightErr
				}
			}
		}

		//Updating the weights
		for (var i = 1; i < this.network.length; i++) {
			for (var j = 0; j < this.network[i].length; j++) {
				//Note index 0 is the bias
				for (var n = 1; n < this.network[i][j].length; n++) {
					this.network[i][j][n] = this.network[i][j][n] - this.learningRate * this.deltas[i][j][n]
				}
			}
		}

		return output
	}
	
	this.backprop = function() {
		
	}
	this.backpropagate = function() {
		
	}
	

	//Creates the svg elements when the network is initialized
	this.createSVG()
}

window.addEventListener("keydown", function(evt){
	if (evt.key == "ArrowRight") {
		delay = Math.round(delay/10)
		delay = delay > 0 ? delay : 1
	} else if (evt.key == "ArrowLeft") {
		delay = Math.round(delay*10)
	}
	Delay.style.transition = "0s"
	Delay.style.opacity = 1
	setTimeout(function(){
		Delay.style.transition = "2s"
		Delay.style.opacity = 0
	}, 1)
	Delay.innerHTML = Math.round(delay) + "ms"
	clearTimeout(trainer)
	train()
})