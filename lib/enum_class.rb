class EnumValue

  attr_reader :name, :value

  def initialize name, value
    @name = name.capitalize.to_s
    @value = value
  end

  def to_i
    @value.to_i
  end

  def to_f
    @value.to_f
  end

  def to_s
    "<#{@name}> (#{@value})"
  end

end

class EnumClass

  def initialize initial_values = {}
    @values = {}

    initial_values.each { |key, value| add_value key, value }
  end

  def _singleton_class
    class << self
      self
    end
  end

  def is_valid? value
    @values.each_value { |enum_value| return true if (value == enum_value.value) }
    false
  end

  def add_value name, value
    key = name.downcase.to_sym
    @values[key] = EnumValue.new name, value

    method_name = name.upcase
    _singleton_class.instance_exec(method_name) do |name|
      define_method(name) do
        @values[key]
      end
    end
  end

  def value_of value
    @values.each_value { |enum_value| return enum_value if (value == enum_value.value) }
    nil
  end

  def each
    @values.each_value { |value| yield value }
  end

  def to_s
    "Enum with values #{@values}"
  end

end
