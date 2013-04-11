class Demographic < ActiveRecord::Base
  #belongs_to :contribution
  attr_protected :gender
  has_many :contributions
end
