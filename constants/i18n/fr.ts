const openAppSettings = `Ouvrir les paramètres de l'application`;

export default {
  "NSCameraUsageDescription": "Autoriser $(PRODUCT_NAME) à utiliser la caméra pour scanner des codes QR.",
  "NSLocalNetworkUsageDescription": "Autoriser $(PRODUCT_NAME) à accéder au réseau local pour transmettre les données des capteurs.",
  "NSLocationAlwaysAndWhenInUseUsageDescription": "Autoriser $(PRODUCT_NAME) à accéder à la position pour calculer la boussole et l'utiliser comme capteur.",
  "NSLocationWhenInUseUsageDescription": "Autoriser $(PRODUCT_NAME) à accéder à la position pour calculer la boussole et l'utiliser comme capteur.",
  "NSMotionUsageDescription": "Autoriser $(PRODUCT_NAME) à accéder l'accéléromètre pour l'utiliser comme capteur.",
  nav: {
    home: 'Accueil',
    settings: 'Réglages',
    qrcode: 'QR Code',
    webview: 'WebView',
    about: 'À propos',
  },
  home: {
    header: 'Accueil',
    a: 'A',
    b: 'B',
    lock: `Verrouiller l'écran (appuyer longtemps...)`,
    unlock: `Déverrouiller l'écran (appuyer longtemps...)`,
  },
  settings: {
    header: 'Réglages',
    outputApiChange: "Merci de noter que la version 3 de CoMote utilise un format différent de celui de la version 2. Merci de consulter la documentation.",
    outputApiAvailable: "Voir ci-dessous pour un mode de compatibilité temporaire.",
    scanQrCode: 'Scanner depuis un QR Code',
    sensors: {
        header: 'Capteurs',
        accelerometer: 'Accéléromètre',
        gyroscope: 'Gyroscope',
        magnetometer: 'Magnétomètre',
        heading: 'Cap',
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
    outputApi: {
      header: 'Mode de compatibilité version 2',
      activate: 'Activer',
      notice: 'Note',
      deprecationNotice: 'Ce mode est obsolète et sera supprimé dans les versions futures.',
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
    comoteWebsite: 'Site Web de CoMote',
    developedBy: `CoMote et l’extension KORAL sont développées par l'Unité Mixte de Recherche STMS (Ircam-CNRS-Sorbonne Université-Ministère de la Culture) en partenariat avec l’association Arts Convergences.`,
    producedBy: `Avec le soutien de : Fondation MAAF, Fondation Falret, Département des Yvelines, et la Fondation Afnic (sour l'égide de la Fondation de France). `,
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
