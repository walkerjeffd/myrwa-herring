// Fetch 2017 volunteer counts from google sheet and save to json

const GoogleSpreadsheet = require('google-spreadsheet');
const jsonfile = require('jsonfile');
const path = require('path');

const config = require('../config');

const doc = new GoogleSpreadsheet(config.volunteer.docId);
const filename = path.join('json', 'volunteer-counts-2017.json');

doc.getInfo((err, info) => {
  if (err) return reject(err);
  console.log(`Loaded doc: ${info.title} by ${info.author.email}`);

  const sheet = info.worksheets[1];

  sheet.getRows({
    offset: 1,
    limit: 1000
  }, (err, rows) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Read ${rows.length} rows`);

    const data = rows.map((d) => {
      return {
        lastname: d.name,
        date: d.date,
        timestarted: d.starttime,
        timeend: d.endtime,
        count: d.count
      }
    });

    console.log(`Saving to ${filename}`);
    jsonfile.writeFile(filename, data, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log('Done');
      process.exit(0);
    });
  });
});
