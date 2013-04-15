class Submission < ActiveRecord::Base
  belongs_to :user
  attr_protected :message, :contribution
  has_many :contributions

end
