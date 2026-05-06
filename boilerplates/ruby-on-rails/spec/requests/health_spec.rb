require "swagger_helper"

RSpec.describe "Health API", type: :request do
  path "/health" do
    get "Health check" do
      tags     "Health"
      produces "application/json"
      security [] # endpoint público

      response "200", "application is healthy" do
        schema type: :object,
               properties: {
                 status: { type: :string, example: "ok" }
               },
               required: %w[status]

        run_test!
      end
    end
  end
end
