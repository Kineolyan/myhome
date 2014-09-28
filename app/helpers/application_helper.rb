module ApplicationHelper

  def self.make_date(params)
    Date.new params[:year].to_i, params[:month].to_i, params[:day].to_i
  end

  def self.is_a_date? value
    return false if value.nil?

    begin
      Date.parse value
      true
    rescue ArgumentError
      false
    end
  end

  def self.format_date date
    date.strftime '%d/%m/%Y'
  end

  def self.is_a_number? value
    return false unless value

    # the value is a number
    return true if value.is_a? Numeric

    # the value represents a number
    ! /^-?\d+(\.\d+)?$/.match(value.to_s).nil?
  end

  TITLE = "My home"
  def self.page_title title = nil
    title.nil? || title.empty? ? TITLE : "#{TITLE} | #{title}"
  end

end
