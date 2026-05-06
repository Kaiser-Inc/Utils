require "swagger_helper"

RSpec.describe "Auth API", type: :request do
  # ── Helper ──────────────────────────────────────────────────────────────────
  def generate_access_token(user)
    payload = { sub: user.id.to_s, role: user.role, type: "access", exp: 15.minutes.from_now.to_i }
    JWT.encode(payload, Rails.application.secret_key_base, "HS256")
  end

  # ── POST /auth/register ─────────────────────────────────────────────────────
  path "/auth/register" do
    post "Register a new user" do
      tags        "Auth"
      consumes    "application/json"
      produces    "application/json"
      security    [] # endpoint público

      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/RegisterRequest" }

      response "201", "user created" do
        schema "$ref" => "#/components/schemas/User"

        let(:body) { { username: "newuser", email: "newuser@example.com", password: "password123" } }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json["email"]).to eq("newuser@example.com")
          expect(json).not_to have_key("password_digest")
        end
      end

      response "422", "email already in use" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        before { create(:user, email: "taken@example.com") }
        let(:body) { { username: "other", email: "taken@example.com", password: "password123" } }

        run_test! do |response|
          expect(JSON.parse(response.body)).to have_key("error")
        end
      end

      response "422", "username already in use" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        before { create(:user, username: "taken") }
        let(:body) { { username: "taken", email: "unique@example.com", password: "password123" } }

        run_test!
      end
    end
  end

  # ── POST /auth/session ──────────────────────────────────────────────────────
  path "/auth/session" do
    post "Login — returns access token + sets refresh cookie" do
      tags        "Auth"
      consumes    "application/json"
      produces    "application/json"
      security    [] # endpoint público

      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/LoginRequest" }

      response "200", "login successful" do
        schema "$ref" => "#/components/schemas/AccessTokenResponse"

        let!(:user) { create(:user, email: "login@example.com", password: "password123") }
        let(:body)  { { email: "login@example.com", password: "password123" } }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json["access_token"]).to be_present
          expect(json["token_type"]).to eq("bearer")
          expect(response.cookies["refresh_token"]).to be_present
        end
      end

      response "401", "invalid credentials" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let!(:user) { create(:user, email: "login@example.com", password: "password123") }
        let(:body)  { { email: "login@example.com", password: "wrong_password" } }

        run_test!
      end

      response "401", "user not found" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:body) { { email: "nobody@example.com", password: "password123" } }

        run_test!
      end
    end
  end

  # ── PATCH /auth/refresh ─────────────────────────────────────────────────────
  path "/auth/refresh" do
    patch "Refresh access token using HTTP-only cookie" do
      tags     "Auth"
      produces "application/json"
      security [] # autenticado via cookie, não bearer

      parameter name: :Cookie,
                in: :header,
                schema: { type: :string },
                required: false,
                description: "refresh_token=<token> (HTTP-only cookie, enviado automaticamente pelo browser)"

      response "200", "new access token issued" do
        schema "$ref" => "#/components/schemas/AccessTokenResponse"

        let!(:user)          { create(:user) }
        let!(:raw_token)     { SecureRandom.hex(32) }
        let!(:token_hash)    { Digest::SHA256.hexdigest(raw_token) }
        let!(:stored_token)  { create(:refresh_token, user: user, token_hash: token_hash) }
        let(:Cookie)         { "refresh_token=#{raw_token}" }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json["access_token"]).to be_present
        end
      end

      response "401", "no refresh cookie" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:Cookie) { nil }

        run_test!
      end

      response "401", "expired refresh token" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let!(:user)         { create(:user) }
        let!(:raw_token)    { SecureRandom.hex(32) }
        let!(:token_hash)   { Digest::SHA256.hexdigest(raw_token) }
        let!(:expired_token){ create(:refresh_token, :expired, user: user, token_hash: token_hash) }
        let(:Cookie)        { "refresh_token=#{raw_token}" }

        run_test!
      end
    end
  end

  # ── PATCH /auth/logout ──────────────────────────────────────────────────────
  path "/auth/logout" do
    patch "Logout — revoke all refresh tokens" do
      tags     "Auth"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :Authorization,
                in: :header,
                schema: { type: :string },
                required: true,
                description: "Bearer <access_token>"

      response "204", "logged out successfully" do
        let!(:user)          { create(:user) }
        let!(:Authorization) { "Bearer #{generate_access_token(user)}" }

        before { create(:refresh_token, user: user) }

        run_test! do
          expect(user.refresh_tokens.reload.count).to eq(0)
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
