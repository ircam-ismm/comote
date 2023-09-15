export default {
  nav: {
    home: `Home`,
    play: 'Esegui',
    settings: 'Impostazioni',
    qrcode: 'QR Code',
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
      url: 'URL',
      urlPlaceholder: 'udp://osc.server.ip:port',
    },
  },
  qrcode: {
    header: 'Scansiona QR Code',
    requestingPermission: `Richiesta di autorizzazione per la fotocamera...`,
    noPermission: `Permesso di accesso alla fotocamera negato.`,
    waitingCamera: `In attesa della fotocamera...`,
    openSettings: `Apri le impostazioni dell'applicazione`,
  },
  about: {
    header: `Informazioni su CoMote`,
    developedBy: `CoMote è sviluppato dall'Ircam e dall'unità mista di ricerca STMS, che è sostenuta dall'Ircam, dal CNRS, dal Ministero della Cultura Francese e dall'Università della Sorbonne.`,
    producedBy: `Realizzato con il sostegno del dispositivo Édu-up del Ministero dell'Educazione Nazionale, dell'Agenzia Nazionale della Ricerca (progetto ELEMENT), e in collaborazione con Radio France.`,
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
