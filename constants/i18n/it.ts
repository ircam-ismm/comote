const openAppSettings = `Apri le impostazioni dell'applicazione`;

export default {
  "NSCameraUsageDescription": "Consentire a $(PRODUCT_NAME) di utilizzare la fotocamera per la scansione di codici QR.",
  "NSLocalNetworkUsageDescription": "Consentire a $(PRODUCT_NAME) di accedere alla rete locale per trasmettere i dati del sensore.",
  "NSLocationAlwaysAndWhenInUseUsageDescription": "Consentire a $(PRODUCT_NAME) di accedere alla posizione per calcolare la bussola e utilizzarla come sensore.",
  "NSLocationWhenInUseUsageDescription": "Consentire a $(NOME PRODOTTO) di accedere alla posizione per calcolare la bussola e utilizzarla come sensore.",
  "NSMotionUsageDescription": "Consentire a $(PRODUCT_NAME) di accedere all'accelerometro per utilizzarlo come sensore.",
  nav: {
    home: `Home`,
    play: 'Esegui',
    settings: 'Impostazioni',
    qrcode: 'QR Code',
    webview: 'WebView',
    about: 'Informazioni',
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
    v3FormatChange: "Si noti che la versione 3 di CoMote utilizza un formato diverso dalla versione 2. Consultare la documentazione.",
    v2CompatibilityModeAvailable: "Vedere di seguito per una modalità di compatibilità temporanea.",
    scanQrCode: 'Configura da QR Code',
    sensors: {
        header: 'Sensori',
        accelerometer: 'Accelerometro',
        gyroscope: 'Giroscopio',
        magnetometer: 'Magnetometro',
        heading: 'Rotta',
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
    webview: {
      header: 'WebView',
      url: 'URL',
      urlPlaceholder: 'http://192.168.1.100/webview',
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
  v2CompatibilityMode: {
    header: 'Modalità di compatibilità versione 2',
    activate: 'Attiva',
    notice: 'Nota',
    deprecationNotice: 'Questa modalità è obsoleta e sarà rimossa nelle versioni future.',
  },
  about: {
    header: `Informazioni su CoMote`,
    comoteWebsite: 'Sito web di CoMote',
    developedBy: `CoMote e l'estensione KORAL sono sviluppati dall'unità di ricerca STMS-Lab (Ircam-CNRS-Sorbonne Université-Ministère de la Culture) in collaborazione con l'associazione Arts Convergences.`,
    producedBy: `Con il sostegno di : Fondation MAAF, Fondation Falret, Département des Yvelines, Fondation Afnic (Fondation de France).`,
    producedByUntil12: `Fino alla versione 1.2 CoMote è stato realizzato con il sostegno di : Éducation Nationale (Edu-up) e Agence Nationale de la Recherche (progetto ELEMENT).`,
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
