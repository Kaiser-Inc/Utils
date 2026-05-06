module Users
  module Interactors
    class UpdateUserService < ApplicationService
      delegate :user, :username, :email, to: :context

      def call
        raise Errors::UserNotFoundError, "User not found" unless user

        update_params = {}
        update_params[:username] = username if username.present?
        update_params[:email] = email if email.present?

        if update_params[:email]
          existing = User.where.not(id: user.id).find_by(email: update_params[:email]&.downcase)
          raise Errors::EmailAlreadyInUseError, "Email already in use" if existing
        end

        if update_params[:username]
          existing = User.where.not(id: user.id).find_by(username: update_params[:username])
          raise Errors::UsernameAlreadyInUseError, "Username already in use" if existing
        end

        user.update!(update_params)
        context.user = user
      end
    end
  end
end
