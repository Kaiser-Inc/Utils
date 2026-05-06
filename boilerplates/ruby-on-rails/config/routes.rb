Rails.application.routes.draw do
  # OpenAPI spec endpoint (rswag) + Scalar UI
  # Scalar:    GET /scalar      → UI moderna (recomendado)
  # Rswag UI:  GET /api-docs    → Swagger UI (alternativo)
  # Para gerar swagger.yaml: make docs
  mount Rswag::Ui::Engine  => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  get "scalar", to: "api_docs#scalar"

  get "health", to: "health#show"

  post "auth/register", to: "auth#register"
  post "auth/session",  to: "auth#login"
  patch "auth/refresh", to: "auth#refresh"
  patch "auth/logout",  to: "auth#logout"

  get    "users/me", to: "users#show"
  put    "users/me", to: "users#update"
  delete "users/me", to: "users#destroy"
end
