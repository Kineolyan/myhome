module ApplicationHelper

  # Creates a link to some location, storing the current location.
  # Use ApplicationController#redirect_back to return to this location
  def link_away(body, url, html_options = {})
    if url.is_a? Hash
      link_to(body, { return_uri: url_for(only_path: true) }.update(url_options.symbolize_keys), html_options)
    else
      url = url_for url unless url.is_a? String
      link_to body, "#{url}#{url.include?("?") ? "&" : "?"}return_uri=#{url_for(only_path: true)}", html_options
    end
  end

  def self.make_date(params)
    Date.new params[:year].to_i, params[:month].to_i, params[:day].to_i
  end

  def self.is_a_date? value, format = nil
    return false if value.nil?

    begin
      format ? Date.strptime(value, format) : Date.parse(value)
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
