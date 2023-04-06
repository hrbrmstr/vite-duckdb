import { LitElement, css, html } from 'lit'

export class StatusMessage extends LitElement {

	static properties = {
		text: { type: String },
	};

	constructor() {
		super()
		this.text = ''
	}

	render() {
		return html`<div>${crossOriginIsolated ? '🔵' : '🌕'} ${this.text}</div>`;
	}

	static styles = [
		css`
			:host {
				display: block;
				color: var(--component-message-color);
				font-family: monospace;
			}
		`
	];

}

window.customElements.define('status-message', StatusMessage)
