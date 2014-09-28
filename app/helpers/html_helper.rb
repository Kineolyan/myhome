module HtmlHelper

	module Bootstrap

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

	  def self.value_badge value, content = nil
	  	content ||= value

	  	"<span class=\"badge alert-#{value >= 0 ? "success" : "danger"}\">#{content}</span>".html_safe
    end

	end

end