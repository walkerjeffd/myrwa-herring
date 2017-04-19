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
  "out": "/path/to/video-report.pdf", // absolute path to save report
  "db": {
    "host": "",
    "port": 5432,
    "database": "",
    "user": "",
    "password": ""
  }
}
```

## Install Dependencies

```r
install.packages(c("tidyverse", "lubridate", "RColorBrewer", "gridExtra", "jsonlite"))
```

## Generate Report

```bash
Rscript video-report.R
```

## Automated Report

Set up cron

```bash
crontab -e
```

Add job to run every hour on minute 30

```
30 * * * * cd /home/myrwa/apps/myrwa-herring-web/r && Rscript video-report.R > /dev/null 2>&1
```