import dgram from 'node:dgram';
import OSC from 'osc-js';

import WebSocketServer from 'ws';

const oscServer = dgram.createSocket('udp4');

const port = process.env.PORT || 8901;

// helpers because osc-js does not properly decode messages

function timetagToTimestamp({seconds, fractions}) {
  /** 70 years in seconds */
  const SECONDS_70_YEARS = 2208988800;
  /** 2^32 */
  const TWO_POWER_32 = Math.pow(2, 32);
  return Math.round((seconds - SECONDS_70_YEARS + fractions / TWO_POWER_32) * 1e3);
}

function typesFormat(types) {
  return types.replace(/^,/, '');
}

oscServer.on('error', (err) => {
  console.error(`osc: error:\n${err.stack}`);
  oscServer.close();
});

oscServer.on('message', (data, rinfo) => {
  console.log(`osc: message: from ${rinfo.address}:${rinfo.port}`);

  try {
    const dataView = new DataView(data.buffer);
    const textDecoder = new TextDecoder('utf-8');

    if (textDecoder.decode(dataView).startsWith('#bundle')) {
      const bundle = new OSC.Bundle()
      bundle.unpack(dataView);

      const timestamp = timetagToTimestamp(bundle.timetag.value);
      const date = new Date(timestamp);
      const dateString = `${date.toLocaleString()}.${date.getMilliseconds()}`;
      bundle.bundleElements.forEach((element) => {
        console.log(
          `osc: bundle element: ${timestamp} (${dateString})`,
          `${element.address}`,
          typesFormat(element.types),
          ...element.args,
        );
      });
    } else {
      const message = new OSC.Message();
      message.unpack(dataView);
      console.log(`osc: message: ${message.address}`,
        typesFormat(message.types),
        ...message.args,
      );

    }
  } catch (error) {
    console.error(error);
  }
});


oscServer.on('listening', () => {
  const address = oscServer.address();
  console.log(`osc: server listening ${address.address}:${address.port}`);
});

oscServer.bind(port);


const webSocketServer = new WebSocketServer.Server({ port });
console.log(`ws: server listening on port ${port}`);

webSocketServer.on('connection', (socket, rinfo) => {
  socket.binaryType = 'arraybuffer';

  console.log(`ws: server connection`);

  socket.on('message', (data) => {
    let message;
    let messageType;
    try {
      if(data.buffer) {
        messageType = 'ArrayBuffer';
        message = JSON.parse(data.toString('utf-8'));
      } else {
        messageType = 'JSON';
        message = JSON.parse(data);
      }

    } catch (e) {
      messageType = 'String';
      message = data;
    }

    console.log(`ws: ${messageType} message from ${rinfo.client.remoteAddress}:`, message);
  });

  socket.on('close', () => {
    console.log(`ws: close`);
  });

});

