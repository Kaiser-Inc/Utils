FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user#{n}" }
    sequence(:email)    { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    role { "user" }

    trait :admin do
      role { "admin" }
      sequence(:username) { |n| "admin#{n}" }
      sequence(:email)    { |n| "admin#{n}@example.com" }
    end
  end
end
