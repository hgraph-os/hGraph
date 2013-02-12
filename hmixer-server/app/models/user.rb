class User < ActiveRecord::Base
  attr_accessible :email, :full_name
  has_many :submissions
end
