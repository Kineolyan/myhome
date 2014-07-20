require "spec_helper"

describe ApplicationHelper do
  let(:helper) { ApplicationHelper }

  describe "#make_date" do
    let(:date) { Date.new 2014, 1, 12 }
    let(:params) { { year: date.year, month: date.month, day: date.day } }
    subject { helper.make_date params }

    it "equals to Date object" do
       expect(subject).to eq date
    end
  end

  describe "#is_a_number?" do
    context "as number" do
      it "detect positive integer" do
        expect(helper.is_a_number? 10).to be true
      end

      it "detect negative integer" do
        expect(helper.is_a_number? -10).to be true
      end

      it "detect 0" do
        expect(helper.is_a_number? 0).to be true
      end

      it "detect positive decimal" do
        expect(helper.is_a_number? 1.25).to be true
      end

      it "detect negative integer" do
        expect(helper.is_a_number? -56.4).to be true
      end
    end

    context "as strings" do
      it "detect positive integer" do
        expect(helper.is_a_number? "10").to be true
      end

      it "detect negative integer" do
        expect(helper.is_a_number? "-10").to be true
      end

      it "detect 0" do
        expect(helper.is_a_number? "0").to be true
      end

      it "detect positive decimal" do
        expect(helper.is_a_number? "1.25").to be true
      end

      it "detect negative integer" do
        expect(helper.is_a_number? "-56.4").to be true
      end

      it "reject words" do
        expect(helper.is_a_number? "abce").to be false
      end

      it "reject empty string" do
        expect(helper.is_a_number? "").to be false
      end
    end

    it "reject nil" do
      expect(helper.is_a_number? "abce").to be false
    end
  end

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

end