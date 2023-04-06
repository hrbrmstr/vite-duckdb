export function describeObject(obj) {
	const keys = Object.keys(obj);
	const numKeys = keys.length;
	const type = Array.isArray(obj) ? 'array' : typeof obj;
	const className = Object.prototype.toString.call(obj).slice(8, -1); // Get class name using toString()

	if (numKeys === 0) {
		return `This is an empty ${type}`;
	}

	let description = `This ${type} (${className}) has ${numKeys} key${numKeys === 1 ? '' : 's'}: \n`;

	for (let i = 0; i < numKeys; i++) {
		const key = keys[ i ];
		const value = obj[ key ];
		const valueType = typeof value;
		const isArray = Array.isArray(value);
		const isObject = valueType === 'object' && value !== null && !isArray;

		description += `  ${key}: `;

		if (isObject) {
			description += `an object with ${Object.keys(value).length} key${numKeys === 1 ? '' : 's'}`;
		} else if (isArray) {
			description += `an array with ${value.length} element${value.length === 1 ? '' : 's'}`;
		} else {
			description += `${valueType}`;
		}

		description += '\n';
	}

	return description;
}