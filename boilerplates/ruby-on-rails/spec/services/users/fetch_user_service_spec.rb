require "rails_helper"

RSpec.describe Users::Interactors::FetchUserService do
  describe "#call" do
    let!(:user) { create(:user) }

    context "when user exists" do
      it "succeeds and sets context.user" do
        result = described_class.call(user: user)
        expect(result).to be_success
        expect(result.user).to eq(user)
      end
    end
  end
end
