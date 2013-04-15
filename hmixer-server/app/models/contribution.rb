class Contribution < ActiveRecord::Base
  belongs_to :submission
  belongs_to :metric
  belongs_to :demographic
  attr_accessible :healthy_max, :healthy_min, :total_max, :total_min, :weight, :score_weight, :metric_id, :demographic_id
end
