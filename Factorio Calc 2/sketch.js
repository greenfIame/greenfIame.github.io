List = `
––Production
Wooden_chest Iron_chest Steel_chest Storage_tank
Transport_belt Fast_transport_belt Express_transport_belt Underground_belt Fast_underground_belt Express_underground_belt Splitter Fast_splitter Express_splitter
Burner_inserter Inserter Long_handed_inserter Fast_inserter Filter_inserter Stack_inserter Stack_filter_inserter
Small_electric_pole Medium_electric_pole Big_electric_pole Substation Pipe Pipe_to_ground Pump
Rail Train_stop Rail_signal Rail_chain_signal Locomotive Cargo_wagon Fluid_wagon Artillery_wagon Car Tank
Logistic_robot Construction_robot Active_provider_chest Passive_provider_chest Storage_chest Buffer_chest Requester_chest Roboport
Lamp Red_wire Green_wire Arithmetic_combinator Decider_combinator Constant_combinator Power_switch Programmable_speaker
Stone_brick Concrete Hazard_concrete Refined_concrete Refined_hazard_concrete Landfill Cliff_explosives
––Logistics
Iron_axe Steel_axe Repair_pack Blueprint Deconstruction_planner Blueprint_book
Boiler Steam_engine Steam_turbine Solar_panel Accumulator Nuclear_reactor Heat_exchanger Heat_pipe
Burner_mining_drill Electric_mining_drill Offshore_pump Pumpjack
Stone_furnace Steel_furnace Electric_furnace
Assembling_machine_1 Assembling_machine_2 Assembling_machine_3 Oil_refinery Chemical_plant Centrifuge Lab
Beacon Speed_module Speed_module_2 Speed_module_3 Efficiency_module Efficiency_module_2 Efficiency_module_3 Productivity_module Productivity_module_2 Productivity_module_3
––Intermediate_products
Raw_wood Coal Stone Iron_ore Copper_ore Uranium_ore Raw_fish Crude_oil Heavy_oil Light_oil Lubricant Petroleum_gas Sulfuric_acid Water Steam
Wood Iron_plate Copper_plate Solid_fuel Steel_plate Plastic_bar Sulfur Battery Explosives Uranium_processing
Crude_oil_barrel Heavy_oil_barrel Light_oil_barrel Lubricant_barrel Petroleum_gas_barrel Sulfuric_acid_barrel Water_barrel
Copper_cable Iron_stick Iron_gear_wheel Empty_barrel Electronic_circuit Advanced_circuit Processing_unit Engine_unit Electric_engine_unit Flying_robot_frame Satellite Rocket_part Rocket_control_unit Low_density_structure Rocket_fuel Nuclear_fuel Uranium_fuel_cell Used_up_uranium_fuel_cell Nuclear_fuel_reprocessing Kovarex_enrichment_process
Science_pack_1 Science_pack_2 Science_pack_3 Military_science_pack Production_science_pack High_tech_science_pack Space_science_pack
––Combat
Pistol Submachine_gun Shotgun Combat_shotgun Rocket_launcher Flamethrower Land_mine
Firearm_magazine Piercing_rounds_magazine Uranium_rounds_magazine Shotgun_shells Piercing_shotgun_shells Cannon_shell Explosive_cannon_shell Uranium_cannon_shell Explosive_uranium_cannon_shell Artillery_shell Rocket Explosive_rocket Atomic_bomb Flamethrower_ammo
Grenade Cluster_grenade Poison_capsule Slowdown_capsule Defender_capsule Distractor_capsule Destroyer_capsule Discharge_defense_remote Artillery_targeting_remote
Light_armor Heavy_armor Modular_armor Power_armor Power_armor_MK2
Portable_solar_panel Portable_fusion_reactor Energy_shield Personal_battery Personal_laser_defense Discharge_defense Exoskeleton Personal_roboport Nightvision Stone_wall Gate Gun_turret Laser_turret Flamethrower_turret Artillery_turret Radar Rocket_silo`

// Logistics.png
// Production.png
// Intermediate_products.png
// Combat.png

