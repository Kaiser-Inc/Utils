module Auth
  module Interactors
    class RotateRefreshTokenService < ApplicationService
      delegate :refresh_token, to: :context

      def call
        token_hash = Digest::SHA256.hexdigest(refresh_token)
        stored = RefreshToken.active.find_by(token_hash: token_hash)

        raise Errors::InvalidTokenError, "Refresh token is invalid or expired" unless stored

        user = stored.user

        stored.destroy!

        new_access_token = generate_access_token(user)
        new_refresh_token_value = SecureRandom.hex(32)
        new_token_hash = Digest::SHA256.hexdigest(new_refresh_token_value)

        RefreshToken.create!(
          user: user,
          token_hash: new_token_hash,
          expires_at: 7.days.from_now
        )

        context.access_token = new_access_token
        context.refresh_token = new_refresh_token_value
      end

      private

      def generate_access_token(user)
        payload = {
          sub: user.id.to_s,
          role: user.role,
          type: "access",
          exp: 15.minutes.from_now.to_i
        }
        JWT.encode(payload, Rails.application.secret_key_base, "HS256")
      end
    end
  end
end
