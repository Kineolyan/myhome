FactoryGirl.define do
  factory :datemarker_event, class: "DateMarker::Event" do
    title "Super event"
    day Date.new(1988, 9, 13)
  end

  factory :comptes_compte, class: "Comptes::Compte" do
    nom "Compte de test"
    solde_historique 1370
  end

  factory :comptes_transaction, class: "Comptes::Transaction" do
    titre 'Cadeau'
    somme 1500
    jour Date.new(2014, 1, 1)
    association :compte, factory: :comptes_compte
  end

  factory :comptes_transaction_monnaie, class: "Comptes::TransactionMonnaie" do
    titre 'Cadeau'
    somme 1500
    jour Date.new(2014, 1, 1)
    association :compte, factory: :comptes_compte
  end

  factory :comptes_category, class: "Comptes::Category" do
    nom "test Category"
  end
end
