class NewDemographicsTable < ActiveRecord::Migration
  def up
    change_table(:demographics) do |t|
      #t.references :age_ranges
      t.remove :contribution_id
    end

    rename_column :contributions, :weight, :score_weight

  end

  def down
  end
end
