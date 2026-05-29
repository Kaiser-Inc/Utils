import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 96, className }: LogoProps) {
  return (
    <Image
      src="/logo-kaiser.png"
      alt="KaiserInc"
      width={size}
      height={size}
      priority
      className={className}
    />
  );
}
