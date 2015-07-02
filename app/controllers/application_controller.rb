class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

	before_filter :link_return

  # redirect somewhere that will eventually return back to here
	def redirect_away(*params)
	  session[:original_uri] = request.request_uri
	  redirect_to(*params)
	end

	# returns the person to either the original url from a redirect_away or to a default url
	def redirect_back(*params)
	  uri = session[:original_uri]
	  session[:original_uri] = nil
	  if uri
	    redirect_to uri
	  else
	    redirect_to(*params)
	  end
	end

	private
	# handles storing return links in the session
	def link_return
	  if params[:return_uri]
	    session[:original_uri] = params[:return_uri]
	  elsif params[:reset_return]
	  	session[:original_uri] = nil
	  end
	end
end
