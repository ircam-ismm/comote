const openAppSettings = 'Open App settings';

export default {
  nav: {
    home: 'Home',
    settings: 'Settings',
    qrcode: 'QR Code',
    webview: 'WebView',
    about: 'About',
  },
  home: {
    header: 'Home',
    a: 'A',
    b: 'B',
    lock: 'Lock the screen (press for a while...)',
    unlock: 'Unlock the screen (press for a while...)',
  },
  settings: {
    header: 'Settings',
    v3FormatChange: 'Please note that the version 3 of CoMote uses a different format than the version 2. Please refer to the documentation.',
    v2CompatibilityModeAvailable: 'See below for a temporary compatibility mode.',
    comoteWebsite: 'CoMote Website',
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
    webview: {
      header: 'WebView',
      url: 'URL',
      urlPlaceholder: 'http://192.168.1.100/webview',
    },
    v2CompatibilityMode: {
      header: 'Version 2 Compatibility Mode',
      activate: 'Activate',
      notice: 'Note',
      deprecationNotice: 'This mode is deprecated and will be removed in future versions.',
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
    comoteWebsite: 'CoMote Website',
    developedBy: `CoMote and the KORAL extension are developed by the STMS-Lab (Ircam-CNRS-Sorbonne Université-Ministère de la Culture) in partnership with the Arts Convergences association.`,
    producedBy: `With the support of: Fondation MAAF, Fondation Falret, Département des Yvelines and Foundation Afnic (Fondation de France).`,
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
