module Auth
  module Organizers
    class LogoutOrganizer
      include Interactor::Organizer

      organize(
        Auth::Interactors::RevokeTokensService
      )
    end
  end
end
