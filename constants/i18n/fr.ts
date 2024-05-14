const openAppSettings = `Ouvrir les paramètres de l'application`;

export default {
  nav: {
    home: 'Accueil',
    play: 'Jouer',
    settings: 'Réglages',
    qrcode: 'QR Code',
    webview: 'WebView',
    about: 'À propos',
  },
  home: {
    play: 'Jouer',
    settings: 'Réglages',
    qrcode: 'QR Code',
  },
  play: {
    header: 'Jouer',
    a: 'A',
    b: 'B',
    lock: `Verrouiller l'écran (appuyez longtemps...)`,
    unlock: `Déverrouiller l'écran (appuyez longtemps...)`,
  },
  settings: {
    header: 'Réglages',
    scanQrCode: 'Scanner depuis un QR Code',
    sensors: {
        header: 'Capteurs',
        accelerometer: 'Accéléromètre',
        gyroscope: 'Gyroscope',
        magnetometer: 'Magnétomètre',
        heading: 'Boussole',
        isAvailable: 'Disponible',
        isNotAvailable: 'Indisponible',
        openSettings: openAppSettings,
    },
    general: {
      header: 'Général',
      id: 'Id',
      period: 'Période',
      estimated: 'Estimée',
    },
    websocket: {
      header: 'WebSocket',
      activate: 'Activer',
      status: 'État',
      url: 'URL',
      urlPlaceholder: 'ws://websocket.server.ip:port',
    },
    osc: {
      header: 'OSC',
      activate: 'Activer',
      status: 'État',
      hostname: 'Hôte',
      hostnamePlaceholder: 'osc.server.ip',
      port: 'Port',
      portPlaceholder: 'port',

      url: 'URL',
      urlPlaceholder: 'udp://osc.server.ip:port',
    },
  },
  qrcode: {
    header: 'Scanner le QR Code',
    requestingPermission: `Demande d'autorisation pour la caméra...`,
    noPermission: `Aucune autorisation d'accéder à la caméra.`,
    waitingCamera: 'En attente de la caméra...',
    openSettings: openAppSettings,
  },
  webview: {
    header: 'WebView',
  },
  about: {
    header: 'À propos de CoMote',
    developedBy: `CoMote est développée par l'unité mixte de recherche STMS :Ircam-CNRS-Sorbonne Université-Ministère de la Culture.`,
    producedBy: `Avec le soutien : Éducation Nationale (Edu-up), ANR (ELEMENT project) et Arts Convergences.`,
    privacyPolicy: 'Politique de confidentialité',
    privacyPolicyLink: 'https://ismm-apps.ircam.fr/comote-privacy-policy-fr',
  },
  connectionStatus: {
    ws: {
      closed: 'DÉCONNECTÉ',
      closing: 'DÉCONNECTÉ',
      connectingRequest: 'CONNEXION',
      connecting: 'CONNEXION',
      open: 'CONNECTÉ',
    },
    osc: {
      closed: 'ARRETÉ',
      openingRequest: 'OUVERTURE',
      opening: 'OUVERTURE',
      open: 'TRANSMISSION',
    }
  }
};
