//Global variable
var layoutType = "periodic"
var highlightType = "none"
var sideBar = false
var searchTimeout = {clear: null, fade: null}

var elements = []
var elementsLength

var elementsByAtomicNumber

//Checks for pre-exiting local storage items and either loads them or creates space (persistent storage)
if (!window.localStorage.IPT) {
	window.localStorage.IPT = JSON.stringify(elements)
} else {
	elements = JSON.parse(window.localStorage.IPT)
}

//Function called once the body of the page loads
function start() {

	window.onresize = windowResize
	windowResize()

	//Either scrapes elements or generates DOM from the data
	if (elements.length == 0) {
		scrapeElements()
	} else {
		for (var i = 0; i < elements.length; i++) {
			createDOMelement(elements[i])
		}

		loadedElements()
	}

	if (layoutType == "periodic") {
		reverseButton.className = graphButton.className = "sidebarButton inactive"
	}
}

//Starts the scraping from wikipedia
function scrapeElements() {
	loading.style.display = "block"

	//Removes dropdown options (if any)
	var options = document.querySelectorAll(".selectOption:not(:first-child)")
	for (var i = 0; i < options.length; i++) {
		options[i].remove()
	}
	elements = []
	var domElements = document.querySelectorAll(".element")
	for (var i = 0; i < domElements.length; i++) {
		domElements[i].remove()
	}
	reverseButton.className = graphButton.className = "sidebarButton inactive"
	layout_periodic.className = "selectOption active"
	highlight_none.className = "selectOption active"
	layoutType = "periodic"
	highlightType = "none"

	//First request gets a list of all the elements
	request("List of chemical elements", function(that){
		var site = JSON.parse(that.response).parse.text["*"]

		var parser = new DOMParser();
		var doc = parser.parseFromString(site, "text/html");
		var query = doc.evaluate("//table[contains(translate(., 'ELMNT', 'elmnt'), 'element')]/tbody/tr/td[position() = 3]/a/@href", doc, null, XPathResult.ANY_TYPE, null)
		var node
		elementsLength = 0
		while (node = query.iterateNext()) {
			elementsLength++
			request(/[^\/]*$/.exec(node.value)[0], addElement)
	  }
	}, true)
}

