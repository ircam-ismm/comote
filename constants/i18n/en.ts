const openAppSettings = 'Open App settings';

export default {
  nav: {
    home: 'Home',
    play: 'Play',
    settings: 'Settings',
    qrcode: 'QR Code',
    webview: 'WebView',
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
    sensors: {
        header: 'Sensors',
        accelerometer: 'Accelerometer',
        gyroscope: 'Gyroscope',
        magnetometer: 'Magnetometer',
        heading: 'Heading',
        isAvailable: 'Available',
        isNotAvailable: 'Not available',
        openSettings: openAppSettings,
    },
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
    openSettings: openAppSettings,
  },
  webview: {
    header: 'WebView',
  },
  about: {
    header: 'About CoMote',
    developedBy: `CoMote and the KORAL extension are developed by the STMS-Lab (Ircam-CNRS-Sorbonne Université-Ministère de la Culture) in partnership with the Arts Convergences association.`,
    producedBy: `With the support of: Fondation MAAF, Fondation Falret, Département des Yvelines.`,
    producedByUntil12: `Until version 1.2 CoMote was supported by: Éducation Nationale (Edu-up) and Agence Nationale de la Recherche (ELEMENT project).`,
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
