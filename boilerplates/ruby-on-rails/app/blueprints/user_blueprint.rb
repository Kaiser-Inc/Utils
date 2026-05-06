class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :username, :email, :role, :created_at

  # Intentionally excludes: password_digest, updated_at
end
