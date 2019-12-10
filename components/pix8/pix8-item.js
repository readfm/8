//import {styleSheets} from '../styling.js';
import account from '../../src/account.js';
import {fix4name} from '../../src/utilities/item.js';
import servers from '../../src/data/servers.js';
import {find2define} from '../../src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;

import { LitElement, html, css } from "../../node_mod/lit-element/lit-element.js";

import fractal_item from '../fractal-item/component.js';

const url = new URL(import.meta.url);

export default class Component extends fractal_item{

  static get is(){
    return 'pix8-item';
  }

  static get styles(){
    return [css`
        #lst{
          opacity: 0;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background-color: #2228;
          backdrop-filter:  blur(5px);
          transition: opacity .4s;
          color: white;
          padding: 2px 4px;
        }

        main:hover #lst, main:focus-within #lst{
          opacity: 1;
        }

        #media{
          height: 100%;
          display: inline-block;
        }
    `];
  }

 render(){
    return html`
      <link rel="stylesheet" href="//${url.host}/components/fractal-item/style.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <main>
        <fractal-media id='media' @click='${this.activate}' src=${this.src} view='${this.activated?'carousel':'fill'}'></fractal-media>

        ${this.item.type == 'list'?html`
          <div id='lst' contentEditable></div>
        `:''}
        <slot></slot>
      </main>
    `;
  }
};


window.customElements.define(Component.is, Component);