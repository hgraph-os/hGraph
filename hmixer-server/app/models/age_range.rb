class AgeRange < ActiveRecord::Base
  belongs_to :demographic
  attr_accessible :age_max, :age_min, :name
end
