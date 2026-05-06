module Auth
  module Interactors
    class RevokeTokensService < ApplicationService
      delegate :user, to: :context

      def call
        user.refresh_tokens.destroy_all
      end
    end
  end
end
