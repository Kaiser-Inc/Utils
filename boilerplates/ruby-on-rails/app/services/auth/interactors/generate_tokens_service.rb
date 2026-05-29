module Auth
  module Interactors
    class GenerateTokensService < ApplicationService
      delegate :user, to: :context

      def call
        access_token = generate_access_token(user)
        refresh_token_value = generate_refresh_token_value
        token_hash = Digest::SHA256.hexdigest(refresh_token_value)

        RefreshToken.create!(
          user: user,
          token_hash: token_hash,
          expires_at: 7.days.from_now
        )

        context.access_token = access_token
        context.refresh_token = refresh_token_value
      end

      private

      def generate_access_token(user)
        payload = {
          sub: user.id.to_s,
          role: user.role,
          type: "access",
          jti: SecureRandom.uuid,
          exp: 15.minutes.from_now.to_i
        }
        JWT.encode(payload, ENV.fetch("SECRET_KEY"), "HS256")
      end

      def generate_refresh_token_value
        SecureRandom.hex(32)
      end
    end
  end
end
