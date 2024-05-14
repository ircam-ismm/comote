const openAppSettings = `Apri le impostazioni dell'applicazione`;

export default {
  nav: {
    home: `Home`,
    play: 'Esegui',
    settings: 'Impostazioni',
    qrcode: 'QR Code',
    webview: 'WebView',
    about: 'Informazioni',
  },
  home: {
    play: 'Esegui',
    settings: 'Impostazioni',
    qrcode: 'QR Code',
  },
  play: {
    header: 'Esegui',
    a: 'A',
    b: 'B',
    lock: `Blocca lo schermo (premere a lungo...)`,
    unlock: `Sblocca lo schermo (premere a lungo...)`,
  },
  settings: {
    header: 'Impostazioni',
    scanQrCode: 'Configura da QR Code',
    sensors: {
        header: 'Sensori',
        accelerometer: 'Accelerometro',
        gyroscope: 'Giroscopio',
        magnetometer: 'Magnetometro',
        heading: 'Bussola',
        isAvailable: 'Disponibile',
        isNotAvailable: 'Non disponibile',
        openSettings: openAppSettings,
    },
    general: {
      header: 'Generale',
      id: 'Id',
      period: 'Periodo',
      estimated: 'Stimati',
    },
    websocket: {
      header: 'WebSocket',
      activate: 'Attiva',
      status: 'Stato',
      url: 'URL',
      urlPlaceholder: 'ws://websocket.server.ip:port',
    },
    osc: {
      header: 'OSC',
      activate: 'Attiva',
      status: 'Stato',
      hostname: 'Hostname',
      hostnamePlaceholder: 'osc.server.ip',
      port: 'Port',
      portPlaceholder: 'port',
      url: 'URL',
      urlPlaceholder: 'udp://osc.server.ip:port',
    },
  },
  qrcode: {
    header: 'Scansiona QR Code',
    requestingPermission: `Richiesta di autorizzazione per la fotocamera...`,
    noPermission: `Permesso di accesso alla fotocamera negato.`,
    waitingCamera: `In attesa della fotocamera...`,
    openSettings: openAppSettings,
  },
  webview: {
    header: 'WebView',
  },
  about: {
    header: `Informazioni su CoMote`,
    developedBy: `CoMote è sviluppato dall'unità mista di ricerca STMS : Ircam-CNRS-Università della Sorbonne-Ministero della Cultura Francese.`,
    producedBy: `Con il sostegno di: Ministero dell'Educazione Nazionale (Edu-up), ANR (progetto ELEMENT), Arts Convergences.`,
    privacyPolicy: 'Politica di confidenzialità',
    privacyPolicyLink: 'https://ismm-apps.ircam.fr/comote-privacy-policy-it',
  },
  connectionStatus: {
    ws: {
      closed: 'DISCONNESSO',
      closing: 'DISCONNESSO',
      connectingRequest: 'CONNESSIONE',
      connecting: 'CONNESSIONE',
      open: 'CONNESSO',
    },
    osc: {
      closed: 'SOSPESO',
      openingRequest: 'APERTURA',
      opening: 'APERTURA',
      open: 'INVIO',
    }
  }
};
