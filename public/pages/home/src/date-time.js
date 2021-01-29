const DaysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

class DateTime {
  /**
   * @param {Date} date
   */
  static getFormatedDate(date) {
    return `${DaysOfWeek[date.getDay()]}, ${Months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  /**
   * @param {Date} date
   */
  static getFormatedHours(date) {
    const hours = date.getHours();

    return hours < 10
      ? '0' + hours
      : hours;
  }

  /**
   * @param {Date} date
   */
  static getFormatedMinutes(date) {
    const minutes = date.getMinutes();

    return minutes < 10
      ? '0' + minutes
      : minutes;
  }
}
