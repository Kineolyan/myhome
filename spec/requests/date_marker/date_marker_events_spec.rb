require 'rails_helper'

RSpec.describe "DateMarker::Events", :type => :request do
  describe "GET /date-marker/events/:event_id/get_day" do
  	let!(:event) { FactoryGirl.create :datemarker_event, day: Date.new(1988, 9, 13) }
  	before { visit get_day_date_marker_event_path event }

  	describe "the get-day form" do
	  	subject { page.find('#get-day-form') }

	  	it { is_expected.to have_field "number", type: "number" }
	  	it { is_expected.to have_select "time_span", with_options: %W{jours mois} }
	  	it { is_expected.to have_button "Trouver la date" }

  		def fill_form number, time_span
  			fill_in "number", with: number
  			select time_span, from: "time_span"
  		end

  		def submit_form
  			click_button "Trouver la date"
  		end

  		def submit_request number, time_span
  			fill_form number, time_span
  			submit_form
  		end

	  	describe "at submit" do
	  		subject { page.find('#date-list') }

	  		describe "on future date" do
	  			describe "with a number of days" do
	  				before { submit_request 36500, "jours" }

	  				it { is_expected.to have_content "36500 jours le #{(event.day + 36500).strftime('%d/%m/%Y')}" }
	  			end

	  			describe "with a number of months" do
	  				before { submit_request 1200, "mois" }

	  				it { is_expected.to have_content "1200 mois le #{(event.day >> 1200).strftime('%d/%m/%Y')}" }
	  			end
	  		end

	  		describe "on past date" do
	  			describe "with a number of days" do
	  				before { submit_request 10, "jours" }

	  				it { is_expected.to have_content "10 jours le #{(event.day + 10).strftime('%d/%m/%Y')}" }
	  			end

	  			describe "with a number of months" do
	  				before { submit_request 2, "mois" }

	  				it { is_expected.to have_content "2 mois le #{(event.day >> 2).strftime('%d/%m/%Y')}" }
	  			end
	  		end
	  	end
	  end
  end
end
