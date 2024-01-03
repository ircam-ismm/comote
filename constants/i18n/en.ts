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
      estimated: 'Estimated',
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
      hostname: 'Hostname',
      hostnamePlaceholder: 'osc.server.ip',
      port: 'Port',
      portPlaceholder: 'port',
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
    developedBy: `CoMote is developed by the  STMS lab: Ircam-CNRS-Sorbonne University-French Ministry of Culture.`,
    producedBy: `With the support of: French Ministry of Education (Edu-up), ANR (ELEMENT project) and Arts Convergences.`,
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
