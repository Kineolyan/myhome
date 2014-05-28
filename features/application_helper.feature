Feature: ApplicationHelper helper methods

  So that I can work easily in my application
  I as a developper
  I want some usefull methods

  Scenario Outline: I can create dates from day information
    Given a <day>, a <month> and a <year>
    When I build a date
    Then the date has correct information

    Scenarios: all are valid date
      | day | month | year |
      | 1   | 1     | 2013 |
      | 31  | 03    | 2013 |
      | 13  | 09    | 1988 |

  Scenario Outline: I can format values with currency
    Given a <amount> in euros
    When I format the amount
    Then I get "<formatted_amount>"

    Scenarios: positive amounts
      | amount | formatted_amount |
      | 12.50  |          12.50 € |
      |  100   |         100.00 € |
      |   0    |           0.00 € |

    Scenarios: negative amounts
      | amount | formatted_amount |
      | -12.50 |         -12.50 € |
      | -100   |        -100.00 € |

  Scenario Outline: I can test if a string is a number
    Given the value "<value>"
    When I test if value is a number
    Then I get the boolean <result>

    Scenarios: numbered values
      | value | result |
      | 12.50 | true   |
      | 0.50  | true   |
      | 1250  | true   |

    Scenarios: negative numbered values
      | value | result |
      | -2.50 | true   |
      | -0.50 | true   |
      | -1250 | true   |

    Scenarios: not a number
      | value | result |
      | abcde | false  |
      | 0=50  | false  |
      | 1.5.2 | false  |

  Scenario Outline: I can test if a variable is a number
    Given the number <number> as value
    When I test if value is a number
    Then I get the boolean <result>

    Scenarios: positive numbers
      | number | result |
      | 12.50  | true   |
      | 0.50   | true   |
      | 1250   | true   |

    Scenarios: positive numbers
      | number | result |
      | -12.50 | true   |
      | -0.50  | true   |
      | -1250  | true   |

