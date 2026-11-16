import type { Quote } from "../../quotes/dto/Quote";

// Todos los textos de la landing viven aquí: retocar una frase no obliga a
// tocar componentes. Diseño y texto aprobados en D-039.
export const landingContent = {
  brand: { name: "Glosa", tagline: "Tu biblioteca personal" },
  header: { signIn: "Entrar", signUp: "Crear cuenta" },
  shelf: {
    label:
      "Una estantería con libros: los que ya tienes, rellenos, y los de tu lista de deseos, punteados.",
    wishlistNote: "los que aún no tienes, pero quieres",
  },
  intro: {
    title: "Todos tus libros, a un toque.",
    signUp: "Crear cuenta",
    fine: "Gratis y sin anuncios.",
    lede: "Glosa es tu estantería digital: los libros que tienes en casa y las frases que no quieres olvidar, en el móvil y en el ordenador. Añades cada libro escaneando su código de barras, lo organizas con tus etiquetas y lo encuentras cuando quieras.",
    ledeAfter:
      "¿Estás en una librería y no recuerdas si ya lo tienes? Lo consultas en Glosa y, si no está, lo apuntas en tu lista de deseos.",
  },
} as const;

// Garantías bajo la portada: todas ciertas hoy (sin «funciona sin conexión»
// hasta que haya service worker).
export const trustContent = {
  label: "Garantías de Glosa",
  points: [
    "Tus datos, siempre descargables",
    "Tus fotos no salen de tu dispositivo",
    "Se instala en tu móvil desde el navegador",
  ],
} as const;

export const addBookContent = {
  note: "Sin cámara, sin problema: escribe el ISBN.",
  title: "Cuatro maneras de añadir un libro.",
  methods: [
    {
      icon: "scan",
      color: 1,
      name: "Escaneando el código de barras",
      hint: "La más rápida",
    },
    {
      icon: "isbn",
      color: 2,
      name: "Escribiendo el ISBN",
      hint: "Si tienes el ISBN",
    },
    {
      icon: "search",
      color: 6,
      name: "Buscando por título o autor",
      hint: "Si no tienes código de barras ni ISBN",
    },
    {
      icon: "manual",
      color: 5,
      name: "Manualmente",
      hint: "Si no aparece en la búsqueda",
    },
  ],
  sources:
    "Glosa busca el título, el autor, la portada y la editorial por ti. Si falta algún dato, lo completas tú.",
} as const;

export const tagsContent = {
  note: "Prueba: toca una etiqueta.",
  title: "Organiza tus libros a tu manera.",
  text: "Cada libro puede llevar las etiquetas que quieras, como «club de lectura» o «música». Marca tus favoritos, apunta a quién has prestado cada libro y usa todo eso para filtrar tu biblioteca y encontrar justo lo que buscas.",
  groupLabel: "Probar un filtro",
} as const;

export const quotesContent = {
  note: "Sea de un libro tuyo, prestado o de cualquier sitio.",
  title: "Cuando una frase te llama la atención, guárdala.",
  paragraphs: [
    "Estás leyendo y encuentras un párrafo que no quieres perder. Lo encuadras con la cámara, ajustas el recuadro al texto que quieres y Glosa lo lee en tu dispositivo. Antes de guardarlo, lo revisas y lo corriges si hace falta. También puedes elegir una foto que ya tengas o escribirlo tú.",
    "Todas tus citas están juntas en su propia sección, Citas, donde puedes filtrarlas por libro. Puedes enlazar cada una a un libro de tu biblioteca o guardarla suelta, de un libro prestado o de cualquier texto que hayas leído en otro sitio.",
  ],
  stepsLabel: "Cómo guardar una cita",
  steps: [
    {
      title: "Haz la foto",
      hint: "Con la cámara, o elige una que ya tengas",
    },
    {
      title: "Recorta el texto",
      hint: "Deja solo lo que quieres y corrígelo si hace falta",
    },
    {
      title: "Queda guardada",
      hint: "Con su libro y su página",
    },
  ],
  page: {
    book: "Una habitación propia",
    location: "Pág. 98",
    before: "Cerrad con llave vuestras bibliotecas si queréis,",
    highlighted:
      "no hay barrera, cerradura ni cerrojo que podáis imponer a la libertad de mi mente.",
    after: "",
  },
} as const;

// Cita de ejemplo, con la forma de una cita real de la app (no es de ninguna
// cuenta): se pinta con la misma tarjeta que Citas.
export const demoQuote: Quote = {
  id: "demo-quote",
  text: "No hay barrera, cerradura ni cerrojo que podáis imponer a la libertad de mi mente.",
  page: 98,
  createdAt: "2026-11-02T00:00:00.000Z",
  book: {
    id: "demo-book",
    title: "Una habitación propia",
    authors: ["Virginia Woolf"],
  },
};

export const dataContent = {
  title: "Tus datos son tuyos.",
  points: [
    {
      lead: "La foto nunca sale de tu dispositivo.",
      text: "Solo se guarda el texto de la cita.",
    },
    {
      lead: "Puedes llevártelos cuando quieras.",
      text: "Descarga en un archivo tus libros, tus citas y tu lista de deseos, o borra tu cuenta y todo lo que contiene.",
    },
    {
      lead: "Es gratis y no hay anuncios.",
      text: "Y pase lo que pase, siempre podrás descargar tus datos.",
    },
  ],
} as const;

// Entrada de diccionario con palabras propias (la de la RAE tiene derechos).
// El texto del origen lo escribió Isa (D-045): «Valle de la Lengua» es el nombre
// con el que se conoce su tierra y se usa sin matices.
export const dictionaryContent = {
  note: "El origen de un nombre.",
  word: "glosa",
  partOfSpeech: "f.",
  etymology: "Viene del latín glossa, y este del griego γλῶσσα, «lengua».",
  meanings: [
    "Nota breve que aclara el significado de un texto.",
    "Anotación escrita en el margen o entre las líneas de un texto, junto a lo que explica.",
  ],
  origin:
    "Hace unos mil años, en el monasterio de San Millán de la Cogolla, alguien añadió a un manuscrito escrito en latín anotaciones en romance y en euskera. Aquellas notas, conocidas como Glosas Emilianenses, constituyen un testimonio fundamental para conocer los primeros romances peninsulares y el euskera escrito. En el Valle de la Lengua nació una forma de acercar las palabras a quien las leía. Glosa recoge ese espíritu: guardar tus libros y las palabras que merecen permanecer en ellos. Porque algunas lecturas merecen quedarse contigo.",
} as const;

export const closingContent = {
  title: "Empieza por el libro que tienes más cerca.",
  text: "Crea tu cuenta, escanea su código de barras y ya está en tu estantería.",
  signUp: "Crear mi biblioteca",
  fine: "Gratis y sin anuncios.",
} as const;

export const footerContent = {
  faq: "FAQ",
  faqSpoken: ": preguntas frecuentes",
  privacy: "Privacidad",
  terms: "Términos",
  contact: "Contacto",
  copyright: "© 2026 Glosa",
} as const;
