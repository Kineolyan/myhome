Given(/^an amount (-?\d+(\.\d+)?) in euros$/) do |amount, cents|
  @amount = amount.to_f
end

When(/^I format the amount with currency$/) do
  @result = Comptes::ComptesHelper::format_amount(@amount, true)
end

When(/^I format the amount$/) do
  @result = Comptes::ComptesHelper::format_amount(@amount, false)
end

When(/^I encode it$/) do
  @result = Comptes::ComptesHelper::encode_amount(@input_number)
end

When(/^I decode it$/) do
  @result = Comptes::ComptesHelper::decode_amount(@input_number)
end