FactoryBot.define do
  factory :refresh_token do
    association :user
    token_hash { Digest::SHA256.hexdigest(SecureRandom.hex(32)) }
    expires_at { 7.days.from_now }

    trait :expired do
      expires_at { 1.day.ago }
    end
  end
end
