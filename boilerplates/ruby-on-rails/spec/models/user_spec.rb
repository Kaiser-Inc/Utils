require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { should have_many(:refresh_tokens).dependent(:destroy) }
  end

  describe "validations" do
    subject { build(:user) }

    it { should validate_presence_of(:username) }
    it { should validate_uniqueness_of(:username).case_insensitive }
    it { should validate_length_of(:username).is_at_least(3).is_at_most(50) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }

    it { should have_secure_password }
  end

  describe "enums" do
    it { should define_enum_for(:role).with_values(user: "user", admin: "admin") }
  end

  describe "default role" do
    it "defaults to user role" do
      user = build(:user)
      expect(user.role).to eq("user")
    end
  end

  describe "role helpers" do
    it "identifies admin users" do
      user = build(:user, :admin)
      expect(user.admin?).to be true
      expect(user.user?).to be false
    end

    it "identifies regular users" do
      user = build(:user)
      expect(user.user?).to be true
      expect(user.admin?).to be false
    end
  end
end
