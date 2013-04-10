class Metric < ActiveRecord::Base
  attr_protected :name, :unit
  has_many :contributions
end
