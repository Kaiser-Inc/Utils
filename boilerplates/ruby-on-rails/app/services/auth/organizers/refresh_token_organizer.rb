module Auth
  module Organizers
    class RefreshTokenOrganizer
      include Interactor::Organizer

      organize(
        Auth::Interactors::RotateRefreshTokenService
      )
    end
  end
end
