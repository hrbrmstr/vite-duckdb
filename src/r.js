import { WebR } from '@r-wasm/webr'

// this can be accessed everywhere as "webR"
globalThis.webR = new WebR();
await globalThis.webR.init();

export const webR = globalThis.webR;

/**
 * This is a [Tag Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)
 * 
 * @param {strings[]} strings 
 * @param  {...any} values 
 * @returns a WebR toJs() object
 * @example
 * await R`sample(100, 5)`
 */
globalThis.R = async function R(strings, ...values) {

	const [ options ] = values;

	let result = "";
	for (let i = 0; i < strings.length; i++) {
		result += strings[ i ];
	}
	
	let res, tmp;
	if (options === undefined) {
		tmp = await webR.evalR(result)
		if (typeof tmp == "function") return tmp
	} else {
		tmp = await webR.evalR(result, options)
	}
	res = simplifyRJs(await tmp.toJs())

	let ret = res

	return Promise.resolve(ret)

}

export function simplifyRJs(obj) {
	// if the result is a single char/dbl/bool/int then return a plain value
	// if it's an unnamed vector then return a typed array
	// if function, return w/o running toJs()
	let ret = obj;
	if ([ 'character', 'double', 'logical', 'integer' ].includes(obj.type)) {
		if (obj.names === null) {
			if (obj.values.length <= 1) {
				ret = obj.values[ 0 ]
			} else {
				ret = obj.values
			}
		}
	}
	return ret
}

export const R = globalThis.R