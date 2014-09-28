describe HtmlHelper do
  let(:helper) { HtmlHelper }

  describe HtmlHelper::Bootstrap do
    let(:helper) { HtmlHelper::Bootstrap }

    describe "#glyphicon" do
      it "create html" do
        expect(helper.glyphicon "test").to eq "<i class=\"glyphicon glyphicon-test\"></i>".html_safe
      end

      describe "with options" do
        it "add text" do
          expect(helper.glyphicon "test", text: "coucou").to eq "<i class=\"glyphicon glyphicon-test\">coucou</i>".html_safe
        end

        it "add btn" do
          expect(helper.glyphicon "test", btn: "alert").to eq "<i class=\"glyphicon glyphicon-test btn btn-alert\"></i>".html_safe
        end
      end
    end

    describe "#value_badge" do

      describe "with a negative value" do
        subject { helper.value_badge -10 }

        it { is_expected.to have_css ".badge" }
        it { is_expected.to have_css ".alert-danger" }
        it { is_expected.to have_content "-10" }
      end

      describe "with a positive value" do
        subject { helper.value_badge 10 }

        it { is_expected.to have_css ".badge" }
        it { is_expected.to have_css ".alert-success" }
        it { is_expected.to have_content "10" }
      end

      describe "with content" do
        subject { helper.value_badge 10, "10.00 €" }

        it { is_expected.to have_css ".badge" }
        it { is_expected.to have_css ".alert-success" }
        it { is_expected.to have_content "10.00 €" }
      end

    end

  end

end