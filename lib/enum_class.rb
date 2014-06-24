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
  include Enumerable

  class EnumError < RangeError
  end

  private
  def initialize initial_values
    @values = {}

    initial_values.each { |key, value| add_value key, value }
  end

  public
  def self.create_values values
    self.new values
  end

  def self.create_series names, initial_value = 0
    values = {}
    enum_value = 0
    names.each do |name|
      values[name] = enum_value
      enum_value += 1
    end

    self.new values
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
    # None of the values matches
    raise EnumError, "No enum value of type #{self} corresponding to #{value}"
  end

  def each
    @values.each_value { |value| yield value }
  end

  def to_s
    "Enum with values #{@values}"
  end

end
