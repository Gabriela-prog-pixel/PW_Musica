/* BLOQUE 1: constantes, estado y referencias al DOM */
const MAX_EMOCIONES = 3;   // emociones que se pueden elegir
const MAX_PALABRAS = 4;    // palabras clave por búsqueda
const MAX_CANCIONES = 9;   // tarjetas que se muestran

let emocionesElegidas = []; // claves: ['tristeza', 'amor']
let cancionesActuales = [];
let idBusqueda = 0;         // para ignorar búsquedas viejas
let indiceVista = -1;       // canción abierta en la vista ampliada
let idCargaLetra = 0;       // para ignorar letras viejas
let temporizadorNotificacion;

const form = document.getElementById('feeling-form');
const inputSituacion = document.getElementById('situacion');
const gridEmociones = document.getElementById('emociones-grid');
const contadorEmociones = document.getElementById('emociones-contador');
const botonBuscar = document.getElementById('submit-btn');
const zonaEstado = document.getElementById('status');
const resultsSection = document.getElementById('results-section');
const keywordsInfo = document.getElementById('keywords-info');
const songsGrid = document.getElementById('songs-grid');
const notification = document.getElementById('notification');
const vista = document.getElementById('vista-cancion');
const vistaFondo = document.getElementById('vista-fondo');
const vistaPortada = document.getElementById('vista-portada');
const vistaTitulo = document.getElementById('vista-titulo');
const vistaArtista = document.getElementById('vista-artista');
const vistaInfo = document.getElementById('vista-info');
const vistaAudio = document.getElementById('vista-audio');
const vistaLetra = document.getElementById('vista-letra');
const vistaCerrar = document.getElementById('vista-cerrar');
const vistaAnterior = document.getElementById('vista-anterior');
const vistaSiguiente = document.getElementById('vista-siguiente');

/* BLOQUE 2: funciones auxiliares */
const normalizar = (texto) => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const mezclar = (lista) => {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
};

// textContent (no innerHTML): los títulos vienen de internet y se tratan solo como texto
const crearElemento = (etiqueta, clase, texto = '') => {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
};

const mostrarNotificacion = (mensaje, tipo = 'success') => {
    notification.textContent = mensaje;
    notification.className = 'notification';
    if (tipo === 'error') notification.classList.add('notification--error');
    notification.classList.add('notification--show');
    clearTimeout(temporizadorNotificacion);
    temporizadorNotificacion = setTimeout(() => notification.classList.remove('notification--show'), 3000);
};

const mostrarEstado = (mensaje, esError = false) => {
    zonaEstado.textContent = mensaje;
    zonaEstado.className = esError ? 'estado estado--error' : 'estado';
};

/* BLOQUE 3: tarjetas de emoción (se puede elegir más de una) */
const actualizarTarjetasEmocion = () => {
    const llena = emocionesElegidas.length >= MAX_EMOCIONES;
    gridEmociones.querySelectorAll('.emocion-card').forEach((boton) => {
        const elegida = emocionesElegidas.includes(boton.dataset.emocion);
        boton.setAttribute('aria-pressed', String(elegida));
        boton.classList.toggle('emocion-card--elegida', elegida);
        boton.classList.toggle('emocion-card--bloqueada', llena && !elegida);
    });
    contadorEmociones.textContent = `Elegiste ${emocionesElegidas.length} de ${MAX_EMOCIONES}`;
};

const alternarEmocion = (clave) => {
    if (emocionesElegidas.includes(clave)) {
        emocionesElegidas = emocionesElegidas.filter((c) => c !== clave);
    } else if (emocionesElegidas.length < MAX_EMOCIONES) {
        emocionesElegidas.push(clave);
    } else {
        mostrarNotificacion(`Puedes elegir hasta ${MAX_EMOCIONES} emociones`, 'error');
        return;
    }
    actualizarTarjetasEmocion();
};

const crearTarjetasEmocion = () => {
    Object.entries(EMOCIONES).forEach(([clave, { nombre, frase }]) => {
        const boton = crearElemento('button', 'emocion-card');
        boton.type = 'button';
        boton.dataset.emocion = clave; // el CSS usa esto para poner el color
        boton.appendChild(crearElemento('span', 'emocion-card__nombre', nombre));
        boton.appendChild(crearElemento('span', 'emocion-card__frase', frase));
        boton.addEventListener('click', () => alternarEmocion(clave));
        gridEmociones.appendChild(boton);
    });
    actualizarTarjetasEmocion();
};

/* BLOQUE 4: lógica de palabras clave
   Devuelve [{ palabra, emocion }]: 1 palabra por emoción elegida + 1 tema del texto + relleno */
