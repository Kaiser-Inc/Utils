require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module RailsBoilerplate
  class Application < Rails::Application
    config.load_defaults 8.1

    config.autoload_lib(ignore: %w[assets tasks])

    # API-only mode — no views, helpers, or asset pipeline
    config.api_only = true

    # Enable cookies middleware (needed for HttpOnly refresh token cookie)
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore

    # UUID as default primary key type
    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end

    # Autoload services and blueprints subdirectories
    # (app/errors.rb is at app/ root — autoloaded by default)
    config.autoload_paths += %W[
      #{config.root}/app/services
      #{config.root}/app/blueprints
    ]
  end
end
