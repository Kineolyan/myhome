FactoryGirl.define do
  factory :datemarker_event, class: "DateMarker::Event" do
    title "Super event"
    day Date.new(1988, 9, 13)
  end

  factory :comptes_compte, class: "Comptes::Compte" do
    nom "Compte de test"
    solde_historique 1370

    factory :comptes_compte_with_transactions do
      after(:create) do |compte|
        3.times { compte.transactions << FactoryGirl.create(:comptes_transaction, compte: compte) }
        compte.save!
      end
    end
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

  factory :comptes_transaction_carte, class: "Comptes::TransactionCarte" do
    titre 'Cadeau'
    somme 1500
    jour Date.new(2014, 1, 1)
    association :compte, factory: :comptes_compte
  end

  factory :comptes_transfer, class: "Comptes::Transfer" do
    titre 'Cadeau'
    somme 1500
    jour Date.new(2014, 1, 1)
    association :compte, factory: :comptes_compte
  end

  factory :comptes_category, class: "Comptes::Category" do
    nom "test Category"
  end
end
