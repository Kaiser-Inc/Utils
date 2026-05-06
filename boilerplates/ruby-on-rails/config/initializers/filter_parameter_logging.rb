Rails.application.config.filter_parameters += %i[
  passw secret token _key crypt salt certificate otp ssn
  password password_confirmation password_digest
  refresh_token access_token
]
