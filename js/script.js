// ── STARFIELD ──
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initStars() {
    stars = [];
    for (let i = 0; i < 280; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.4 + 0.2,
            a: Math.random(),
            speed: Math.random() * 0.003 + 0.001,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isLight = document.body.classList.contains('light-mode');
    stars.forEach(s => {
        s.twinkle += s.speed;
        const base  = isLight ? 0.75 : 0.5;
        const alpha = s.a * (base + (1 - base) * Math.abs(Math.sin(s.twinkle)));
        ctx.beginPath();
        ctx.arc(s.x, s.y, isLight ? s.r * 1.3 : s.r, 0, Math.PI * 2);
        ctx.fillStyle = isLight
            ? `rgba(255,255,255,${alpha})`
            : `rgba(200,220,255,${alpha})`;
        // halo en modo claro para estrellas grandes
        if (isLight && s.r > 1) {
            ctx.shadowBlur  = 6;
            ctx.shadowColor = 'rgba(180,220,255,0.9)';
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    requestAnimationFrame(drawStars);
}

resize();
initStars();
drawStars();
window.addEventListener('resize', () => { resize(); initStars(); });

// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    const sections = ['inicio', 'informacion', 'centros', 'misiones', 'galeria', 'contacto'];
    let cur = '';
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) cur = id;
    });
    document.querySelectorAll('.nav-menu > li > a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + cur) a.classList.add('active');
        // Centros de Lanzamiento vive bajo Información en el nav
        if (cur === 'centros' && a.getAttribute('href') === '#informacion') a.classList.add('active');
    });
});

// ── DROPDOWN HOVER ──
document.querySelectorAll('.nav-menu > li').forEach(li => {
    const dropdown = li.querySelector('.dropdown');
    if (dropdown) {
        let hideTimeout;
        li.addEventListener('mouseenter', () => { clearTimeout(hideTimeout); dropdown.classList.add('show'); });
        li.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => dropdown.classList.remove('show'), 200); });
        dropdown.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
        dropdown.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => dropdown.classList.remove('show'), 200); });
    }
});

// ── REVEAL ON SCROLL ──
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── TABS ──
function showTab(id, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tabs = document.querySelectorAll('.tab-content');
    if (id === 'all') {
        tabs.forEach(t => t.classList.add('active'));
    } else {
        tabs.forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + id).classList.add('active');
    }
}

// ── GALLERY FILTER ──
function filterGallery(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.gallery-item').forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        item.style.display = match ? 'flex' : 'none';
    });
    const gallery = document.getElementById('galleryGrid');
    if (gallery) gallery.scrollLeft = 0;
}

function selectInfoSection(section, btn) {
    document.querySelectorAll('.info-filter .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.info-section').forEach(sectionEl => {
        const match = section === 'all' || sectionEl.dataset.info === section;
        sectionEl.style.display = match ? 'block' : 'none';
    });
}

// ── GALLERY SCROLL ──
function scrollGallery(direction) {
    const gallery = document.getElementById('galleryGrid');
    if (!gallery) return;
    const distance = gallery.clientWidth * 0.8;
    gallery.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
}

// ── FORM (Formspree) ──
function handleForm(e) {
    e.preventDefault();
    const form = document.getElementById('contactForm');
    const btn  = document.getElementById('submitBtn');

    btn.textContent   = '⏳ Enviando...';
    btn.disabled      = true;
    btn.style.opacity = '0.7';

    fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
    })
    .then(res => {
        if (res.ok) {
            btn.textContent       = '✓ Mensaje Enviado';
            btn.style.borderColor = '#4caf50';
            btn.style.color       = '#4caf50';
            btn.style.opacity     = '1';
            form.reset();
        } else {
            throw new Error('server error');
        }
    })
    .catch(() => {
        btn.textContent       = '✗ Error al enviar — intenta de nuevo';
        btn.style.borderColor = '#ff5252';
        btn.style.color       = '#ff5252';
        btn.style.opacity     = '1';
        btn.disabled          = false;
    })
    .finally(() => {
        setTimeout(() => {
            btn.textContent       = 'Enviar Mensaje';
            btn.style.borderColor = '';
            btn.style.color       = '';
            btn.style.opacity     = '1';
            btn.disabled          = false;
        }, 4000);
    });
}

