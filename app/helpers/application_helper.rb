module ApplicationHelper

  def self.make_date(params)
    Date.new params[:year].to_i, params[:month].to_i, params[:day].to_i
  end

  # Formats a value in cents into a decimal value with 2 decimals and a final €
  def self.format_amount value, with_currency = true
    (with_currency ? "%.2f €" : "%.2f") % [ value.to_f ]
  end

  def self.is_a_number? value
    return false unless value

    # the value is a number
    return true if value.is_a? Numeric

    # the value represents a number
    ! /^-?\d+(\.\d+)?$/.match(value.to_s).nil?
  end

end
