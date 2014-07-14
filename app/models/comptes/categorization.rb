class Comptes::Categorization < ActiveRecord::Base
  belongs_to :transaction
  belongs_to :category

  validates :transaction, presence: true
  validates :category, presence: true
end
