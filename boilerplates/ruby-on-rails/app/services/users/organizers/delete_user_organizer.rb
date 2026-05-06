module Users
  module Organizers
    class DeleteUserOrganizer
      include Interactor::Organizer

      organize(
        Users::Interactors::DeleteUserService
      )
    end
  end
end
