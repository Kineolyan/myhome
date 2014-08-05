Given(/^an amount (-?\d+(\.\d+)?) in euros$/) do |amount, cents|
  @amount = amount.to_f
end

When(/^I format the amount with currency$/) do
  @value = Comptes::ComptesHelper::format_amount(@amount, true)
end

When(/^I format the amount$/) do
  @value = Comptes::ComptesHelper::format_amount(@amount, false)
end