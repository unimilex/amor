// =====================================================
//  CONFIGURACIÓN: cambia aquí lo que quieras
// =====================================================
const CONFIG = {
  // Mensaje que aparece en el centro al terminar cada vuelta de idiomas
  mensajeFinal: "Para ti ❤",
  // Tonos de rosa usados en las letras
  colores: ["#ff8fc7", "#ffb3d9", "#ff6fae", "#ffc8e3", "#ff9ecf"],
  // Color del texto grande del centro
  colorCentro: "#ffb3d9",
  // Cuántas frases forman el corazón
  frasesBorde: 170,
  frasesRelleno: 280,
  // Milisegundos que se ve cada idioma en el centro
  duracionIdioma: 2200,
};

const FRASES = [
  { idioma: "Español", texto: "Te quiero" },
  { idioma: "English", texto: "I love you" },
  { idioma: "Français", texto: "Je t'aime" },
  { idioma: "Italiano", texto: "Ti amo" },
  { idioma: "Português", texto: "Eu te amo" },
  { idioma: "Deutsch", texto: "Ich liebe dich" },
  { idioma: "Nederlands", texto: "Ik hou van jou" },
  { idioma: "Català", texto: "T'estimo" },
  { idioma: "Euskara", texto: "Maite zaitut" },
  { idioma: "Polski", texto: "Kocham cię" },
  { idioma: "Svenska", texto: "Jag älskar dig" },
  { idioma: "Türkçe", texto: "Seni seviyorum" },
  { idioma: "Ελληνικά", texto: "Σ' αγαπώ" },
  { idioma: "Русский", texto: "Я тебя люблю" },
  { idioma: "العربية", texto: "أحبك" },
  { idioma: "हिन्दी", texto: "मैं तुमसे प्यार करता हूँ" },
  { idioma: "中文", texto: "我爱你" },
  { idioma: "日本語", texto: "愛してる" },
  { idioma: "한국어", texto: "사랑해" },
  { idioma: "Kiswahili", texto: "Nakupenda" },
];

// =====================================================
//  LIENZO
// =====================================================
const lienzo = document.getElementById("lienzo");
const ctx = lienzo.getContext("2d");
const pista = document.getElementById("pista");
const FUENTE = '"Segoe UI", system-ui, -apple-system, Roboto, "Noto Sans", Arial, sans-serif';

let W = 0, H = 0, escala = 1, cx = 0, cy = 0;

function redimensionar() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  lienzo.width = Math.round(W * dpr);
  lienzo.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // El corazón mide unas 34 unidades de ancho y 30 de alto
  escala = Math.min(W / 38, (H * 0.86) / 34);
  cx = W / 2;
  cy = H * 0.47;
}
window.addEventListener("resize", redimensionar);
redimensionar();

// Curva clásica del corazón (en unidades; y hacia abajo)
function puntoCorazon(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
}

const azar = (a, b) => a + Math.random() * (b - a);
const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
const suavizar = (p) => p * p * (3 - 2 * p);

// =====================================================
//  PARTÍCULAS (cada una es un "te quiero" pequeño)
// =====================================================
let particulas = [];
let estrellas = [];
let inicio = performance.now();

