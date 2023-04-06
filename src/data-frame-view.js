import { LitElement, css, html } from 'lit'
import { when } from 'lit/directives/when.js';
import { range, create } from "d3"

function simple_table(data) {

	// Create table element
	const table = document.createElement('table');

	// Add table headers
	const headerRow = document.createElement('tr');
	for (const key in data[ 0 ]) {
		const header = document.createElement('th');
		header.textContent = key;
		headerRow.appendChild(header);
	}
	table.appendChild(headerRow);

	// Add table rows
	data.forEach((rowObj) => {
		const row = document.createElement('tr');
		for (const key in rowObj) {
			const cell = document.createElement('td');
			cell.textContent = rowObj[ key ];
			row.appendChild(cell);
		}
		table.appendChild(row);
	});

	return table;

}

export class DataFrameView extends LitElement {

	static properties = {
		id: { type: String },
		label: { type: String },
		dataFrame: { type: Array },
		columns: { type: Array }
	};

	constructor() {
		super()
		this.label = ''
		this.columns = [] 
		this.dataFrame = null
	}

	render() {

		return when(

			this.dataFrame,

			() => html`
			<h3>${this.label}</h3>
			<div id="tbl">
			${simple_table(this.dataFrame)}
			</div>`,

			() => html`<div id="${this.id}"></div>`

		)

	}

	static styles = [
		css`
			:host {
				display: block;
			}
			:host div#tbl {
				overflow-y: scroll;
				height: 300px;
				scrollbar-width: none;
			}
			:host div#tbl::-webkit-scrollbar { 
				display: none;
			}
			:host table {
				font-family: var(--font-family-monospace, monospace);
			}
			:host th {
				text-align: right;
				padding-right: 12px;
				padding-left: 12px;
			}
			:host td {
				text-align: right;
				padding-right: 12px;
				padding-left: 12px;
			}
		`
	];

}

window.customElements.define('data-frame-view', DataFrameView)
