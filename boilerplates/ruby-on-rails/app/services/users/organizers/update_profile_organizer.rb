module Users
  module Organizers
    class UpdateProfileOrganizer
      include Interactor::Organizer

      organize(
        Users::Interactors::UpdateUserService
      )
    end
  end
end
