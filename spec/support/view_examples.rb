RSpec.shared_examples "a paginated resource" do |selector, values|
	it { expect(subject).to have_selector(selector, text: "Previous") }
	it { expect(subject).to have_selector(selector, text: "Next") }

  values.each do |value|
		it { expect(subject).to have_selector(selector, text: value) }
  end
end
