/**
 * Gets the timestamp of the next day of a given value.
 * @param {Number} date - unix timestamp in ms
 */
function nextDay(date) {
	return new Date(date).setHours(23, 59, 59, 999) + 1;
}

export {
  nextDay
};