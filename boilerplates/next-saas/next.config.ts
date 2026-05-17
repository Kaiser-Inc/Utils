import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CSP: define origens autorizadas para scripts, estilos e conexões.
// Ajuste os valores ao adicionar CDNs, analytics ou serviços externos.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' ${isDev ? "ws: wss:" : ""};
  frame-ancestors 'none';
`
  .replace(/\n/g, " ")
  .trim();

const nextConfig: NextConfig = {
  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          // HSTS: força HTTPS por 1 ano após primeiro acesso.
          // Remover em desenvolvimento ou se o app não usar HTTPS ainda.
          ...(!isDev
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },
  // Logging
  logging: {
    fetches: { fullUrl: isDev },
  },
};

export default nextConfig;
