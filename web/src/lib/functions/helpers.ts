import type { ValidatedFormData, NewUserFormData } from '$lib/types';

export const getAge = (dateString: string): number => {
	const today = new Date();
	const birthDate = new Date(dateString);
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
};

export const getAstTovRatio = (ast: number, tov: number): number => {
	return ast / tov;
};

export const capitalizeFirstLetter = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const base64ToBlob = (base64Data: string): Blob => {
	// Split into two parts
	const parts = base64Data.split(';base64,');

	// Hold the content type
	const fileType = parts[0].split(':')[1];

	// Decode Base64 string
	const decodedData = window.atob(parts[1]);

	// Create UNIT8ARRAY of size same as row data length
	const uInt8Array = new Uint8Array(decodedData.length);

	// Insert all character code into uInt8Array
	for (let i = 0; i < decodedData.length; ++i) {
		uInt8Array[i] = decodedData.charCodeAt(i);
	}

	// Return BLOB image after conversion
	return new Blob([uInt8Array], { type: fileType });
};

export const camelize = (str: string): string => {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		})
		.replace(/\s+/g, '');
};

const requiredString = (str: string): boolean => {
	if (str && str.length > 2) return true;
	return false;
};

interface ValidatedBirthdate {
	valid: boolean;
	errors: string[];
}
const checkBirthdate = (date: Date): ValidatedBirthdate => {
	const result: ValidatedBirthdate = {
		valid: true,
		errors: []
	};
	if (!date) {
		result.valid = false;
		result.errors.push(`Birthdate is required`);
	}

	const age = getAge(date.toString());
	console.log(age);
	if (age < 18) {
		result.valid = false;
		result.errors.push(`You must be 18 years or older to register an account`);
	}
	return result;
};

interface ValidateCheckAge {
	valid: boolean;
	name: string;
}
export const checkAge = (minAge: number) => {
	return (value: Date): ValidateCheckAge => {
		const age = getAge(value.toString());
		return { valid: age >= minAge, name: `min_age` };
	};
};

export const validateNewUserForm = (formData: NewUserFormData): ValidatedFormData => {
	const result: ValidatedFormData = {
		valid: true,
		errors: []
	};

	//validate first name
	if (requiredString(formData.name.first)) {
		result.valid = false;
		result.errors.push('First name is required!');
	}

	//validate last name
	if (requiredString(formData.name.last)) {
		result.valid = false;
		result.errors.push('Last name is required!');
	}

	//validate birthdate
	const { valid, errors } = checkBirthdate(formData.birthdate);
	if (!valid) {
		result.valid = false;
		result.errors = result.errors.concat(errors);
	}
	return result;
};

function padZero(str: string, len?: number) {
	len = len || 2;
	const zeros = new Array(len).join('0');
	return (zeros + str).slice(-len);
}

export const invertColor = (hex: string, bw?: boolean): string => {
	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}
	/* convert 3-digit hex to 6-digits */
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	if (hex.length !== 6) {
		throw new Error('Invalid HEX color.');
	}
	let r: string | number = parseInt(hex.slice(0, 2), 16),
		g: string | number = parseInt(hex.slice(2, 4), 16),
		b: string | number = parseInt(hex.slice(4, 6), 16);

	/* See: https://stackoverflow.com/a/3943023/112731 */
	if (bw) {
		return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
	}
	r = (255 - r).toString(16);
	g = (255 - g).toString(16);
	b = (255 - b).toString(16);

	/* pad result */
	return '#' + padZero(r) + padZero(g) + padZero(b);
};

export const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export const getImgSize = (srcStr: string): number => {
	const hrefSplit = srcStr.split('/')[srcStr.split('/').length - 1].split('.')[0].split('-');
	return parseInt(hrefSplit[hrefSplit.length - 1]);
};

