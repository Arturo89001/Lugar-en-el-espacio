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
        ctx.fillStyle = isLight ? `rgba(255,255,255,${alpha})` : `rgba(200,220,255,${alpha})`;
        if (isLight && s.r > 1) { ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(180,220,255,0.9)'; }
        else { ctx.shadowBlur = 0; }
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

// ── NAV HELPERS (subsecciones del menú) ──
function navToInfo(section) {
    const btn = document.querySelector(`.info-filter .filter-btn[onclick*="'${section}'"]`);
    if (btn) selectInfoSection(section, btn);
}

function navToMision(tab) {
    const btn = document.querySelector(`.tab-btn[onclick*="'${tab}'"]`);
    if (btn) showTab(tab, btn);
}

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
        } else { throw new Error('server error'); }
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

// ── LIGHTBOX ──
// Variables declaradas ANTES de cualquier función que las use
let lbIndex         = 0;
let galleryLbData   = [];
let galleryLbActive = false;

const featuredData = [
    { src: 'images/Baikonur.jpg',                label: 'Julio 1992',  title: 'Cosmódromo de Baikonur',         text: 'Primer viaje a las instalaciones soviéticas recién abiertas al mundo. Testigo del lanzamiento de Soyuz TM-15.' },
    { src: 'images/edgarmitchell.jpg',            label: 'Junio 2006',  title: 'Visita del Dr. Edgar Mitchell',  text: 'El sexto hombre en caminar en la Luna visitó "el Santuario" — la colección personal de modelos espaciales.' },
    { src: 'images/new_horizons_launch_1_sm.jpg', label: 'Enero 2006', title: 'Lanzamiento New Horizons',       text: 'Los "Baikonour Boys" se reunieron para ver el Atlas V 500 llevar la sonda New Horizons hacia Plutón.' }
];

window.openLightbox = function(index) {
    galleryLbActive = false;
    galleryLbData   = [];
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
    galleryLbData   = [];
};

