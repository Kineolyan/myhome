module ApplicationHelper

  def self.make_date(params)
    Date.new params[:year].to_i, params[:month].to_i, params[:day].to_i
  end

  # Formats a value in cents into a decimal value with 2 decimals and a final €
  def self.format_amount value
    "%.2f €" % [ value.to_f / 100 ]
  end

  def self.is_a_number? value
    return false unless value

    # the value is a number
    return true if value.is_a? Numeric

    # the value represents a number
    ! /^-?\d+(\.\d+)?$/.match(value.to_s).nil?
  end

end
