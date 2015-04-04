
/** Acquire the string of the id that we use
    to identify a square, based on its js Date object.
    It must be unique between any two dates that appear
    on the calendar at once (hence it depends on the month
    and day, but not the year).
*/
function getDateSquareID(date) {
    return date.getMonth()+"-"+date.getDate();
}

/** Get a string of the month's full name using
    the 0-indexed javascript month number
*/
function getMonthName(month) {
    return ["January","February","March","April",
     "May","June","July","August",
     "September","October","November","December"][month];
}

/** Converts a JS Date object into a string
 * that Mysql server will accept (YYYY-MM-DD).
 * Credit to http://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
 * for the form
*/
function toMysqlDate(jsDate) {
    return jsDate.toISOString().slice(0,10);
}

/** Converts the time from a JS Date object into a string
 * that Mysql server will accept (HH:MM:SS).
 * Credit to http://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
 * for the form
*/
function toMysqlTime(jsDate) {
    return jsDate.toISOString().slice(11,19);
}

/** Convert Mysql date (YYYY-MM-DD)
 */
function mysqlDateToDateObject(date) {
    return (new Date(date)).deltaDays(1); // deltaDays is workaround for timezone crap. Questionable: this will likely break for users who are actually in GMT timezone
}