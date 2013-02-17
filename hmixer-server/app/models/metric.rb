class Metric < ActiveRecord::Base
  attr_accessible :name, :unit
  has_many :contributions
end
