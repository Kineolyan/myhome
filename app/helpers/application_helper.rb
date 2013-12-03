module ApplicationHelper

  def self.make_date(params)
    Date.new params[:year].to_i, params[:month].to_i, params[:day].to_i
  end
end
