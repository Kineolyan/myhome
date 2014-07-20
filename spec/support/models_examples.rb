RSpec.shared_examples "a valid model" do
  it { is_expected.to be_valid }
end

RSpec.shared_examples "an invalid model" do
  it { is_expected.not_to be_valid }
end