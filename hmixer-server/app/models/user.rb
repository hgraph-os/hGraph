class User < ActiveRecord::Base
  attr_accessible :email, :full_name
end
