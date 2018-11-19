# compare night vs day runs in 2018

suppressPackageStartupMessages(library(tidyverse))
suppressPackageStartupMessages(library(lubridate))
suppressPackageStartupMessages(library(RColorBrewer))
suppressPackageStartupMessages(library(gridExtra))
suppressPackageStartupMessages(library(jsonlite))

theme_set(theme_bw())

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
  ) %>%
  filter(
    date >= ymd(20180518),
    date <= ymd(20180610)
  )

tbl_counts <- pg %>%
  tbl("counts") %>%
  filter(!flagged) %>%
  collect()


# merge -------------------------------------------------------------------

counts <- tbl_counts %>%
  inner_join(select(tbl_videos, id, start_timestamp), by = c("video_id" = "id"))

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
  )

stats_by_video_day <- videos %>%
  group_by(date) %>%
  summarise(
    n_video = n(),
    n_watched = sum(counted),
    n_unwatched = n_video - n_watched,
    n_count = sum(n_count),
    sum_count = sum(mean_count),
    mean_count_per_min = mean(if_else(counted, mean_count / (duration / 60), 0))
  )

stats_by_count_day <- tbl_counts %>%
  filter(video_id %in% videos$id) %>%
  mutate(
    date = as.Date(created_at, tz = "America/New_York")
  ) %>%
  group_by(date) %>%
  summarise(
    n_count = n(),
    n_count_zero = sum(count == 0),
    sum_count = sum(count),
    n_session = length(unique(session))
  )

videos_hour_tally <- videos %>%
  filter(
    date >= ymd(20170411)
  ) %>%
  mutate(
    hour = hour(start_timestamp)
  ) %>%
  group_by(date, hour) %>%
  summarise(
    n = n(),
    mean_duration = mean(duration)/60, # sec -> min
    sum_duration = sum(duration)/60, # sec -> min
    sum_duration_watched = sum(duration * counted)/60,
    n_watched = sum(counted),
    n_count = sum(n_count),
    sum_count = sum(mean_count)
  ) %>%
  ungroup %>%
  complete(
    date, hour = seq(0, 23, by = 1),
    fill = list(
      n = 0,
      mean_duration = 0,
      sum_duration = 0,
      n_watched = 0,
      n_count = 0,
      sum_count = 0
    )
  ) %>%
  filter(
    date < as.Date(now(), tz = "America/New_York") | hour < hour(now(tzone = "America/New_York"))
  )

# run estimate ------------------------------------------------------------

# 2-hour periods (23-0, 1-2, 3-4, 5-6, 7-8, ...)
run_counts <- videos %>%
  mutate(
    hour = hour(start_timestamp),
    period = as.integer(cut(hour, breaks = seq(0, 24, by = 2), right = FALSE)) - 1,
    period = if_else(period == 12, 0, period)
  ) %>%
  filter(!is.na(period)) %>%
  select(date, video_id = id, start = start_timestamp, end = end_timestamp, hour, period, duration, n_count, mean_count)

run_hour <- run_counts %>%
  select(
    date,
    hour,
    n_count,
    y_i = mean_count,
    t_i = duration
  ) %>%
  mutate(
    t_i_counted = t_i * (n_count > 0)
  ) %>%
  group_by(date, hour) %>%
  summarise(
    N = n(),
    n = sum(n_count > 0),
    T = sum(t_i),
    sum_y = sum(y_i, na.rm = TRUE),
    sum_t = sum(t_i_counted),
    mean_t = coalesce(sum_t / n, 0),
    r = coalesce(sum_y / sum_t, 0),
    Y = r * T,
    se2 = coalesce(sum((y_i - r * t_i_counted) ^ 2, na.rm = TRUE) / (n - 1), 0),
    var_Y = coalesce((T / mean_t)^2 * (N - n) / (N * n) * se2, 0),
    df = n - 1,
    t_star = coalesce(qt(0.975, df = df), 0),
    ci_lower = Y - t_star * sqrt(var_Y),
    ci_upper = Y + t_star * sqrt(var_Y),
    a = if_else(n == 0, 0, N * (N - n) / n)
  )

run_period <- run_counts %>%
  select(
    date,
    period,
    n_count,
    y_i = mean_count,
    t_i = duration
  ) %>%
  mutate(
    t_i_counted = t_i * (n_count > 0)
  ) %>%
  group_by(date, period) %>%
  summarise(
    N = n(),
    n = sum(n_count > 0),
    T = sum(t_i),
    sum_y = sum(y_i, na.rm = TRUE),
    sum_t = sum(t_i_counted),
    mean_t = coalesce(sum_t / n, 0),
    r = coalesce(sum_y / sum_t, 0),
    Y = r * T,
    se2 = coalesce(sum((y_i - r * t_i_counted) ^ 2, na.rm = TRUE) / (n - 1), 0),
    var_Y = coalesce((T / mean_t)^2 * (N - n) / (N * n) * se2, 0),
    df = n - 1,
    t_star = coalesce(qt(0.975, df = df), 0),
    ci_lower = Y - t_star * sqrt(var_Y),
    ci_upper = Y + t_star * sqrt(var_Y),
    a = if_else(n == 0, 0, N * (N - n) / n)
  )

run_day <- run_period %>%
  group_by(date) %>%
  summarise(
    df_num = sum(a * se2),
    df_den = sum((a * se2) ^ 2 / (n - 1), na.rm = TRUE),
    N = sum(N),
    n = sum(n),
    T = sum(T),
    sum_y = sum(sum_y),
    sum_t = sum(sum_t),
    Y = sum(Y),
    r = Y / T,
    var_Y = sum(var_Y),
    se_Y = sqrt(var_Y),
    df = coalesce(df_num ^ 2 / df_den, 0),
    df = round(df),
    t_star = coalesce(qt(0.975, df = df), 0),
    ci_lower = Y - t_star * sqrt(var_Y),
    ci_upper = Y + t_star * sqrt(var_Y)
  )

