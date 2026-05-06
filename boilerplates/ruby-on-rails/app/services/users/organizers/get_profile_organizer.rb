module Users
  module Organizers
    class GetProfileOrganizer
      include Interactor::Organizer

      organize(
        Users::Interactors::FetchUserService
      )
    end
  end
end
