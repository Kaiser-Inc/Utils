# db/seeds.rb
# Example seed data — customize for your project

# Admin user
User.find_or_create_by!(email: "admin@example.com") do |u|
  u.username = "admin"
  u.password = "password123"
  u.password_confirmation = "password123"
  u.role = "admin"
end

puts "Seeded: admin@example.com / password123"
