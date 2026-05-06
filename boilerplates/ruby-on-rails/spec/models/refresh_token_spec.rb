require "rails_helper"

RSpec.describe RefreshToken, type: :model do
  describe "associations" do
    it { should belong_to(:user) }
  end

  describe "validations" do
    it { should validate_presence_of(:token_hash) }
    it { should validate_presence_of(:expires_at) }
  end

  describe "scopes" do
    describe ".active" do
      it "returns only non-expired tokens" do
        user = create(:user)
        active_token  = create(:refresh_token, user: user)
        expired_token = create(:refresh_token, :expired, user: user)

        expect(RefreshToken.active).to include(active_token)
        expect(RefreshToken.active).not_to include(expired_token)
      end
    end
  end
end
