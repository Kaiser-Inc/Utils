/**
 * Card — re-exports @kaiserinc/react-native + aliases de compatibilidade
 *
 * KaiserInc: Card + CardHeader + CardTitle + CardBody
 * Aliases:   CardContent = CardBody, CardFooter (NativeWind View)
 */
export { Card, CardBody, CardHeader, CardTitle } from "@kaiserinc/react-native";
export type {
  CardProps,
  CardBodyProps,
  CardHeaderProps,
  CardTitleProps,
} from "@kaiserinc/react-native";

/** Alias de CardBody — mantém compatibilidade com imports existentes */
export { CardBody as CardContent } from "@kaiserinc/react-native";

import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

/** Rodapé do card — NativeWind View (não existe no @kaiserinc/react-native) */
export function CardFooter({ children, style, ...props }: ViewProps) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingBottom: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
