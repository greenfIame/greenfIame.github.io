var layoutType = "periodic"
var sideBar = false
var elementsDiv
var highlightType = "none"
var searchTimeout = {clear: null, fade: null}

var decayModes = {
	"ε": "electron capture",
	"β−": "beta decay",
	"α": "alpha decay"
}

//Save element data

var elements = []
var elementsLength

var elementsByAtomicNumber

var categoryText = ["noble gas", "diatomic nonmetal", "polyatomic nonmetal", "metalloid", "post-transition metal", "transition metal", "alkaline earth metal", "alkali metal", "lanthanide", "actinide"]

//window.localStorage.removeItem('IPT')
if (!window.localStorage.IPT) {
	window.localStorage.IPT = JSON.stringify(elements)
} else {
	elements = JSON.parse(window.localStorage.IPT)
}

var showHelp

function start() {

	elementsDiv = document.getElementById("elements")
	window.onresize = windowResize
	windowResize()

	if (elements.length == 0) {
		scrapeElements()
	} else {
		for (var i = 0; i < elements.length; i++) {
			createDOMelement(elements[i])
		}

		elementsByAtomicNumber = insertionSort(elements, function(a, b) {return a.atomic_number - b.atomic_number}).slice(0)
		createButtons()
		createPlaceholders()
		layout()
		showHelp = setTimeout(function(){document.getElementById("help").style.opacity = 1}, 2000)
	}

	//https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0
	// var xhttp = new XMLHttpRequest()
// 	xhttp.onreadystatechange = function() {
// 		console.log(["request not initialized", "server connection established", "request received", "processing request", "request finished and response is ready"][this.readyState])
// 	}
//   xhttp.onload = function() {
//     console.log(this)
//   }
// 	xhttp.onerror = function() {
// 		console.log("failed")
// 	}
//   xhttp.open("GET", 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=helium&section=0', true)
//   xhttp.send()
}

function scrapeElements() {
	loading.style.display = "block"
	elements = []
	var domElements = document.querySelectorAll(".element")
	for (var i = 0; i < domElements.length; i++) {
		domElements[i].remove()
	}
	document.getElementById("elements")

	request("https://en.wikipedia.org/wiki/Periodic_table", function(that){
		var site = eval(that.responseText.slice(26))
		var links = site.contents.match(/<span class="nounderlines"><a href="\/wiki\/([^"])*(?=")/g)
		elementsLength = links.length
		for (var i = 0; i < links.length; i++) {
			links[i] = links[i].slice(42)
			request("https://en.wikipedia.org/wiki/" + links[i], addElement)
		}
	}, true)
}

function request(url, func, load) {
	var xhttp = new XMLHttpRequest()
	xhttp.URL = url

	if (load) {
		xhttp.onreadystatechange = function() {
			console.log(["request not initialized", "server connection established", "request received", "processing request", "request finished and response is ready"][this.readyState])

	  }
	}

  xhttp.onload = function() {
    func(this)
  }
	xhttp.onerror = function() {
		setTimeout(function(){
			request(url, func, load)
		}, 1000)
	}
  xhttp.open("GET", 'https://allorigins.me/get?url=' + encodeURIComponent(url) + '&callback=?', true)
  xhttp.send()
}

function XPath(xpath, parent) {
	return (parent || document).evaluate(xpath, parent || document, null, XPathResult.ANY_TYPE, null).iterateNext() || {innerHTML: "", innerText: ""}
}

