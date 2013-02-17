class CreateDemographics < ActiveRecord::Migration
  def change
    create_table :demographics do |t|
      t.string :gender
      t.references :contribution

      t.timestamps
    end
    add_index :demographics, :contribution_id
  end
end
