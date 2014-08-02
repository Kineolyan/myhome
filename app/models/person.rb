class Person < ActiveRecord::Base
	has_many :livings
	has_many :locations, through: :livings

	validates :name, presence: true
end
