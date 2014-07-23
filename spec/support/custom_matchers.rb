RSpec::Matchers.define :have_solde do |expected|
  precision = 0.01

  match do |actual|
    ((expected - actual.solde) / precision).to_i == 0
  end

  failure_message do |actual|
    "expected that #{actual.solde} == #{expected} (precision: #{precision})"
  end

  failure_message_when_negated do |actual|
    "expected that #{actual.solde} == #{expected} (precision: #{precision})"
  end

  description do
    "solde be equal to #{expected} (precision: #{precision})"
  end
end