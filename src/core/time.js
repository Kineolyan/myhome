/**
 * Gets the timestamp of the next day of a given value.
 * @param {Number} date - unix timestamp in ms
 */
function nextDay(date) {
	return new Date(date).setHours(23, 59, 59, 999) + 1;
}

const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
/**
 * Displays a timestamp as a date, if defined.
 * @param {Number} value - timestamp to display
 * @return {String} equivalent date, or default value if empty
 */
function asDate(value, none = '--') {
  if (value) {
    return new Date(value).toLocaleDateString('fr-FR', options);
  } else {
    return none;
  }
}

export {
  nextDay,
  asDate
};