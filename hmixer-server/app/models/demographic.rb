class Demographic < ActiveRecord::Base
  belongs_to :contribution
  attr_accessible :gender
end