//Requests the html of the page using the mediawiki API
function request(page, func, load) {
	var url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(page)}&prop=links%7Csections%7Ctext&origin=*`
	var xhttp = new XMLHttpRequest()
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
			request(page, func, load)
		}, 1000)
	}
  xhttp.open("GET", url, true)
	xhttp.setRequestHeader("Api-User-Agent", "request")
  xhttp.send()
}

//Creates an xpath on a specific document, only returns the first match
function XPath(xpath, parent) {
	return (parent || document).evaluate(xpath, parent || document, null, XPathResult.ANY_TYPE, null).iterateNext() || {innerHTML: "", innerText: ""}
}

//Generates User Defined objects from wikipedia page html using xpath and regex
function addElement(that){
	var parser = new DOMParser();
	var doc = parser.parseFromString(JSON.parse(that.response).parse.text["*"], "text/html");
	var element = {
		name: /[A-Za-z]+\w/.exec(JSON.parse(that.response).parse.title)[0],
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
			element.category = "noble gas"
		} else if (element.category.indexOf("nonmetal") != -1 && element.category.indexOf("polyatomic") == -1) {
			element.category = "diatomic nonmetal"
		} else if (element.category.indexOf("polyatomic nonmetal") != -1) {
			element.category = "polyatomic nonmetal"
		} else if (element.category.indexOf("metalloid") != -1) {
			element.category = "metalloid"
		} else if (element.category.indexOf("lanthanide") != -1) {
			element.category = "lanthanide"
		} else if (element.category.indexOf("actinide") != -1) {
			element.category = "actinide"
		} else if (element.category.indexOf("post-transition metal") != -1 && element.category.indexOf("alternatively") == -1) {
			element.category = "post-transition metal"
		} else if (element.category.indexOf("transition metal") != -1) {
			element.category = "transition metal"
		} else if (element.category.indexOf("alkaline earth metal") != -1) {
			element.category = "alkaline earth metal"
		} else if (element.category.indexOf("alkali metal") != -1) {
			element.category = "alkali metal"
		}
	}
	//Creating outer shell attribute
	element.outer_shell = element.shells[element.shells.length - 1]
	//Removing group of lanthanides and actinides
	if (element.category == 8 || element.category == 9) {
		element.group = null
	}

	elements.push(element)
	createDOMelement(element)

	if (elements.length == elementsLength) {
		window.localStorage.IPT = JSON.stringify(elements)
		loadedElements()
	}
}

//Once the elements are loaded
function loadedElements() {
	elementsByAtomicNumber = insertionSort(elements, function(a, b) {return a.atomic_number - b.atomic_number}).slice(0)
	window.localStorage.IPT = JSON.stringify(elements)
	createButtons()
	createPlaceholders()
	layout()
	loading.style.display = "none"
}

//Creates a dom element from an object containing the chemical element's data
function createDOMelement(element) {
	DOMelement = document.createElement("div")
	DOMelement.className = "element"
	DOMelement.id = element.name
	DOMelement.onclick = function(){showElementData.bind(this)()}
	DOMelement.innerHTML = `<p class='Symbol'>${element.symbol}</p><p class='Name'>${element.name}</p><p class='AtomicNumber'>${element.atomic_number}</p></p><p class='Datapoints'></p>`
	DOMelement.style.position = "absolute"
	DOMelement.style.left = "47.5%"
	DOMelement.style.top = "40%"
	elementsDiv.appendChild(DOMelement)

	var x = element.group
	var y = element.period
	if (56 < element.atomic_number && element.atomic_number < 72) {
		x = 2 + element.atomic_number - 56
		y += 3
	} else if (88 < element.atomic_number && element.atomic_number < 104) {
		x = 2 + element.atomic_number - 88
		y += 3
	}
	DOMelement.style.left = x*5 + "%"
	DOMelement.style.top = y*(100/12) + "%"
}

//Establishing all of the options for layout and highlight
function createButtons() {
	var element = elements[0]
	var keys = insertionSort(Object.keys(elements[0]), (a, b) => a.toNumber() - b.toNumber())
	for (var i = 0; i < keys.length; i++) {

		//You cannot sort or highlight by appearance or shells
		if (keys[i] == "appearance" || keys[i] == "shells" || keys[i] == "crystal_structure") {
			continue
		}

		var text = keys[i].capsAll()

		//Creating the buttons
		layoutSelectContent.innerHTML += `<div class='selectOption' id='layout_${keys[i]}' onclick="layoutChange.bind(this)(); (graphButton.checked ? graph : layout)()">${text}</div>`
		highlightSelectContent.innerHTML += `<div class='selectOption' id='highlight_${keys[i]}' onclick="highlightChange.bind(this)(); highlight(); (graphButton.checked ? graph() : 0)">${text}</div>`

	}

	layoutSelect.style.transition = document.getElementById('layoutSelectContent').scrollHeight/400 + "s"
	highlightSelect.style.transition = document.getElementById('highlightSelectContent').scrollHeight/400 + "s"
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

//Show the 2 placeholders
function showPlaceholders() {
	for (var i = 0; i < 2; i++) {
		document.getElementById("placeholder" + (i + 1)).style.opacity = 1
		document.getElementById("placeholder" + (i + 1)).style.left = "15%"
		document.getElementById("placeholder" + (i + 1)).style.top = "calc(100%/12 * (" + (6 + i) + "))"
	}
}

//Hides the 2 placeholders
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
		if (56 < elements[i].atomic_number && elements[i].atomic_number < 72) {
			x = 2 + elements[i].atomic_number - 56
			y += 3
		} else if (88 < elements[i].atomic_number && elements[i].atomic_number < 104) {
			x = 2 + elements[i].atomic_number - 88
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
		showPlaceholders()
		periodicPlacement()
	} else {
		hidePlaceholders()
		elements = insertionSort(elements, comparison)
		move()
	}
}

//Compare 2 elements based on the layoutType.
//If the result is negative; a < b, positive; a > b, 0; a = b
function comparison(a, b){
	var A, B, sum, reversed = document.getElementById("reverseButton").checked

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

//The insertion sort (Sort Routine)
function insertionSort(list, comparison) {
	for (var i = 0; i < list.length; i++) {
		var j = i
		while (j > 0 && comparison(list[j], list[j - 1]) < 0) {
			var temp = list[j - 1]
			list[j - 1] = list[j]
			list[j] = temp
			j--
		}
	}
	return list
}

//Highlight the elements based on their distribution of the highlightType
function highlight() {
	if (highlightType == "none") {
		for (var i = 0; i < elements.length; i++) {
			var element = document.getElementById(elements[i].name)
			element.style.backgroundColor = "rgba(0, 0, 0, 0.1)"
			element.querySelector(".Datapoints").style.opacity = 0
		}
	} else {
		var max = -Infinity
		var min = Infinity
		var fontSize = 0.4
		for (var i = 0; i < elements.length; i++) {
			if (elements[i][highlightType] || elements[i][highlightType] === 0) {
				var value = elements[i][highlightType].toNumber()
				max = Math.max(max, value)
				min = Math.min(min, value)
				if (isNaN(elements[i][highlightType])) {
					textWidth.innerHTML = elements[i][highlightType]
					textWidth.style.fontSize = fontSize + "em"
					while (textWidth.clientWidth + 1 > elementsDiv.clientWidth * 0.05 * 0.9) {
						fontSize -= 0.01
						textWidth.style.fontSize = fontSize + "em"
					}
				}
			}
		}

		for (var i = 0; i < elements.length; i++) {
			var element = document.getElementById(elements[i].name)


			if (elements[i][highlightType] || elements[i][highlightType] === 0) {
				var lerp = (elements[i][highlightType].toNumber()-min)/(max-min)
				element.style.backgroundColor = lerpCol(0, 255, 255, 0.5, 255, 0, 100, 0.6, lerp)
			} else {
				element.style.backgroundColor = "rgba(0, 0, 0, 0.1)"
			}

			if (elements[i][highlightType] || elements[i][highlightType] === 0) {
				element.querySelector(".Datapoints").style.opacity = 1
				element.querySelector(".Datapoints").style.fontSize = fontSize + "em"
				element.querySelector(".Datapoints").style.bottom = `calc(25% - ${fontSize}ex)`
			  if (highlightType == "phase" || highlightType == "discovery Year" || highlightType == "category") {
			 		element.querySelector(".Datapoints").innerHTML = elements[i][highlightType]
			 	} else if (isNaN(elements[i][highlightType])) {
			 		element.querySelector(".Datapoints").innerHTML = elements[i][highlightType]
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

//Move the sidebar out/in
function moveSideBar() {
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
		elementsDiv.style.fontSize = parseInt(((window.innerHeight-30)/60*100)/37) + "px"
		document.getElementById("diamondArrow").style.fontSize = `0.78vh`
		document.getElementById("dataText").style.fontSize = `calc((((100vh - 30px)/60)*100) / 85)`
	} else {
		//Set aspect ratio by width
		elementsDiv.style.width = `calc(100vw - ${rhs}px)`
		elementsDiv.style.height = `calc((100vw - ${rhs}px)*0.6)`
		elementsDiv.style.fontSize = parseInt((window.innerWidth - rhs)/37) + "px"
		document.getElementById("diamondArrow").style.fontSize = `calc((100vw - ${rhs}px) * 0.005)`
		document.getElementById("dataText").style.fontSize = `calc((100vw - ${rhs}px)/90)`
	}

	document.getElementById("Title").style.width = `calc(100vw - ${rhs}px)`
	document.getElementById("sidebar").style.width = `${rhs}px`
	document.getElementById("sidebarHandle").style.right = `${rhs}px`
	
	if (graphButton.checked) {
		yAxis.style.left = `calc(-${(yAxis.clientWidth)/2}px + 2.5%)`
		yAxisLine1.y2.baseVal.valueAsString = `${elementsDiv.clientHeight/2 - (yAxis.clientWidth + 1)/2}px`
		yAxisLine2.y1.baseVal.valueAsString = `${elementsDiv.clientHeight/2 + (yAxis.clientWidth + 1)/2}px`
	
		textWidth.style.fontSize = "1em"
		textWidth.innerHTML = xAxis.innerHTML
		xAxisLine1.x2.baseVal.valueAsString = `${elementsDiv.clientWidth/2 - (textWidth.clientWidth + 1)/2}px`
		xAxisLine2.x1.baseVal.valueAsString = `${elementsDiv.clientWidth/2 + (textWidth.clientWidth + 1)/2}px`
	}
}

//Show the contents of a dropdown div
function showContent() {
	this.style.height = this.scrollHeight + 'px'
}

//Hide the contents of a dropdown div
function hideContent() {
	this.style.height = 'calc(1em + 10px)'
}

//Change the layout of the elements
function layoutChange() {
	document.getElementById("layout_" + layoutType).className = "selectOption"
	this.className = "selectOption active"
	layoutType = this.id.slice(7)
	if (layoutType == "periodic" || highlightType == "none") {
		reverseButton.className = graphButton.className = "sidebarButton inactive"
		reverseButton.querySelector("p").innerHTML = "Reverse order"
		reverseYAxisButton.className = 'sidebarButton hidden'
		axies.style.opacity = "0"
	} else {
		reverseButton.className = graphButton.className = "sidebarButton"
		if (graphButton.checked) {
			reverseButton.querySelector("p").innerHTML = "Reverse X axis" 
			reverseYAxisButton.className = 'sidebarButton'
		}
	}
}

//Change the highlight of the elements
function highlightChange() {
	document.getElementById("highlight_" + highlightType).className = "selectOption"
	this.className = "selectOption active"
	highlightType = this.id.slice(10)
	if (layoutType == "periodic") {
		reverseButton.className = graphButton.className = "sidebarButton inactive"
		reverseButton.querySelector("p").innerHTML = "Reverse order"
		reverseYAxisButton.className = 'sidebarButton hidden'
		axies.style.opacity = "0"
		if (highlightType == "none" && graphButton.checked) {
			layout()
		}
	} else {
		reverseButton.className = graphButton.className = "sidebarButton"
		if (graphButton.checked) {
			reverseButton.querySelector("p").innerHTML = "Reverse X axis" 
			reverseYAxisButton.className = 'sidebarButton'
		}
	}
}

//Handle a keypress and highlight search results
function keyPress(event) {
	hideElementData()

	if (event.metaKey || event.ctrlKey) {
		return 0
	}

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

//Handles the checkboxes
function checkbox() {
	if (!this.className.match('inactive')) {
		this.checked = !this.checked
		this.querySelector("input").checked = this.checked
		if (this.checked) {
			this.style.backgroundColor = "#bbb"
		} else {
			this.style.backgroundColor = ""
		}
	}
}

//Hides element data
function hideElementData() {
	document.getElementById("dataForm").style.opacity = "0"
}

//The binary search
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
function showElementData() {
	var index = binarySearch(elementsByAtomicNumber, function(a){return a.atomic_number}, this.querySelector(".AtomicNumber").innerHTML)

	var element = elementsByAtomicNumber[index]

	var Year = `${Math.abs(element.discovery)} ${element.discovery > 0 ? "CE" : "BCE"}`

	//String manipulation using backticks
	document.getElementById("dataText").innerHTML = `
	Symbol: ${element.symbol}<br>
	Name: ${element.name}<br>
	Phase: ${element.phase.caps()}<br>
	Category: ${element.category.caps()}<br><br>
	Appearance:<br>${element.appearance ? element.appearance.caps() + ".<br><br>" : ""}
	Year of discovery: ${Year ? "Discovery: " + Year + "<br>": ""}
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
	<span style="position: absolute; right: 0.4em; top: 0.4em; font: bold 1.5em arial;">${element.atomic_number}</span>
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

