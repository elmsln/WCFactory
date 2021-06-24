import { LitElement, html } from "lit";
import {Router} from '@vaadin/router';
import './wcfactory-ui-factories.js'
import './wcfactory-ui-factory.js'
import './wcfactory-ui-404.js'
import './wcfactory-ui-active-scripts.js'
import './wcfactory-ui-desktop-tabs.js'
import './wcfactory-ui-terminal.js'
import './wcfactory-ui-factory-create.js'
import './wcfactory-ui-element-create.js'
import { subscribeToOperationsOutput } from '../subscriptions/operationsOutput.js'
import { subscribeToFactoryUpdates } from '../subscriptions/factoryUpdate.js'

class WCFactoryUI extends LitElement {
  firstUpdated() {
    this.routerSetup()
    subscribeToOperationsOutput()
    subscribeToFactoryUpdates()
  }

  render() {
    return html`
      <style>
        :host {
          --list-item-hover-background: rgba(255,255,255, 0.1);
        }
        h1 a {
          color: inherit;
          text-decoration: inherit;
        }
      </style>
      <style>
        :host {
          display: block;
          max-width: 900px;
          margin: auto;
        }
        h1 {
          text-align: center;
          margin-bottom: 5vw
        }
      </style>
      <h1><a href="/">WCFactory</a></h1>
      <div id="router-outlet"></div>

      <wcfactory-ui-active-scripts></wcfactory-ui-active-scripts>
    `;  
  }

  /**
   * Sets up the router
   */
  routerSetup() {
    const outlet = this.shadowRoot.getElementById('router-outlet')
    const router = new Router(outlet);
    router.setRoutes([
      {path: '/', component: 'wcfactory-ui-factories'},
      {path: '/factories', component: 'wcfactory-ui-factory'},
      {path: '/factories/create', component: 'wcfactory-ui-factory-create'},
      {path: '/factories/:factory', component: 'wcfactory-ui-factory'},
      {path: '/factories/:factory/create-element', component: 'wcfactory-ui-element-create'},
      {path: '(.*)', component: 'wcfactory-ui-404'},
    ]);
  }
}

customElements.define('wcfactory-ui', WCFactoryUI);