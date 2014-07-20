json.array!(@comptes_categories) do |comptes_category|
  json.extract! comptes_category, :id, :nom
  json.url comptes_category_url(comptes_category, format: :json)
end
