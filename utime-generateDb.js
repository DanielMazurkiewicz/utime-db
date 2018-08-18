const time = require('time');
const zones = require('./zones');
const fs = require('fs');

function scan(timeZone, start, end, increment, callback) {
  var localTime, current, timeZoneOffset;

  while (start <= end) {
    current = new Date(start);
    if (timeZone && timeZone !== 'system') {
      time.extend(current);
      current.setTimezone(timeZone);
    }

    if (timeZoneOffset !== current.getTimezoneOffset()) {
      if (timeZoneOffset !== undefined) {
        localTime = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours());
        if (callback(start, localTime)) return;
      }
      timeZoneOffset = current.getTimezoneOffset();
    }
    start += increment;
  }
}


function scanNodeTime(timeZone, start, end, increment, callback) {
  var localTime, current, currentDiff, previousDiff=null;

  while (start <= end) {
    current = new time.Date(start);
    current.setTimezone(timeZone);

    localTime = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours());
    currentDiff = start - localTime;

    if (previousDiff !== currentDiff) {
      if (previousDiff !== null) {
        if (callback(start, localTime)) return;
      }
      previousDiff = currentDiff;

    }
    start += increment;
  }

}


function getTimeZoneDb(timeZone, scanFunction, endYear = 2100, endMonth = 1, endDay = 1, startYear = 1850, startMonth = 1, startDay = 1) {
  var result = [];

  var start = Date.UTC(startYear, startMonth, startDay), 
      end = Date.UTC(endYear, endMonth, endDay);

  scanFunction(timeZone, start, end, 86400000, (utc, local) => { 
    scanFunction(timeZone, utc - 2*86400000 , utc, 3600000, (utc, local) => { 
      scanFunction(timeZone, utc - 2*3600000, utc, 60000, (utc, local) => {
        //console.log((new Date(utc)).toUTCString(), (new Date(local)).toUTCString());
        result.push([utc, local]);
        return true;
      });
      return true;
    });
  });

  return result;
}


for (let zone in zones) {
  let timeZone = zones[zone];
  console.log(`Db for: ${zone} (${timeZone})`);
  let zoneDb = getTimeZoneDb(timeZone, scan);
  fs.writeFile(`./country/${zone}.json`, JSON.stringify(zoneDb), function(err) {
    if(err) {
      return console.log(err);
    }
  }); 
}

