# utime-db
Database for javascript utime library

# Timezone database format

Each number in database represents date and time as given number of milliseconds since 1970-01-01 00:00:00.0

Database is an array that consists 2 elements array of which:
 * First element represents a moment of local time change in UTC time.
 * Second element represents a new local date and time at moment pointed in first element.


