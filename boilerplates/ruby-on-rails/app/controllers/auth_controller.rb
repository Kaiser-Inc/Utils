class AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[register login]

  def register
    result = Auth::Organizers::RegisterOrganizer.call(
      username: params[:username],
      email: params[:email],
      password: params[:password],
      role: params.fetch(:role, "user")
    )
    render json: UserBlueprint.render(result.user), status: :created
  end

  def login
    result = Auth::Organizers::LoginOrganizer.call(
      email: params[:email],
      password: params[:password]
    )

    response.set_cookie(:refresh_token, {
      value: result.refresh_token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      expires: 7.days.from_now,
      path: "/"
    })

    render json: { access_token: result.access_token, token_type: "bearer" }, status: :ok
  end

  def refresh
    token_value = request.cookies["refresh_token"]
    raise Errors::InvalidTokenError, "Refresh token not provided" unless token_value

    result = Auth::Organizers::RefreshTokenOrganizer.call(refresh_token: token_value)

    response.set_cookie(:refresh_token, {
      value: result.refresh_token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      expires: 7.days.from_now,
      path: "/"
    })

    render json: { access_token: result.access_token, token_type: "bearer" }, status: :ok
  end

  def logout
    Auth::Organizers::LogoutOrganizer.call(user: current_user)
    cookies.delete(:refresh_token, path: "/")
    head :no_content
  end
end
