require 'test_helper'

class HomeControllerTest < ActionController::TestCase
  test "should get welcone" do
    get :welcone
    assert_response :success
  end

end
