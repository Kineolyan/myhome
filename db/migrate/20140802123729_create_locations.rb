class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.text :address

      t.timestamps
    end
  end
end
