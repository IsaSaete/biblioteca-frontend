// Preguntas frecuentes (HU-08). Cada respuesta debe ser verdad hoy: nada de
// «sin conexión» ni «instalable en Android» hasta que existan.
export const faqContent = {
  title: "Preguntas frecuentes",
  items: [
    {
      question: "¿Es gratis?",
      answer:
        "Sí. Glosa es gratis, no tiene anuncios y no pide tarjeta. Si algún día eso cambia, tus datos seguirán siendo descargables.",
    },
    {
      question: "¿En qué dispositivos funciona?",
      answer:
        "En el navegador del móvil, de la tableta y del ordenador, sin instalar nada. En el móvil puedes añadirla a la pantalla de inicio, como una app. Escanear códigos de barras y fotografiar citas solo se ofrece si el dispositivo tiene cámara.",
    },
    {
      question: "¿Necesito conexión?",
      answer:
        "Sí: hoy hace falta internet para entrar y guardar. Si hace un rato que nadie usa Glosa, la primera carga puede tardar unos segundos mientras el servidor despierta.",
    },
    {
      question: "¿Qué pasa con mis datos?",
      answer:
        "La foto de una cita no se sube: el texto se lee en tu móvil y solo se guarda el texto. Puedes descargar en un archivo tus libros, tus citas y tu lista de deseos, o borrar tu cuenta y todo lo que contiene.",
    },
  ],
} as const;