//Graph the elements by the highlight type vs layout type
function graph() {
	axies.style.opacity = "1"
	var attributeX = layoutType, attributeY = highlightType
	hidePlaceholders()
	max = {x: -Infinity, y: -Infinity}
	min = {x: Infinity, y: Infinity}
	
	xAxis.innerHTML = layoutType.capsAll()
	yAxis.innerHTML = highlightType.capsAll()
	yAxis.style.left = `calc(-${(yAxis.clientWidth)/2}px + 2.5%)`
	yAxisLine1.y2.baseVal.valueAsString = `${elementsDiv.clientHeight/2 - (yAxis.clientWidth + 1)/2}px`
	yAxisLine2.y1.baseVal.valueAsString = `${elementsDiv.clientHeight/2 + (yAxis.clientWidth + 1)/2}px`
	
	textWidth.style.fontSize = "1em"
	textWidth.innerHTML = xAxis.innerHTML
	xAxisLine1.x2.baseVal.valueAsString = `${elementsDiv.clientWidth/2 - (textWidth.clientWidth + 1)/2}px`
	xAxisLine2.x1.baseVal.valueAsString = `${elementsDiv.clientWidth/2 + (textWidth.clientWidth + 1)/2}px`
	

	for (var i = 0; i < elements.length; i++) {
		var valueX = elements[i][attributeX], valueY = elements[i][attributeY]

		if (valueX || valueX === 0) {
			if (isNaN(valueX)) {
				valueX = valueX.toNumber()
			}
			if (valueX > max.x) {
				max.x = valueX
			}
			if (valueX < min.x) {
				min.x = valueX
			}
		}
		if (valueY || valueY === 0) {
			if (isNaN(valueY)) {
				valueY = valueY.toNumber()
			}
			if (valueY > max.y) {
				max.y = valueY
			}
			if (valueY < min.y) {
				min.y = valueY
			}
		}
	}

	//5% < x < 95%

	for (var i = 0; i < elements.length; i++) {
		var element = document.getElementById(elements[i].name)

		if (elements[i][attributeX] || elements[i][attributeX] === 0) {
			if (reverseButton.checked) {
				element.style.left = ((1 - (elements[i][attributeX].toNumber() - min.x)/(max.x-min.x))*17+1)*5 + "%"
			} else {
				element.style.left = ((elements[i][attributeX].toNumber() - min.x)/(max.x-min.x)*17+1)*5 + "%"
			}
		} else {
			element.style.left = "-6%"
		}
		if (elements[i][attributeY] || elements[i][attributeY] === 0) {
			if (reverseYAxisButton.checked) {
				element.style.top = ((elements[i][attributeY].toNumber() - min.y)/(max.y-min.y))*(100 - 300/12) + 100/12 + "%"
			} else {
				element.style.top = ((1 - (elements[i][attributeY].toNumber() - min.y)/(max.y-min.y)))*(100 - 300/12) + 100/12 + "%"
			}
		} else {
			element.style.top = "108%"
		}

	}

}

//Change whether the elements are to be graphed
function graphingChange() {
	axies.style.opacity = this.checked ? "1" : "0";
	(this.checked ? graph : layout)()
	reverseYAxisButton.className = 'sidebarButton ' + (!this.checked && 'hidden')
	reverseButton.querySelector("p").innerHTML = this.checked ? "Reverse X axis" : "Reverse order"
}

//Capitalises a given string
String.prototype.caps = function() {
	return this ? this[0].toUpperCase() + this.slice(1) : this
}

//Capitalises all words in a string
String.prototype.capsAll = function() {
	var temp = []
	this.split("_").forEach((a, i) => temp[i] = a.caps())
	return temp.join(" ")
}

//Reverses a given string
String.prototype.reverse = function() {
	if (this.length) {
		return this.slice(1).reverse() + this[0]
	}
	return ""
}

//Turns a string into a unique number, giving it a numerical value to interpolate between
String.prototype.toNumber = function() {
	var n = 0
	for (var i = 0; i < this.length; i++) {
		n += 1/Math.pow(27, i + 1)*(this.charCodeAt(i) - 96)
	}
	return n
}

//Allows a valid toNumber call on both strings and numbers
Number.prototype.toNumber = function() {
	return this
}