const obtenerPalabrasClave = (claves, textoSituacion) => {
    const palabrasDelTexto = new Set(normalizar(textoSituacion).split(/[^a-z]+/).filter(Boolean));
    const palabrasDeTema = TEMAS
        .filter((tema) => tema.pistas.some((pista) => palabrasDelTexto.has(normalizar(pista))))
        .map((tema) => tema.palabraBusqueda);

    const reservas = {};
    claves.forEach((clave) => { reservas[clave] = mezclar(EMOCIONES[clave].palabras); });

    const resultado = [];
    const agregar = (palabra, emocion) => {
        if (palabra && !resultado.some((r) => r.palabra === palabra)) resultado.push({ palabra, emocion });
    };

    claves.forEach((clave) => agregar(reservas[clave].shift(), clave));   // 1) una por emoción
    const temaNuevo = palabrasDeTema.find((p) => !resultado.some((r) => r.palabra === p));
    if (temaNuevo) agregar(temaNuevo, claves[0]);                         // 2) un tema del texto (que no se repita)
    for (let turno = 0; resultado.length < MAX_PALABRAS && turno < 20; turno++) { // 3) relleno por turnos
        const clave = claves[turno % claves.length];
        agregar(reservas[clave].shift(), clave);
    }
    return resultado;
};

/* BLOQUE 5: resultados (juntar, dibujar tarjetas y buscar) */
const combinarResultados = (listas) => {
    const vistos = new Set();
    const resultado = [];
    const largoMaximo = Math.max(0, ...listas.map((lista) => lista.canciones.length));
    for (let i = 0; i < largoMaximo && resultado.length < MAX_CANCIONES; i++) {
        listas.forEach(({ palabra, emocion, canciones }) => {
            const cancion = canciones[i];
            if (cancion && !vistos.has(cancion.id) && resultado.length < MAX_CANCIONES) {
                vistos.add(cancion.id);
                resultado.push({ ...cancion, palabraClave: palabra, emocion });
            }
        });
    }
    return resultado;
};

// Vista previa en las tarjetas: un solo reproductor, así suena una canción a la vez
const reproductor = new Audio();
let botonSonando = null;
const TEXTO_PREVIEW = 'Vista previa · 30 s';

const detenerPreview = () => {
    reproductor.pause();
    if (botonSonando) {
        botonSonando.classList.remove('polaroid__preview--sonando');
        botonSonando.textContent = TEXTO_PREVIEW;
        botonSonando = null;
    }
};

const alternarPreview = (cancion, boton) => {
    if (botonSonando === boton) { detenerPreview(); return; } // segundo clic = pausar
    detenerPreview();
    reproductor.src = cancion.preview;
    reproductor.play().catch((error) => console.error(error));
    botonSonando = boton;
    boton.classList.add('polaroid__preview--sonando');
    boton.textContent = 'Pausar vista previa';
};
reproductor.addEventListener('ended', detenerPreview);

const crearTarjetaCancion = (cancion, indice) => {
    const { titulo, artista, portada, emocion, preview } = cancion;
    const tarjeta = crearElemento('article', 'polaroid');
    tarjeta.dataset.emocion = emocion;           // color de la tarjeta
    tarjeta.style.setProperty('--i', indice);    // retraso de aparición (una tras otra)

    // zona que abre la vista ampliada
    const abrir = crearElemento('button', 'polaroid__abrir');
    abrir.type = 'button';
    abrir.setAttribute('aria-label', `Abrir ${titulo}, de ${artista}`);
    const foto = crearElemento('div', 'polaroid__foto');
    if (portada) {
        const imagen = crearElemento('img');
        imagen.alt = `Portada de ${titulo}`;
        imagen.addEventListener('load', () => imagen.classList.add('cargada')); // aparece suave al cargar
        imagen.src = portada;
        if (imagen.complete) imagen.classList.add('cargada');
        foto.appendChild(imagen);
    }
    abrir.appendChild(foto);
    abrir.appendChild(crearElemento('span', 'polaroid__titulo', titulo));
    abrir.appendChild(crearElemento('span', 'polaroid__artista', artista));
    abrir.addEventListener('click', () => abrirVista(indice));
    tarjeta.appendChild(abrir);

    // botón de vista previa (si la API la trae)
    if (preview) {
        const boton = crearElemento('button', 'polaroid__preview', TEXTO_PREVIEW);
        boton.type = 'button';
        boton.addEventListener('click', () => alternarPreview(cancion, boton));
        tarjeta.appendChild(boton);
    }
    return tarjeta;
};

