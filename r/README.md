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
install.packages(c("dplyr", "tidyr", "ggplot2", "RPostgreSQL", "lubridate", "RColorBrewer", "gridExtra", "jsonlite"))
```

## Video Report

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

## Video-Count Dataset

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
