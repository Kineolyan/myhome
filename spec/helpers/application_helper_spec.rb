require "spec_helper"

describe ApplicationHelper do
  let(:helper) { ApplicationHelper }

  describe "#page_title" do
    it "has default value" do
      expect(helper.page_title).to eq "My home"
    end

    it "gets correct value" do
      expect(helper.page_title "Title").to eq "My home | Title"
    end
  end

  describe "#is_a_date?" do
  	describe "by default" do
	  	it "detects day date" do
	  		expect(helper.is_a_date? "2014-01-10").to be_truthy
	  	end

	  	it "rejects wrong date" do
	  		expect(helper.is_a_date? "2014-28-10").to be_falsey
	  	end

	  	it "rejects string" do
	  		expect(helper.is_a_date? "hello world").to be_falsey
	  	end
	  end

  	describe "with format" do
	  	it "detects date" do
	  		expect(helper.is_a_date? "2014-01", "%Y-%m").to be_truthy
	  	end

	  	it "rejects wrong date" do
	  		expect(helper.is_a_date? "2014-28-10", "%Y-%m").to be_falsey
	  	end
	  end
  end

end