function addElement(that){
	var parser = new DOMParser();
	var doc = parser.parseFromString(eval(that.responseText.slice(26)).contents, "text/html");
	var element = {
		name: /[A-Za-z]+\w/.exec(doc.querySelector("h1.firstHeading").innerText)[0],
		appearance: (XPath("//tr[contains(., 'Appearance')]/td", doc).innerText||"").replace(/[\[\]0-9]/g, "").trim(),
		category: XPath("//tr[contains(., 'Element category')]/td", doc).innerText.trim(),
		symbol: /[A-Za-z]{1,2}$/.exec(XPath("//caption", doc).innerText)[0],
		phase: /([A-Za-z])+\w/.exec(XPath("//tr[contains(., 'Phase')]/td", doc).innerText||"solid")[0],
		crystal_structure: XPath("//tr[contains(., 'Crystal structure')]/td/a", doc).innerText,

		shells: XPath("//tr[contains(., 'Electrons per shell')]/td", doc).innerText.split(",").map(function(a){return parseInt(a)}),

		vaporisation:						parseFloat(/([0-9]|[\.])+(?=\s)/.exec(XPath("//tr[contains(., 'Heat of vapor')]/td", doc).innerText))||null,
		electronegativity:			parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Electronegativity')]/td", doc).innerText))||null,
		covalent_radius:				parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Covalent radius')]/td", doc).innerText))||null,
		melting_point:					parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Melting point')]/td", doc).innerText))||null,
		boiling_point:					parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Boiling point')]/td", doc).innerText))||null,
		density:								parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Density')]/td", doc).innerText))||null,
		group:									parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Group')]/td", doc).innerText))||null,
		period:									parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Period')]/td", doc).innerText))||null,
		electrical_resisivity:	parseFloat(/([0-9]|[\.])+/.exec(XPath("//tr[contains(., 'Electrical resistivity')]/td", doc).innerText))||null,

		first_ionization:		parseFloat(/[0-9\.]+/.exec(/\s([0-9]|[\.])+\s/.exec(XPath("//tr[contains(., 'ation energies')]//li", doc).innerText))),
		atomic_number:			parseFloat(XPath("//tr[contains(., 'Atomic number (Z)')]/td", doc).innerText),

		atomic_weight:	parseFloat(/([0-9\.]+)(?![0-9]*♠)/.exec(XPath("//tr[contains(., 'atomic weight')]//span[@class='nowrap']|//tr[contains(., 'Mass number')]/td", doc).innerHTML)),

		discovery: XPath("//tr[contains(., 'Discovery')]", doc).innerText,
	}

	//Making discovery year linear
	element.discovery = /[0-9]{2,4}/.exec(element.discovery.reverse())[0].reverse() * (element.discovery.match(/([^a-z]|^)(bce*)((?=[^a-z])|$)/gi) ? -1 : 1)

	//Assigning general categories
	if (element.category) {
		element.category = element.category.replace(/[0123456789\[\]]/g, "")

		if (element.category.indexOf("noble gas") != -1) {
			element.category = 0
		} else if (element.category.indexOf("nonmetal") != -1 && element.category.indexOf("polyatomic") == -1) {
			element.category = 1
		} else if (element.category.indexOf("polyatomic nonmetal") != -1) {
			element.category = 2
		} else if (element.category.indexOf("metalloid") != -1) {
			element.category = 3
		} else if (element.category.indexOf("lanthanide") != -1) {
			element.category = 8
		} else if (element.category.indexOf("actinide") != -1) {
			element.category = 9
		} else if (element.category.indexOf("post-transition metal") != -1 && element.category.indexOf("alternatively") == -1) {
			element.category = 4
		} else if (element.category.indexOf("transition metal") != -1) {
			element.category = 5
		} else if (element.category.indexOf("alkaline earth metal") != -1) {
			element.category = 6
		} else if (element.category.indexOf("alkali metal") != -1) {
			element.category = 7
		}
	}
	//Creating outer shell attribute
	element.outer_shell = element.shells[element.shells.length - 1]
	//Removing group of lanthanides and actinides
	if (element.category == 8 || element.category == 9) {
		element.group = null
	}

	console.log(element.name)

	elements.push(element)
	createDOMelement(element)
	elementsByAtomicNumber = insertionSort(elements, function(a, b) {return a.atomic_number - b.atomic_number}).slice(0)

	if (elements.length == elementsLength) {
		window.localStorage.IPT = JSON.stringify(elements)
		createButtons()
		createPlaceholders()
		layout()
		loading.style.display = "none"
		showHelp = setTimeout(function(){document.getElementById("help").style.opacity = 1}, 2000)
	}
}

