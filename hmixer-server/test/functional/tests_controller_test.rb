require 'test_helper'

class TestsControllerTest < ActionController::TestCase
  test "should get metrics" do
    get :metrics
    assert_response :success
  end

end
