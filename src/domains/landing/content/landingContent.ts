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
    fine: "Gratis, sin anuncios y sin tarjeta.",
    lede: "Glosa es tu estantería en digital: guarda en el móvil y en el ordenador los libros que tienes en casa. Los añades escaneando el código de barras, los organizas con tus propias etiquetas y los encuentras cuando quieras.",
    ledeAfter:
      "¿Estás en una librería y no recuerdas si ya lo tienes? Lo miras en Glosa y, si no está, lo apuntas en tu lista de deseos.",
  },
} as const;

export const addBookContent = {
  note: "Sin cámara, sin problema: se escribe el ISBN.",
  title: "Cuatro maneras de añadir un libro.",
  methods: [
    {
      icon: "scan",
      color: 1,
      name: "Escaneando el código de barras",
      hint: "Apuntas con la cámara y listo",
    },
    {
      icon: "isbn",
      color: 2,
      name: "Escribiendo el ISBN",
      hint: "Si prefieres teclear",
    },
    {
      icon: "search",
      color: 6,
      name: "Buscando por título o autor",
      hint: "Cuando no tienes el código a mano",
    },
    {
      icon: "manual",
      color: 5,
      name: "A mano",
      hint: "Si no aparece en ningún sitio",
    },
  ],
  sources:
    "Glosa busca el título, el autor, la portada y la editorial por ti. Si falta algún dato, lo completas tú.",
} as const;

export const tagsContent = {
  note: "Prueba: toca una etiqueta.",
  title: "Ponles las etiquetas que quieras.",
  text: "Cada libro puede llevar tus propias etiquetas, como «club de lectura» o «música», y luego las usas de filtro para encontrar justo lo que buscas. Marcas tus favoritos y si lo estás leyendo, ya lo leíste o lo tienes pendiente.",
  groupLabel: "Probar un filtro",
} as const;

export const quotesContent = {
  note: "Aunque no tengas el libro.",
  title: "Cuando una frase te llama la atención, guárdala.",
  paragraphs: [
    "Estás leyendo y hay un párrafo que te gusta y no quieres perder. Lo encuadras con la cámara, el texto se lee en tu móvil y queda guardado dentro de ese libro. También puedes escribirlo tú, o subir una foto desde el ordenador.",
    "Todas tus citas tienen además su propia sección, Citas, donde las ves juntas y las filtras por libro.",
  ],
  page: {
    book: "Don Quijote",
    chapter: "Capítulo LVIII",
    highlighted:
      "La libertad, Sancho, es uno de los más preciosos dones que a los hombres dieron los cielos;",
    rest: "con ella no pueden igualarse los tesoros que encierra la tierra ni el mar encubre.",
  },
} as const;

// Cita de ejemplo, con la forma de una cita real de la app (no es de ninguna
// cuenta): se pinta con la misma tarjeta que Citas.
export const demoQuote: Quote = {
  id: "demo-quote",
  text: "La libertad, Sancho, es uno de los más preciosos dones que a los hombres dieron los cielos.",
  page: 812,
  createdAt: "2026-11-02T00:00:00.000Z",
  book: {
    id: "demo-book",
    title: "Don Quijote de la Mancha",
    authors: ["Miguel de Cervantes"],
  },
};

export const dataContent = {
  title: "Tus datos son tuyos.",
  points: [
    {
      lead: "La foto no se sube.",
      text: "El texto se lee en tu móvil y solo se guarda el texto.",
    },
    {
      lead: "Puedes llevártelos.",
      text: "Descarga en un archivo tus libros, tus citas y tu lista de deseos, o borra tu cuenta y todo lo que contiene.",
    },
    {
      lead: "Es gratis y no hay anuncios.",
      text: "Si algún día eso cambia, tus datos seguirán siendo descargables.",
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
    "Explicación breve que se añade a un texto para aclarar su significado.",
    "Anotación que se escribe en el margen o sobre las líneas de un texto, junto a la palabra o el pasaje que aclara.",
  ],
  origin:
    "Hace unos mil años, en el monasterio de San Millán de la Cogolla, alguien añadió a un manuscrito escrito en latín anotaciones en romance y en euskera. Aquellas notas, conocidas como Glosas Emilianenses, constituyen un testimonio fundamental para conocer los primeros romances peninsulares y el euskera escrito. En el Valle de la Lengua nació una forma de acercar las palabras a quien las leía. Glosa recoge ese espíritu: guardar tus libros y las palabras que merecen permanecer en ellos. Porque algunas lecturas merecen quedarse con nosotros.",
} as const;

export const closingContent = {
  title: "Empieza por el libro que tienes más cerca.",
  text: "Crea tu cuenta, escanea su código de barras y ya está en tu estantería.",
  signUp: "Crear cuenta",
  fine: "Gratis, sin anuncios y sin tarjeta.",
} as const;

export const footerContent = {
  brand: "Glosa",
  signIn: "Entrar",
  privacy: "Privacidad",
  terms: "Términos",
  copyright: "© 2026 Glosa",
} as const;
