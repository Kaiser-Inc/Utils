module Auth
  module Interactors
    class CreateUserService < ApplicationService
      delegate :username, :email, :password, :role, to: :context

      def call
        raise Errors::EmailAlreadyInUseError, "Email already in use" if User.exists?(email: email&.downcase)
        raise Errors::UsernameAlreadyInUseError, "Username already in use" if User.exists?(username: username)

        user = User.create!(
          username: username,
          email: email,
          password: password,
          role: role || "user"
        )

        context.user = user
      end
    end
  end
end
