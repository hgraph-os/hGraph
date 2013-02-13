class CreateAgeRanges < ActiveRecord::Migration
  def change
    create_table :age_ranges do |t|
      t.string :name
      t.integer :age_min
      t.integer :age_max
      t.references :demographic

      t.timestamps
    end
    add_index :age_ranges, :demographic_id
  end
end
