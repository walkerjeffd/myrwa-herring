# evolution of the run estimate over time

library(tidyverse)
library(lubridate)
library(RColorBrewer)
library(jsonlite)


# config ------------------------------------------------------------------

cfg <- read_json("./config.json")

site <- "UML"
run_year <- "2020"

# load data ---------------------------------------------------------------

con <- DBI::dbConnect(
  RPostgreSQL::PostgreSQL(),
  dbname = cfg$db$database,
  host = cfg$db$host,
  port = cfg$db$port,
  user = cfg$db$user,
  password = cfg$db$password
)

tbl_videos <- tbl(con, "videos") %>%
  filter(!flagged, location_id == site)  %>%
  collect() %>%
  mutate(
    start_timestamp = with_tz(start_timestamp, tzone = "US/Eastern"),
    end_timestamp = with_tz(end_timestamp, tzone = "US/Eastern"),
    date = as_date(start_timestamp, tz = "US/Eastern")
  )

tbl_counts <- tbl(con, "counts") %>%
  filter(!flagged) %>%
  collect()

DBI::dbDisconnect(con)


# merge -------------------------------------------------------------------

df_videos <- tbl_videos %>%
  filter(
    year(date) == run_year
  )

all_counts <- tbl_counts %>%
  inner_join(select(df_videos, id, start_timestamp, date), by = c("video_id" = "id")) %>%
  filter(
    hour(start_timestamp) >= 7,
    hour(start_timestamp) < 19
  ) %>%
  arrange(created_at)

calculate_run_daily <- function(x) {
  counts_by_video <- x %>%
    group_by(video_id) %>%
    summarise(
      n_count = n(),
      mean_count = mean(count),
      .groups = "drop"
    )

  videos <- df_videos %>%
    left_join(counts_by_video, by = c("id" = "video_id")) %>%
    mutate(
      n_count = coalesce(n_count, 0L),
      mean_count = coalesce(mean_count, 0.0),
      counted = n_count > 0
    )

  run_counts <- videos %>%
    filter(
      # date >= ymd(start_date),
      # date <= ymd(end_date),
      hour(start_timestamp) < 19,
      hour(end_timestamp) >= 7
    ) %>%
    mutate(
      hour = hour(start_timestamp),
      period = case_when(
        hour >= 7 & hour < 11 ~ 1,
        hour >= 11 & hour < 15 ~ 2,
        hour >= 15 & hour < 19 ~ 3,
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
      N = n(), # number of recorded videos
      n = sum(n_count > 0), # number of counted videos
      T = sum(t_i), # total duration of recorded videos
      sum_y = sum(y_i, na.rm = TRUE), # total number of fish counted
      sum_t = sum(t_i_counted), # total duration of counted videos
      mean_t = coalesce(sum_t / n, 0), # average duration of counted videos
      r = coalesce(sum_y / sum_t, 0), # average fish passage rate from counted videos (# fish / sec)
      Y = r * T, # estimated total number of fish
      se2 = coalesce(sum((y_i - r * t_i_counted) ^ 2, na.rm = TRUE) / (n - 1), 0), # sq(std error) of Y
      var_Y = coalesce((T / mean_t)^2 * (N - n) / (N * n) * se2, 0), # variance of Y
      df = n - 1, # deg of freedom
      t_star = coalesce(qt(0.975, df = df), 0), # t statistic
      ci_lower = Y - t_star * sqrt(var_Y), # upper 95% CI
      ci_upper = Y + t_star * sqrt(var_Y), # lower 95% CI
      a = if_else(n == 0, 0, N * (N - n) / n), # pooling parameter
      .groups = "drop"
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
      a = if_else(n == 0, 0, N * (N - n) / n),
      .groups = "drop"
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
      ci_upper = Y + t_star * sqrt(var_Y),
      .groups = "drop"
    )

  run_day
}

calculate_run_total <- function (x) {
  x %>%
    summarise(
      N = sum(N), # total number of recorded videos
      n = sum(n), # total number of counted videos
      T = sum(T), # total duration of recorded videos
      sum_y = sum(sum_y), # total number of fish counted
      sum_t = sum(sum_t), # total duration of counted videos
      Y = sum(Y), # total estimated number of fish
      r = Y / T, # average fish passage rate (# fish/sec)
      var_Y = sum(var_Y), # variance of Y
      se_Y = sqrt(var_Y), # st err of Y
      df = sum(df_num) ^ 2 / sum(df_den), # deg of freedom
      df = round(df),
      t_star = coalesce(qt(0.975, df = df), 0), # t statistic
      ci_lower = Y - t_star * sqrt(var_Y), # upper 95% CI
      ci_upper = Y + t_star * sqrt(var_Y), # lower 95% CI
      .groups = "drop"
    )
}

calculate_run_daily(all_counts)
calculate_run_total(calculate_run_daily(all_counts))

df_count_days <- crossing(
    date = seq.Date(as_date(min(all_counts$created_at)), as_date(max(all_counts$created_at)), by = "day"),
    hour = 0
    # hour = 0:23
  ) %>%
  mutate(
    datetime = date + hours(hour),
    counts = map(datetime, function (x) {
      all_counts %>%
        filter(created_at <= x)
    }),
    n_counts = map_int(counts, nrow),
    run_daily = map(counts, calculate_run_daily),
    run_total = map(run_daily, calculate_run_total)
  )

pdf(glue("pdf/run-estimate-evolution-{site}-{run_year}.pdf"), width = 11, height = 8.5)
df_count_days %>%
  unnest(run_total) %>%
  ggplot(aes(datetime)) +
  geom_ribbon(aes(ymin = ci_lower, ymax = ci_upper), alpha = 0.5) +
  geom_line(aes(y = Y)) +
  scale_y_continuous(labels = scales::comma) +
  labs(
    x = "Counting Date",
    y = "Total Run Estimate (95% CI)",
    title = "Evolution of the Total Run Estimate over Time",
    subtitle = str_c(
      "This chart shows how the total run estimate changed over time based on when counts were submitted (not when videos were recorded).",
      "At each point in time, the run estimate is calculated from all counts submitted before that time.",
      # "The major increase on May 18 is probably from new videos that were uploaded at that time and contained a major pulse of fish",
      # "This spike then receeds as more videos from that day were counted, which brought down the estimate",
      sep = "\n"
    )
  )
#
# df_count_days %>%
#   filter(
#     datetime %in% ymd_hm(c(202105170000, 202105180100, 202105190000, 202105200000))
#   ) %>%
#   select(-date, -hour) %>%
#   unnest(
#     run_daily
#   ) %>%
#   ggplot(aes(date, Y, color = format(datetime, "%Y-%m-%d %H:%M"))) +
#   geom_line(aes()) +
#   geom_point() +
#   scale_x_date(breaks = scales::pretty_breaks(n = 10)) +
#   labs(
#     x = "Date Video Recorded",
#     y = "Daily Run Estimate",
#     color = "End Count\nDatetime",
#     title = "Evolution of Daily Run Estimates over Time",
#     subtitle = str_c(
#       "This chart shows how the daily run estimate changed over time based on when counts were submitted.",
#       "Each line shows the daily run estimate for a set of counts, which vary by the last datetime when counts were submitted.",
#       "For example, the red line includes all counts submitted before 5/17 while the blue line includes all counts submitted before 5/19",
#       "The large difference in the lines from May 12-14 reflects the large spike in total run estimate on May 18,",
#       "which suggests videos recorded on May 12-14 were uploaded on May 18, and because they contained a lot of fish, this made the estimate jump.",
#       sep = "\n"
#     )
#   )

dev.off()