// ── LIGHTBOX (galería destacada) ──
const featuredData = [
    {
        src:   'images/Baikonur.jpg',
        label: 'Julio 1992',
        title: 'Cosmódromo de Baikonur',
        text:  'Primer viaje a las instalaciones soviéticas recién abiertas al mundo. Testigo del lanzamiento de Soyuz TM-15.'
    },
    {
        src:   'images/edgarmitchell.jpg',
        label: 'Junio 2006',
        title: 'Visita del Dr. Edgar Mitchell',
        text:  'El sexto hombre en caminar en la Luna visitó "el Santuario" — la colección personal de modelos espaciales.'
    },
    {
        src:   'images/new_horizons_launch_1_sm.jpg',
        label: 'Enero 2006',
        title: 'Lanzamiento New Horizons',
        text:  'Los "Baikonour Boys" se reunieron para ver el Atlas V 500 llevar la sonda New Horizons hacia Plutón.'
    }
];

let lbIndex = 0;

window.openLightbox = function(index) {
    lbIndex = index;
    const d   = featuredData[index];
    const lb  = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = d.src;
    img.alt = d.title;
    document.getElementById('lightbox-label').textContent = d.label;
    document.getElementById('lightbox-title').textContent = d.title;
    document.getElementById('lightbox-text').textContent  = d.text;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
    galleryLbActive = false;
};

window.lightboxNav = function(dir, e) {
    if (e) e.stopPropagation();
    if (galleryLbActive && galleryLbData.length) {
        lbIndex = (lbIndex + dir + galleryLbData.length) % galleryLbData.length;
        const d   = galleryLbData[lbIndex];
        const img = document.getElementById('lightbox-img');
        img.style.opacity = '0';
        setTimeout(() => { img.src = d.src; img.alt = d.title; img.style.opacity = '1'; }, 150);
        document.getElementById('lightbox-label').textContent = d.label;
        document.getElementById('lightbox-title').textContent = d.title;
        document.getElementById('lightbox-text').textContent  = d.text;
    } else {
        lbIndex = (lbIndex + dir + featuredData.length) % featuredData.length;
        const d   = featuredData[lbIndex];
        const img = document.getElementById('lightbox-img');
        img.style.opacity = '0';
        setTimeout(() => { img.src = d.src; img.alt = d.title; img.style.opacity = '1'; }, 150);
        document.getElementById('lightbox-label').textContent = d.label;
        document.getElementById('lightbox-title').textContent = d.title;
        document.getElementById('lightbox-text').textContent  = d.text;
    }
};

// ── GALLERY LIGHTBOX (galería espacial) ──
let galleryLbData   = [];
let galleryLbActive = false;

window.openGalleryLightbox = function(clickedItem) {
    galleryLbData = [];
    const visibleItems = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(el => el.style.display !== 'none');
    visibleItems.forEach(item => {
        const img   = item.querySelector('.gi-image');
        const title = item.querySelector('.gi-overlay h5');
        const sub   = item.querySelector('.gi-overlay p');
        galleryLbData.push({
            src:   img   ? img.src           : '',
            title: title ? title.textContent : '',
            label: sub   ? sub.textContent   : '',
            text:  ''
        });
    });
    lbIndex = visibleItems.indexOf(clickedItem);
    if (lbIndex < 0) lbIndex = 0;
    galleryLbActive = true;
    const d   = galleryLbData[lbIndex];
    const lb  = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = d.src;
    img.alt = d.title;
    document.getElementById('lightbox-label').textContent = d.label;
    document.getElementById('lightbox-title').textContent = d.title;
    document.getElementById('lightbox-text').textContent  = d.text;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
};

