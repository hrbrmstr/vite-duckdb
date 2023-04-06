import { Library, FileAttachments } from 'https://cdn.jsdelivr.net/npm/@observablehq/stdlib@5.5.1/+esm'

export const { DuckDBClient } = new Library()

/**
 * Turn a DuckDB resultset into a JS Array
 * 
 * @param {DuckDB resultset} res 
 * @returns {Array}
 */
export function ddbResToArray(res) {
	// get column names from the schema
	const colnames = res.schema.map(d => d.name)
	// turn each row into an array and then turn that into named object
	return res.map(d => d.toArray()).map(row => Object.fromEntries(colnames.map((colname, index) => [ colname, row[ index ] ])))
}

/**
 * This will let us use Observable FileAttachment which has some benefits
 * over raw D3 ops.
 */
export const FileAttachment = FileAttachments((url) =>
	new URL(`${url}`)
);
