# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$(document).ready ->
  # for submitting new transactions with ajax
  (->
    transaction_form = $("#new_comptes_transaction")
    return if transaction_form.length == 0

    errors_list = $("#transaction-errors")
    reset_transaction_form = (form) ->
      transaction_form[0].reset()
      errors_list.empty()
      transaction_form.find("input[name*='titre']").focus()
      return

    transaction_table = $("#transactions-table")
    add_last_transaction = (data) ->
      # refer to _transactions.html.erb for row content
      row = $('<tr>')
      row.attr("transaction-id='#{data.id}'")
      row.html("<td>#{data.date}</td><td>#{data.titre}</td><td>#{data.somme} €</td><td>#{data.compte}</td><td>#{data.paiement}</td><td></td>")
      transaction_table.append(row)
      return

    display_errors = (errors) ->
      errors_list.empty()
      for field of errors
        errors_list.append("<li>#{field} : #{error}</li>") for error in errors[field]
      return

    transaction_form.on("ajax:success", (e, data, status, xhr) ->
      json_data = JSON.parse(xhr.responseText)
      if json_data.transaction
        add_last_transaction(json_data.transaction)
        reset_transaction_form transaction_form
      else if json_data.errors
        display_errors(json_data.errors)
      else
        alert "ERROR: invalid data #{JSON.stringify(json_data)}"
    ).bind "ajax:error", (e, xhr, status, error) ->
      alert "ERROR: #{error}"

    return
  )()