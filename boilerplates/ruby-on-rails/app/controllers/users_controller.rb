class UsersController < ApplicationController
  def show
    result = Users::Organizers::GetProfileOrganizer.call(user: current_user)
    render json: UserBlueprint.render(result.user), status: :ok
  end

  def update
    result = Users::Organizers::UpdateProfileOrganizer.call(
      user: current_user,
      username: params[:username],
      email: params[:email]
    )
    render json: UserBlueprint.render(result.user), status: :ok
  end

  def destroy
    Users::Organizers::DeleteUserOrganizer.call(user: current_user)
    head :no_content
  end
end
