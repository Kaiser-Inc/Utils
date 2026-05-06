class ApiDocsController < ApplicationController
  skip_before_action :authenticate_user!

  # GET /scalar
  # Serve a UI do Scalar apontando para o swagger.yaml gerado pelo rswag.
  # Para gerar o arquivo: make docs
  # Para acessar: http://localhost:3000/scalar
  def scalar
    render html: scalar_html.html_safe, layout: false
  end

  private

  def scalar_html
    <<~HTML
      <!doctype html>
      <html lang="en">
        <head>
          <title>#{Rails.application.class.module_parent_name} API Reference</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <script
            id="api-reference"
            data-url="/api-docs/v1/swagger.yaml"
            data-configuration='#{scalar_configuration.to_json}'
          ></script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
      </html>
    HTML
  end

  def scalar_configuration
    {
      theme: "purple",
      defaultHttpClient: { targetKey: "ruby", clientKey: "net_http" },
      hideDownloadButton: false,
      darkMode: true
    }
  end
end
