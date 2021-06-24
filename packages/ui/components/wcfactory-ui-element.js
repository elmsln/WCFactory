import { LitElement, html } from "lit";
import gql from 'graphql-tag'
import './wcfactory-ui-scripts.js'
import './wcfactory-ui-location.js'
import client from '../client.js'

class WCFactoryUIElement extends LitElement {
  static get properties() {
    return {
      element: { type: Object }
    }
  }

  constructor() {
    super()
    this.element = {}
  }

  render() {
    return html`
      <style>
        :host {
          display: flex;
          background: var(--wcfactory-ui-secondary-color);
          padding: 10px;
          min-height: 100px;
          flex-direction: column;
        }
        button {
          font-family: inherit;
          border: none;
          margin: 0;
          padding: 0;
          background: none;
          color: inherit;
          cursor: pointer
        }
        button:hover, button:focus {
          color: white;
        }
        #header {
          display: flex;
          align-items: center;
        }
        #header > * {
          margin: 0 .5em;
        }
        #title {
          flex: 1 1 auto;
        }
        #middle {
          flex: 1 1 auto;
          font-size: 14px;
          opacity: 0.7;
          font-family: inherit;
          border: none;
          margin: 0;
          padding: 0;
          background: none;
          color: inherit;
          margin: 10px 0;
        }
        #location {
          font-size: 14px;
          opacity: 0.7;
          font-family: inherit;
          border: none;
          margin: 0;
          padding: 0;
          background: none;
          color: inherit;
          cursor: pointer;
        }
      </style>
      <div id="header">
        <div id="title"> ${this.element.name} </div>
        <div id="location">
          <wcfactory-ui-location .location=${this.element.location}></wcfactory-ui-location>
        </div>
        <div id="version"> 📦${this.element.version} </div>
      </div>
      <div id="middle">
        <wcfactory-ui-scripts .scripts=${this.element.scripts} .location=${this.element.location}></wcfactory-ui-scripts>
      </div>
      <div id="footer">
      </div>
    `;
  }
}

customElements.define('wcfactory-ui-element', WCFactoryUIElement);