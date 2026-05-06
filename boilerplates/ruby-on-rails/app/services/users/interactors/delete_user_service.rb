module Users
  module Interactors
    class DeleteUserService < ApplicationService
      delegate :user, to: :context

      def call
        raise Errors::UserNotFoundError, "User not found" unless user

        user.destroy!
      end
    end
  end
end
