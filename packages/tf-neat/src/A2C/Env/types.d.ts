export type RosterEncd = [number, number, number, number, number, number, number, number, number];

export type RosterDatumInputs = [
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd,
	RosterEncd
];

export type RosterDatum = {
	inputs: RosterDatumInputs;
	labels: [0 | 1];
};

export type RosterDataSet = {
	data: RosterDatum[];
};