window.lightboxNav = function(dir, e) {
    if (e) e.stopPropagation();
    const dataset = (galleryLbActive && galleryLbData.length) ? galleryLbData : featuredData;
    if (!dataset.length) return;
    lbIndex = (lbIndex + dir + dataset.length) % dataset.length;
    const d   = dataset[lbIndex];
    const img = document.getElementById('lightbox-img');
    img.style.opacity = '0';
    setTimeout(() => { img.src = d.src; img.alt = d.title; img.style.opacity = '1'; }, 150);
    document.getElementById('lightbox-label').textContent = d.label;
    document.getElementById('lightbox-title').textContent = d.title;
    document.getElementById('lightbox-text').textContent  = d.text;
};

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
    const d = galleryLbData[lbIndex];
    if (!d) return;
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
        tag:   'Kazajistán · 1955',
        title: 'Cosmódromo de Baikonur',
        hero:  'images/Baikonur.jpg',
        desc:  'El Cosmódromo de Baikonur, ubicado en las estepas de Kazajistán, es el centro de lanzamiento espacial más antiguo y más grande del mundo. Construido por la Unión Soviética en 1955, desde aquí se lanzó el Sputnik 1 en 1957 —el primer satélite artificial de la historia— y en 1961 partió Yuri Gagarin en el Vostok 1, convirtiéndose en el primer ser humano en el espacio. Ken Harman visitó estas instalaciones en julio de 1992, siendo testigo del lanzamiento de la Soyuz TM-15, uno de los primeros accesos al cosmódromo abiertos al mundo occidental.',
        facts: [
            { label: 'Fundado',                     value: '1955' },
            { label: 'País',                        value: 'Kazajistán (arrendado por Rusia)' },
            { label: 'Primer lanzamiento histórico', value: 'Sputnik 1 — 4 oct. 1957' },
            { label: 'Primer humano al espacio',    value: 'Yuri Gagarin — 12 abr. 1961' },
            { label: 'Cohetes activos',             value: 'Soyuz, Proton' },
        ],
        images: ['images/Baikonur.jpg', 'images/soyuz_t_launcher.jpg', 'images/new_horizons_launch_1_sm.jpg']
    },
    kennedy: {
        tag:   'Florida, EUA · 1962',
        title: 'Centro Espacial Kennedy',
        hero:  'images/Kennedy.jpg',
        desc:  'El Centro Espacial John F. Kennedy (KSC) es la principal instalación de lanzamiento de la NASA, situado en la Isla Merritt, Florida. Desde aquí se ejecutaron todas las misiones tripuladas del programa Apolo —incluyendo el histórico Apolo 11 en 1969—, los vuelos del Transbordador Espacial y, más recientemente, los lanzamientos del cohete SLS del programa Artemis hacia la Luna. Sus plataformas LC-39A y LC-39B han sido testigos de más de 200 lanzamientos a lo largo de su historia.',
        facts: [
            { label: 'Fundado',              value: '1962' },
            { label: 'País',                 value: 'Estados Unidos' },
            { label: 'Misión más famosa',    value: 'Apollo 11 — 16 jul. 1969' },
            { label: 'Plataformas activas',  value: 'LC-39A, LC-39B' },
            { label: 'Operador actual',      value: 'NASA / SpaceX / Boeing' },
        ],
        images: ['images/Kennedy.jpg', 'images/apollo-15-eva.jpg', 'images/artemis2.jpg']
    },
    kourou: {
        tag:   'Guayana Francesa · 1968',
        title: 'Centro Espacial de Kourou',
        hero:  'images/Kourou.jpg',
        desc:  'El Centro Espacial de Kourou, también conocido como Puerto Espacial Europeo, es operado por la Agencia Espacial Europea (ESA) y el CNES francés. Su ubicación a apenas 5° al norte del ecuador le otorga una ventaja gravitacional excepcional para lanzar satélites geoestacionarios, reduciendo el combustible necesario respecto a otros centros. Es el principal puerto de lanzamiento del cohete Ariane, que ha puesto en órbita cientos de satélites comerciales y científicos desde la década de 1970.',
        facts: [
            { label: 'Fundado',               value: '1968' },
            { label: 'País',                  value: 'Guayana Francesa (Francia / ESA)' },
            { label: 'Latitud',               value: '5.2°N — ventaja ecuatorial' },
            { label: 'Cohetes principales',   value: 'Ariane 5, Ariane 6, Vega' },
            { label: 'Lanzamientos totales',  value: '300+' },
        ],
        images: ['images/satelites.jpg', 'images/artemis2.jpg']
    },
    vandenberg: {
        tag:   'California, EUA · 1957',
        title: 'Base de la Fuerza Espacial Vandenberg',
        hero:  'images/Vandenberg.jpg',
        desc:  'La Base de la Fuerza Espacial Vandenberg, ubicada en California, es la principal instalación de Estados Unidos para lanzamientos hacia órbitas polares y heliosíncronas. Su posición en la costa del Pacífico permite que los cohetes sobrevuelen el océano en lugar de tierra habitada, siendo ideal para satélites de vigilancia, reconocimiento y meteorología. Actualmente es utilizada activamente por SpaceX con el Falcon 9 y el Falcon Heavy, además de misiones militares y civiles de la NASA.',
        facts: [
            { label: 'Fundado',          value: '1957' },
            { label: 'País',             value: 'Estados Unidos' },
            { label: 'Especialidad',     value: 'Órbitas polares y heliosíncronas' },
            { label: 'Operadores',       value: 'USSF, NASA, SpaceX' },
            { label: 'Cohetes activos',  value: 'Falcon 9, Falcon Heavy' },
        ],
        images: ['images/Vandenberg.jpg', 'images/cohetes.jpg']
    },
    peenemunde: {
        tag:   'Alemania · 1937',
        title: 'Peenemünde — Cuna de la Era Espacial',
        hero:  'images/Peenemünde.jpg',
        desc:  'Peenemünde, en la isla de Usedom al norte de Alemania, fue el centro secreto de investigación de cohetes del Tercer Reich durante la Segunda Guerra Mundial. Aquí Wernher von Braun y su equipo desarrollaron el cohete V-2 (A-4), el primer objeto fabricado por el ser humano en alcanzar el espacio exterior, superando los 100 km de altitud en pruebas de 1944. La tecnología y los científicos de Peenemünde sentaron las bases tanto del programa espacial soviético, a través de Serguéi Korolev, como del estadounidense, a través de von Braun y la NASA.',
        facts: [
            { label: 'Activo',               value: '1937 – 1945' },
            { label: 'País',                 value: 'Alemania' },
            { label: 'Cohete desarrollado',  value: 'V-2 (A-4) — primer objeto en el espacio' },
            { label: 'Director técnico',     value: 'Wernher von Braun' },
            { label: 'Legado',               value: 'Base del Programa Apolo y Soyuz' },
        ],
        images: ['images/Peenemünde.jpg', 'images/v-2.jpg', 'images/n-1.jpg']
    },
    woomera: {
        tag:   'Australia · 1947',
        title: 'Woomera — El Cosmódromo del Sur',
        hero:  'images/woomera.jpg',
        desc:  'El Rango de Pruebas de Woomera, en el desierto de Australia del Sur, fue establecido en 1947 como instalación conjunta australo-británica para pruebas de misiles y cohetes. En 1967 se lanzó desde aquí el WRESAT, convirtiendo a Australia en el tercer país en lanzar su propio satélite desde su propio territorio. Con una superficie de 127,000 km², es el mayor campo de pruebas del mundo. Hoy sigue activo para ensayos hipersónicos, experimentos de reentrada y lanzamientos comerciales de nueva generación.',
        facts: [
            { label: 'Fundado',                    value: '1947' },
            { label: 'País',                       value: 'Australia' },
            { label: 'Primer satélite australiano', value: 'WRESAT — 1967' },
            { label: 'Especialidad',               value: 'Pruebas hipersónicas y suborbital' },
            { label: 'Superficie',                 value: '127,000 km²' },
        ],
        images: ['images/woomera.jpg', 'images/Australias_First_Satellites_1.jpg']
    },
    cohetes: {
        tag:   'Propulsión espacial',
        title: 'Cohetes — El Puente al Universo',
        hero:  'images/cohetes.jpg',
        desc:  'Los cohetes son el único medio que tenemos para superar la gravedad terrestre y alcanzar el espacio. Funcionan gracias al principio de acción y reacción de la Tercera Ley de Newton: expulsan gases a gran velocidad hacia abajo, lo que impulsa el vehículo hacia arriba. Los cohetes de guerra V-2 desarrollados en Peenemünde derivaron directamente en los grandes vehículos de la era espacial: el Saturn V de la NASA —el más potente jamás construido, con 34 MN de empuje—, el R-7 soviético, y en la actualidad el Falcon 9 de SpaceX o el SLS de la NASA para el programa Artemis.',
        facts: [
            { label: 'Principio',                        value: 'Tercera Ley de Newton (acción-reacción)' },
            { label: 'Cohete más potente en la historia', value: 'Saturn V — 34 MN de empuje' },
            { label: 'Cohete más usado hoy',             value: 'SpaceX Falcon 9' },
            { label: 'Velocidad de escape terrestre',    value: '11.2 km/s' },
            { label: 'Tipos principales',                value: 'Líquido, sólido, híbrido, iónico' },
        ],
        images: ['images/cohetes.jpg', 'images/v-2.jpg', 'images/soyuz_t_launcher.jpg', 'images/n-1.jpg', 'images/starship.jpg']
    },
    satelites: {
        tag:   'Órbita terrestre',
        title: 'Satélites — Ojos en el Cielo',
        hero:  'images/satelites.jpg',
        desc:  'Un satélite artificial es cualquier objeto colocado intencionalmente en órbita alrededor de la Tierra u otro cuerpo celeste. El Sputnik 1, lanzado el 4 de octubre de 1957, fue el primero en la historia. Desde entonces, miles de satélites orbitan la Tierra con misiones tan diversas como telecomunicaciones, navegación GPS, observación meteorológica, espionaje y ciencia. Los satélites geoestacionarios, a 35,786 km de altitud, rotan al mismo ritmo que la Tierra y son ideales para televisión y comunicaciones. Los de órbita baja (LEO), como los de la constelación Starlink de SpaceX, orbitan entre 200 y 2,000 km.',
        facts: [
            { label: 'Primer satélite',          value: 'Sputnik 1 — 4 oct. 1957 (URSS)' },
            { label: 'Satélites activos hoy',    value: '+7,500 (aprox.)' },
            { label: 'Órbita geoestacionaria',   value: '35,786 km sobre el ecuador' },
            { label: 'LEO (órbita baja)',         value: '200 – 2,000 km' },
            { label: 'Mayor constelación activa', value: 'Starlink (SpaceX) — 5,000+ sats' },
        ],
        images: ['images/satelites.jpg', 'images/hubble.jpg', 'images/Australias_First_Satellites_1.jpg', 'images/sputnik2.jpg']
    },
    estacion: {
        tag:   'Hábitat orbital',
        title: 'Estaciones Espaciales — Hogar en Órbita',
        hero:  'images/estacion_espacial.jpg',
        desc:  'Las estaciones espaciales son laboratorios orbitales que permiten a los astronautas vivir y trabajar en el espacio durante meses. La primera fue el Salyut 1 soviético, lanzado en 1971. Le siguieron el Skylab estadounidense (1973), la soviética Mir (1986–2001) y finalmente la Estación Espacial Internacional (ISS), ensamblada entre 1998 y 2011 con la participación de 15 países. En la ISS los astronautas realizan experimentos en microgravedad, estudian los efectos del espacio en el cuerpo humano y desarrollan las tecnologías necesarias para los futuros viajes tripulados a la Luna y Marte.',
        facts: [
            { label: 'Primera estación',      value: 'Salyut 1 — URSS, 1971' },
            { label: 'ISS en órbita desde',   value: '1998 (habitada desde 2000)' },
            { label: 'Altitud ISS',           value: '~408 km' },
            { label: 'Velocidad ISS',         value: '7.7 km/s (17,500 mph)' },
            { label: 'Países participantes',  value: '15 naciones' },
        ],
        images: ['images/estacion_espacial.jpg', 'images/Skylab.jpg', 'images/salyut-7.jpg', 'images/buran-mir.jpg', 'images/Salyut_1_with_Soyuz_11_model.jpg']
    },
    traje: {
        tag:   'Equipo personal',
        title: 'Trajes Espaciales — Armadura del Astronauta',
        hero:  'images/traje.jpg',
        desc:  'El traje espacial es esencialmente una nave espacial personalizada: provee presión interna, suministro de oxígeno, control térmico, comunicaciones y protección contra la radiación cósmica y los micrometeoritos. Los primeros trajes de la era Mercury eran adaptaciones de equipos militares de alta altitud. Los trajes para caminatas espaciales (EVA) actuales —como el EMU de la ISS o el nuevo xEMU diseñado para el programa Artemis— son mucho más complejos, pesan más de 130 kg en la Tierra y permiten hasta 8 horas de trabajo fuera de la estación.',
        facts: [
            { label: 'Primer traje espacial',  value: 'Sokol SK-1 — Gagarin, 1961' },
            { label: 'Traje EVA actual ISS',   value: 'EMU (Extravehicular Mobility Unit)' },
            { label: 'Peso del EMU',           value: '~130 kg (en la Tierra)' },
            { label: 'Duración máx. EVA',      value: '8 horas' },
            { label: 'Capas de protección',    value: '14 capas de materiales especiales' },
        ],
        images: ['images/traje.jpg', 'images/apollo-15-eva.jpg', 'images/astronautas.jpg']
    },
    historia: {
        tag:   'Historia de la exploración espacial',
        title: 'De la Tierra a las Estrellas',
        hero:  'images/Australias_First_Satellites_1.jpg',
        desc:  'La exploración espacial comenzó en 1957 con el lanzamiento del Sputnik 1 soviético, el primer satélite artificial de la historia. En 1961, Yuri Gagarin se convirtió en el primer ser humano en el espacio; en 1969, Neil Armstrong pisó la Luna. Las décadas siguientes trajeron estaciones espaciales permanentes, sondas hacia los confines del sistema solar como Voyager 1 y 2, y el telescopio Hubble, que revolucionó la astronomía. Hoy el programa Artemis busca regresar humanos a la Luna, SpaceX desarrolla el Starship y Marte se perfila como el gran destino de la próxima generación.',
        facts: [
            { label: 'Era 1 — Inicio',        value: 'Sputnik 1 — 4 oct. 1957' },
            { label: 'Era 2 — Primer humano', value: 'Yuri Gagarin — 12 abr. 1961' },
            { label: 'Era 3 — La Luna',       value: 'Apollo 11 — 20 jul. 1969' },
            { label: 'Era 4 — Estaciones',    value: 'ISS — habitada desde 2000' },
            { label: 'Era 5 — Futuro',        value: 'Artemis, Starship, Marte' },
        ],
        images: ['images/Australias_First_Satellites_1.jpg', 'images/sputnik2.jpg', 'images/vostok.jpg', 'images/apollo-15-eva.jpg', 'images/artemis2.jpg']
    },
    misiones_destacadas: {
        tag:   'Misiones Destacadas',
        title: 'Misiones que Cambiaron la Historia',
        hero:  'images/capsulamercury.jpg',
        desc:  'A lo largo de la era espacial, ciertas misiones marcaron hitos fundamentales para la humanidad. Los acoplamientos orbitales de Soyuz 4 y 5 en 1969 demostraron que era posible transferir tripulantes entre naves en el espacio. El Apollo 15 en 1971 exploró la Luna con el primer vehículo lunar rover. Más recientemente, el rover Perseverance de la NASA busca señales de vida pasada en Marte desde 2021, la sonda JUICE de la ESA viaja hacia las lunas de Júpiter, el Starship de SpaceX redefine el acceso al espacio y el programa Artemis II prepara el regreso humano a la Luna.',
        facts: [
            { label: 'Soyuz 4 & 5',   value: '1969 — primer acoplamiento tripulado' },
            { label: 'Apollo 15',     value: '1971 — primer rover lunar' },
            { label: 'Perseverance',  value: '2021–hoy — búsqueda de vida en Marte' },
            { label: 'JUICE (ESA)',   value: '2023 — destino: lunas de Júpiter' },
            { label: 'Artemis II',    value: '2025 — tripulación alrededor de la Luna' },
        ],
        images: ['images/capsulamercury.jpg', 'images/soyuz-4-5-docking.jpg', 'images/apollo-15-eva.jpg', 'images/perseverance.jpg', 'images/juice.jpg', 'images/starship.jpg', 'images/artemis2.jpg']
    },
    lunar_orbital: {
        tag:   'Exploración Lunar y Orbital',
        title: 'La Luna y Más Allá',
        hero:  'images/lunar_exploracion.jpg',
        desc:  'La exploración lunar ha sido el corazón de la era espacial. El programa Apollo culminó con 12 astronautas caminando sobre la Luna entre 1969 y 1972, trayendo 382 kg de muestras lunares. La Unión Soviética desarrolló en paralelo el complejo LOK/LK para su propia misión lunar que nunca se realizó. Los acoplamientos Soyuz 4 y 5 perfeccionaron la tecnología orbital esencial para cualquier misión de larga distancia. Mars Base Camp es el concepto actual de la NASA para establecer una estación en órbita marciana que sirva de base para explorar la superficie del Planeta Rojo.',
        facts: [
            { label: 'Apollo 15',         value: '1971 — primer rover y EVA de regreso' },
            { label: 'Soviet LOK & LK',   value: 'Años 60s — programa lunar soviético secreto' },
            { label: 'Soyuz Docking',     value: '1969 — tecnología de acoplamiento orbital' },
            { label: 'Mars Base Camp',    value: 'Concepto futuro — estación orbital marciana' },
            { label: 'Próximo objetivo',  value: 'Artemis — regreso humano a la Luna' },
        ],
        images: ['images/lunar_exploracion.jpg', 'images/apollo-15-eva.jpg', 'images/soviet-lunar-landing.jpg', 'images/soyuz-4-5-docking.jpg', 'images/mars-base-camp.jpg', 'images/artemis2.jpg']
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

    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) window.closeLightbox();
    });

    document.getElementById('infoModal').addEventListener('click', function(e) {
        if (e.target === this) window.closeInfoModal();
    });

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

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => window.openGalleryLightbox(item));
    });

    const infoBtnCentros = document.querySelector('.info-filter .filter-btn:nth-child(2)');
    if (infoBtnCentros) selectInfoSection('centros', infoBtnCentros);

    const tabBtnProgramas = document.querySelector('.missions-tabs .tab-btn:nth-child(2)');
    if (tabBtnProgramas) showTab('programas', tabBtnProgramas);

    const themeBtn = document.getElementById('themeToggle');
    const saved    = localStorage.getItem('theme');
    if (saved === 'light') { document.body.classList.add('light-mode'); themeBtn.textContent = '☀️'; }

    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        themeBtn.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
});
