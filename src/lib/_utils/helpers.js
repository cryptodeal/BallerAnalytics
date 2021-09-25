const getAge = (dateString) => {
	let today = new Date();
	let birthDate = new Date(dateString);
	let age = today.getFullYear() - birthDate.getFullYear();
	let m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
};

const flattenObject = (obj) => {
	const flattened = {};

	Object.keys(obj).forEach((key) => {
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			Object.assign(flattened, flattenObject(obj[key]));
		} else {
			flattened[key] = obj[key];
		}
	});
	return flattened;
};

export { getAge, flattenObject };
