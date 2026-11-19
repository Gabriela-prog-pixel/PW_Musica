const EMOCIONES = {
  alegria: {
    nombre: "Alegría",
    frase: "para cuando todo brilla",
    palabras: ["feliz", "alegría", "bailar", "sonrisa", "happy", "sunshine"],
  },

  amor: {
    nombre: "Amor",
    frase: "para cuando el corazón late",
    palabras: ["amor", "enamorado", "corazón", "besos", "love", "darling"],
  },

  esperanza: {
    nombre: "Esperanza",
    frase: "para cuando algo mejor llega",
    palabras: ["esperanza", "luz", "volar", "sueños", "hope", "rise"],
  },

  tristeza: {
    nombre: "Tristeza",
    frase: "para cuando duele un poco",
    palabras: ["llorar", "lágrimas", "tristeza", "sad", "cry", "alone"],
  },

  nostalgia: {
    nombre: "Nostalgia",
    frase: "para cuando se extraña el ayer",
    palabras: [
      "recuerdos",
      "ayer",
      "volver",
      "extrañar",
      "memories",
      "yesterday",
    ],
  },

  calma: {
    nombre: "Calma",
    frase: "para cuando todo se detiene",
    palabras: ["calma", "paz", "silencio", "peace", "calm", "easy"],
  },

  enojo: {
    nombre: "Enojo",
    frase: "para cuando ya es suficiente",
    palabras: ["rabia", "furia", "basta", "angry", "scream", "fire"],
  },

  miedo: {
    nombre: "Miedo y ansiedad",
    frase: "para cuando todo da vueltas",
    palabras: ["miedo", "oscuridad", "nervios", "fear", "afraid", "breathe"],
  },
};

/* BLOQUE 2: temas (palabra de búsqueda y pistas en la situación) */

const TEMAS = [
  {
    palabraBusqueda: "amor",
    pistas: [
      "amor",
      "novio",
      "novia",
      "pareja",
      "enamorado",
      "enamorada",
      "beso",
      "besos",
    ],
  },

  {
    palabraBusqueda: "adiós",
    pistas: [
      "adios",
      "terminamos",
      "termine",
      "ruptura",
      "despedida",
      "separacion",
      "perdida",
    ],
  },

  {
    palabraBusqueda: "familia",
    pistas: [
      "familia",
      "mama",
      "papa",
      "madre",
      "padre",
      "hermano",
      "hermana",
      "abuelos",
      "abuela",
      "abuelo",
    ],
  },

  {
    palabraBusqueda: "amigos",
    pistas: ["amigo", "amiga", "amigos", "amigas", "amistad"],
  },

  {
    palabraBusqueda: "extrañar",
    pistas: [
      "extrano",
      "extrana",
      "extranar",
      "extranando",
      "recuerdo",
      "recuerdos",
      "ayer",
      "nostalgia",
    ],
  },

  {
    palabraBusqueda: "lluvia",
    pistas: ["lluvia", "llueve", "lloviendo", "tormenta", "nubes"],
  },

  {
    palabraBusqueda: "sueños",
    pistas: [
      "sueno",
      "suenos",
      "sonar",
      "meta",
      "metas",
      "futuro",
      "logro",
      "logros",
    ],
  },

  {
    palabraBusqueda: "soledad",
    pistas: ["solo", "sola", "soledad", "aislado", "aislada"],
  },

  {
    palabraBusqueda: "libertad",
    pistas: ["libre", "libertad", "viaje", "viajar", "escapar", "camino"],
  },

  {
    palabraBusqueda: "fiesta",
    pistas: ["fiesta", "celebrar", "celebracion", "bailar", "cumpleanos"],
  },

  {
    palabraBusqueda: "noche",
    pistas: ["noche", "madrugada", "luna", "estrellas", "insomnio"],
  },
];
