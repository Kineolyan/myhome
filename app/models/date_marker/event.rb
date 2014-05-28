class DateMarker::Event < ActiveRecord::Base
  validates :title, presence: true
  validates :day, presence: true

  def number_of_days
    (Date.today - day).to_i
  end

  def number_of_months
    today = Date.today
    (today.year * 12 + today.month) - (day.year * 12 + day.month)
  end

  def number_of_years
    (number_of_months / 12).to_i
  end
end
