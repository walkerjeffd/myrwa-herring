# herring run estimate algorithm for video count data

library(tidyverse)
library(lubridate)
library(RColorBrewer)
library(jsonlite)


# config ------------------------------------------------------------------

cfg <- read_json("./config.json")

site <- "UML"
start_date <- "2020-04-15"
end_date <- "2020-06-30"


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
  ) %>%
  filter(
    date >= ymd(start_date),
    date <= ymd(end_date)
  )

tbl_counts <- tbl(con, "counts") %>%
  filter(!flagged) %>%
  collect()

DBI::dbDisconnect(con)


# merge -------------------------------------------------------------------

all_counts <- tbl_counts %>%
  left_join(select(tbl_videos, id, start_timestamp, date), by = c("video_id" = "id")) %>%
  filter(
    date >= as.Date(start_date),
    date <= as.Date(end_date),
    hour(start_timestamp) >= 7,
    hour(start_timestamp) < 19
  )

estimate_run <- function(n) {
  cat("n = ", n, "\n")
  x <- all_counts %>%
    sample_n(size = n)

  counts_by_video <- x %>%
    group_by(video_id) %>%
    summarise(
      n_count = n(),
      mean_count = mean(count),
      .groups = "drop"
    )

  videos <- tbl_videos %>%
    left_join(counts_by_video, by = c("id" = "video_id")) %>%
    mutate(
      n_count = coalesce(n_count, 0L),
      mean_count = coalesce(mean_count, 0.0),
      counted = n_count > 0
    )


  run_counts <- videos %>%
    filter(
      date >= ymd(start_date),
      date <= ymd(end_date),
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

  run_total <- run_day %>%
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

  run_total # Y = total run estimate
}

estimate_run(100)

final_run <- estimate_run(nrow(all_counts))

x <- tibble(
  n = rep(c(c(1:9) * rep(10^(2:4), each = 9)), each = 10)
  # n = c(100, 1000)
) %>%
  rowwise() %>%
  mutate(
    run = list(estimate_run(n)),
    Y = run$Y
  )

x %>%
  group_by(n) %>%
  summarise(
    mean = mean(Y),
    se = sd(Y) / sqrt(n)
  ) %>%
  ggplot(aes(n, mean)) +
  geom_ribbon(aes(ymin = mean - 2 * se, ymax = mean + 2 * se)) +
  geom_line() +
  scale_x_log10()

x %>%
  ggplot(aes(n, Y)) +
  geom_point() +
  # geom_jitter(height = 0) +
  geom_hline(yintercept = final_run$Y) +
  scale_x_log10(labels = scales::comma) +
  scale_y_continuous(labels = scales::comma) +
  labs(x = "# Counts (note: log scale)", y = "Estimated Total Run (# Fish)")

# run estimate ------------------------------------------------------------


# plots -------------------------------------------------------------------

run_day %>%
  ggplot(aes(date, Y)) +
  geom_col(fill = "gray50") +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.5) +
  scale_y_continuous(breaks = scales::pretty_breaks(n = 10), labels = scales::comma, expand = c(0, 0)) +
  coord_cartesian(ylim = c(0, max(run_day$ci_upper, na.rm = TRUE) * 1.1)) +
  labs(
    x = "Date",
    y = "# Fish",
    title = "Daily Run Estimate"
  )

run_day_cumul %>%
  ggplot(aes(date)) +
  geom_line(aes(y = Y)) +
  geom_ribbon(aes(ymin = ci_lower, ymax = ci_upper), alpha = 0.2) +
  geom_point(
    data = run_day_cumul %>%
      filter(date == max(date)),
    aes(x = date, y = Y)
  ) +
  geom_text(
    data = run_day_cumul %>%
      filter(
        date == max(date)
      ),
    aes(label = scales::comma(round(Y)), x = date, y = Y),
    hjust = 1, vjust = 0, nudge_y = 0
  ) +
  # scale_x_date(breaks = scales::pretty_breaks(n = 8)) +
  scale_y_continuous(breaks = scales::pretty_breaks(n = 6), labels = scales::comma) +
  labs(
    x = "Date",
    y = "# Fish",
    title = "Cumulative Estimated Total Fish (95% CI)"
  )

run_hour %>%
  ggplot(aes(date, hour, fill = Y)) +
  geom_tile(aes(alpha = n > 0)) +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_alpha_manual("", values = c("TRUE" = 1, "FALSE" = 0), guide = FALSE) +
  scale_fill_gradientn("# Fish", colours = rev(brewer.pal(8, "Spectral")), limits = c(0, NA)) +
  labs(
    x = "Date",
    y = "Hour of Day",
    title = "Hourly Estimated # Fish"
  ) +
  theme(
    panel.grid.minor = element_blank()
  )

run_hour %>%
  ggplot(aes(date, hour, fill = sqrt(se2))) +
  geom_tile(aes(alpha = n > 0)) +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_alpha_manual("", values = c("TRUE" = 1, "FALSE" = 0), guide = FALSE) +
  scale_fill_gradientn("Std Error", colours = rev(brewer.pal(8, "Spectral")), limits = c(0, NA)) +
  labs(
    x = "Date",
    y = "Hour of Day",
    title = "Standard Error of Hourly Estimated # Fish"
  ) +
  theme(
    panel.grid.minor = element_blank()
  )
