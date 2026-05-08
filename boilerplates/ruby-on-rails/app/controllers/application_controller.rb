class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Authenticatable

  rescue_from StandardError,                   with: :render_internal_error
  rescue_from Errors::UnauthorizedError,       with: :render_unauthorized
  rescue_from Errors::InvalidCredentialsError, with: :render_unauthorized
  rescue_from Errors::InvalidTokenError,       with: :render_unauthorized
  rescue_from Errors::TokenExpiredError,       with: :render_unauthorized
  rescue_from Errors::EmailAlreadyInUseError,  with: :render_unprocessable
  rescue_from Errors::UsernameAlreadyInUseError, with: :render_unprocessable
  rescue_from Errors::UserNotFoundError,       with: :render_not_found

  private

  def render_unauthorized(error)
    render json: { error: error.message }, status: :unauthorized
  end

  def render_unprocessable(error)
    render json: { error: error.message }, status: :unprocessable_entity
  end

  def render_not_found(error)
    render json: { error: error.message }, status: :not_found
  end

  def render_internal_error(error)
    Rails.logger.error "[500] #{error.class}: #{error.message}"
    render json: { error: "Internal server error" }, status: :internal_server_error
  end
end
