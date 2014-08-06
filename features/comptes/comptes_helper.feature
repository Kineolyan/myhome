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

  Scenario Outline: I can encode amounts for database
    Given the number <number>
    When I encode it
    Then I get the number <result>

    Scenarios: positive numbers
      | number | result |
      | 100    | 10000  |
      | 12.3   | 1230   |
      | 4.56   | 456    |
      | 0.789  | 79     |
      | 0.123  | 12     |

    Scenarios: negative numbers
      |  number |  result |
      | -100    | -10000  |
      | -12.3   | -1230   |
      | -4.56   | -456    |
      | -0.789  | -79     |
      | -0.123  | -12     |

    Scenarios: special values with mantisse
      |  number |  result |
      | -81.24  | -8124   |

  Scenario Outline: I can decode amounts from database
    Given the number <number>
    When I decode it
    Then I get the number <result>

    Scenarios: positive numbers
      | result | number |
      | 100    | 10000  |
      | 12.3   | 1230   |
      | 4.56   | 456    |
      | 0.79   | 79     |

    Scenarios: negative numbers
      |  result |  number |
      | -100    | -10000  |
      | -12.3   | -1230   |
      | -4.56   | -456    |
      | -0.79   | -79     |

    Scenarios: special values with mantisse
      |  result |  number |
      | -81.24  | -8124   |
