# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

(($) ->
	on_load = () ->
		sign = $("#sign-box label")
		$("#sign-box input:checkbox").change (event) ->
			sign.text(if this.checked then "-" else "+")

	$(document).ready on_load
	$(document).on "page:load", on_load
)(jQuery)