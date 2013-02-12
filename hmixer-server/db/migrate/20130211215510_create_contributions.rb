class CreateContributions < ActiveRecord::Migration
  def change
    create_table :contributions do |t|
      t.references :submission
      t.references :metric
      t.string :gender
      t.integer :age
      t.decimal :healthy_min
      t.decimal :healthy_max
      t.decimal :total_min
      t.decimal :total_max
      t.integer :weight

      t.timestamps
    end
    add_index :contributions, :submission_id
    add_index :contributions, :metric_id
  end
end
