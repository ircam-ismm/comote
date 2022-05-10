import { AbstractExperience } from '@soundworks/core/client';
import { render, html, nothing } from 'lit-html';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';

const SOCKET_PORT = 8901;

class PlayerExperience extends AbstractExperience {
  constructor(client, config, $container) {
    super(client);

    this.config = config;
    this.$container = $container;
    this.rafId = null;

    // require plugins if needed

    renderInitializationScreens(client, config, $container);
  }

  async start() {
    super.start();

    window.addEventListener('resize', () => this.render());

    // // Create WebSocket connection.
    // const {hostname} = window.location;
    // const socket = new WebSocket(`ws://${hostname}:${SOCKET_PORT}`);

    // // Connection opened
    // socket.addEventListener('open', (event) => {
    //   console.log('open socket');
    //   socket.send('Hello Server!');
    // });

    // // Listen for messages
    // socket.addEventListener('message', (event) => {
    //   if(event.data instanceof Blob) {
    //     event.data.text().then( text => {
    //       console.log('Binary Blob message from server: ', text );
    //     });
    //   } else if(event.data instanceof ArrayBuffer) {
    //     event.data.text().then( text => {
    //       console.log('Binary ArrayBuffer message from server: ', text );
    //     });
    //   } else {
    //     console.log('Message from server:', event.data);
    //   }
    // });

    this.infos = await this.client.stateManager.attach('infos');
    this.infos.subscribe(() => this.render());

    this.render();
  }

  render() {
    // debounce with requestAnimationFrame
    window.cancelAnimationFrame(this.rafId);

    this.rafId = window.requestAnimationFrame(() => {
      render(html`
        <div style="padding: 20px">
          <h1 style="margin: 20px 0">SSID: ${this.infos.get('ssid')}</h1>
          <h1 style="margin: 20px 0">IP: ${this.infos.get('ip')}</h1>

          ${this.infos.get('wsQRCode') ?
            html`
              <div>
                <h2 style="margin: 20px 0">Connect WebSocket</h2>
                <img src="${this.infos.get('wsQRCode')}" />
              </div>
            `
          : nothing}

          ${this.infos.get('oscQRCode') ?
            html`
              <div>
                <h2 style="margin: 20px 0">Connect OSC</h2>
                <img src="${this.infos.get('oscQRCode')}" />
              </div>
            `
          : nothing}

          <pre><code>${JSON.stringify(this.infos.get('data'), null, 2)}</code></pre>
        </div>
      `, this.$container);
    });
  }
}

export default PlayerExperience;
