# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

%W{Alimentation Animaux Consommation Divers Energies Epargne Habillement Impôts Logement Loisirs Multimedia Retrait Santé Sorties Transports Travaux Vacances Salaires}.each do |categorie|
  unless Comptes::Category.create nom: categorie
    puts "Failed to create #{categorie}"
  end
end