module Auth
  module Organizers
    class LoginOrganizer
      include Interactor::Organizer

      organize(
        Auth::Interactors::AuthenticateUserService,
        Auth::Interactors::GenerateTokensService
      )
    end
  end
end
