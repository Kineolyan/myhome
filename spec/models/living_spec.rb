require 'rails_helper'

RSpec.describe Living, :type => :model do

	describe "#new" do
		let(:living) { Living.new }
		subject { living }

		it "works" do
			living.build_person name: "olivier"
			living.build_location address: "there"

			expect(living).to be_valid
		end

		describe "validation" do
			before do
				living.person = Person.create! name: "Yo"
				living.location = Location.create! address: 'abcde'
			end

			describe "without person" do
				before { living.person = nil }
				it_behaves_like "an invalid model"
			end

			describe "without location" do
				before { living.location = nil }
				it_behaves_like "an invalid model"
			end
		end
	end

end
