var audioCtx
var voices = []
var Voices = 12
var playOctave = false

var gain, synthGain, micGain, musicGain, sensitivity, analyser, source, shape

var ADSR = {attack: 0.1, decay: 1, sustain: 0.5, release: 0.5, target: null}

var fft = Math.pow(2, Math.round(Math.log(2000)/Math.log(2)))

var dataArray

var canvas
var ctx

function createADSR() {
	var x = document.getElementById("custom_waveform")
	var span = ADSR.attack + ADSR.decay + ADSR.release + 1
	var attack = ADSR.attack/span*98 + 2
	var peak = 2
	var decay = (ADSR.attack + ADSR.decay)/span*98 + 2
	var sustainLevel = (1 - ADSR.sustain/1)*98 + 2
	var release = (ADSR.attack + ADSR.decay + 1)/span*98 + 2
	x.innerHTML = `
	<line class="clicker" onclick="editEnvelope(this)" name='attack' 	x1="2%" 					y1="100%" 						x2="${attack}%" 	y2="${peak}%" />
	<line class="clicker" onclick="editEnvelope(this)" name='decay' 	x1="${attack}%" 	y1="${peak}%" 				x2="${decay}%" 		y2="${sustainLevel}%" />
	<line class="clicker" onclick="editEnvelope(this)" name='sustain' x1="${decay}%" 		y1="${sustainLevel}%" x2="${release}%"	y2="${sustainLevel}%" />
	<line class="clicker" onclick="editEnvelope(this)" name='release' x1="${release}%" 	y1="${sustainLevel}%" x2="98%"					y2="100%" />
	<line name='attack' 	x1="2%" 					y1="100%" 						x2="${attack}%" 	y2="${peak}%" />
	<line name='decay'		x1="${attack}%" 	y1="${peak}%" 				x2="${decay}%" 		y2="${sustainLevel}%" />
	<line name='sustain'	x1="${decay}%" 		y1="${sustainLevel}%" x2="${release}%"	y2="${sustainLevel}%" />
	<line name='release'	x1="${release}%" 	y1="${sustainLevel}%" x2="98%"					y2="100%" />
	<circle name='peakPoint' 		cx="${attack}%"		cy="${peak}%" 				r="0.5%"></circle>
	<circle name='sustainPoint'	cx="${decay}%"		cy="${sustainLevel}%" r="0.5%"></circle>
	<circle name='releasePoint' cx="${release}%"	cy="${sustainLevel}%" r="0.5%"></circle>
	`
}

function updateADSR() {
	var span = ADSR.attack + ADSR.decay + ADSR.release + 1
	var M = Math.max(1, ADSR.sustain)
	var attack = ADSR.attack/span*98 + 2
	var peak = (1 - 1/M)*98 + 2
	var decay = (ADSR.attack + ADSR.decay)/span*98 + 2
	var sustainLevel = (1 - ADSR.sustain/M)*98 + 2
	var release = (ADSR.attack + ADSR.decay + 1)/span*98 + 2
	
	var l = document.querySelectorAll("[name='attack']")
	l[0].setAttribute("x2", attack + "%")
	l[0].setAttribute("y2", peak + "%")
	l[1].setAttribute("x2", attack + "%")
	l[1].setAttribute("y2", peak + "%")
	
	l = document.querySelectorAll("[name='decay']")
	l[0].setAttribute("x1", attack + "%")
	l[0].setAttribute("y1", peak + "%")
	l[0].setAttribute("x2", decay + "%")
	l[0].setAttribute("y2", sustainLevel + "%")
	l[1].setAttribute("x1", attack + "%")
	l[1].setAttribute("y1", peak + "%")
	l[1].setAttribute("x2", decay + "%")
	l[1].setAttribute("y2", sustainLevel + "%")
	
	l = document.querySelectorAll("[name='sustain']")
	l[0].setAttribute("x1", decay + "%")
	l[0].setAttribute("y1", sustainLevel + "%")
	l[0].setAttribute("x2", release + "%")
	l[0].setAttribute("y2", sustainLevel + "%")
	l[1].setAttribute("x1", decay + "%")
	l[1].setAttribute("y1", sustainLevel + "%")
	l[1].setAttribute("x2", release + "%")
	l[1].setAttribute("y2", sustainLevel + "%")
	
	l = document.querySelectorAll("[name='release']")
	l[0].setAttribute("x1", release + "%")
	l[0].setAttribute("y1", sustainLevel + "%")
	l[1].setAttribute("x1", release + "%")
	l[1].setAttribute("y1", sustainLevel + "%")
	
	l = document.querySelector("[name='peakPoint']")
	l.setAttribute("cx", attack + "%")
	l.setAttribute("cy", peak + "%")
	l = document.querySelector("[name='sustainPoint']")
	l.setAttribute("cx", decay + "%")
	l.setAttribute("cy", sustainLevel + "%")
	l = document.querySelector("[name='releasePoint']")
	l.setAttribute("cx", release + "%")
	l.setAttribute("cy", sustainLevel + "%")
}

