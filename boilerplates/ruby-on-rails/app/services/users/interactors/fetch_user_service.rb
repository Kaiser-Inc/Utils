module Users
  module Interactors
    class FetchUserService < ApplicationService
      delegate :user, to: :context

      def call
        raise Errors::UserNotFoundError, "User not found" unless user

        # Reload to ensure fresh data from DB
        context.user = user.reload
      end
    end
  end
end
