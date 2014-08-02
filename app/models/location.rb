class Location < ActiveRecord::Base
	has_many :livings
	has_many :persons, through: :livings

	validates :address, presence: true
end