function editEnvelope(that) {
	envelopeValue.style.left = `calc((100% - 10px) * ${(that.x1.baseVal.valueInSpecifiedUnits + that.x2.baseVal.valueInSpecifiedUnits) / 2 /100} - 5px)`
	var v = (that.y1.baseVal.valueInSpecifiedUnits + that.y2.baseVal.valueInSpecifiedUnits) / 2
	if (v >= 98) {
		envelopeValue.style.top = `calc(100% - 20px)`
	} else if (v <= 2) {
		envelopeValue.style.top = `0`
	} else {
		envelopeValue.style.top = `calc(${v}% - 10px)`
	}
	
	if (parseFloat(envelopeValue.value) != ADSR[that.getAttribute("name")]) {
		envelopeValue.value = ADSR[that.getAttribute("name")]
	}
	ADSR.target = that
}

function changeEnvelope(evt, that) {
	if (!isNaN(parseFloat(that.value)) && (ADSR.target.getAttribute("name") != "sustain" || parseFloat(that.value) <= 1)) {
		ADSR[ADSR.target.getAttribute("name")] = parseFloat(that.value)
		updateADSR()
		editEnvelope(ADSR.target)
	}
}

function start() {
	createADSR()
	var x = document.querySelectorAll(".dial")
	for (var i = 0; i < x.length; i++) {
		var y = x[i].title.split(",")
		for (var j = parseInt(y[1]); j <= parseInt(y[2]); j += (parseInt(y[2]) - parseInt(y[1]))/(parseInt(y[0]) - 1)) {
			x[i].innerHTML += `<dot style="transform: rotate(${j}deg);"></dot>`
		}
		x[i].addEventListener("mousedown", Start, false)
	}
  document.addEventListener("mousemove", Rotate, false)
  document.addEventListener("mouseup", Stop, false)
	
	createKeyboard()
  
  var file = document.getElementById("thefile")
 	var audio = document.getElementById("audio")
	
	canvas = document.getElementById("canvas")
	ctx = canvas.getContext("2d")
	
	var ac = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext
	
  audioCtx = new ac()
  analyser = audioCtx.createAnalyser()
	
	synthGain = audioCtx.createGain()//before keyboard is mixed
	micGain = audioCtx.createGain()//before the mic is mixed
	musicGain = audioCtx.createGain()//before the music is mixed
	gain = audioCtx.createGain()//over all gain
	sensitivity = audioCtx.createGain()//sensitivty for analysis
	shape = audioCtx.createWaveShaper()//distortion curve
	
	micGain.connect(shape)
	micGain.gain.value = 5
	synthGain.connect(shape)
	synthGain.gain.value = 0.5
	musicGain.connect(shape)
	musicGain.gain.value = 0.5
	sensitivity.connect(analyser)
	sensitivity.gain.value = 0.2
	
	shape.oversample = "4x"
	//shape.curve = makeDistortionCurve()
	shape.connect(sensitivity)
	shape.connect(gain)
	
  gain.connect(audioCtx.destination)
	gain.gain.value = 0.5
	
  analyser.fftSize = fft
	bufferLength = analyser.frequencyBinCount
	dataArray = new Uint8Array(bufferLength)
	
  canvas.width = fft/2/4
  canvas.height = 512
	ctx.strokeStyle = "aqua"
	
	renderFrame()
	
	document.addEventListener("keydown", press)
	document.addEventListener("keyup", release)
	document.addEventListener("click", function(){if (audioCtx.state == "suspended") {audioCtx.resume()}})
	
  file.onchange = function() {
		var e = document.getElementById("fileLabel")
		e.innerHTML = this.files[0].name.caps()
    var files = this.files
    audio.src = URL.createObjectURL(files[0])
    audio.load()
		
		r()
		cassetteControls(document.getElementById("pauser"), 4)
		
		try {
			var src = audioCtx.createMediaElementSource(audio)
	    src.connect(musicGain)
		} catch (err) {}
  }
	
	navigator.mediaDevices.getUserMedia({audio: true}).then(
	  function(stream) {
	    source = audioCtx.createMediaStreamSource(stream)
	 	}).catch( function(err) { console.log('The following gUM error occured: ' + err)}
	)
	
	
	for (var i = 0; i < Voices; i++) {
		voices.push({p: false, osc: audioCtx.createOscillator(), gain: audioCtx.createGain()})
		voices[i].osc.type = 'sine'//sawtooth sine square triangle
		voices[i].osc.connect(voices[i].gain)
		voices[i].osc.start()
		voices[i].gain.connect(synthGain)
		voices[i].gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0)
	}
	
	resize()
}

