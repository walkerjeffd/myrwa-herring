const GoogleSpreadsheet = require('google-spreadsheet');
const jsonfile = require('jsonfile');
const path = require('path');

const config = require('../config');

const doc = new GoogleSpreadsheet(config.volunteer.docId);
const filename = path.join('json', 'volunteer-counts.json');

doc.getInfo((err, info) => {
  if (err) return reject(err);
  console.log(`Loaded doc: ${info.title} by ${info.author.email}`);

  const sheet = info.worksheets[0];

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
        lastname: d.lastname,
        date: d.date,
        timestarted: d.timestarted,
        timeend: d.timeend,
        count: d.howmanyfishdidyoucountgoinguptheladder
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