function createDOMelement(element) {
	DOMelement = document.createElement("div")
	DOMelement.className = "element"
	DOMelement.id = element.name
	DOMelement.onclick = function(){showElementData(this)}
	DOMelement.innerHTML = `<p class='Symbol'>${element.symbol}</p><p class='Name'>${element.name}</p><p class='AtomicNumber'>${element.atomic_number}</p></p><p class='Datapoints'></p>`
	DOMelement.style.position = "absolute"
	DOMelement.style.left = "47.5%"
	DOMelement.style.top = "40%"
	elementsDiv.appendChild(DOMelement)

	if (layoutType == "periodic") {
		var x = element.group
		var y = element.period
		if (!element.group) {
			if (element.atomic_number < 89) {
				x = 2 + element.atomic_number - 56
			} else {
				x = 2 + element.atomic_number - 88
			}
			y += 3
		}
		DOMelement.style.left = x*5 + "%"
		DOMelement.style.top = y*(100/12) + "%"
	} else {
		layout()
	}
}

//Establishing all of the options for layout and highlight
function createButtons() {
	var element = elements[0]
	for (var i in element) {

		//You cannot sort or highlight by appearance, shells
		if (i == "appearance" || i == "shells" || i == "Element") {
			continue
		}

		var text = i.split("_")
		for (var j = 0; j < text.length; j++) {
			text[j] = text[j].caps()
		}
		text = text.join(" ")

		//Creating the buttons
		document.getElementById('layoutSelectContent').innerHTML += `<div class='selectOption' id='layout_${i}' onclick='layoutChange(this)'>${text}</div>`

		if (!isNaN(element[i]) || i == "phase") {
			document.getElementById('highlightSelectContent').innerHTML += `<div class='selectOption' id='highlight_${i}' onclick='highlight(this)'>${text}</div>`
		}

	}

	document.getElementById('layoutSelect').style.transition = document.getElementById('layoutSelectContent').scrollHeight/400 + "s"
	document.getElementById('highlightSelect').style.transition = document.getElementById('highlightSelectContent').scrollHeight/400 + "s"
}

//Create placeholder elements
function createPlaceholders() {
	var pht = ["57 - 71", "89-103"]
	for (var i = 0; i < 2; i++) {
		DOMelement = document.createElement("div")
		DOMelement.className = "element"
		DOMelement.id = "placeholder" + (i + 1)
		DOMelement.onclick = hideElementData
		DOMelement.innerHTML = "<p class='AtomicNumber'>" + pht[i] + "</p><p class='Datapoints'></p>"
		DOMelement.style.position = "absolute"
		DOMelement.style.left = "47.5%"
		DOMelement.style.top = "40%"
		DOMelement.style["-webkit-transition"] = "opacity 0.5s, left 1s, right 1s,"
		elementsDiv.appendChild(DOMelement)
	}
}

//show the 2 placeholders
function showPlaceholders() {
	for (var i = 0; i < 2; i++) {
		document.getElementById("placeholder" + (i + 1)).style.opacity = 1
		document.getElementById("placeholder" + (i + 1)).style.left = "15%"
		document.getElementById("placeholder" + (i + 1)).style.top = "calc(100%/12 * (" + (6 + i) + "))"
	}
}

//hides the 2 placeholders
function hidePlaceholders() {
	for (var i = 0; i < 2; i++) {
		document.getElementById("placeholder" + (i + 1)).style.opacity = 0
		document.getElementById("placeholder" + (i + 1)).style.left = (Math.random()*90 + 5) + "%"
		document.getElementById("placeholder" + (i + 1)).style.top = "calc(100%/12 * (" + (Math.random()*6) + "))"
	}
}

