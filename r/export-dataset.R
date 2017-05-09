library(dplyr)
library(tidyr)
library(lubridate)
library(jsonlite)
library(readr)

# load config -------------------------------------------------------------

cfg <- read_json("./config.json")

# load data ---------------------------------------------------------------

pg <- src_postgres(
  dbname = cfg$db$database,
  host = cfg$db$host,
  port = cfg$db$port,
  user = cfg$db$user,
  password = cfg$db$password
)

tbl_videos <- pg %>%
  tbl("videos") %>%
  filter(location_id == "UML") %>%
  select(
    location_id,
    video_id = id,
    video_created_at = created_at,
    video_url = url,
    video_filename = filename,
    video_duration = duration,
    video_filesize = filesize,
    video_start_timestamp = start_timestamp,
    video_end_timestamp = end_timestamp,
    video_flagged = flagged
  )

tbl_counts <- pg %>%
  tbl("counts") %>%
  select(
    video_id,
    count_id = id,
    count_timestamp = created_at,
    count_session = session,
    count,
    count_comment = comment,
    count_flagged = flagged
  )

df <- tbl_videos %>%
  left_join(tbl_counts, by = c("video_id")) %>%
  collect()

df <- df %>%
  mutate(
    video_start_timestamp = with_tz(video_start_timestamp, tzone = "America/New_York"),
    video_end_timestamp = with_tz(video_end_timestamp, tzone = "America/New_York"),
    video_date = as.Date(video_start_timestamp, tz = "America/New_York")
  ) %>%
  select(location_id, video_id, video_date, everything()) %>%
  arrange(location_id, video_start_timestamp)

# export ------------------------------------------------------------------

df %>%
  mutate(
    video_created_at = format(video_created_at, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York"),
    video_start_timestamp = format(video_start_timestamp, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York"),
    video_end_timestamp = format(video_end_timestamp, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York"),
    count_timestamp = format(count_timestamp, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York")
  ) %>%
  write_csv("csv/herring-dataset.csv", na = "")

