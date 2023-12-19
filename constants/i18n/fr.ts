export default {
  nav: {
    home: 'Accueil',
    play: 'Jouer',
    settings: 'Réglages',
    qrcode: 'QR Code',
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
    openSettings: `Ouvrir les paramètres de l'application`,
  },
  about: {
    header: 'À propos de CoMote',
    developedBy: `CoMote est développée par l'Ircam et l'unité mixte de recherche STMS soutenue par l'Ircam, le CNRS, le ministère de la Culture et Sorbonne Université.`,
    producedBy: `Réalisée initialement avec le soutien du dispositif Édu-up du ministère de l'Éducation Nationale, de l'Agence Nationale de la Recherche (projet ELEMENT), et en partenariat avec Radio France. À partir de v1.3, l'application est développée en partenariat avec l'association Arts Convergences. `,
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