//Place the elements in the shape of a periodic table
function periodicPlacement() {
	for (var i = 0; i < elements.length; i++) {
		var element = document.getElementById(elements[i].name)
		var x = elements[i].group
		var y = elements[i].period
		if (!elements[i].group) {
			if (elements[i].atomic_number < 89) {
				x = 2 + elements[i].atomic_number - 56
			} else {
				x = 2 + elements[i].atomic_number - 88
			}
			y += 3
		}
		element.style.left = x*5 + "%"
		element.style.top = y*(100/12) + "%"
	}
}

//Move the elements to be in order of the sorted array
function move() {
	for (var i = 0; i < elements.length; i++) {
		var element = document.getElementById(elements[i].name)

		if (elements[i][layoutType] || elements[i][layoutType] === 0) {
			element.style.left = (i%18+1)*5 + "%"
			element.style.top = (Math.floor(i/18)+1)*(100/12) + "%"
		} else {
			var index = elements.length - i - 1
			element.style.left = 95 - (index%18 + 1)*5 + "%"
			element.style.top = 100 - (Math.floor(index/18) + 2)*(100/12) + "%"
		}

	}
}

//Change the layout of the elements
function layout() {
	if (layoutType == "periodic") {
		reversed.className += " inactive"
		showPlaceholders()
		periodicPlacement()
	} else {
		reversed.className = reversed.className.replace(" inactive", "")
		hidePlaceholders()
		elements = insertionSort(elements, comparison)
		move()
	}
}

//Compare 2 elements based on the layoutType.
//If the result is negative; b > a, positive; a > b, 0; a = b
function comparison(a, b){
	var A, B, sum, reversed = document.getElementById("reversed").checked

	//Should a specific record not exist move it towards the end of the array
	if (a[layoutType] === null || b[layoutType] === null) {
		if (a[layoutType] === b[layoutType]) {
			sum = a.atomic_number - b.atomic_number
		} else if (a[layoutType] === null) {
			sum = 1
		} else {
			sum = -1
		}
	//If the contents is a string sort it alphabetically
	} else if (typeof(a[layoutType]) === "string") {

		for (var i = 0; i < a[layoutType].length && i < b[layoutType].length && !sum; i++) {
			A = a[layoutType].charCodeAt(i)
			B = b[layoutType].charCodeAt(i)
			//Reverse the order if the reverse checkbox is checked
			sum = reversed ? B - A : A - B
		}

	//Sort by quantity of the number
	} else {

		A = a[layoutType]
		B = b[layoutType]

		//Reverse the order if the reverse checkbox is checked
		sum = reversed ? B - A : A - B
		//Should they tie sort by atomic number
		if (sum == 0) {
			sum = reversed ? b.atomic_number - a.atomic_number : a.atomic_number - b.atomic_number
		}

	}
	return sum
}

//An insertion sort
function insertionSort(list, comparison) {
	for (var i = 0; i < list.length; i++) {
		var j = i
		while (list[j - 1] && comparison(list[j], list[j - 1]) < 0) {
			var temp = list[j - 1]
			list[j - 1] = list[j]
			list[j] = temp
			j--
		}
	}
	return list
}

