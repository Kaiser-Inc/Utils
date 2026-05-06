module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    raise Errors::UnauthorizedError, "Token not provided" unless token

    payload = decode_jwt(token)
    raise Errors::InvalidTokenError, "Invalid token" unless payload
    raise Errors::InvalidTokenError, "Invalid token type" unless payload["type"] == "access"

    @current_user = User.find_by(id: payload["sub"])
    raise Errors::UnauthorizedError, "User not found" unless @current_user
  end

  def current_user
    @current_user
  end

  def decode_jwt(token)
    secret = Rails.application.secret_key_base
    decoded = JWT.decode(token, secret, true, algorithm: "HS256")[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::ExpiredSignature
    raise Errors::TokenExpiredError, "Token has expired"
  rescue JWT::DecodeError
    nil
  end
end
