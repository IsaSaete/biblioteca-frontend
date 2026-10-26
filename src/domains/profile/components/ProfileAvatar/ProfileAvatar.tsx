import Avatar from "@mui/material/Avatar";
import { getInitials } from "../../utils/getInitials";

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size: number;
}

// La foto de la cuenta o, si no hay (o no carga), sus iniciales. Es decorativa:
// el nombre ya está escrito al lado.
const ProfileAvatar = ({ name, avatarUrl, size }: ProfileAvatarProps) => (
  <Avatar
    src={avatarUrl ?? undefined}
    aria-hidden="true"
    sx={{
      width: size,
      height: size,
      fontSize: size >= 96 ? "1.5rem" : "1.1875rem",
      bgcolor: "secondary.main",
      color: "secondary.contrastText",
      fontWeight: 500,
    }}
  >
    {getInitials(name)}
  </Avatar>
);

export default ProfileAvatar;
