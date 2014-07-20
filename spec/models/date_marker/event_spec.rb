require 'spec_helper'

describe DateMarker::Event do

  before(:each) do
    DatabaseCleaner.clean
  end

  describe "creation" do
    let(:event) { FactoryGirl.build :datemarker_event }

    specify { expect(event.save).to be true  }

    describe "accepts 'stringged' date" do
      before(:each) { event.day = '2014-01-01' }

      specify { expect(event.save).to be true  }
    end

    describe "without title" do
      before(:each) { event.title = nil }

      specify { expect(event.save).to be false  }
    end

    describe "without day" do
      before(:each) { event.day = nil }

      specify { expect(event.save).to be false }
    end
  end

  describe "Period calculation" do
    describe "#number_of_days" do
      let(:event) { FactoryGirl.create :datemarker_event, day: Date.today - 5 }

      specify { expect(event.number_of_days).to eql 5 }
    end

    describe "#number_of_months" do
      let(:event) { FactoryGirl.create :datemarker_event, day: Date.today << 5 }

      specify { expect(event.number_of_months).to eql 5 }
    end

    describe "#number_of_months" do
      let(:event) { FactoryGirl.create :datemarker_event, day: Date.today << 5 }

      specify { expect(event.number_of_months).to eql 5 }
    end

    describe "#number_of_years" do

      describe "on the same year" do
        let(:event) { FactoryGirl.create :datemarker_event, day: Date.today }

        specify { expect(event.number_of_years).to eq 0 }
      end

      describe "400 days ago" do
        let(:event) { FactoryGirl.create :datemarker_event, day: 400.days.ago }

        specify { expect(event.number_of_years).to eq 1 }
      end
    end
  end
end
