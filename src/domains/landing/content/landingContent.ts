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
      name: "Escaneando el código de barras",
      hint: "apuntas con la cámara y listo",
    },
    { name: "Escribiendo el ISBN", hint: "si prefieres teclear" },
    {
      name: "Buscando por título o autor",
      hint: "cuando no tienes el código a mano",
    },
    { name: "A mano", hint: "si no aparece en ningún sitio" },
  ],
  sources:
    "Glosa busca el título, el autor, la portada y la editorial en Google Books y Open Library. Si alguno de esos datos no aparece, como a veces pasa con la editorial, lo escribes tú.",
} as const;
