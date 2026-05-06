class CreateRefreshTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :refresh_tokens, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :token_hash, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :refresh_tokens, :token_hash, unique: true
  end
end