function start() {
	var l = List.split("\n––").slice(1)
	var tabs = document.createElement("div")
	itemMenu.appendChild(tabs)

	for (var n = 0; n < l.length; n++) {
		l[n] = l[n].split("\n")
		var tab = document.createElement("div")
		var div = document.createElement("div")

		tab.setAttribute("data", l[n][0].replace(/_/g, " "))
		tab.innerHTML = `<img src="${"Assets/" + l[n][0] + ".png"}"></img>`
		tab.onclick = function() {
			this.parentNode.parentNode.querySelector(".active").className = ""
			this.parentNode.parentNode.querySelector(".active").className = ""
			this.className = "active"
			this.parentNode.parentNode.children[Array.prototype.indexOf.call(this.parentNode.children, this) + 1].className = "active"
		}
		tabs.appendChild(tab)

		if (n == 0) {
			tab.className = "active"
			div.className = "active"
		}

		for (var i = 1; i < l[n].length; i++) {
			l[n][i] = l[n][i].split(" ")
			for (var j = 0; j < l[n][i].length; j++) {
				var img = document.createElement("div")
				img.style.clear = j == 0 ? "left" : ""
				img.innerHTML = `<img src="${"Assets/" + l[n][i][j] + ".png"}"></img>`
				img.onclick = function() {
					if (!window[this.getAttribute("data")]) {
						var x = document.createElement("div")
						x.className = "target"
						x.id = this.getAttribute("data")
						x.innerHTML = `<img src="${this.firstChild.src}" onclick="targets.removeChild(this.parentElement); update()"></img><input value="1" onchange="update()"/><input value="/sec"></input>`
						targets.appendChild(x)
					} else {
						window[this.getAttribute("data")].children[1].value = parseFloat(window[this.getAttribute("data")].children[1].value) + 1
					}
					update()
				}
				img.setAttribute("data", l[n][i][j].replace(/_/g, " "))
				div.appendChild(img)
			}
		}
		itemMenu.appendChild(div)
	}

}

function update() {
	tree()
}

function tree() {
	out = "<table>"

	var tiers = []
	for (var i = 0; i < targets.children.length; i++) {
		t = recipies[targets.children[i].id.replace(/ /g, "_")].tier
		tiers[t] = tiers[t] ? tiers[t] : {}
		tiers[t][targets.children[i].id.replace(/ /g, "_")] = {q: parseFloat(targets.children[i].children[1].value)}
	}

	for (var i = 1; i < tiers.length; i++) {
		tiers[i] = tiers[i] ? tiers[i] : {}
	}

	for (var t = tiers.length - 1; t >= 1; t--) {

		for (var i in tiers[t]) {
			tiers[t][i].C = tiers[t][i].q / recipies[i].output * recipies[i].time
			tiers[t][i].c = Math.ceil(tiers[t][i].C)

			if (t > 1) {
				var rat = tiers[t][i].q / recipies[i].output
				for (var j = 0; j < recipies[i].ingredients.length; j++) {
					var ing = recipies[i].ingredients[j]
					if (tiers[recipies[ing.i].tier][ing.i]) {
						tiers[recipies[ing.i].tier][ing.i].q += ing.q * rat
					} else {
						tiers[recipies[ing.i].tier][ing.i] = {q: ing.q * rat}
					}
				}
			}
		}

		out += `<tr>`
		for (var i in tiers[t]) {
			out += `
			<td><img src="Assets/${i}.png"></img></td><td>${tiers[t][i].q}/sec</td>
			<td><img src="Assets/${recipies[i].production_type}.png"></img></td><td>${tiers[t][i].c}</td><td>(${tiers[t][i].C.toFixed(3)})</td>`
		}
		out += `</tr>`
	}
	output.innerHTML = out + "</table>"
}

Array.prototype.copy = function() {
	var t = []
	for (var i = 0; i < this.length; i++) {
		if (typeof(this[i]) == "object") {
			var x = {}
			for (j in this[i]) {
				x[j] = this[i][j]
			}
			t.push(x)
		} else {
			t.push(this[i])
		}
	}
	return t
}
