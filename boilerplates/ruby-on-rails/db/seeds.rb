# db/seeds.rb
# Seed script — populates the database with development data.
# Run: bin/rails db:seed  OR  make setup

SEED_USERS = [
  { username: "admin", email: "admin@example.com", password: "password123", role: "admin" },
  { username: "alice", email: "alice@example.com", password: "password123", role: "user" },
  { username: "bob",   email: "bob@example.com",   password: "password123", role: "user" },
].freeze

SEED_USERS.each do |attrs|
  User.find_or_create_by!(email: attrs[:email]) do |u|
    u.username              = attrs[:username]
    u.password              = attrs[:password]
    u.password_confirmation = attrs[:password]
    u.role                  = attrs[:role]
  end
  puts "  Seeded: #{attrs[:email]} / #{attrs[:password]} (role: #{attrs[:role]})"
end

puts "Done."
