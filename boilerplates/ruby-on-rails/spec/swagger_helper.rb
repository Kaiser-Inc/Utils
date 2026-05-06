require "rails_helper"

RSpec.configure do |config|
  # Diretório onde o swagger.yaml gerado será salvo
  config.swagger_root = Rails.root.join("swagger").to_s

  # Definição OpenAPI 3.0 completa
  config.swagger_docs = {
    "v1/swagger.yaml" => {
      openapi: "3.0.1",
      info: {
        title: "Rails Boilerplate API",
        version: "v1",
        description: <<~DESC
          API de autenticação com dual-token JWT.
          Autenticação via `Authorization: Bearer <access_token>`.
          O refresh token é enviado automaticamente via cookie HTTP-only.
        DESC,
        contact: {
          name: "KaiserInc",
          url: "https://github.com/KaiserInc"
        }
      },
      servers: [
        { url: "http://localhost:3000", description: "Development" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: "JWT",
            description: "Access token JWT. Expira em 15 minutos."
          }
        },
        schemas: {
          # ── Response schemas ──────────────────────────────────────────────
          User: {
            type: :object,
            properties: {
              id:         { type: :string, format: :uuid, example: "550e8400-e29b-41d4-a716-446655440000" },
              username:   { type: :string, example: "pedro" },
              email:      { type: :string, format: :email, example: "pedro@example.com" },
              role:       { type: :string, enum: %w[user admin], example: "user" },
              created_at: { type: :string, format: "date-time", example: "2026-01-01T00:00:00.000Z" }
            },
            required: %w[id username email role created_at]
          },
          AccessTokenResponse: {
            type: :object,
            properties: {
              access_token: { type: :string, example: "eyJhbGciOiJIUzI1NiJ9..." },
              token_type:   { type: :string, example: "bearer" }
            },
            required: %w[access_token token_type]
          },
          ErrorResponse: {
            type: :object,
            properties: {
              error: { type: :string, example: "Invalid credentials" }
            },
            required: %w[error]
          },
          # ── Request schemas ───────────────────────────────────────────────
          RegisterRequest: {
            type: :object,
            properties: {
              username: { type: :string, minLength: 3, maxLength: 50, example: "pedro" },
              email:    { type: :string, format: :email, example: "pedro@example.com" },
              password: { type: :string, minLength: 8, example: "secret123" },
              role:     { type: :string, enum: %w[user admin], default: "user", example: "user" }
            },
            required: %w[username email password]
          },
          LoginRequest: {
            type: :object,
            properties: {
              email:    { type: :string, format: :email, example: "pedro@example.com" },
              password: { type: :string, example: "secret123" }
            },
            required: %w[email password]
          },
          UpdateUserRequest: {
            type: :object,
            properties: {
              username: { type: :string, minLength: 3, maxLength: 50, example: "new_username" },
              email:    { type: :string, format: :email, example: "new@example.com" }
            }
          }
        }
      },
      # Security global — sobrescrita nos endpoints públicos com security: []
      security: [ { bearerAuth: [] } ],
      tags: [
        { name: "Health",        description: "Status da aplicação" },
        { name: "Auth",          description: "Registro, login, refresh e logout" },
        { name: "Users",         description: "Gerenciamento do perfil autenticado" }
      ],
      paths: {}
    }
  }

  config.swagger_format = :yaml
end
