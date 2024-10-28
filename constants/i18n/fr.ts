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
    webview: {
      header: 'WebView',
      url: 'URL',
      urlPlaceholder: 'http://192.168.1.100/webview',
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
    developedBy: `CoMote et l’extension KORAL sont développées par l'Unité Mixte de Recherche STMS (Ircam-CNRS-Sorbonne Université-Ministère de la Culture) en partenariat avec l’association Arts Convergences.`,
    producedBy: `Avec le soutien de : Fondation MAAF, Fondation Falret, Département des Yvelines. `,
    producedByUntil12: `Jusqu'à la version 1.2 CoMote a été réalisé avec le soutien de: Éducation Nationale (Edu-up) et Agence Nationale de la Recherche (projet ELEMENT).`,
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
