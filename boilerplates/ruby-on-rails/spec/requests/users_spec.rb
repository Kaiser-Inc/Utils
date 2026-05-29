require "swagger_helper"

RSpec.describe "Users API", type: :request do
  def generate_access_token(user)
    payload = { sub: user.id.to_s, role: user.role, type: "access", exp: 15.minutes.from_now.to_i }
    JWT.encode(payload, ENV.fetch("SECRET_KEY"), "HS256")
  end

  def generate_expired_token(user)
    payload = { sub: user.id.to_s, role: user.role, type: "access", exp: 1.minute.ago.to_i }
    JWT.encode(payload, ENV.fetch("SECRET_KEY"), "HS256")
  end

  path "/users/me" do
    get "Get current user profile" do
      tags     "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :Authorization,
                in: :header,
                schema: { type: :string },
                required: true,
                description: "Bearer <access_token>"

      response "200", "profile returned" do
        schema "$ref" => "#/components/schemas/User"

        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer #{generate_access_token(user)}" }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json["email"]).to eq(user.email)
          expect(json["username"]).to eq(user.username)
          expect(json).not_to have_key("password_digest")
        end
      end

      response "401", "missing or invalid token" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:Authorization) { nil }

        run_test!
      end

      response "401", "expired token" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer #{generate_expired_token(user)}" }

        run_test! do |response|
          expect(JSON.parse(response.body)).to have_key("error")
        end
      end

      response "401", "malformed token" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer not.a.valid.jwt" }

        run_test! do |response|
          expect(JSON.parse(response.body)).to have_key("error")
        end
      end

      response "401", "user deleted after token issued" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer #{generate_access_token(user)}" }

        before { user.destroy! }

        run_test! do |response|
          expect(JSON.parse(response.body)).to have_key("error")
        end
      end
    end

    put "Update current user profile" do
      tags     "Users"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :Authorization,
                in: :header,
                schema: { type: :string },
                required: true,
                description: "Bearer <access_token>"

      parameter name: :body,
                in: :body,
                schema: { "$ref" => "#/components/schemas/UpdateUserRequest" }

      response "200", "profile updated" do
        schema "$ref" => "#/components/schemas/User"

        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer #{generate_access_token(user)}" }
        let(:body)           { { username: "updated_username" } }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json["username"]).to eq("updated_username")
        end
      end

      response "422", "email already taken" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let!(:other_user)    { create(:user, email: "taken@example.com") }
        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer #{generate_access_token(user)}" }
        let(:body)           { { email: "taken@example.com" } }

        run_test!
      end

      response "401", "missing or invalid token" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:Authorization) { nil }
        let(:body)          { { username: "hacker" } }

        run_test!
      end
    end

    delete "Delete current user account" do
      tags     "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :Authorization,
                in: :header,
                schema: { type: :string },
                required: true,
                description: "Bearer <access_token>"

      response "204", "account deleted" do
        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer #{generate_access_token(user)}" }

        run_test! do
          expect(User.find_by(id: user.id)).to be_nil
        end
      end

      response "401", "missing or invalid token" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:Authorization) { nil }

        run_test!
      end
    end
  end
end
