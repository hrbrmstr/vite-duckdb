import { LitElement, css, html } from 'lit'

export class SimpleMessage extends LitElement {

	static properties = {
		text: { type: String },
	};

	constructor() {
		super()
		this.text = ''
	}

	render() {
		return html`<div><pre>${this.text}</pre></div>`;
	}

	static styles = [
		css`
			:host {
				display: block;
				color: var(--component-message-color);
				font-family: var(--font-family-monospace);
			}
		`
	];

}

window.customElements.define('simple-message', SimpleMessage)
