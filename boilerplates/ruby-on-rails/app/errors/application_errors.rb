module Errors
  class ApplicationError < StandardError; end

  # Auth errors
  class UnauthorizedError < ApplicationError; end
  class InvalidCredentialsError < ApplicationError; end
  class InvalidTokenError < ApplicationError; end
  class TokenExpiredError < ApplicationError; end

  # Resource errors
  class UserNotFoundError < ApplicationError; end

  # Validation / uniqueness errors
  class EmailAlreadyInUseError < ApplicationError; end
  class UsernameAlreadyInUseError < ApplicationError; end
end
