Given(/^a (\d+), a (\d+) and a (\d+)$/) do |day, month, year|
  @day = day.to_i
  @month = month.to_i
  @year = year.to_i
end

When(/^I build a date$/) do
  @date = ApplicationHelper::make_date year: @year, month: @month, day: @day
end

Then(/^the date has correct information$/) do
  expect(@date.year).to eq(@year)
  expect(@date.month).to eq(@month)
  expect(@date.day).to eq(@day)
end

Given(/^a (-?\d+(\.\d+)?) in euros$/) do |amount, cents|
  @amount = amount.to_f * 100
end

When(/^I format the amount$/) do
  @formatted_amount = ApplicationHelper::format_amount @amount
end

Then(/^I get "(.*?)"$/) do |formatted_amount|
  expect(@formatted_amount).to eq(formatted_amount)
end

Given(/^the string "(.*?)"$/) do |value|
  @value = if value.empty?
      ''
    elsif value == "nil"
      nil
    else
      value
    end
end

Given(/^the number (-?\d+(\.\d+)?) as value$/) do |number, decimal_part|
  @value = number.to_f
end

When(/^I test if value is a number$/) do
  @result = ApplicationHelper::is_a_number? @value
end

Then(/^I get the boolean (true|false)$/) do |result|
  boolean_result = result == "true"

  expect(@result).to eq(boolean_result)
end