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

end