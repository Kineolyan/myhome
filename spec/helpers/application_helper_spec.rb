require "spec_helper"

describe ApplicationHelper do
  let(:helper) { ApplicationHelper }

  describe "#glyphicon" do
    it "create html" do
      expect(helper.glyphicon "test").to eq "<i class=\"glyphicon glyphicon-test\"></i>".html_safe
    end

    describe "with options" do
      it "add text" do
        expect(helper.glyphicon "test", text: "coucou").to eq "<i class=\"glyphicon glyphicon-test\">coucou</i>".html_safe
      end

      it "add btn" do
        expect(helper.glyphicon "test", btn: "alert").to eq "<i class=\"glyphicon glyphicon-test btn btn-alert\"></i>".html_safe
      end
    end
  end

  describe "#is_a_date?" do
    [ "10/03/2014" ].each do |date|
      it "detects #{date}" do
        expect(helper.is_a_date? date).to be true
      end
    end

    [ "123456", "", "abcde" ].each do |wrong_date|
      it "fails on #{wrong_date}" do
        expect(helper.is_a_date? wrong_date).to be false
      end
    end
  end

  describe "#page_title" do
    it "has default value" do
      expect(helper.page_title).to eq "My home"
    end

    it "gets correct value" do
      expect(helper.page_title "Title").to eq "My home | Title"
    end
  end

end