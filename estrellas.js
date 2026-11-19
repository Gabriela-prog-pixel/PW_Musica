

/* BLOQUE 1: crear las estrellas */
const CANTIDAD_ESTRELLAS = 80;

const crearEstrellas = () => {
    const contenedor = document.createElement('div');
    contenedor.className = 'estrellas';
    contenedor.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < CANTIDAD_ESTRELLAS; i++) {
        const estrella = document.createElement('span');
        const tamano = 1 + Math.random() * 2; 
        estrella.className = 'estrella';
        estrella.style.left = `${Math.random() * 100}%`;
        estrella.style.top = `${Math.random() * 100}%`;
        estrella.style.width = estrella.style.height = `${tamano}px`;
        estrella.style.setProperty('--duracion', `${3 + Math.random() * 5}s`);
        estrella.style.setProperty('--retraso', `${-Math.random() * 8}s`);
        estrella.style.setProperty('--brillo', (0.35 + Math.random() * 0.45).toFixed(2));
        contenedor.appendChild(estrella);
    }
    document.body.prepend(contenedor);
};

crearEstrellas();
