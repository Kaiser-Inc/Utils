class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :username, :email, :role

  field :created_at do |user|
    user.created_at.iso8601
  end

  # Intentionally excludes: password_digest, updated_at
end
