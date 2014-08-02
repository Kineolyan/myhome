class CreateLivings < ActiveRecord::Migration
  def change
    create_table :livings do |t|
      t.references :person, index: true
      t.references :location, index: true

      t.timestamps
    end

    add_index :livings, [:person_id, :location_id], unique: true
  end
end
