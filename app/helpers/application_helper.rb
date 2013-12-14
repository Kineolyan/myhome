module ApplicationHelper

  def self.make_date(params)
    Date.new params[:year].to_i, params[:month].to_i, params[:day].to_i
  end

  def self.format_amount value
    "%.2f €" % [ value.to_f / 100 ]
  end
end
