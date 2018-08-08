Mystic Herring Migration - R Reports
====================================

## Configuration

Copy config template

```bash
cp config.template.json config.json
```

Edit `config.json`

```js
{
  "db": {
    "host": "",
    "port": 5432,
    "database": "",
    "user": "",
    "password": ""
  },
  "s3": {
    "accessKeyId": "",
    "secretAccessKey": "",
    "bucket": "myrwa",
    "path": ""
  },
  "report": {
    "year": 2017
  }
}
```

## Install Dependencies

Required for `RPostgreSQL` package

```bash
sudo apt-get install libpq-dev
```

Install R packages

```r
install.packages(c("tidyverse", "RPostgreSQL", "lubridate", "RColorBrewer", "gridExtra", "jsonlite", "hexbin"))
```

## Fetch Volunteer Data

Read volunteer count data from google sheet, and save results to `json/volunteer-counts-2017.json`.

```bash
node get-volunteer-counts-2017.js
```

For 2018, load from excel file and save to `json/volunteer-counts-2018.json`.

```bash
Rscript get-volunteer-counts-2018.R
```

## Video Report

The `video-report.R` script fetches the video and count data from the database and generates a pdf of various plots for tracking the system.

### Manual

```bash
Rscript video-report.R # -> pdf/video-report.R
```

### Automated

Add cron job to run every hour on minute 30

```bash
crontab -e
# 30 * * * * cd /home/myrwa/apps/myrwa-herring-web/r && Rscript video-report.R > /dev/null 2>&1
```

## Export Video-Count Dataset

The `export-dataset.R` script fetches the video and count data from the database, merges the two tables, and saves the result to a csv file.

### Manual

```bash
Rscript export-dataset.R # -> csv/herring-dataset.csv
```

### Automated

Add cron job to run every hour on minute 15

```bash
crontab -e
# 15 * * * * cd /home/myrwa/apps/myrwa-herring-web/r && Rscript export-dataset.R > /dev/null 2>&1
```
