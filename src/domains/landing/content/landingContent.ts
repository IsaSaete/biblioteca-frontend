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
      hint: "apuntas con la cámara y listo",
    },
    {
      icon: "isbn",
      color: 2,
      name: "Escribiendo el ISBN",
      hint: "si prefieres teclear",
    },
    {
      icon: "search",
      color: 6,
      name: "Buscando por título o autor",
      hint: "cuando no tienes el código a mano",
    },
    {
      icon: "manual",
      color: 5,
      name: "A mano",
      hint: "si no aparece en ningún sitio",
    },
  ],
  sources:
    "Glosa busca el título, el autor, la portada y la editorial en Google Books y Open Library. Si alguno de esos datos no aparece, como a veces pasa con la editorial, lo escribes tú.",
} as const;

export const tagsContent = {
  note: "Prueba: toca una etiqueta.",
  title: "Ponles las etiquetas que quieras.",
  text: "Cada libro puede llevar tus propias etiquetas, como «club de lectura» o «ensayo», y luego las usas de filtro para encontrar justo lo que buscas. Marcas tus favoritos y si lo estás leyendo, ya lo leíste o lo tienes pendiente.",
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
  card: {
    text: "La libertad, Sancho, es uno de los más preciosos dones que a los hombres dieron los cielos.",
    author: "Miguel de Cervantes",
    book: "Don Quijote de la Mancha",
    saved: "Guardada",
  },
} as const;
