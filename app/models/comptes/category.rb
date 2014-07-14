class Comptes::Category < ActiveRecord::Base
  has_many :categorizations, dependent: :destroy
  accepts_nested_attributes_for :categorizations
  has_many :transactions, through: :categorizations

  validates :nom, presence: true, uniqueness: true
end
