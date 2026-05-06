# Domain error hierarchy — loaded at boot before any controller autoloads.
# Defined here (not in app/errors/) to avoid Zeitwerk namespace conflicts.
module Errors
  class ApplicationError < StandardError; end

  class UnauthorizedError < ApplicationError; end
  class InvalidCredentialsError < ApplicationError; end
  class InvalidTokenError < ApplicationError; end
  class TokenExpiredError < ApplicationError; end

  class UserNotFoundError < ApplicationError; end

  class EmailAlreadyInUseError < ApplicationError; end
  class UsernameAlreadyInUseError < ApplicationError; end
end
