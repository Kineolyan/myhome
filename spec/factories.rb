FactoryGirl.define do
  factory :datemarker_event, class: "DateMarker::Event" do
    title "Super event"
    day Date.new(1988, 9, 13)
  end
end
