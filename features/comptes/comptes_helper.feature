Feature: ComptesHelper helper methods

  So that I can work easily in my comptes
  I as a developper
  I want some usefull methods

  Scenario Outline: I can format amounts with currency
    Given an amount <amount> in euros
    When I format the amount with currency
    Then I get "<formatted_amount>"

    Scenarios: positive amounts
      | amount | formatted_amount |
      | 12.50  |          12.50 € |
      |  6.4   |           6.40 € |
      |  100   |         100.00 € |
      |   0    |           0.00 € |

    Scenarios: negative amounts
      | amount | formatted_amount |
      | -12.50 |         -12.50 € |
      | -6.4   |          -6.40 € |
      | -100   |        -100.00 € |

  Scenario Outline: I can format amount
    Given an amount <amount> in euros
    When I format the amount
    Then I get "<formatted_amount>"

    Scenarios: positive amounts
      | amount | formatted_amount |
      | 12.50  |          12.50   |
      |  6.4   |           6.40   |
      |  100   |         100.00   |
      |   0    |           0.00   |

    Scenarios: negative amounts
      | amount | formatted_amount |
      | -12.50 |         -12.50   |
      | -6.4   |          -6.40   |
      | -100   |        -100.00   |