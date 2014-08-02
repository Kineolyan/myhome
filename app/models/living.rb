class Living < ActiveRecord::Base
  belongs_to :person
  belongs_to :location

  validates :person, presence: true
  validates :location, presence: true
  # validates :person, uniqueness: true, allow_nil: true

  # validate :person_not_null, :location_not_null

  private
  	def person_not_null
  		errors.add :person, "Must be defined" if person.nil?
  	end

  	def location_not_null
  		errors.add :location, "Must be defined" if location.nil?
  	end
end
