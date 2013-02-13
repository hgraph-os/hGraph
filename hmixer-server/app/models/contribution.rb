class Contribution < ActiveRecord::Base
  belongs_to :submission
  belongs_to :metric
  has_one: :demographic
  attr_accessible :healthy_max, :healthy_min, :total_max, :total_min, :weight
end
