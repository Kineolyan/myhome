# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

(($) ->

	sign = $("#sign-box label")
	$("#sign-box input:checkbox").click (event) ->
		sign.text this.checked ? "-" : "+"

)(jQuery);