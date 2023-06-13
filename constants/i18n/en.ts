export default {
  nav: {
    home: 'Home',
    play: 'Play',
    settings: 'Settings',
    qrcode: 'QR Code',
    about: 'About',
  },
  home: {
    play: 'Play',
    settings: 'Settings',
    qrcode: 'QR Code',
  },
  play: {
    header: 'Play',
    a: 'A',
    b: 'B',
    lock: 'Lock the screen (press for a while...)',
    unlock: 'Unlock the screen (press for a while...)',
  },
  settings: {
    header: 'Settings',
    scanQrCode: 'Scan config from QRCode',
    general: {
      header: 'General',
      id: 'Id',
      period: 'Period',
    },
    websocket: {
      header: 'WebSocket',
      activate: 'Activate',
      status: 'Status',
      url: 'URL',
      urlPlaceholder: 'ws://websocket.server.ip:port',
    },
    osc: {
      header: 'OSC',
      activate: 'Activate',
      status: 'Status',
      url: 'URL',
      urlPlaceholder: 'udp://osc.server.ip:port',
    },
  },
  qrcode: {
    header: 'Scan QR Code',
    requestingPermission: 'Requesting for camera permission...',
    noPermission: 'No permission to access camera.',
    waitingCamera: 'Waiting for camera...',
    openSettings: 'Open App settings',
  },
  about: {
    header: 'About CoMote',
    developedBy: `CoMote is developed by Ircam and the Music and Sound Science and Technology Joint Research Unit (STMS), supported by Ircam, CNRS, the French Ministry of Culture and Sorbonne University.`,
    producedBy: `Produced with the support of the French Ministry of Education, Youth and Sports (Edu-up system), the National Research Agency (ELEMENT project), and in partnership with Radio France.`,
    privacyPolicy: 'Privacy Policy',
    privacyPolicyLink: 'https://ismm-apps.ircam.fr/comote-privacy-policy',
  },
  connectionStatus: {
    ws: {
      closed: 'DISCONNECTED',
      closing: 'DISCONNECTED',
      connectingRequest: 'CONNECTING',
      connecting: 'CONNECTING',
      open: 'CONNECTED',
    },
    osc: {
      closed: 'OFF',
      openingRequest: 'OPENING',
      opening: 'OPENING',
      open: 'STREAMING',
    }
  }
};