function makeDistortionCurve() {
   var n_samples = 44100,
    curve = new Float32Array(n_samples),
    i = 0,
    x
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = (3 + 100) * x * 57 * (Math.PI / 180) / (Math.PI + 100 * Math.abs(x))
  }
	
	curve = new Float32Array(3)
	curve[0] = 1
	curve[1] = 0
	curve[2] = 1
	
  return curve;
}

function renderFrame() {
  //setTimeout(requestAnimationFrame.bind(null, renderFrame.bind(null)), 1000/60)

  analyser.getByteFrequencyData(dataArray)
	
	/** /
  for (var i = 0; i < bufferLength/4; i++) {
		var a = dataArray[i]/255
		var v
		if (a < 0.1) {
			ctx.fillStyle = `rgb(34, 34, 34)`
		} else if (a <= 0.25) {
			v = Math.round((a/0.25)*221)
			ctx.fillStyle = `rgb(${v + 34}, 34, 34)`
		} else if (a < 0.75) {
			v = Math.round(((a-0.25)/0.5)*221)
			ctx.fillStyle = `rgb(255, ${v + 34}, 34)`
		} else {
			v = Math.round(((a-0.75)/0.25)*221)
			ctx.fillStyle = `rgb(255, 255, ${v + 34})`
		}
		
		ctx.fillRect(i, canvas.height - 2, 1, -1)
  }
	ctx.drawImage(canvas, 0, -1)

	/*/
	
  ctx.clearRect(0, 0, canvas.width, canvas.height)
	
  for (var i = 0; i < bufferLength/4; i++) {
    var y = dataArray[i]
		//y = y < 50 ? 0 : y
    ctx.fillStyle = `rgb(${Math.round(y + 10)}, 0, 50)`
		ctx.fillRect(i, canvas.height, 1, -y)
  }
	
	analyser.getByteTimeDomainData(dataArray)
	
	ctx.beginPath()
  for (var i = 0; i < bufferLength; i += 4) {
    ctx[i == 0 ? "moveTo" : "lineTo"](i/4, 256 - dataArray[i])
  }
	ctx.stroke()
	/**/
	
	requestAnimationFrame(renderFrame)
}

var KEYS = "zsxcfvgbnjmkq2we4r5ty7u8"
						123456789012123456789012

var keys = {}
var keyboard = 37
var NOTES = []