//Highlight the elements based on their distribution of the highlightType
function highlight(that) {

	document.getElementById("highlight_" + highlightType).className = document.getElementById("highlight_" + highlightType).className.replace(" active", "")
	that.className += " active"
	highlightType = that.id.slice(10)

	if (highlightType == "none") {
		for (var i = 0; i < elements.length; i++) {
			var element = document.getElementById(elements[i].name)
			element.style.backgroundColor = "rgba(0, 0, 0, 0.1)"
			element.querySelector(".Datapoints").style.opacity = 0
		}
	} else {
		if (highlightType != "phase") {
			var max = -Infinity
			var min = Infinity
			for (var i = 0; i < elements.length; i++) {
				max = (elements[i][highlightType] || elements[i][highlightType] === 0) && elements[i][highlightType] > max ? elements[i][highlightType] : max
				min = (elements[i][highlightType] || elements[i][highlightType] === 0) && elements[i][highlightType] < min ? elements[i][highlightType] : min
			}
		}

		for (var i = 0; i < elements.length; i++) {
			var element = document.getElementById(elements[i].name)


			if (highlightType == "phase") {
				var r = (elements[i][highlightType] == "gas" ? 255 : 100)
				var g = (elements[i][highlightType] == "solid" ? 100 : 0)
				var b = (elements[i][highlightType] == "liquid" ? 255 : 100)
				element.style.backgroundColor = "rgba(" + r + ", "  + g + "," + b + ", 0.5)"
			} else if (elements[i][highlightType] || elements[i][highlightType] === 0) {
				var lerp = (elements[i][highlightType]-min)/(max-min)
				element.style.backgroundColor = lerpCol(0, 255, 255, 0.5, 255, 0, 100, 0.6, lerp)
			} else {
				element.style.backgroundColor = "rgba(0, 0, 0, 0.1)"
			}

			if (elements[i][highlightType] || elements[i][highlightType] === 0) {
				element.querySelector(".Datapoints").style.opacity = 1
			  if (highlightType == "phase" || highlightType == "discovery Year" || highlightType == "category") {
			 		element.querySelector(".Datapoints").innerHTML = elements[i][highlightType]
			 	} else if (window[highlightType + "Text"]) {
			 		element.querySelector(".Datapoints").innerHTML = window[highlightType + "Text"][elements[i][highlightType]]
			 	} else {
					element.querySelector(".Datapoints").innerHTML = elements[i][highlightType].toFixed(1)
				}
			} else {
				element.querySelector(".Datapoints").style.opacity = 0
			}
		}

	}
}

//Pick a colour between two others based on a value between 0 and 1
function lerpCol(r1, g1, b1, a1, r2, g2, b2, a2, lerp) {
	return "rgba(" + Math.round(r1+(r2-r1)*lerp) + ", " + Math.round(g1+(g2-g1)*lerp) + ", " + Math.round(b1+(b2-b1)*lerp) + ", " + (a1+(a2-a1)*lerp) + ")"
}

//When the window resizes, resize the contents appropriately, instantaniously
function windowResize() {
	elementsDiv.style.transition = "0s"
	document.getElementById("sidebar").style.transition = "0s"
	document.getElementById("sidebarHandle").style.transition = "0s"
	document.getElementById("Title").style.transition = "0s"
	document.getElementById("elementData").style.transition = "0s"
	document.getElementById("diamondArrow").style.transition = "0s"
	document.getElementById("dataText").style.transition = "0s"
	resize()
}

//Move the sidebar out/ind
function moveSideBar() {
	if (showHelp) {
		clearInterval(showHelp)
		document.getElementById("help").style["-webkit-transition"] = "opacity 3s, right 1s"
		document.getElementById("help").style.opacity = 0
	}

	hideElementData()
	sideBar = !sideBar
	elementsDiv.style.transition = '1s'
	document.getElementById("sidebar").style.transition = "1s"
	document.getElementById("sidebarHandle").style.transition = "1s"
	document.getElementById("dataText").style.transition = "1s"
	document.getElementById("Title").style.transition = "1s"
	resize()
}

//Resize contents of the webpage
function resize() {
	var rhs

	if (sideBar) {
		rhs = 180
	} else {
		rhs = 0
	}

	if ((window.innerWidth - rhs)*0.6 > window.innerHeight - 30) {
		//Set aspect ratio by height
		elementsDiv.style.width = "calc(((100vh - 30px)/60) * 100)"
		elementsDiv.style.height = "calc(100vh - 30px)"
		elementsDiv.style["font-size"] = parseInt(((window.innerHeight-30)/60*100)/37) + "px"
		document.getElementById("diamondArrow").style.fontSize = `0.78vh`
		document.getElementById("dataText").style.fontSize = `calc((((100vh - 30px)/60)*100) / 85)`
	} else {
		//Set aspect ratio by width
		elementsDiv.style.width = `calc(100vw - ${rhs}px)`
		elementsDiv.style.height = `calc((100vw - ${rhs}px)*0.6)`
		elementsDiv.style["font-size"] = parseInt((window.innerWidth - rhs)/37) + "px"

		document.getElementById("diamondArrow").style.fontSize = `calc((100vw - ${rhs}px) * 0.005)`
		document.getElementById("dataText").style.fontSize = `calc((100vw - ${rhs}px)/90)`
	}

	document.getElementById("help").style.right = `calc(${rhs}px + 24px)`
	document.getElementById("Title").style.width = `calc(100vw - ${rhs}px)`
	document.getElementById("sidebar").style.width = `${rhs}px`
	document.getElementById("sidebarHandle").style.right = `${rhs}px`
}

