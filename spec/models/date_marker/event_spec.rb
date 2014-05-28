require 'spec_helper'

describe DateMarker::Event do

  before(:each) do
    DatabaseCleaner.clean
  end

  context "creation" do
    it "creates a new event" do
      event = DateMarker::Event.new({ title: "Test", day: Date.new(1988, 9, 13) })
      expect(event.save).to be_true
    end

    it "cannot create an event without title" do
      params = { day: Date.today }
      event = DateMarker::Event.new params
      expect(event.save).to be_false

      params[:title] = "test"
      event = DateMarker::Event.new params
      expect(event.save).to be_true
    end

    it "cannot create an event without day" do
      params = { title: "test" }
      event = DateMarker::Event.new params
      expect(event.save).to be_false

      params[:day] = Date.today
      event = DateMarker::Event.new params
      expect(event.save).to be_true
    end
  end

  context "Period calculation" do
    it "gets the correct number of days" do
      event_day = Date.today
      event_day -= 5

      event = DateMarker::Event.new title: "test", day: event_day
      expect(event.number_of_days).to eql 5
    end

    it "gets the correct number of months" do
      event_day = Date.today <<  5
      event = DateMarker::Event.new title: "test", day: event_day

      expect(event.number_of_months).to eql 5
    end

    it "gets the correct number of years" do
      event_day = Date.today << 7

      event = DateMarker::Event.new title: "test", day: event_day
      expect(event.number_of_years).to eql 0

      event.day <<= 24
      expect(event.number_of_years).to eql 2
    end
  end
end
