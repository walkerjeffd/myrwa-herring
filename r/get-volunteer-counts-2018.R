# load 2018 volunteer counts from XLSX and save to JSON

library(tidyverse)
library(lubridate)
library(jsonlite)
library(readxl)

df <- read_excel("~/Dropbox/Work/mystic/herring/data/2018/Visual Counts 2018.xlsx", sheet = 1) %>%
  select(
    date = Date, lastname = Monitor, starttime = `Start Time`, endtime = `End Time`, count = `Fish Count`
  ) %>%
  mutate(
    datetime_start = date + hours(hour(starttime)) + minutes(minute(starttime)),
    datetime_end = date + hours(hour(endtime)) + minutes(minute(endtime)),
    date = format(as.Date(date), "%m/%d/%Y"),
    difftime = as.integer(difftime(endtime, starttime, units = "min")),
    starttime = format(starttime, "%r"),
    endtime = format(endtime, "%r"),
    count = as.integer(count)
  )

summary(df)
table(df$difftime)

df %>%
  ggplot(aes(datetime_start, count)) +
  geom_point()

df %>%
  select(lastname, date, starttime, endtime, count) %>%
  write_json(file.path("json", "volunteer-counts-2018.json"))
