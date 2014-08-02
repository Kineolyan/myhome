require 'rails_helper'

RSpec.describe Person, :type => :model do

	describe "#new" do
		let!(:location) { Location.create! address: "here" }
		let(:person) { Person.new name: "Me" }
		subject { person }

		it { is_expected.to be_valid }

		describe "works with #locations" do
			before { person.locations << location }
			it { is_expected.to be_valid }
		end

		describe "works with #locations#build" do
			before { person.locations.build address: "away" }
			it { is_expected.to be_valid }
		end

		describe "with #livings" do
			before { person.livings.build location: location }
			it { is_expected.to be_valid }
		end
	end

end
