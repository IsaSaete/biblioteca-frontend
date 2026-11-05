import type { LegalContent } from "../dto/LegalContent";
import { legalContact } from "./legalContact";

// Borrador redactado a partir de lo que la app hace de verdad (modelo de datos,
// contrato de API y arquitectura). Debe revisarlo su titular: no es
// asesoramiento jurídico.
export const privacyContent: LegalContent = {
  title: "Política de privacidad",
  lastUpdated: "3 de noviembre de 2026",
  sections: [
    {
      heading: "Quién es el responsable",
      paragraphs: [
        `El responsable de tus datos es ${legalContact.owner}, que desarrolla y mantiene Glosa como proyecto personal y gratuito.`,
        `Puedes escribirle para cualquier duda o para ejercer tus derechos en ${legalContact.email}.`,
      ],
    },
    {
      heading: "Qué datos guardamos",
      paragraphs: ["Solo los necesarios para que Glosa funcione:"],
      items: [
        "Tu cuenta: nombre, correo electrónico, contraseña (se guarda cifrada, nadie puede leerla), la fecha en que aceptaste los Términos y la Política de Privacidad y si has verificado tu correo.",
        "Tu foto de perfil, si decides añadirla (256 × 256 píxeles, guardada en nuestra base de datos) y tus preferencias, como la vista de la biblioteca.",
        "Lo que guardas: los libros de tu biblioteca y lo que apuntas sobre ellos (estado de lectura, etiquetas, favoritos…), tus citas con su página, tu lista de deseos y, si prestas un libro, el nombre de la persona a quien se lo has prestado (lo escribes tú y no se comparte con nadie).",
        "Datos técnicos: la dirección IP y la hora de las peticiones, que quedan en los registros del servidor y sirven para proteger la cuenta y limitar abusos.",
      ],
    },
    {
      heading: "Lo que no hacemos",
      paragraphs: [
        "Las fotos que haces para guardar una cita no se suben: el texto se lee en tu móvil y solo se guarda el texto.",
        "No hay publicidad ni analítica, no vendemos ni cedemos tus datos y no los usamos para hacer perfiles ni para tomar decisiones automatizadas.",
      ],
    },
    {
      heading: "Para qué los usamos y con qué base legal",
      paragraphs: [],
      items: [
        "Crear y mantener tu cuenta y prestarte el servicio, incluidos los correos necesarios (verificar tu correo, recuperar la contraseña o confirmar un cambio de correo). Base: la ejecución del servicio que aceptas al registrarte (art. 6.1.b del RGPD).",
        "Proteger el servicio: limitar intentos de acceso, detectar abusos y resolver fallos. Base: nuestro interés legítimo en mantenerlo seguro (art. 6.1.f del RGPD).",
      ],
    },
    {
      heading: "Con quién se comparten",
      paragraphs: [
        "Para que Glosa funcione recurrimos a proveedores que tratan datos por nuestra cuenta:",
      ],
      items: [
        "Netlify: aloja la web y reenvía las peticiones al servidor.",
        "Render: aloja el servidor de Glosa.",
        "MongoDB Atlas: guarda la base de datos.",
        "Resend: envía los correos de verificación y recuperación.",
      ],
    },
    {
      heading: "Libros y portadas",
      paragraphs: [
        "Cuando buscas un libro por ISBN, título o autor, nuestro servidor consulta Google Books y Open Library con esa búsqueda, sin tus datos de cuenta.",
        "Las portadas las descarga directamente tu navegador desde Google Books, Open Library o Internet Archive, que pueden ver tu dirección IP, como ocurre al cargar cualquier imagen de otra web.",
        "Las tipografías, el lector de códigos de barras y el lector de texto se sirven desde nuestro propio servidor: no se envía nada a terceros para usarlos.",
      ],
    },
    {
      heading: "Transferencias fuera de la Unión Europea",
      paragraphs: [
        "Algunos de estos proveedores tienen sede o servidores fuera de la Unión Europea, por ejemplo en Estados Unidos. En esos casos la transferencia se apoya en las garantías que ofrece cada proveedor, como las cláusulas contractuales tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU.",
      ],
    },
    {
      heading: "Cuánto tiempo los conservamos",
      paragraphs: [
        "Mientras tengas cuenta. Si la eliminas desde Perfil, se borran de inmediato y de forma definitiva tu usuario, los libros que habías guardado, tus citas, tu lista de deseos y tu foto. Los datos de catálogo de un libro (título, autor, editorial…) no son personales y se mantienen porque los comparten todas las cuentas.",
        "Los registros técnicos del servidor se conservan solo el tiempo limitado que establece el proveedor de alojamiento.",
      ],
    },
    {
      heading: "Cookies y almacenamiento en tu navegador",
      paragraphs: [
        "Glosa solo usa lo imprescindible para funcionar, por eso no te pedimos que aceptes cookies:",
      ],
      items: [
        "Cookies de sesión (accessToken y refreshToken): mantienen tu sesión iniciada; duran unos 15 minutos y unos 30 días respectivamente.",
        "Cookie de seguridad (csrfToken): protege tu cuenta frente a peticiones falsas.",
        "Almacenamiento del navegador: recuerda si prefieres el tema claro, el oscuro o el del sistema.",
      ],
    },
    {
      heading: "Tus derechos",
      paragraphs: [
        "Puedes acceder a tus datos, rectificarlos, suprimirlos, pedir que se limite su tratamiento, oponerte a él y recibirlos en un formato portable.",
        "Casi todo lo puedes hacer tú mismo desde Perfil: editar tus datos, descargar todo lo que guardas en un archivo («Descargar mis datos») o eliminar tu cuenta.",
        `Para lo demás, escribe a ${legalContact.email}: responderemos en un mes como máximo.`,
        "Si crees que no tratamos tus datos correctamente, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
      ],
    },
    {
      heading: "Edad mínima",
      paragraphs: [
        "Glosa es para personas de 14 años o más. Si descubrimos una cuenta de alguien más joven, la eliminaremos.",
      ],
    },
    {
      heading: "Seguridad",
      paragraphs: [
        "Protegemos tus datos con conexión cifrada (HTTPS), contraseñas guardadas cifradas, cookies de sesión que el navegador no deja leer a otros programas y límites a los intentos de acceso. Ningún sistema es infalible, pero cuidamos de que lo sea lo menos posible.",
      ],
    },
    {
      heading: "Cambios en esta política",
      paragraphs: [
        "Si cambia algo importante te lo diremos en la propia app o por correo, y actualizaremos la fecha de arriba.",
      ],
    },
  ],
};