//Show the contents of a dropdown div
function showContent(that) {
	that.style.height = that.scrollHeight + 'px'
}

//Hide the contents of a dropdown div
function hideContent(that) {
	that.style.height = 'calc(1em + 10px)'
}

//Change the layout of the elements
function layoutChange(that) {
	document.getElementById("layout_" + layoutType).className = document.getElementById("layout_" + layoutType).className.replace(" active", "")
	that.className += " active"
	layoutType = that.id.slice(7)
	layout()
}

//Handle a keypress and highlight search results
function keyPress(event) {
	hideElementData()

	clearTimeout(searchTimeout.fade)
	clearTimeout(searchTimeout.clear)

	searchTimeout.fade = setTimeout(function(){document.getElementById("Search").style.opacity = 0}, 1800)
	searchTimeout.clear = setTimeout(function(){
		document.getElementById("Search").innerHTML = "";
		for (var i = 0; i < elements.length; i++) {document.getElementById(elements[i].name).style.outline = "none"}
	}, 2000)

	document.getElementById("Search").style.opacity = 0.5
	if (event.key.length == 1 && event.key.match(/([A-Z]|[a-z])/)) {
		document.getElementById("Search").innerHTML += event.key
	} else if (event.key == "Backspace") {
		document.getElementById("Search").innerHTML = document.getElementById("Search").innerHTML.slice(0, -1)
	}
	document.getElementById("Search").style.left = "calc(50% - " + document.getElementById("Search").offsetWidth/2 + "px)"
	document.getElementById("Search").style.top = "calc(50% - " + document.getElementById("Search").offsetHeight/2 + "px)"

	var searchTerm = document.getElementById("Search").innerHTML.toLowerCase()

	for (var i = 0; i < elements.length; i++) {
		var element = document.getElementById(elements[i].name)
		var first
		if (searchTerm.length > 0) {
			if (elements[i].name.toLowerCase().includes(searchTerm) || elements[i].symbol.toLowerCase().includes(searchTerm)) {
				element.style.outline = "2px yellow solid"
			} else {
				element.style.outline = "none"
			}
		} else {
			element.style.outline = "none"
		}
	}
	if (searchTerm.length == 0) {
		document.getElementById("Search").style.transition = "0s"
		document.getElementById("Search").style.opacity = 0
		setTimeout(function(){document.getElementById("Search").style.transition = "0.2s"}, 1)
	}
}

//handles the reverse button
function checkReverse(that) {
	that.checked = !that.checked
	layout()
	that.querySelector("#reverseCheckbox").checked = that.checked
	if (that.checked) {
		that.style.backgroundColor = "#bbb"
	} else {
		that.style.backgroundColor = ""
	}
}

//Hides element data
function hideElementData() {
	document.getElementById("dataForm").style.opacity = "0"
}

//A binary search
function binarySearch(list, attribute, target) {
	var min = 0, max = list.length - 1
	var index = Math.floor((max - min)/2)

	if (!target) {
		target = attribute
		attribute = function(a) {return a}
	}

	do {
		if (attribute(list[index]) < target) {
      min = index + 1
    } else {
      max = index
    }

		index = min + Math.floor((max - min)/2)

	} while (max != min && attribute(list[index]) != target)

	return attribute(list[index]) == target ? index : null
}

