import type { LegalContent } from "../dto/LegalContent";
import { legalContact } from "./legalContact";

// Borrador redactado a partir de lo que la app hace de verdad. Debe revisarlo
// su titular: no es asesoramiento jurídico.
export const termsContent: LegalContent = {
  title: "Términos de uso",
  lastUpdated: "3 de noviembre de 2026",
  sections: [
    {
      heading: "Qué es Glosa y quién la ofrece",
      paragraphs: [
        `Glosa es una aplicación gratuita para catalogar los libros que tienes en casa y guardar tus citas. La ofrece ${legalContact.owner}, como proyecto personal. Puedes contactar en ${legalContact.email}.`,
      ],
    },
    {
      heading: "Aceptación y edad mínima",
      paragraphs: [
        "Al crear tu cuenta aceptas estos Términos y la Política de Privacidad. Para usar Glosa debes tener 14 años o más.",
      ],
    },
    {
      heading: "Tu cuenta",
      paragraphs: [
        "Debes dar datos verdaderos y mantener tu contraseña en secreto. Eres responsable de lo que se haga con tu cuenta. Si crees que alguien ha entrado sin permiso, cambia la contraseña y avísanos.",
      ],
    },
    {
      heading: "Uso aceptable",
      paragraphs: ["Al usar Glosa te comprometes a no:"],
      items: [
        "intentar acceder a cuentas ajenas ni saltarte las medidas de seguridad;",
        "sobrecargar el servicio con un uso automatizado o masivo;",
        "usarlo para actividades ilegales ni guardar contenidos que vulneren derechos de otras personas.",
      ],
    },
    {
      heading: "Tu contenido",
      paragraphs: [
        "Tus libros, notas y citas son tuyos y solo los ves tú: Glosa no tiene perfiles públicos ni comparte lo que guardas. Nos das el permiso técnico necesario para almacenarlos y mostrártelos.",
        "Las citas que guardes son para tu uso personal. Eres responsable de que guardarlas no infrinja derechos de autor, por ejemplo copiando fragmentos extensos.",
        "Puedes descargar todo lo que guardas o eliminarlo cuando quieras desde Perfil.",
      ],
    },
    {
      heading: "Datos de los libros",
      paragraphs: [
        "La información de los libros (título, autor, portada, editorial…) viene de Google Books y Open Library y puede tener errores. Puedes corregirla en tu ficha.",
      ],
    },
    {
      heading: "Gratuidad",
      paragraphs: [
        "Glosa es gratis y no tiene anuncios. Si algún día eso cambia, te avisaremos con antelación y tus datos seguirán siendo descargables.",
      ],
    },
    {
      heading: "Disponibilidad y cambios en el servicio",
      paragraphs: [
        "Glosa es un proyecto personal y se aloja en servicios gratuitos: puede tardar en arrancar, no funcionar de forma temporal o cambiar. No garantizamos que esté disponible en todo momento.",
        "Podemos modificar o cerrar el servicio. Si ocurriera, haremos lo posible por avisarte con tiempo para que descargues tus datos.",
      ],
    },
    {
      heading: "Propiedad intelectual",
      paragraphs: [
        "El nombre, el diseño y el código de Glosa pertenecen a su autora, salvo los componentes de terceros, que mantienen sus propias licencias. Estos Términos no te dan ningún derecho sobre ellos más allá de usar el servicio.",
      ],
    },
    {
      heading: "Responsabilidad",
      paragraphs: [
        "Glosa se ofrece tal cual, sin garantías. En la medida que permite la ley, no respondemos de pérdidas de datos ni de daños derivados de fallos del servicio. Por eso te recomendamos descargar una copia de tus datos de vez en cuando desde Perfil. Esto no afecta a los derechos que la ley te reconoce como consumidor y que no se pueden renunciar.",
      ],
    },
    {
      heading: "Baja de la cuenta",
      paragraphs: [
        "Puedes eliminar tu cuenta cuando quieras desde Perfil. Podemos suspender o eliminar las cuentas que incumplan estos Términos.",
      ],
    },
    {
      heading: "Cambios en los Términos",
      paragraphs: [
        "Si cambian de forma importante te avisaremos en la app o por correo, y actualizaremos la fecha de arriba. Si sigues usando Glosa después, entendemos que los aceptas.",
      ],
    },
    {
      heading: "Ley aplicable",
      paragraphs: [
        "Estos Términos se rigen por la ley española. Si hay algún conflicto, serán competentes los juzgados que correspondan según la normativa de consumidores.",
      ],
    },
  ],
};
