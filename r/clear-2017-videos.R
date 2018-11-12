# create list of 2017 video files to remove

library(tidyverse)
library(lubridate)
library(jsonlite)

theme_set(theme_bw())

cfg <- read_json("./config.json")

con <- src_postgres(
  dbname = cfg$db$database,
  host = cfg$db$host,
  port = cfg$db$port,
  user = cfg$db$user,
  password = cfg$db$password
)

df <- con %>%
  tbl("videos") %>%
  collect()

df %>%
  mutate(year = year(start_timestamp)) %>%
  group_by(year) %>%
  tally()

df_2017 <- df %>%
  filter(year(start_timestamp) == 2017)

nrow(df_2017)
# 50,855 (matches number of files in backup)

df_2017_urls <- c(df_2017$url, df_2017$url_webm) %>%
  sort()

df %>%
  mutate(
    prefix = str_sub(filename, 1, 1)
  ) %>%
  pull(prefix) %>%
  table()
# all start with "1_"



