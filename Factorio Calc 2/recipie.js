var recipies = {
	Iron_ore: {
		time: 0.5,
		ingredients: [],
		production_type: "Electric_mining_drill",
		output: 1,
		tier: 1
	},
	Copper_ore: {
		time: 0.5,
		ingredients: [],
		production_type: "Electric_mining_drill",
		output: 1,
		tier: 1
	},
	Uranium_ore: {
		time: 0.5,
		ingredients: [],
		production_type: "Electric_mining_drill",
		output: 1,
		tier: 1
	},
	Coal: {
		time: 0.5,
		ingredients: [],
		production_type: "Electric_mining_drill",
		output: 1,
		tier: 1
	},
	Raw_wood: {
		time: 0,
		ingredients: [],
		output: 1,
		tier: 1,
	},
	Stone: {
		time: 0.65,
		ingredients: [],
		production_type: "Electric_mining_drill",
		output: 1,
		tier: 1
	},
	Raw_fish: {
		time: 0,
		ingredients: [],
		output: 1,
		tier: 1
	},
	Crude_oil: {
		time: 0,
		ingredients: [],
		production_type: "Pumpjack",
		output: 1,
		tier: 1
	},
	Heavy_oil: {
		time: 0,
		ingredients: [],
		production_type: "Oil_refinery",
		output: 1,
		tier: 1
	},
	Ligh_oil: {
		time: 0,
		ingredients: [],
		production_type: "Oil_refinery",
		output: 1,
		tier: 1
	},
	Petroleum_gas: {
		time: 0,
		ingredients: [],
		production_type: "Oil_refinery",
		output: 1,
		tier: 1
	},
	Water: {
		time: 0,
		ingredients: [],
		production_type: "Offshore_pump",
		output: 1,
		tier: 1
	},

	Iron_plate: {
		time: 3.5,
		ingredients: [
			{q: 1, i: "Iron_ore"}
		],
		production_type: "Steel_furnace",
		output: 1,
		tier: 2
	},
	Copper_plate: {
		time: 3.5,
		ingredients: [
			{q: 1, i: "Copper_ore"}
		],
		production_type: "Steel_furnace",
		output: 1,
		tier: 2
	},
	Stone_brick: {
		time: 3.5,
		ingredients: [
			{q: 2, i: "Stone"}
		],
		production_type: "Steel_furnace",
		output: 1,
		tier: 2
	},

	Iron_stick: {
		time: 0.5,
		ingredients: [
			{q: 1, i: "Iron_plate"},
		],
		production_type: "Assembling_machine_1",
		output: 2,
		tier: 3
	},
	Copper_cable: {
		time: 0.5,
		ingredients: [
			{q: 1, i: "Copper_plate"},
		],
		production_type: "Assembling_machine_1",
		output: 2,
		tier: 3
	},
	Iron_gear_wheel: {
		time: 0.5,
		ingredients: [
			{q: 2, i: "Iron_plate"},
		],
		production_type: "Assembling_machine_1",
		output: 1,
		tier: 3
	},
	Steel_plate: {
		time: 16,
		ingredients: [
			{q: 2, i: "Iron_plate"},
		],
		production_type: "Steel_furnace",
		output: 1,
		tier: 3
	},
	Science_pack_1: {
		time: 5,
		ingredients: [
			{q: 1, i: "Iron_plate"},
			{q: 1, i: "Copper_plate"}
		],
		production_type: "Assembling_machine_1",
		output: 1,
		tier: 3
	},

	Iron_axe: {
		time: 0.5,
		ingredients: [
			{q: 3, i: "Iron_plate"},
			{q: 2, i: "Iron_stick"}
		],
		production_type: "Assembling_machine_1",
		output: 1,
		tier: 4
	},
	Electronic_circuit: {
		time: 0.5,
		ingredients: [
			{q: 1, i: "Iron_plate"},
			{q: 3, i: "Copper_cable"}
		],
		production_type: "Assembling_machine_1",
		output: 1,
		tier: 4
	},
	Transport_belt: {
		time: 0.5,
		ingredients: [
			{q: 1, i: "Iron_plate"},
			{q: 1, i: "Iron_gear_wheel"}
		],
		production_type: "Assembling_machine_1",
		output: 1,
		tier: 4
	},

	Inserter: {
		time: 0.5,
		ingredients: [
			{q: 1, i: "Iron_plate"},
			{q: 1, i: "Iron_gear_wheel"},
			{q: 1, i: "Electronic_circuit"}
		],
		production_type: "Assembling_machine_1",
		output: 1,
		tier: 5
	},

	Science_pack_2: {
		time: 6,
		ingredients: [
			{q: 1, i: "Transport_belt"},
			{q: 1, i: "Inserter"}
		],
		production_type: "Assembling_machine_1",
		output: 1,
		tier: 6
	}
}
