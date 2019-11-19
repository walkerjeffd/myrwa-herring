library(dplyr)
library(tidyr)
library(lubridate)
library(jsonlite)

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
  write.csv("csv/herring-dataset.csv", row.names = FALSE, na = "")



df_videos <- pg %>%
  tbl("videos") %>%
  filter(location_id == "UML") %>%
  collect()

df_videos %>%
  mutate(
    created_at = format(created_at, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York"),
    start_timestamp = format(start_timestamp, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York"),
    end_timestamp = format(end_timestamp, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York")
  ) %>%
  select(-url_webm, -mp4_converted, -location_id) %>%
  write.csv("csv/herring-videos.csv", row.names = FALSE, na = "")

df_counts <- pg %>%
  tbl("counts") %>%
  collect() %>%
  filter(
    video_id %in% df_videos$id
  )

df_counts %>%
  mutate(
    created_at = format(created_at, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York")
  ) %>%
  write.csv("csv/herring-counts.csv", row.names = FALSE, na = "")

df_users <- pg %>%
  tbl("users") %>%
  collect()

disabled_uid <- c(
  "3DIdGNC6UEV0GLy5ViALyAYpyCn2",
  "5DdSBOeKVfhmxzUzVcHdMU0hlKO2",
  "HcqNPHmCjfVZVyjrMhyWViHBvCY2",
  "LEoot1tiIAguVplHgH4asQMvsTx1",
  "O6mhUeiYhkcVL8S6SXj0xBisTXT2",
  "SY5LmQw14JSBX8ntOeJ8h8v7PQe2",
  "TVB4IUamISY0bSWjzaGASJQ5ynT2",
  "XfLWMbrKOgOEwrB44llQaWurF5i1",
  "cwnfYFm0AZdQsGwEjZr2KLFjNc83",
  "cxQQPcnt4ZU6IwTtEZdQIYFzta62",
  "fixbzPnFDmhbJSRb5tMO6iTEIFF3",
  "g4cTtTCCAkXu4qIGqHFSMFECToH2",
  "kJdJKwlgFJZL7cCufzSP9IkiTlM2",
  "mLatdERTh7gQyan5f2FEc3S5ujY2",
  "nx4uR5OqE8gDPzEv6dhpBp2taNy1",
  "ohWeyFzdvBgKF3IGrk7v8ByxJ3O2",
  "vWBA1UHiZIesjJ0iqUvLUngPlO32",
  "w2GD5bhZwFNwLmhprLFUMGVRXqu1",
  "xZv8ER6KdUN2b7WYEwl1DshclTq1",
  "yUQW5iYrZwUWxUo4sd5RZPX9lj03"
)

df_users %>%
  mutate(
    disabled = uid %in% disabled_uid,
    created_at = format(created_at, format = "%Y-%m-%d %H:%M:%S", tz = "America/New_York")
  ) %>%
  write.csv("csv/herring-users.csv", row.names = FALSE, na = "")



