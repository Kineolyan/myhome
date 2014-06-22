module Comptes::ComptesHelper

  # Formats a value in cents into a decimal value with 2 decimals and a final €
  def self.format_amount value, with_currency = true
    (with_currency ? "%.2f €" : "%.2f") % [ value.to_f ]
  end

  # Convertit une somme pour un stockage sous forme d'entier en centimes
  # Params:
  #   value: la somme
  # Returns:
  #   la valeur entière correspondante
  def self.encode_amount value
    (value.to_f * 100).round.to_i
  end

  # Convertit une somme stockéé en entier sous sa forme originale
  # Params:
  #   value: la somme stockée
  # Returns:
  #   la valeur correspondante
  def self.decode_amount value
    (value.to_f / 100)
  end
end
