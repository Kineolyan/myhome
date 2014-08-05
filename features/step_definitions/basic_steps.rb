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
  expect(@value).to eq expected_value
end

Then(/^I get the number (-?\d+(\.\d+)?)$/) do |expected_value, decimal_part|
  expect(@value).to eq expected_value
end