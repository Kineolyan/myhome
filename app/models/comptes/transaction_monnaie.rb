module Comptes

  class TransactionMonnaie < Transaction
    TypePaiement.add_value :monnaie, 1
  end

end