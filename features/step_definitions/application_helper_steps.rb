## Givens

Given(/^a (\d+), a (\d+) and a (\d+)$/) do |day, month, year|
  @day = day.to_i
  @month = month.to_i
  @year = year.to_i
end

## Whens

When(/^I build a date$/) do
  @date = ApplicationHelper::make_date year: @year, month: @month, day: @day
end

When(/^I test if it \(as a string\) is a number$/) do
  @result = ApplicationHelper::is_a_number? @input_string
end

When(/^I test if it \(as a number\) is a number$/) do
  @result = ApplicationHelper::is_a_number? @input_number
end

When(/^I test if it is a valid date$/) do
  @result = ApplicationHelper::is_a_date? @input_string
end

## Thens

Then(/^the date has correct information$/) do
  expect(@date.year).to eq(@year)
  expect(@date.month).to eq(@month)
  expect(@date.day).to eq(@day)
end