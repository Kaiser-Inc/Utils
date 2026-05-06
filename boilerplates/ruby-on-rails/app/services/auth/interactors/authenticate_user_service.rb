module Auth
  module Interactors
    class AuthenticateUserService < ApplicationService
      delegate :email, :password, to: :context

      def call
        user = User.find_by(email: email&.downcase)

        unless user&.authenticate(password)
          raise Errors::InvalidCredentialsError, "Invalid email or password"
        end

        context.user = user
      end
    end
  end
end