// ── INFO MODAL DATA ──
const infoData = {
    baikonur: {
        tag:  'Kazajistán · 1955',
        title: 'Cosmódromo de Baikonur',
        hero:  'images/Baikonur.jpg',
        desc:  'El Cosmódromo de Baikonur, ubicado en las estepas de Kazajistán, es el centro de lanzamiento espacial más antiguo y más grande del mundo. Construido por la Unión Soviética e[...]',
        facts: [
            { label: 'Fundado',                    value: '1955' },
            { label: 'País',                       value: 'Kazajistán (arrendado por Rusia)' },
            { label: 'Primer lanzamiento histórico', value: 'Sputnik 1 — 4 oct. 1957' },
            { label: 'Primer humano al espacio',   value: 'Yuri Gagarin — 12 abr. 1961' },
            { label: 'Cohetes activos',            value: 'Soyuz, Proton' },
        ],
        images: ['images/Baikonur.jpg', 'images/soyuz_t_launcher.jpg', 'images/new_horizons_launch_1_sm.jpg']
    },
    kennedy: {
        tag:  'Florida, EUA · 1962',
        title: 'Centro Espacial Kennedy',
        hero:  'images/Kennedy.jpg',
        desc:  'El Centro Espacial John F. Kennedy (KSC) es la principal instalación de lanzamiento de la NASA, situado en la Isla Merritt, Florida. Desde aquí se ejecutaron todas las misiones [...]',
        facts: [
            { label: 'Fundado',             value: '1962' },
            { label: 'País',               value: 'Estados Unidos' },
            { label: 'Misión más famosa',  value: 'Apollo 11 — 16 jul. 1969' },
            { label: 'Plataformas activas', value: 'LC-39A, LC-39B' },
            { label: 'Operador actual',    value: 'NASA / SpaceX / Boeing' },
        ],
        images: ['images/Kennedy.jpg', 'images/apollo-15-eva.jpg', 'images/artemis2.jpg']
    },
    kourou: {
        tag:  'Guayana Francesa · 1968',
        title: 'Centro Espacial de Kourou',
        hero:  'images/Kourou.jpg',
        desc:  'El Centro Espacial de Kourou, conocido como Puerto Espacial Europeo, es operado por la ESA y el CNES francés. Su ubicación a 5° al norte del ecuador le otorga una ventaja gravi[...]',
        facts: [
            { label: 'Fundado',              value: '1968' },
            { label: 'País',                value: 'Guayana Francesa (Francia / ESA)' },
            { label: 'Latitud',             value: '5.2°N — ventaja ecuatorial' },
            { label: 'Cohetes principales', value: 'Ariane 5, Ariane 6, Vega' },
            { label: 'Lanzamientos totales', value: '300+' },
        ],
        images: ['images/Kourou.jpg', 'images/satelites.jpg']
    },
    vandenberg: {
        tag:  'California, EUA · 1957',
        title: 'Base de la Fuerza Espacial Vandenberg',
        hero:  'images/Vandenberg.jpg',
        desc:  'La Base de la Fuerza Espacial Vandenberg es la principal instalación de EUA para lanzamientos hacia órbitas polares y heliosíncronas. Su posición en la costa del Pacífico es [...]',
        facts: [
            { label: 'Fundado',        value: '1957' },
            { label: 'País',          value: 'Estados Unidos' },
            { label: 'Especialidad',  value: 'Órbitas polares y heliosíncronas' },
            { label: 'Operadores',    value: 'USSF, NASA, SpaceX' },
            { label: 'Cohetes activos', value: 'Falcon 9, Falcon Heavy' },
        ],
        images: ['images/Vandenberg.jpg', 'images/cohetes.jpg']
    },
    peenemunde: {
        tag:  'Alemania · 1937',
        title: 'Peenemünde — Cuna de la Era Espacial',
        hero:  'images/Peenemünde.jpg',
        desc:  'Peenemünde fue el centro secreto de investigación de cohetes del Tercer Reich durante la Segunda Guerra Mundial. Aquí Wernher von Braun y su equipo desarrollaron el cohete V-2 [...]',
        facts: [
            { label: 'Activo',              value: '1937 – 1945' },
            { label: 'País',               value: 'Alemania' },
            { label: 'Cohete desarrollado', value: 'V-2 (A-4) — primer objeto en el espacio' },
            { label: 'Director técnico',   value: 'Wernher von Braun' },
            { label: 'Legado',             value: 'Base del Programa Apolo y Soyuz' },
        ],
        images: ['images/Peenemünde.jpg', 'images/v-2.jpg', 'images/n-1.jpg']
    },
    woomera: {
        tag:  'Australia · 1947',
        title: 'Woomera — El Cosmódromo del Sur',
        hero:  'images/woomera.jpg',
        desc:  'El Rango de Pruebas de Woomera fue establecido en 1947 como instalación conjunta australo-británica. En 1967 se lanzó el WRESAT, convirtiendo a Australia en el tercer país en [...]',
        facts: [
            { label: 'Fundado',                   value: '1947' },
            { label: 'País',                      value: 'Australia' },
            { label: 'Primer satélite australiano', value: 'WRESAT — 1967' },
            { label: 'Especialidad',              value: 'Pruebas hipersónicas y suborbital' },
            { label: 'Superficie',                value: '127,000 km²' },
        ],
        images: ["images/woomera.jpg", "images/Australia's First Satellites 1.jpg"]
    },
    cohetes: {
        tag:  'Propulsión espacial',
        title: 'Cohetes — El Puente al Universo',
        hero:  'images/cohetes.jpg',
        desc:  'Los cohetes son el único medio para superar la gravedad terrestre. Funcionan por el principio de acción y reacción. Los cohetes V-2 derivaron en los grandes vehículos de la er[...]',
        facts: [
            { label: 'Principio',                       value: 'Tercera Ley de Newton (acción-reacción)' },
            { label: 'Cohete más potente en la historia', value: 'Saturn V — 34 MN de empuje' },
            { label: 'Cohete más usado hoy',            value: 'SpaceX Falcon 9' },
            { label: 'Velocidad de escape terrestre',   value: '11.2 km/s' },
            { label: 'Tipos principales',               value: 'Líquido, sólido, híbrido, iónico' },
        ],
        images: ['images/cohetes.jpg', 'images/v-2.jpg', 'images/soyuz_t_launcher.jpg', 'images/n-1.jpg', 'images/starship.jpg']
    },
    satelites: {
        tag:  'Órbita terrestre',
        title: 'Satélites — Ojos en el Cielo',
        hero:  'images/satelites.jpg',
        desc:  'Un satélite artificial es cualquier objeto colocado en órbita. El Sputnik 1 (1957) fue el primero. Hoy más de 7,500 satélites orbitan la Tierra cubriendo telecomunicaciones, G[...]',
        facts: [
            { label: 'Primer satélite',         value: 'Sputnik 1 — 4 oct. 1957 (URSS)' },
            { label: 'Satélites activos hoy',   value: '+7,500 (aprox.)' },
            { label: 'Órbita geoestacionaria',  value: '35,786 km sobre el ecuador' },
            { label: 'LEO (órbita baja)',        value: '200 – 2,000 km' },
            { label: 'Mayor constelación',      value: 'Starlink (SpaceX) — 5,000+ sats' },
        ],
        images: ['images/satelites.jpg', 'images/hubble.jpg', "images/Australia's First Satellites 1.jpg", 'images/sputnik2.jpg']
    },
    estacion: {
        tag:  'Hábitat orbital',
        title: 'Estaciones Espaciales — Hogar en Órbita',
        hero:  'images/estacion espacial.jpg',
        desc:  'Las estaciones espaciales son laboratorios orbitales para vivir y trabajar en el espacio durante meses. La primera fue el Salyut 1 soviético (1971). Le siguieron Skylab (1973), M[...]',
        facts: [
            { label: 'Primera estación',     value: 'Salyut 1 — URSS, 1971' },
            { label: 'ISS en órbita desde',  value: '1998 (habitada desde 2000)' },
            { label: 'Altitud ISS',          value: '~408 km' },
            { label: 'Velocidad ISS',        value: '7.7 km/s (17,500 mph)' },
            { label: 'Países participantes', value: '15 naciones' },
        ],
        images: ['images/estacion espacial.jpg', 'images/skylab.jpg', 'images/salyut-7.jpg', 'images/buran-mir.jpg', "images/Salyut 1 with Soyuz 11 model.jpg"]
    },
    traje: {
        tag:  'Equipo personal',
        title: 'Trajes Espaciales — Armadura del Astronauta',
        hero:  'images/traje.jpg',
        desc:  'El traje espacial es una nave personal: provee presión, oxígeno, control térmico, comunicaciones y protección contra radiación. Los trajes EVA actuales —EMU de la ISS o el [...]',
        facts: [
            { label: 'Primer traje espacial', value: 'Sokol SK-1 — Gagarin, 1961' },
            { label: 'Traje EVA actual ISS',  value: 'EMU (Extravehicular Mobility Unit)' },
            { label: 'Peso del EMU',          value: '~130 kg (en la Tierra)' },
            { label: 'Duración máx. EVA',     value: '8 horas' },
            { label: 'Capas de protección',   value: '14 capas de materiales especiales' },
        ],
        images: ['images/traje.jpg', 'images/apollo-15-eva.jpg', 'images/astronautas.jpg']
    },
    historia: {
        tag:  'Historia de la exploración espacial',
        title: 'De la Tierra a las Estrellas',
        hero:  "images/Australia's First Satellites 1.jpg",
        desc:  'La exploración espacial comenzó en 1957 con el Sputnik 1. En 1961 Gagarin llegó al espacio; en 1969 Armstrong pisó la Luna. Las siguientes décadas trajeron estaciones permane[...]',
        facts: [
            { label: 'Era 1 — Inicio',        value: 'Sputnik 1 — 4 oct. 1957' },
            { label: 'Era 2 — Primer humano', value: 'Yuri Gagarin — 12 abr. 1961' },
            { label: 'Era 3 — La Luna',       value: 'Apollo 11 — 20 jul. 1969' },
            { label: 'Era 4 — Estaciones',    value: 'ISS — habitada desde 2000' },
            { label: 'Era 5 — Futuro',        value: 'Artemis, Starship, Marte' },
        ],
        images: ["images/Australia's First Satellites 1.jpg", 'images/sputnik2.jpg', 'images/vostok.jpg', 'images/apollo-15-eva.jpg', 'images/artemis2.jpg']
    },
    misiones_destacadas: {
        tag:  'Misiones Destacadas',
        title: 'Misiones que Cambiaron la Historia',
        hero:  'images/capsulamercury.jpg',
        desc:  'A lo largo de la era espacial, ciertas misiones marcaron hitos fundamentales: los acoplamientos Soyuz 4 y 5 demostraron transferencia de tripulantes; el Apollo 15 exploró la Luna[...]',
        facts: [
            { label: 'Soyuz 4 & 5',  value: '1969 — primer acoplamiento tripulado' },
            { label: 'Apollo 15',    value: '1971 — primer rover lunar' },
            { label: 'Perseverance', value: '2021–hoy — búsqueda de vida en Marte' },
            { label: 'JUICE (ESA)',  value: '2023 — destino: lunas de Júpiter' },
            { label: 'Artemis II',   value: '2025 — tripulación alrededor de la Luna' },
        ],
        images: ['images/capsulamercury.jpg', 'images/soyuz-4-5-docking.jpg', 'images/apollo-15-eva.jpg', 'images/perseverance.jpg', 'images/juice.jpg', 'images/starship.jpg', 'images/artemis2.jpg']
    },
    lunar_orbital: {
        tag:  'Exploración Lunar y Orbital',
        title: 'La Luna y Más Allá',
        hero:  'images/lunar exploracion.jpg',
        desc:  'La exploración lunar ha sido el corazón de la era espacial. El programa Apollo culminó con 12 astronautas en la Luna entre 1969 y 1972. Los acoplamientos Soyuz perfeccionaron l[...]',
        facts: [
            { label: 'Apollo 15',        value: '1971 — primer rover y EVA de regreso' },
            { label: 'Soviet LOK & LK',  value: 'Años 60s — programa lunar soviético secreto' },
            { label: 'Soyuz Docking',    value: '1969 — tecnología de acoplamiento orbital' },
            { label: 'Mars Base Camp',   value: 'Concepto futuro — estación orbital marciana' },
            { label: 'Próximo objetivo', value: 'Artemis — regreso humano a la Luna' },
        ],
        images: ['images/lunar exploracion.jpg', 'images/apollo-15-eva.jpg', 'images/soviet-lunar-landing.jpg', 'images/soyuz-4-5-docking.jpg', 'images/mars-base-camp.jpg', 'images/artemis2.jpg']
    }
};

