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

  Scenario Outline: I can format date to my preferred format
    Given the date <date>
    When I format a date
    Then I get "<formatted_date>"

    Scenarios: simple dates
      |    date    | formatted_date |
      | 13/09/1988 |   13/09/1988   |

  Scenario Outline: I can check if a string is a number
    Given the string "<date>"
    When I test if it is a valid date
    Then validity is <result>

    Scenarios: valid dates
      | date       | result |
      | 10/03/2014 | true   |
      | 28/02/2014 | true   |
      | 10/12/2014 | true   |
      | 18/12/2014 | true   |

    Scenarios: unexisting dates
      | date       | result |
      | 10/13/2014 | false  |
      | 30/02/2014 | false  |

    Scenarios: invalid values
      | date       | result |
      | 1234566    | false  |
      | abcde      | false  |

    Scenarios: special values
      | date       | result |
      |            | false  |
      | nil        | false  |

  Scenario Outline: I can test if a string is a number
    Given the string "<value>"
    When I test if it (as a string) is a number
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

    Scenarios: special values
      | value | result |
      |   0   | true   |
      |  nil  | false  |
      |       | false  |

    Scenarios: not a number
      | value | result |
      | abcde | false  |
      | 0=50  | false  |
      | 1.5.2 | false  |

  Scenario Outline: I can test if a variable is a number
    Given the number <number>
    When I test if it (as a number) is a number
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

