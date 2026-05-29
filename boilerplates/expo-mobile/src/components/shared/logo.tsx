import { Image } from "react-native";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 96 }: LogoProps) {
  return (
    <Image
      source={require("../../../assets/logo-kaiser.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
