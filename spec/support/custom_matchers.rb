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

RSpec::Matchers.define :have_value do |expected|
  match do |actual|
    expected == actual.value
  end

  failure_message do |actual|
    "expected value '#{actual.value}' to be '#{expected}'"
  end

  failure_message_when_negated do |actual|
    "expected value '#{actual.value}' not to be '#{expected}'"
  end

  description do
    "have value '#{expected}'"
  end
end

RSpec::Matchers.define :respond do |expected|
  expected ||= 200

  match do |actual|
    expected == actual.status_code
  end

  failure_message do |actual|
    "expected status code #{actual.status_code} == #{expected}"
  end

  failure_message_when_negated do |actual|
    "expected status code #{actual.status_code} != #{expected}"
  end

  description do
    "have status code #{expected}"
  end
end