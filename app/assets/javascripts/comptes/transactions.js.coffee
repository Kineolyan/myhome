# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

(($) ->
	$(() ->
		sign = $("#sign-box label")
		$("#sign-box input:checkbox").change (event) ->
			sign.text(if this.checked then "-" else "+")
	)
)(jQuery)