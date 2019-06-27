# determine effect of fake counts

library(tidyverse)
library(lubridate)
library(jsonlite)

theme_set(theme_bw())

cfg <- read_json("./config.json")

pg <- src_postgres(
  dbname = cfg$db$database,
  host = cfg$db$host,
  port = cfg$db$port,
  user = cfg$db$user,
  password = cfg$db$password
)

site <- cfg$reports[[1]]$site
start_date <- cfg$reports[[1]]$start
end_date <- as.character(today())

tbl_videos <- pg %>%
  tbl("videos") %>%
  filter(!flagged, location_id == site)  %>%
  collect() %>%
  mutate(
    start_timestamp = with_tz(start_timestamp, tzone = "US/Eastern"),
    end_timestamp = with_tz(end_timestamp, tzone = "US/Eastern"),
    date = as.Date(start_timestamp, tz = "US/Eastern")
  ) %>%
  filter(
    date >= as.Date(start_date),
    date <= as.Date(end_date)
  )

tbl_counts <- pg %>%
  tbl("counts") %>%
  filter(!flagged) %>%
  collect()

counts <- tbl_counts %>%
  left_join(select(tbl_videos, id, start_timestamp, date), by = c("video_id" = "id")) %>%
  filter(
    date >= as.Date(start_date),
    date <= as.Date(end_date)
  )

bogus_count_ids <- counts %>%
  filter(
    as_date(created_at) == ymd(20190502),
    count >= 100
  ) %>%
  pull(id)

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

counts_by_video2 <- tbl_counts %>%
  filter(
    !id %in% bogus_count_ids
  ) %>%
  group_by(video_id) %>%
  summarise(
    n_count = n(),
    mean_count = mean(count)
  )

videos2 <- tbl_videos %>%
  left_join(counts_by_video2, by = c("id" = "video_id")) %>%
  mutate(
    n_count = coalesce(n_count, 0L),
    mean_count = coalesce(mean_count, 0.0),
    counted = n_count > 0
  )

compute_run <- function(df) {
  run_counts <- df %>%
    filter(
      date >= ymd(start_date),
      date <= ymd(end_date),
      hour(start_timestamp) < 21,
      hour(end_timestamp) >= 5
      # !(hour(start) != hour(end) & hour(end) %in% c(7, 11, 15, 19) & minute(end) > 0)
    ) %>%
    mutate(
      hour = hour(start_timestamp),
      period = case_when(
        hour >= 5 & hour < 7 ~ 0,
        hour >= 7 & hour < 11 ~ 1,
        hour >= 11 & hour < 15 ~ 2,
        hour >= 15 & hour < 19 ~ 3,
        hour >= 19 & hour < 21 ~ 4,
        TRUE ~ NA_real_
      )
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
    filter(period %in% c(1:3)) %>%
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

  run_day_cumul <- run_day %>%
    mutate(
      Y = cumsum(Y),
      var_Y = cumsum(var_Y),
      se = sqrt(var_Y),
      df_num = cumsum(df_num),
      df_den = cumsum(df_den),
      df = df_num ^ 2 / df_den,
      df = coalesce(round(df), 0),
      t_star = map_dbl(df, ~ qt(0.975, df = .)),
      t_star = coalesce(t_star, 0),
      ci_lower = Y - t_star * se,
      ci_upper = Y + t_star * se
    )

  list(
    counts = run_counts,
    hour = run_hour,
    period = run_period,
    day = run_day,
    total = run_total
  )
}

run1 <- compute_run(videos)
run2 <- compute_run(videos2)

bind_rows(
  run1$day %>%
    mutate(dataset = "original"),
  run2$day %>%
    mutate(dataset = "updated"),
) %>%
  ggplot(aes(date, Y)) +
  geom_ribbon(aes(ymin = ci_lower, ymax = ci_upper, group = dataset), fill = "gray50", alpha = 0.5) +
  geom_line(aes(color = dataset))


bind_rows(
  run1$day %>%
    mutate(dataset = "w/ fake counts"),
  run2$day %>%
    mutate(dataset = "w/o fake counts"),
) %>%
  ggplot(aes(date, Y)) +
  geom_line(aes(color = dataset)) +
  scale_x_date(breaks = scales::date_breaks("2 day"), labels = scales::date_format("%b %d")) +
  labs(
    x = "",
    y = "Est. Daily Fish Run"
  )


run1$total
run2$total

run1$day %>%
  filter(date == ymd(20190430))
run2$day %>%
  filter(date == ymd(20190430))



# find bad counts ---------------------------------------------------------

counts %>%
  left_join(
    tbl_videos %>%
      select(video_id = id, url),
    by = "video_id"
  ) %>%
  group_by(video_id) %>%
  mutate(
    n_count = n(),
    min_count = min(count),
    max_count = max(count),
    diff_count = max_count - min_count
  ) %>%
  filter(
    n_count > 1,
    diff_count > 10
  ) %>%
  arrange(desc(diff_count)) %>%
  View()

