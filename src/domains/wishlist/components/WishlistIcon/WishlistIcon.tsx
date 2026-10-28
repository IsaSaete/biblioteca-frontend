interface WishlistIconProps {
  size?: number;
}

// Un libro cerrado con un corazón pequeño en la esquina: «el libro que
// quiero». No es el marcapáginas (ese es el botón de añadir libro) ni la estrella
// (esa es Favoritos).
const WishlistIcon = ({ size = 24 }: WishlistIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19.5 12V4.5A1.5 1.5 0 0 0 18 3H6.5A2.5 2.5 0 0 0 4 5.5v12A2.5 2.5 0 0 0 6.5 20H11" />
    <path d="M8 3v17" />
    <g transform="translate(17.5 21.5) scale(1.2) translate(-17.5 -21.5)">
      <path
        d="M17.5 21.5s-4.5-2.7-4.5-5.8a2.4 2.4 0 0 1 4.5-1.1 2.4 2.4 0 0 1 4.5 1.1c0 3.1-4.5 5.8-4.5 5.8z"
        fill="currentColor"
        strokeWidth="1"
      />
    </g>
  </svg>
);

export default WishlistIcon;