const renderizarCanciones = (palabras) => {
    songsGrid.innerHTML = '';
    cancionesActuales.forEach((cancion, indice) => songsGrid.appendChild(crearTarjetaCancion(cancion, indice)));
    const nombres = emocionesElegidas.map((clave) => EMOCIONES[clave].nombre).join(', ');
    const claves = palabras.map(({ palabra }) => `«${palabra}»`).join(', ');
    keywordsInfo.textContent = `Emociones: ${nombres}. Palabras clave usadas: ${claves}.`;
    resultsSection.hidden = false;
};

const manejarBusqueda = async (evento) => {
    evento.preventDefault();
    const situacion = inputSituacion.value.trim();
    if (situacion.length < 5 || emocionesElegidas.length === 0) {
        mostrarNotificacion('Escribe tu situación y elige al menos una emoción', 'error');
        return;
    }

    const miBusqueda = ++idBusqueda;
    const palabras = obtenerPalabrasClave(emocionesElegidas, situacion);
    botonBuscar.disabled = true;
    resultsSection.hidden = true;
    mostrarEstado('Buscando canciones para lo que sientes...');

    // una petición por palabra clave, todas a la vez; si una falla, las otras siguen
    const respuestas = await Promise.allSettled(
        palabras.map(async ({ palabra, emocion }) => ({ palabra, emocion, canciones: await buscarCancionesPorPalabra(palabra) }))
    );
    if (miBusqueda !== idBusqueda) return;
    botonBuscar.disabled = false;

    const listas = respuestas.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    if (listas.length === 0) {
        console.error(respuestas.map((r) => r.reason));
        mostrarEstado('No pudimos conectar con la API de canciones. Revisa tu internet e intenta de nuevo.', true);
        mostrarNotificacion('Error al buscar canciones', 'error');
        return;
    }

    cancionesActuales = combinarResultados(listas);
    if (cancionesActuales.length === 0) {
        mostrarEstado('No encontramos canciones con esas palabras. Prueba con otras emociones o cambia tu texto.', true);
        return;
    }
    mostrarEstado('');
    renderizarCanciones(palabras);
    mostrarNotificacion(`${cancionesActuales.length} canciones encontradas`);
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* BLOQUE 6: vista ampliada (ventana <dialog>) con la letra */
const cargarLetra = async (cancion) => {
    const miCarga = ++idCargaLetra;
    vistaLetra.className = 'vista__letra vista__letra--mensaje';
    vistaLetra.textContent = 'Cargando letra...';
    try {
        const letra = await obtenerLetra(cancion);
        if (miCarga !== idCargaLetra) return;
        if (letra) {
            vistaLetra.className = 'vista__letra';
            vistaLetra.textContent = letra;
            vistaLetra.scrollTop = 0;
        } else {
            vistaLetra.textContent = 'No encontramos la letra de esta canción. Prueba con otra.';
        }
    } catch (error) {
        if (miCarga !== idCargaLetra) return;
        console.error(error);
        vistaLetra.textContent = error.name === 'AbortError'
            ? 'La API tardó demasiado en responder. Intenta de nuevo.'
            : 'No se pudo cargar la letra. Intenta de nuevo.';
    }
};

const abrirVista = (indice) => {
    const cancion = cancionesActuales[indice];
    if (!cancion) return;
    indiceVista = indice;
    const grande = cancion.portadaGrande || cancion.portada;
    vista.dataset.emocion = cancion.emocion;
    vistaFondo.style.backgroundImage = grande ? `url("${grande.replace(/"/g, '%22')}")` : 'none'; // portada desenfocada
    vistaPortada.src = grande;
    vistaPortada.alt = `Portada de ${cancion.titulo}`;
    vistaTitulo.textContent = cancion.titulo;
    vistaArtista.textContent = cancion.artista;
    vistaInfo.textContent = `${cancion.album ? `Álbum: ${cancion.album}. ` : ''}Encontrada con la palabra «${cancion.palabraClave}».`;
    detenerPreview();
    vistaAudio.pause();
    vistaAudio.hidden = !cancion.preview;
    if (cancion.preview) vistaAudio.src = cancion.preview;
    vistaAnterior.disabled = indice === 0;
    vistaSiguiente.disabled = indice === cancionesActuales.length - 1;
    cargarLetra(cancion);
    if (!vista.open) vista.showModal();
};

/* BLOQUE 7: eventos e inicio */
vistaCerrar.addEventListener('click', () => vista.close());
vista.addEventListener('click', (evento) => { if (evento.target === vista) vista.close(); }); // clic afuera
vista.addEventListener('close', () => { vistaAudio.pause(); idCargaLetra++; });
vistaAnterior.addEventListener('click', () => abrirVista(indiceVista - 1));
vistaSiguiente.addEventListener('click', () => abrirVista(indiceVista + 1));
form.addEventListener('submit', manejarBusqueda);
crearTarjetasEmocion();