//Shows relevant element data
function showElementData(that) {
	var index = binarySearch(elementsByAtomicNumber, function(a){return a.atomic_number}, that.querySelector(".AtomicNumber").innerHTML)

	var element = elementsByAtomicNumber[index]

	var Year = `${Math.abs(element.discovery)} ${element.discovery > 0 ? "CE" : "BCE"}`

	document.getElementById("dataText").innerHTML = `
	Symbol: ${element.symbol}<br>
	Name: ${element.name}<br>
	${element.phase.caps()}<br>
	${categoryText[element.category].caps()}<br><br>
	${element.appearance ? element.appearance.caps() + ".<br><br>" : ""}
	${Year ? "Discovery: " + Year + "<br>": ""}
	Shells: ${element.shells.toString().replace(/,/g, ', ')}<br>
	Crystal structure: ${element.crystal_structure}<br><br>
	${element.melting_point ? "Melting point: " + element.melting_point + " K (" + (element.melting_point - 273.15).toFixed(2) + "°C)<br>" + (element.boiling_point ? "" : "<br>") : ""}
	${element.boiling_point ? "Boiling point: " + element.boiling_point + " K (" + (element.boiling_point - 273.15).toFixed(2) + "°C)<br><br>": ""}
	Density: ${element.density} g/cm3<br>
	${element.vaporization ? "Heat of vaporization: " + element.vaporization + " kJ/mol<br>" : ""}
	${element.electronegativity ? "Electronegativity: " + element.electronegativity + "<br>" : ""}
	${element.covalent_radius ? "Covalent radius: " + element.covalent_radius + " pm<br>" : ""}
	${element.electrical_resisivity ? "Electrical resisivity: " + element.electrical_resisivity + " nΩ·m<br>" : ""}
	First ionization: ${element.first_ionization} kJ/mol<br>
	<span style="position: absolute; right: 0.4em; top: 0.4em; font: bold 1.5em arial;">${element.atomic_number}</span><br>
	`

	var h = document.getElementById("dataText").scrollHeight/elementsDiv.scrollHeight*100
	var w = 20

	document.getElementById("dataForm").style.opacity = "1"
	document.getElementById("elementData").style.transition = "0.5s"
	document.getElementById("diamondArrow").style.transition = "0.5s"
	var eTop = document.getElementById(element.name).style.top
	var eLeft = document.getElementById(element.name).style.left
	if (parseFloat(eTop) + h < 95) {
		document.getElementById("elementData").style.top = parseFloat(eTop) + 0.3 + "%"
	} else {
		document.getElementById("elementData").style.top = `${elementsDiv.clientHeight*0.95 - (document.getElementById("dataText").scrollHeight + 2)}px`
	}
	document.getElementById("elementData").style.height = document.getElementById("dataText").scrollHeight + "px"

	document.getElementById("diamondArrow").style.top = parseFloat(eTop) + 0.4 + "%"

	if (parseFloat(eLeft) + 7.3 + w > 100 || (
		parseFloat(document.getElementById("diamondArrow").style.left) < parseFloat(eLeft) + 4.8 &&
		parseFloat(eLeft) - 4.4 - w > 0
	)) {
		document.getElementById("elementData").style.left = parseFloat(eLeft) + - w - 2.1 + "%"
		document.getElementById("diamondArrow").style.left = parseFloat(eLeft) + -4.4 + "%"
	} else {
		document.getElementById("elementData").style.left = parseFloat(eLeft) + 7.3 + "%"
		document.getElementById("diamondArrow").style.left = parseFloat(eLeft) + 4.8 + "%"
	}

}

//Capitalises a given string
String.prototype.caps = function() {
	return this ? this[0].toUpperCase() + this.slice(1) : this
}

//Reverses a given string
String.prototype.reverse = function() {
	if (this.length) {
		return this.slice(1).reverse() + this[0]
	}
	return ""
}