run_total <- run_day %>%
  summarise(
    N = sum(N),
    n = sum(n),
    T = sum(T),
    sum_y = sum(sum_y),
    sum_t = sum(sum_t),
    Y = sum(Y),
    r = Y / T,
    var_Y = sum(var_Y),
    se_Y = sqrt(var_Y),
    df = sum(df_num) ^ 2 / sum(df_den),
    df = round(df),
    t_star = coalesce(qt(0.975, df = df), 0),
    ci_lower = Y - t_star * sqrt(var_Y),
    ci_upper = Y + t_star * sqrt(var_Y)
  )



run_hour %>%
  ggplot(aes(date, hour, fill = N)) +
  geom_tile()

run_hour %>%
  ggplot(aes(date, hour, fill = n)) +
  geom_tile()

run_hour %>%
  ggplot(aes(date, hour, fill = n / N)) +
  geom_tile()

run_hour %>%
  ggplot(aes(date, hour, fill = Y)) +
  geom_tile()

run_hour %>%
  ggplot(aes(date, hour, fill = Y)) +
  geom_tile() +
  geom_tile(
    aes(alpha = if_else(Y == 0, 1, 0)),
    fill = "red"
  )

run_hour %>%
  ggplot(aes(date, hour, fill = sqrt(var_Y) / Y)) +
  geom_tile()


# fraction day vs night
run_hour %>%
  mutate(
    day_night = if_else(hour >= 7 & hour < 19, "day", "night")
  ) %>%
  group_by(date, day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  ggplot(aes(date, Y, fill = day_night)) +
  geom_col(position = "stack") +
  theme(legend.position = c(1, 1), legend.justification = c(1, 1))

run_hour %>%
  mutate(
    day_night = if_else(hour >= 7 & hour < 19, "day", "night")
  ) %>%
  group_by(date, day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  ggplot(aes(date, Y, fill = day_night)) +
  geom_col(position = "fill") +
  theme(legend.position = c(1, 1), legend.justification = c(1, 1))

run_hour %>%
  mutate(
    day_night = if_else(hour >= 7 & hour < 19, "day", "night")
  ) %>%
  group_by(date, day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  spread(day_night, Y) %>%
  mutate(frac_day = day / (day + night)) %>%
  ggplot(aes(date, frac_day)) +
  geom_col()

# fraction day, night, dusk, dawn
run_hour %>%
  mutate(
    day_night = case_when(
      hour < 5 ~ "pre-dawn",
      hour < 7 ~ "dawn",
      hour < 19 ~ "day",
      hour < 21 ~ "dusk",
      TRUE ~ "post-dusk"
    ),
    day_night = factor(day_night, levels = rev(c("pre-dawn", "dawn", "day", "dusk", "post-dusk")), ordered = TRUE)
  ) %>%
  group_by(date, day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  ggplot(aes(date, Y, fill = day_night)) +
  geom_col(position = "stack")

run_hour %>%
  mutate(
    day_night = case_when(
      hour < 5 ~ "pre-dawn",
      hour < 7 ~ "dawn",
      hour < 19 ~ "day",
      hour < 21 ~ "dusk",
      TRUE ~ "post-dusk"
    ),
    day_night = factor(day_night, levels = rev(c("pre-dawn", "dawn", "day", "dusk", "post-dusk")), ordered = TRUE)
  ) %>%
  group_by(date, day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  ggplot(aes(date, Y, fill = day_night)) +
  geom_col(position = "fill")

run_hour %>%
  mutate(
    day_night = case_when(
      hour < 5 ~ "pre-dawn",
      hour < 7 ~ "dawn",
      hour < 19 ~ "day",
      hour < 21 ~ "dusk",
      TRUE ~ "post-dusk"
    ),
    day_night = factor(day_night, levels = c("pre-dawn", "dawn", "day", "dusk", "post-dusk"), ordered = TRUE)
  ) %>%
  group_by(day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  ggplot(aes(day_night, Y, fill = day_night)) +
  geom_col()


run_hour %>%
  mutate(
    day_night = if_else(hour >= 7 & hour < 19, "day", "night")
  ) %>%
  group_by(date, day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  ggplot(aes(date, Y, fill = day_night)) +
  geom_col(position = "fill") +
  theme(legend.position = c(1, 1), legend.justification = c(1, 1))

run_hour %>%
  mutate(
    day_night = if_else(hour >= 7 & hour < 19, "day", "night")
  ) %>%
  group_by(date, day_night) %>%
  summarise(
    Y = sum(Y)
  ) %>%
  spread(day_night, Y) %>%
  mutate(frac_day = day / (day + night)) %>%
  ggplot(aes(date, frac_day)) +
  geom_col()


run_period %>%
  mutate(
    period_label = paste(paste0(sprintf("%02d", period * 2), ":00"), paste0(sprintf("%02d", period * 2 + 1), ":59"), sep = " - ")
  ) %>%
  ggplot(aes(date, period_label, fill = Y)) +
  geom_tile()

run_period %>%
  mutate(
    period_label = paste(paste0(sprintf("%02d", period * 2), ":00"), paste0(sprintf("%02d", period * 2 + 1), ":59"), sep = " - ")
  ) %>%
  ggplot(aes(date, period_label, fill = N)) +
  geom_tile()

run_period %>%
  mutate(
    period_label = paste(paste0(sprintf("%02d", period * 2), ":00"), paste0(sprintf("%02d", period * 2 + 1), ":59"), sep = " - ")
  ) %>%
  filter(n > 0) %>%
  ggplot(aes(date, period_label, fill = n)) +
  geom_tile()
