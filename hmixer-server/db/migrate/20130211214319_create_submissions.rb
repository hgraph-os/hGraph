class CreateSubmissions < ActiveRecord::Migration
  def change
    create_table :submissions do |t|
      t.references :user
      t.text :message

      t.timestamps
    end
    add_index :submissions, :user_id
  end
end
