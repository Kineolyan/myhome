require 'spec_helper'

describe HomeController do

  it "rend welcome accessible" do
    get :welcome
    assert_response :success
  end

end