library(dplyr)
library(tidyr)
library(ggplot2)
library(lubridate)
library(RColorBrewer)
library(gridExtra)
library(jsonlite)
library(purrr)

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
  filter(!flagged, location_id == "UML")  %>%
  collect() %>%
  mutate(
    start_timestamp = with_tz(start_timestamp, tzone = "America/New_York"),
    end_timestamp = with_tz(end_timestamp, tzone = "America/New_York"),
    date = as.Date(start_timestamp, tz = "America/New_York")
  )

tbl_counts <- pg %>%
  tbl("counts") %>%
  filter(!flagged) %>%
  collect()


# merge -------------------------------------------------------------------

counts <- tbl_counts %>%
  left_join(select(tbl_videos, id, start_timestamp), by = c("video_id" = "id"))

counts_by_video <- tbl_counts %>%
  group_by(video_id) %>%
  summarise(
    n_count = n(),
    mean_count = mean(count)
  )

videos <- tbl_videos %>%
  left_join(counts_by_video, by = c("id" = "video_id")) %>%
  mutate(
    n_count = coalesce(n_count, 0L),
    mean_count = coalesce(mean_count, 0.0),
    counted = n_count > 0
  ) %>%
  rename(video_id = id)

# load volunteer counts ---------------------------------------------------

volunteer <- fromJSON("json/volunteer-counts.json") %>%
  mutate(
    start = mdy_hms(paste(date, timestarted), tz = "America/New_York"),
    end = mdy_hms(paste(date, timeend), tz = "America/New_York"),
    count = as.numeric(count),
    human_duration = as.numeric(difftime(end, start, units = "mins"))
  ) %>%
  arrange(start) %>%
  distinct %>%
  mutate(
    volunteer_id = row_number()
  )

volunteer_videos <- volunteer %>%
  mutate(
    video = map2(start, end, function (start, end) {
      filter(videos, start_timestamp >= start, start_timestamp <= end) %>%
        select(
          video_id,
          filename,
          video_raw_url = url,
          video_start = start_timestamp,
          video_end = end_timestamp,
          video_duration = duration,
          video_n_count = n_count,
          video_mean_count = mean_count,
          video_counted = counted
        )
    })
  ) %>%
  unnest(video) %>%
  mutate(
    date = mdy(date),
    video_url = paste0("https://www.mysticherring.org/video/watch?id=", video_id)
  ) %>%
  select(
    volunteer_id, date, volunteer_start = timestarted, volunteer_end = timeend, lastname, volunteer_count = count,
    video_id, video_raw_url, video_start, video_end, video_duration, video_counted, video_n_count, video_mean_count, video_url
  ) %>%
  mutate(
    video_start = format(video_start, "%I:%M:%S %p"),
    video_end = format(video_end, "%I:%M:%S %p")
  )

volunteer_counts <- volunteer_videos %>%
  group_by(volunteer_id, date, lastname, volunteer_start, volunteer_end, volunteer_count) %>%
  summarise(
    n_video = n(),
    video_duration = round(sum(video_duration) / 60, 1),
    n_video_counted = sum(video_counted),
    n_video_remaining = n_video - n_video_counted,
    video_count = as.integer(sum(video_mean_count))
  ) %>%
  ungroup %>%
  select(
    volunteer_id,
    date,
    lastname,
    volunteer_start,
    volunteer_end,
    n_video,
    video_duration,
    n_video_counted,
    n_video_remaining,
    volunteer_count,
    video_count
  )


# export ------------------------------------------------------------------

volunteer_videos %>%
  write.csv("csv/volunteer-videos.csv", na = "", row.names = FALSE)

volunteer_counts %>%
  write.csv("csv/volunteer-counts.csv", na = "", row.names = FALSE)