function press(evt) {
	if (document.activeElement == envelopeValue) {
		return false
	}
	var key = KEYS.indexOf(evt.key.toLowerCase())
	if (key >= 0 && !keys[key]) {
		key += keyboard
		var Key = key
		
		for (var i = 0; i < voices.length; i++) {
			if (voices[i].gain.gain.value === 0 && keys[key - keyboard] === undefined) {
				
			  var now = audioCtx.currentTime;
			  var currentVol = voices[i].gain.gain.value
			  voices[i].gain.gain.cancelScheduledValues(now)
			  voices[i].gain.gain.linearRampToValueAtTime(currentVol, now)
				voices[i].gain.gain.linearRampToValueAtTime(1, now + ADSR.attack)
				voices[i].gain.gain.linearRampToValueAtTime(ADSR.sustain, now + ADSR.attack + ADSR.decay)
				voices[i].osc.frequency.setValueAtTime(frequencyOf(key), audioCtx.currentTime)
				keys[key - keyboard] = {n: i, k: key, o: playOctave && Key == key}
				voices[i].p = true

				var notes = document.querySelectorAll(`[name="${(key - 1) % 12}"]`)
				for (var j = 0; j < notes.length; j++) {
					notes[j].style["-webkit-filter"] = "invert(20%)" 
					notes[j].style.filter = "invert(20%)" 
				}
				
				if (Key != key || !playOctave) {
					break
				}
				key += 12
			}
		}
		
	} else if (evt.key.toLowerCase() == ',' && keyboard > 13) {
		keyboard -= 12
	} else if (evt.key.toLowerCase() == '.' && keyboard < 73) {
		keyboard += 12
	} else if (evt.key.toLowerCase() == 'shift') {
		playOctave = true
	}
}

function release(evt) {
	var key = KEYS.indexOf(evt.key.toLowerCase())
	if (keys[key] !== undefined && key >= 0) {
	  var now = audioCtx.currentTime;
		do {
		  var currentVol = voices[keys[key].n].gain.gain.value
		  voices[keys[key].n].gain.gain.cancelScheduledValues(now)
		  voices[keys[key].n].gain.gain.linearRampToValueAtTime(currentVol, now)
		  voices[keys[key].n].gain.gain.linearRampToValueAtTime(0, now + ADSR.release)
		
			voices[keys[key].n].p = false
		
			var notes = document.querySelectorAll(`[name="${(key) % 12}"]`)
			for (var j = 0; j < notes.length; j++) {
				notes[j].style["-webkit-filter"] = "none" 
				notes[j].style.filter = "none" 
			}
		
			var r = keys[key].o && keys[key + 12]
			keys[key] = undefined
			key += 12
		} while (r)
	} else if (evt.key.toLowerCase() == 'shift') {
		playOctave = false
	}
}

function frequencyOf(n) {
	return Math.pow(2, (n-49)/12)*440
}

function r() {
	var x = document.querySelectorAll(".active")
	if (!audio.src) {
		return false
	} else if (x.length > 1) {
		x[1].className = x[1].className.replace(/active/g, "")
	} else {
		x[0].className = x[0].className.replace(/active/g, "")
	}
}

function cassetteControls(that, control) {
	var audio = document.getElementById("audio")
	var cogs = document.querySelectorAll(".cog")
	
	if (!audio.src) {
		return false
	}

	switch (control) {
		case 1:
			audio.play()
			audio.playbackRate = 1
			that.className += " active"
			break
		case 2:
			audio.pause()
			audio.currentTime = 0
			document.getElementById("pauser").className += " active"
			break
		case 3:
			audio.play()
			audio.playbackRate = 1.5
			that.className += " active"
			break
		case 4:
			audio.pause()
			that.className += " active"
			break
	}
	var running = audio.paused ? "paused" : "running"

	for (var i  = 0; i < cogs.length; i++) {
		cogs[i].style.animationPlayState = running
	}
	
}

function cassetteRecord(that) {
	if (that.className == "controller active") {
		that.className = "controller"
		source.disconnect()
	} else {
		that.className = "controller active"
		source.connect(micGain)
	}
}

