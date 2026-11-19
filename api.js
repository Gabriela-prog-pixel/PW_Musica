/* BLOQUE 1: constantes y petición con tiempo límite */
const API_BASE = 'https://api.lyrics.ovh';
const TIEMPO_ESPERA = 15000; // 15 segundos
const cacheLetras = {};      // letras ya pedidas

const fetchConTiempo = async (url) => {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA);
    try {
        return await fetch(url, { signal: controlador.signal });
    } finally {
        clearTimeout(temporizador);
    }
};

/* BLOQUE 2: buscar canciones por una palabra clave */
const buscarCancionesPorPalabra = async (palabra) => {
    const respuesta = await fetchConTiempo(`${API_BASE}/suggest/${encodeURIComponent(palabra)}`);
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al buscar «${palabra}»`);
    const datos = await respuesta.json();
    return (datos.data || []).map((item) => ({
        id: item.id,
        titulo: item.title,
        artista: item.artist?.name ?? 'Artista desconocido',
        album: item.album?.title ?? '',
        portada: item.album?.cover_medium ?? item.album?.cover ?? '',
        portadaGrande: item.album?.cover_big ?? item.album?.cover_medium ?? '',
        preview: item.preview ?? ''
    }));
};

/* BLOQUE 3: pedir la letra (devuelve texto o null si no existe) */
const limpiarTitulo = (titulo) => titulo.replace(/\(.*?\)|\[.*?\]/g, '').split(' - ')[0].trim();

const obtenerLetra = async (cancion) => {
    const clave = `${cancion.artista}|${cancion.titulo}`;
    if (clave in cacheLetras) return cacheLetras[clave];
    const url = `${API_BASE}/v1/${encodeURIComponent(cancion.artista)}/${encodeURIComponent(limpiarTitulo(cancion.titulo))}`;
    const respuesta = await fetchConTiempo(url);
    if (respuesta.status === 404) { cacheLetras[clave] = null; return null; }
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al pedir la letra`);
    const datos = await respuesta.json();
    const letra = datos.error ? '' : (datos.lyrics || '').trim();
    cacheLetras[clave] = letra || null;
    return cacheLetras[clave];
};