window.openInfoModal = function(key) {
    const d = infoData[key];
    if (!d) return;
    document.getElementById('im-hero-img').src      = d.hero;
    document.getElementById('im-hero-img').alt      = d.title;
    document.getElementById('im-tag').textContent   = d.tag;
    document.getElementById('im-title').textContent = d.title;
    document.getElementById('im-desc').textContent  = d.desc;
    document.getElementById('im-facts').innerHTML = d.facts.map(f =>
        `<div class="im-fact"><span class="im-fact-label">${f.label}</span><span class="im-fact-value">${f.value}</span></div>`
    ).join('');
    const galleryEl = document.getElementById('im-gallery');
    if (d.images && d.images.length > 1) {
        galleryEl.innerHTML     = d.images.map(src =>
            `<img src="${src}" alt="" class="im-gal-img" onclick="this.classList.toggle('im-gal-zoom')">`
        ).join('');
        galleryEl.style.display = 'grid';
    } else {
        galleryEl.innerHTML     = '';
        galleryEl.style.display = 'none';
    }
    document.getElementById('infoModal').classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeInfoModal = function() {
    document.getElementById('infoModal').classList.remove('open');
    document.body.style.overflow = '';
};

// ── DOM READY ──
document.addEventListener('DOMContentLoaded', () => {

    // Lightbox — cerrar fondo
    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) window.closeLightbox();
    });

    // Info modal — cerrar fondo
    document.getElementById('infoModal').addEventListener('click', function(e) {
        if (e.target === this) window.closeInfoModal();
    });

    // Teclado
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (document.getElementById('infoModal').classList.contains('open')) window.closeInfoModal();
            else window.closeLightbox();
        }
        const lb = document.getElementById('lightbox');
        if (!lb.classList.contains('open')) return;
        if (e.key === 'ArrowRight') window.lightboxNav(1);
        if (e.key === 'ArrowLeft')  window.lightboxNav(-1);
    });

    // Galería espacial — click abre lightbox
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => window.openGalleryLightbox(item));
    });

    // Estado inicial: primera sección real en Información
    const infoBtnCentros = document.querySelector('.info-filter .filter-btn:nth-child(2)');
    if (infoBtnCentros) selectInfoSection('centros', infoBtnCentros);

    // Estado inicial: primera tab real en Misiones
    const tabBtnProgramas = document.querySelector('.missions-tabs .tab-btn:nth-child(2)');
    if (tabBtnProgramas) showTab('programas', tabBtnProgramas);

    // ── THEME TOGGLE ──
    const themeBtn = document.getElementById('themeToggle');
    const saved    = localStorage.getItem('theme');
    if (saved === 'light') { document.body.classList.add('light-mode'); themeBtn.textContent = '☀️'; }

    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        themeBtn.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
});
