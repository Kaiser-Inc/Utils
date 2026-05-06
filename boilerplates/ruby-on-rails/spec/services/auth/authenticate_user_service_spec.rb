require "rails_helper"

RSpec.describe Auth::Interactors::AuthenticateUserService do
  describe "#call" do
    let!(:user) { create(:user, email: "auth@example.com", password: "pass123") }

    context "with valid credentials" do
      it "succeeds and sets context.user" do
        result = described_class.call(email: "auth@example.com", password: "pass123")
        expect(result).to be_success
        expect(result.user).to eq(user)
      end
    end

    context "with wrong password" do
      it "raises InvalidCredentialsError" do
        expect {
          described_class.call(email: "auth@example.com", password: "wrong")
        }.to raise_error(Errors::InvalidCredentialsError)
      end
    end

    context "with non-existent email" do
      it "raises InvalidCredentialsError" do
        expect {
          described_class.call(email: "nobody@example.com", password: "pass123")
        }.to raise_error(Errors::InvalidCredentialsError)
      end
    end
  end
end
