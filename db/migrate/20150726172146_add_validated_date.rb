class AddValidatedDate < ActiveRecord::Migration
	def up
    add_column :comptes_comptes, :validated_date, :datetime
    Comptes::Compte.all.each { |compte| compte.update validated_date: compte.validation_date }
	end

	def down
		change_table :comptes_comptes do |t|
			t.remove :validated_date
		end
	end
end
