// Preguntas frecuentes (HU-08). Cada respuesta debe ser verdad hoy: nada de
// «sin conexión» ni «instalable en Android» hasta que existan.
export const faqContent = {
  title: "Preguntas frecuentes",
  items: [
    {
      question: "¿Es gratis?",
      answer:
        "Sí. Glosa es gratis y no tiene anuncios. Y pase lo que pase, siempre podrás descargar tus datos.",
    },
    {
      question: "¿En qué dispositivos funciona?",
      answer:
        "En el navegador del móvil, de la tableta y del ordenador, sin instalar nada. En el móvil puedes añadirla a la pantalla de inicio, como una app. Escanear códigos de barras y fotografiar citas con la cámara solo se ofrece si el dispositivo tiene cámara; si no, puedes escribir el ISBN y subir una foto de la cita.",
    },
    {
      question: "¿Necesito conexión?",
      answer:
        "Sí: hoy hace falta internet para entrar y guardar. Si hace un rato que nadie usa Glosa, la primera carga puede tardar unos segundos mientras el servidor despierta.",
    },
    {
      question: "¿Qué pasa con mis datos?",
      answer:
        "La foto de una cita nunca sale de tu dispositivo: solo se guarda el texto de la cita. Puedes llevarte tus datos cuando quieras: descarga tus libros, tus citas y tu lista de deseos en un archivo, o borra tu cuenta y todo lo que contiene.",
    },
  ],
} as const;