window.onresize = resize
function resize() {
	var x = document.getElementById("cassetteWrapper")
	var w = Math.round(window.innerWidth*0.38)
	var h = Math.round(window.innerHeight*0.42*0.8 - window.innerWidth*0.006)
	if (h < w / 1.7) {
		var W = (h*0.95*1.7)
		var H = (h*0.95)
		x.style.width = `${W}px`
		x.style.height = `${H}px`
		x.style.left = `${((w - W)/2)}px`
		x.style.top = `${((h - H)/2)}px`
		x.style["font-size"] = W/100 + "px"
	} else {
		var W = (w*0.95)
		var H = (w*0.95/1.7)
		x.style.width = `${W}px`
		x.style.height = `${H}px`
		x.style.left = `${((w - W)/2)}px`
		x.style.top = `${((h - H)/2)}px`
		x.style["font-size"] = W/100 + "px"
	}
}

String.prototype.caps = function() {
	var s = ""
	for (var i = 0; i < this.length; i++) {
		if (!this[i - 1] || this[i - 1] == " ") {
			s += this[i].toUpperCase()
		} else {
			s += this[i]
		}
	}
	return s
}

var notes = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1]
var Notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

function createKeyboard() {
	var x = 0
	for (var i = 20; i < 39; i++) {
		var Name = (i < 24 || i > 35) ? `` : `name="${i%12}"`
		if (!notes[i % notes.length]) {
			document.getElementById("keyboard").innerHTML += `<div ${Name} class="whitekey" style="left: ${x}%;"></div>`
			x += 10
		} else {
			document.getElementById("keyboard").innerHTML += `<div ${Name} class="blackkey" style="left: ${x - 3}%;"></div>`
		}
	}
}

var active
var center

function Start(evt) {
	active = evt.target
	var _ref = active.querySelector("flower").getBoundingClientRect()
	center = {x: _ref.left + (_ref.width)/2, y: _ref.top + (_ref.height)/2}
	active.querySelector("flower").style.transition = "0.1s"
	active.querySelector("flower").style["transition-timing-function"] = "linear"
	active.querySelector("marking").style.transition = "0.1s"
	active.querySelector("marking").style["transition-timing-function"] = "linear"
	Rotate(evt, true)
}

function Rotate(evt, transition) {
	if (active) {
		if (!transition) {
			active.querySelector("flower").style.transition = "0s"
			active.querySelector("marking").style.transition = "0s"
		}
		var x = evt.clientX - center.x
		var y = evt.clientY - center.y
		var a = Math.round(180/Math.PI * Math.atan2(y, x)) + 90
		
		var currentAngle = parseInt(active.querySelector("flower").style.transform.replace(/[^0-9.-]/g, ""))
		currentAngle = currentAngle ? currentAngle : 0
		var d = a - currentAngle
		d = mod((d + 180), 360) - 180
		active.querySelector("flower").style.transform = `rotate(${currentAngle + d}deg)`
		active.querySelector("flower").style.background = `linear-gradient(${45 - (currentAngle + d)}deg, #333 0%, #aaa 50%, #333 100%)`
		active.querySelector("flowerA").style.background = `linear-gradient(${-15 - (currentAngle + d)}deg, #444 0%, #aaa 50%, #333 100%)`
		active.querySelector("flowerB").style.background = `linear-gradient(${15 - (currentAngle + d)}deg, #444 0%, #aaa 50%, #333 100%)`
		
		active.querySelector("marking").style.transform = `rotate(${currentAngle + d}deg)`
		getDial(active)
	}
}

