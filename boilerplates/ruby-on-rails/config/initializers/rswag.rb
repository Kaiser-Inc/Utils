Rswag::Ui.configure do |config|
  config.swagger_endpoint "/api-docs/v1/swagger.yaml", "Boilerplate API v1"
  config.config_object[:tryItOutEnabled] = true
  config.config_object[:docExpansion] = "list"
end

Rswag::Api.configure do |config|
  config.swagger_root = Rails.root.join("swagger").to_s
end
