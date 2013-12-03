# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$(document).ready ->
  # for submitting new transactions with ajax
  (->
    transaction_form = $("#new_comptes_transaction")
    return if transaction_form.length == 0

    reset_transaction_form = (form) ->
      transaction_form[0].reset()

    transaction_list = $("transactions-list")
    transaction_form.on("ajax:success", (e, data, status, xhr) ->
      transaction_list.append xhr.responseText
      reset_transaction_form transaction_form
    ).bind "ajax:error", (e, xhr, status, error) ->
      alert "ERROR: #{xhr.responseText}"
  )()