function Stop(evt) {
	if (active) {
		active.querySelector("flower").style.transition = "0.2s"
		active.querySelector("flower").style["transition-timing-function"] = "ease-out"
		active.querySelector("marking").style.transition = "0.2s"
		active.querySelector("marking").style["transition-timing-function"] = "ease-out"
		
		var x = evt.clientX - center.x
		var y = evt.clientY - center.y
		var a = Math.round(180/Math.PI * Math.atan2(y, x)) + 90
	
		var p = active.title.split(",")
		var A = constrain(a, p)
		
		
		var currentAngle = parseInt(active.querySelector("flower").style.transform.replace(/[^0-9.-]/g, ""))
		currentAngle = currentAngle ? currentAngle : 0
		var d = A - currentAngle
		d = mod((d + 180), 360) - 180
		active.querySelector("flower").style.transform = `rotate(${currentAngle + d}deg)`
		active.querySelector("marking").style.transform = `rotate(${currentAngle + d}deg)`
		getDial(active)
		
		active = false
	}
}

function mod(a, n) {
	return a - Math.floor(a/n) * n
}

function getDial(that) {
	var currentAngle = parseInt(that.querySelector("flower").style.transform.replace(/[^0-9.-]/g, ""))
	var range = that.title.split(",")
	var values = [parseFloat(range[4]), parseFloat(range[5])]
	
	currentAngle = currentAngle ? currentAngle : 0
	currentAngle = currentAngle % 360
	currentAngle = currentAngle < 0 ? 360 + currentAngle : currentAngle
	currentAngle = constrain(currentAngle, range)
	currentAngle += 90
	currentAngle -= parseInt(range[1])
	currentAngle = currentAngle % 360
	currentAngle = currentAngle < 0 ? 360 + currentAngle : currentAngle
	
	range = Math.abs(parseInt(range[2]) - parseInt(range[1]))
	
	var value = (currentAngle/range * (values[1] - values[0])) + values[0]
	switch (that.querySelector(".dialLabel").innerHTML) {
		case "Waveform":
			for (var i = 0; i < Voices; i++) {
				voices[i].osc.type = ['sine', 'sawtooth', 'square', 'triangle'][value]
			}
			break
		case "Synth":
			synthGain.gain.value = value
			break
		case "Mic":
			micGain.gain.value = value
			break
		case "Music":
			musicGain.gain.value = value
			break
		case "Gain":
			gain.gain.value = value
			break
	}
}

function constrain(a, p) {
	var A = a
	if (parseInt(p[3])) {
		var min = Infinity
		for (var j = parseInt(p[1]); j <= parseInt(p[2]); j += (parseInt(p[2]) - parseInt(p[1]))/(parseInt(p[0]) - 1)) {
			var a2 = Math.round(j) - 90
			var d = a - a2
			d = Math.abs(mod((d + 180), 360) - 180)
			if (d < min) {
				min = d
				A = a2
			}
		}
	} else {
		var a1 = parseInt(p[1]) - 90
		var a2 = parseInt(p[2]) - 90
		if (
			(a < a1 || a < 360 + a1) &&
			(a > a2 || a > 360 + a2)
		) {
			d1 = a1 - a
			d1 = Math.abs(mod((d1 + 180), 360) - 180)
			d2 = a2 - a
			d2 = Math.abs(mod((d2 + 180), 360) - 180)
			A = d1 < d2 ? a1 : a2
		}
	}
	return A
}


var dragging = false
window.onmouseup = function() {
	dragging = false
}

window.onmousemove = mouseMove

function mouseMove(event) {
	
	if (dragging) {
		var y = event.clientY
		if (y > 0.021*window.innerHeight && y < 0.399*window.innerHeight) {
			document.getElementById("thumb").style.top = `calc(${event.clientY / (0.42*window.innerHeight) * 100 - 4}%)`//`calc(${event.clientY}px - 4%)`
			sensitivity.gain.value = Math.pow(7.8, 1 - (y - 0.021*window.innerHeight)/(0.399*window.innerHeight - 0.021*window.innerHeight)) - 0.8
		}
	}
}

function changeftt(temp) {
	fft = Math.pow(2, Math.round(Math.log(temp)/Math.log(2)))
	fft = fft < 32 ? 32 : (fft > 32768 ? 32768 : fft)
  analyser.fftSize = fft
	bufferLength = analyser.frequencyBinCount
	dataArray = new Uint8Array(bufferLength)
}