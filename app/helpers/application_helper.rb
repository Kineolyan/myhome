module ApplicationHelper

  def self.make_date(params)
    Date.new params[:year].to_i, params[:month].to_i, params[:day].to_i
  end

  def self.is_a_number? value
    return false unless value

    # the value is a number
    return true if value.is_a? Numeric

    # the value represents a number
    ! /^-?\d+(\.\d+)?$/.match(value.to_s).nil?
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

  # Create a Bootstrap glyphicon in a tag
  # Options can contains:
  #   :btn to create a button. Ex { btn: "danger" }
  #   :text to add text after the glyphicon. Ex { text: "Edit" }
  # Returns the html for the glyphicon
  def self.glyphicon name, options = {}
    additional_classes=""
    additional_classes << " btn btn-#{options[:btn]}" if options.key? :btn

    "<i class=\"glyphicon glyphicon-#{name}#{additional_classes}\">#{options[:text]}</i>".html_safe
  end

  TITLE = "My home"
  def self.page_title title = nil
    title.nil? || title.empty? ? TITLE : "#{TITLE} | #{title}"
  end

end
