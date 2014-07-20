require 'spec_helper'

RSpec.describe HomeController, type: :controller do

  it "rend welcome accessible" do
    get :welcome
    assert_response :success
  end

end