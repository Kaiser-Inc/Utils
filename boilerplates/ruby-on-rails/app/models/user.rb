class User < ApplicationRecord
  has_secure_password
  has_many :refresh_tokens, dependent: :destroy

  enum :role, { user: "user", admin: "admin" }

  validates :username, presence: true,
                       uniqueness: { case_sensitive: false },
                       length: { minimum: 3, maximum: 50 }

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }

  before_validation :normalize_email

  private

  def normalize_email
    self.email = email&.downcase&.strip
  end
end
