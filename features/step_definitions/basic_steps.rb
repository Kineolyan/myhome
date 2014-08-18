## Givens

Given(/^the string "(.*?)"$/) do |value|
  @input_string = if value.empty?
      ''
    elsif value == "nil"
      nil
    else
      value
    end
end

Given(/^the number (-?\d+)$/) do |number|
  @input_number = number.to_i
end

Given(/^the number (-?\d+\.\d+)$/) do |number|
  @input_number = number.to_f
end

Given(%r!^the date (\d{2})/(\d{2})/(\d{4})$!) do |day, month, year|
  @input_date = Date.new year.to_i, month.to_i, day.to_i
end

## Thens

Then(/^I get the boolean (true|false)$/) do |result|
  boolean_result = case result
  	when "true"
  		true
  	when "false"
  		false
  	else
  		raise ArgumentError, "accepting true or false, '#{result}' given"
  	end

  expect(@result).to eq boolean_result
end

Then(/^I get "(.*?)"$/) do |expected_value|
  expect(@result).to eq expected_value
end

Then(/^I get the number (-?\d+)$/) do |expected_number|
  expect(@result).to eq expected_number.to_i
end

Then(/^I get the number (-?\d+\.\d+?)$/) do |expected_number|
  expect(@result).to eq expected_number.to_f
end