// Contorno del corazón como polígono (sirve para repartir las frases)
const CONTORNO = Array.from({ length: 600 }, (_, i) => puntoCorazon((i / 600) * Math.PI * 2));
const LONGITUDES = [0];
for (let i = 1; i <= CONTORNO.length; i++) {
  const a = CONTORNO[i - 1], b = CONTORNO[i % CONTORNO.length];
  LONGITUDES.push(LONGITUDES[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
}
const PERIMETRO = LONGITUDES[LONGITUDES.length - 1];

// Punto del borde a una distancia d recorrida (así quedan espaciadas por igual)
function puntoPorDistancia(d) {
  let i = 1;
  while (LONGITUDES[i] < d) i++;
  const a = CONTORNO[i - 1], b = CONTORNO[i % CONTORNO.length];
  const f = (d - LONGITUDES[i - 1]) / (LONGITUDES[i] - LONGITUDES[i - 1] || 1);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

function dentroDelCorazon(x, y) {
  let dentro = false;
  for (let i = 0, j = CONTORNO.length - 1; i < CONTORNO.length; j = i++) {
    const a = CONTORNO[i], b = CONTORNO[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro;
  }
  return dentro;
}

function crear() {
  particulas = [];

  // Borde: se va dibujando en orden alrededor del corazón
  for (let i = 0; i < CONFIG.frasesBorde; i++) {
    const { x, y } = puntoPorDistancia((i / CONFIG.frasesBorde) * PERIMETRO);
    particulas.push({
      x, y,
      r: azar(0.98, 1.02),
      frase: FRASES[i % FRASES.length].texto,
      tam: azar(0.55, 0.75),
      alfa: azar(0.8, 1),
      color: elegir(CONFIG.colores),
      retraso: i * 14,
      fase: azar(0, Math.PI * 2),
    });
  }

  // Relleno: aparece después, al azar
  for (let i = 0; i < CONFIG.frasesRelleno; i++) {
    let x, y;
    do {
      x = azar(-16, 16);
      y = azar(-13, 17);
    } while (!dentroDelCorazon(x / 0.88, y / 0.88));
    particulas.push({
      x, y,
      r: 1,
      frase: elegir(FRASES).texto,
      tam: azar(0.45, 0.65),
      alfa: azar(0.25, 0.6),
      color: elegir(CONFIG.colores),
      retraso: CONFIG.frasesBorde * 14 + azar(0, 2600),
      fase: azar(0, Math.PI * 2),
    });
  }

  estrellas = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: azar(0.3, 1.2),
    fase: azar(0, Math.PI * 2),
    vel: azar(0.5, 1.6),
  }));
}

// Latido: dos golpes ("pum-pum") cada 1,2 s
function latido(ms) {
  const p = (ms % 1200) / 1200;
  const g1 = Math.exp(-Math.pow((p - 0.08) / 0.05, 2));
  const g2 = 0.6 * Math.exp(-Math.pow((p - 0.28) / 0.06, 2));
  return g1 + g2;
}

// =====================================================
//  DIBUJO
// =====================================================
const FIN_BORDE = CONFIG.frasesBorde * 14;
const FIN_RELLENO = FIN_BORDE + 2600 + 600;

function dibujar(ahora) {
  const ms = ahora - inicio;
  const seg = ms / 1000;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // Estrellas de fondo
  for (const e of estrellas) {
    const a = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(seg * e.vel + e.fase));
    ctx.fillStyle = `rgba(255, 170, 210, ${a})`;
    ctx.beginPath();
    ctx.arc(e.x * W, e.y * H, e.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // El latido empieza poco a poco cuando el corazón está completo
  const fuerzaLatido = limitar((ms - FIN_RELLENO) / 1500, 0, 1);
  const s = escala * (1 + 0.05 * latido(ms) * fuerzaLatido);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const p of particulas) {
    const vida = ms - p.retraso;
    if (vida <= 0) continue;
    const entrada = suavizar(limitar(vida / 700, 0, 1));

    const { x, y } = p;
    const flotar = 0.18 * Math.sin(seg * 1.3 + p.fase);
    // Entran desde un poco más afuera y se colocan en su sitio
    const r = p.r * (1 + (1 - entrada) * 0.25);
    const px = cx + (x * r + flotar) * s;
    const py = cy + (y * r + flotar * 0.6) * s;

    const tamPx = limitar(p.tam * escala, 8, 20);
    ctx.font = `600 ${tamPx}px ${FUENTE}`;
    ctx.globalAlpha = p.alfa * entrada;
    ctx.fillStyle = p.color;
    ctx.fillText(p.frase, px, py);
  }
  ctx.globalAlpha = 1;

  dibujarCentro(ms);

  requestAnimationFrame(dibujar);
}

// Texto grande del centro: va pasando por los 20 idiomas
function dibujarCentro(ms) {
  const empieza = FIN_BORDE * 0.6;
  if (ms < empieza) return;

  const t = ms - empieza;
  const dur = CONFIG.duracionIdioma;
  const vuelta = dur * (FRASES.length + 2); // +2 = el mensaje final dura el doble
  const enVuelta = t % vuelta;
  const indice = Math.floor(enVuelta / dur);

  let texto, idioma, local;
  if (indice < FRASES.length) {
    texto = FRASES[indice].texto;
    idioma = FRASES[indice].idioma;
    local = (enVuelta % dur) / dur;
  } else {
    texto = CONFIG.mensajeFinal;
    idioma = "";
    local = (enVuelta - FRASES.length * dur) / (dur * 2);
  }

  // Aparece y desaparece suavemente
  const alfa = Math.min(limitar(local / 0.18, 0, 1), limitar((1 - local) / 0.18, 0, 1));
  const zoom = 0.92 + 0.08 * suavizar(limitar(local / 0.25, 0, 1));

  let tam = limitar(escala * 2.1, 26, 72);
  ctx.font = `700 ${tam}px ${FUENTE}`;
  // Que las frases largas quepan dentro del corazón
  const maxAncho = escala * 20;
  const ancho = ctx.measureText(texto).width;
  if (ancho > maxAncho) {
    tam *= maxAncho / ancho;
    ctx.font = `700 ${tam}px ${FUENTE}`;
  }

  ctx.save();
  ctx.translate(cx, cy - escala * 1.2);
  ctx.scale(zoom, zoom);
  ctx.globalAlpha = alfa;

  // Halo oscuro detrás para que se lea encima del relleno
  ctx.shadowColor = "rgba(0,0,0,0.95)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "rgba(0,0,0,0.0)";
  ctx.lineWidth = tam * 0.35;
  ctx.strokeStyle = "rgba(0,0,0,0.75)";
  ctx.lineJoin = "round";
  ctx.strokeText(texto, 0, 0);

  // Brillo rosa
  ctx.shadowColor = "#ff5fa8";
  ctx.shadowBlur = 28;
  ctx.fillStyle = CONFIG.colorCentro;
  ctx.fillText(texto, 0, 0);
  ctx.shadowBlur = 0;

  if (idioma) {
    const tamIdioma = limitar(tam * 0.32, 11, 20);
    ctx.font = `500 ${tamIdioma}px ${FUENTE}`;
    ctx.lineWidth = tamIdioma * 0.5;
    ctx.strokeText(idioma.toUpperCase(), 0, tam * 0.85);
    ctx.globalAlpha = alfa * 0.75;
    ctx.fillStyle = "#ff8fc7";
    ctx.fillText(idioma.toUpperCase(), 0, tam * 0.85);
  }
  ctx.restore();
}

// =====================================================
//  INICIO Y REPETIR
// =====================================================
function reiniciar() {
  crear();
  inicio = performance.now();
  pista.classList.remove("visible");
  clearTimeout(reiniciar.temporizador);
  reiniciar.temporizador = setTimeout(() => pista.classList.add("visible"), FIN_RELLENO + 1500);
}

lienzo.addEventListener("click", reiniciar);
reiniciar();
requestAnimationFrame(dibujar);