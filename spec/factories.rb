FactoryGirl.define do
  factory :datemarker_event, class: "DateMarker::Event" do
    title "Super event"
    day Date.new(1988, 9, 13)
  end

  factory :comptes_compte, class: "Comptes::Compte" do
    nom "Compte de test"
    solde_historique 1370
  end
end
