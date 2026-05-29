require "rails_helper"

RSpec.describe Auth::Interactors::GenerateTokensService do
  describe "#call" do
    let!(:user) { create(:user) }

    it "creates a refresh token record and sets context tokens" do
      result = described_class.call(user: user)
      expect(result).to be_success
      expect(result.access_token).to be_present
      expect(result.refresh_token).to be_present
      expect(RefreshToken.where(user: user).count).to eq(1)
    end

    it "stores only the hash of the refresh token (not plain text)" do
      result = described_class.call(user: user)
      stored = RefreshToken.find_by(user: user)
      expected_hash = Digest::SHA256.hexdigest(result.refresh_token)
      expect(stored.token_hash).to eq(expected_hash)
    end

    it "encodes user id and role in access token" do
      result = described_class.call(user: user)
      decoded = JWT.decode(result.access_token, ENV.fetch("SECRET_KEY"), true, algorithm: "HS256")[0]
      expect(decoded["sub"]).to eq(user.id.to_s)
      expect(decoded["role"]).to eq(user.role)
      expect(decoded["type"]).to eq("access")
    end
  end
end
