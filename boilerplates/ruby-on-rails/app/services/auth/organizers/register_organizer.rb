module Auth
  module Organizers
    class RegisterOrganizer
      include Interactor::Organizer

      organize(
        Auth::Interactors::CreateUserService,
        Auth::Interactors::GenerateTokensService
      )
    end
  end
end
