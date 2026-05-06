Rswag::Ui.configure do |config|
  # Registra o arquivo swagger gerado no Swagger UI
  config.swagger_endpoint "/api-docs/v1/swagger.yaml", "Boilerplate API v1"

  # Habilita "Try it out" por padrão
  config.config_object[:tryItOutEnabled] = true

  # Expande a primeira tag por padrão
  config.config_object[:docExpansion] = "list"
end

Rswag::Api.configure do |config|
  config.swagger_root = Rails.root.join("swagger").to_s
end
