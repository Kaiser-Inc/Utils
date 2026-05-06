module Auth
  module Interactors
    class RevokeTokensService < ApplicationService
      delegate :user, to: :context

      def call
        # Delete all refresh tokens for this user (full logout)
        user.refresh_tokens.destroy_all
      end
    end
  end
end
