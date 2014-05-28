class CreateDateMarkerEvents < ActiveRecord::Migration
  def change
    create_table :date_marker_events do |t|
      t.string :title
      t.date :day

      t.timestamps
    end
  end
end
