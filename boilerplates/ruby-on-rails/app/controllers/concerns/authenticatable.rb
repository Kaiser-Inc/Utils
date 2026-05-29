module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    token = extract_bearer_token
    payload = decode_jwt(token)
    validate_token_payload!(payload)
    @current_user = resolve_user!(payload["sub"])
  end

  def current_user
    @current_user
  end

  def extract_bearer_token
    token = request.headers["Authorization"]&.split(" ")&.last
    raise Errors::UnauthorizedError, "Token not provided" unless token

    token
  end

  def validate_token_payload!(payload)
    raise Errors::InvalidTokenError, "Invalid token type" unless payload["type"] == "access"
  end

  def resolve_user!(user_id)
    user = User.find_by(id: user_id)
    raise Errors::UnauthorizedError, "User not found" unless user

    user
  end

  def decode_jwt(token)
    raw = JWT.decode(token, ENV.fetch("SECRET_KEY"), true, algorithm: "HS256")[0]
    HashWithIndifferentAccess.new(raw)
  rescue JWT::ExpiredSignature
    raise Errors::TokenExpiredError, "Token has expired"
  rescue JWT::DecodeError => e
    raise Errors::InvalidTokenError, "Invalid token: #{e.message}"
  end
end
