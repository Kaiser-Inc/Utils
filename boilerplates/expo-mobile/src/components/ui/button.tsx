/**
 * Button — wrapper sobre @kaiserinc/react-native
 *
 * Mantém compatibilidade com API anterior:
 *   - variant="default"     → "primary"
 *   - variant="destructive" → "danger"
 *   - isLoading             → loading
 *   - leftIcon/rightIcon    → renderizado como ReactNode (LucideIcon component)
 *   - className             → aceito mas ignorado (KaiserInc usa StyleSheet)
 */
import {
  Button as KaisButton,
  type ButtonProps as KaisButtonProps,
  semantic,
} from "@kaiserinc/react-native";
import type { LucideIcon } from "lucide-react-native";

type IconComponent = LucideIcon;

type LegacyVariant = "default" | "outline" | "ghost" | "secondary" | "destructive";
type KaisVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const VARIANT_MAP: Record<LegacyVariant, KaisVariant> = {
  default: "primary",
  outline: "outline",
  ghost: "ghost",
  secondary: "secondary",
  destructive: "danger",
};

const ICON_COLORS: Record<KaisVariant, string> = {
  primary: semantic.white,
  secondary: semantic.black,
  ghost: semantic.brand,
  outline: semantic.brand,
  danger: semantic.white,
};

const ICON_SIZES: Record<string, number> = { sm: 14, md: 16, lg: 18 };

interface ButtonProps extends Omit<KaisButtonProps, "variant" | "leftIcon" | "rightIcon"> {
  variant?: LegacyVariant | KaisVariant;
  /** @deprecated use `loading` */
  isLoading?: boolean;
  leftIcon?: IconComponent;
  rightIcon?: IconComponent;
  /** accepted but ignored — KaiserInc Button uses StyleSheet internally */
  className?: string;
}

export function Button({
  variant = "default",
  size = "md",
  isLoading,
  loading,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className: _className,
  ...props
}: ButtonProps) {
  const kaisVariant: KaisVariant =
    variant in VARIANT_MAP ? VARIANT_MAP[variant as LegacyVariant] : (variant as KaisVariant);
  const iconColor = ICON_COLORS[kaisVariant];
  const iconSize = ICON_SIZES[size ?? "md"] ?? 16;

  return (
    <KaisButton
      variant={kaisVariant}
      size={size}
      loading={loading ?? isLoading}
      leftIcon={LeftIcon ? <LeftIcon size={iconSize} color={iconColor} /> : undefined}
      rightIcon={RightIcon ? <RightIcon size={iconSize} color={iconColor} /> : undefined}
      {...props}
    />
  );
}
