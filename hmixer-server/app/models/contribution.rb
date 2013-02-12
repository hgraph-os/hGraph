class Contribution < ActiveRecord::Base
  belongs_to :submission
  belongs_to :metric
  attr_accessible :age, :gender, :healthy_max, :healthy_min, :total_max, :total_min, :weight
end
