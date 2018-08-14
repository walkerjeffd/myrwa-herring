# load 2018 volunteer counts from XLSX and save to JSON

library(tidyverse)
library(lubridate)
library(jsonlite)
library(readxl)

cfg <- read_json("./config.json")

# load volunteer ----------------------------------------------------------

df_vol <- read_excel("~/Dropbox/Work/mystic/herring/data/2018/Visual Counts 2018.xlsx", sheet = 1) %>%
  select(
    date = Date, collector = Monitor, starttime = `Start Time`, endtime = `End Time`, count = `Fish Count`
  ) %>%
  mutate(
    start = date + hours(hour(starttime)) + minutes(minute(starttime)),
    end = date + hours(hour(endtime)) + minutes(minute(endtime)),
    date = as.Date(date),
    count = as.integer(count)
  ) %>%
  select(collector, date, start, end, count)

# load video --------------------------------------------------------------

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
    year(start_timestamp) == cfg$report$year
  )

tbl_counts <- pg %>%
  tbl("counts") %>%
  filter(!flagged) %>%
  collect()

counts <- tbl_counts %>%
  left_join(select(tbl_videos, id, start_timestamp), by = c("video_id" = "id")) %>%
  filter(
    year(start_timestamp) == cfg$report$year
  )

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


stats_by_video_day_7AM7PM <- videos %>%
  filter(hour(start_timestamp) >= 7, hour(start_timestamp) < 19) %>%
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


# run estimate - video ----------------------------------------------------

run_vid_counts <- videos %>%
  filter(
    # date >= ymd(cfg$report$start),
    month(start_timestamp) < 7,
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

run_vid_hour <- run_vid_counts %>%
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

run_vid_period <- run_vid_counts %>%
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

run_vid_day <- run_vid_period %>%
  group_by(date) %>%
  summarise(
    n_p = n(),
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

run_vid_total <- run_vid_day %>%
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
    ci_range = t_star * sqrt(var_Y),
    ci_lower = Y - ci_range,
    ci_upper = Y + ci_range
  )

run_vid_day_cumul <- run_vid_day %>%
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


# run estimate - volunteer ------------------------------------------------

df_vol_counts <- df_vol %>%
  filter(
    month(date) < 7,
    hour(start) < 19,
    hour(end) >= 7,
    !(hour(start) != hour(end) & hour(end) %in% c(7, 13, 19) & minute(end) > 0) # exclude any 10-min periods that cross from one 4-hour period to the next
  ) %>%
  mutate(
    hour = hour(start),
    period = case_when(
      hour >= 7 & hour < 13 ~ 1,
      hour >= 13 & hour < 19 ~ 2,
      TRUE ~ NA_real_
    )
  ) %>%
  rename(
    y_kpi = count
  ) %>%
  select(date, start, end, hour, period, y_kpi)

# daily summary statistics, note that these are NOT used for total run estimates
df_vol_daily_stats <- df_vol_counts %>%
  group_by(date) %>%
  summarise(
    mean = mean(y_kpi),
    sd = sd(y_kpi),
    n = n(),
    se = sd / sqrt(n)
  )

# calculations ------------------------------------------------------------

df_vol_period <- df_vol_counts %>%
  group_by(date, period) %>%
  summarise(
    y_kp = mean(y_kpi),            # mean count per period
    n_kp = n(),
    s_kp = coalesce(sd(y_kpi), 0), # st. dev of period count (Eq 13)
    N_kp = 6 * 6
  ) %>%
  ungroup() %>%
  mutate(
    Y_kp = N_kp * y_kp,                              # estimated total coun per period (Eq 12)
    varY_kp = N_kp * (N_kp - n_kp) * s_kp^2 / n_kp,  # variance of total count per period (Eq 13)
    a_kp = N_kp * (N_kp - n_kp) / n_kp               # coefficient used to estimate deg. of freedom (Eq 9)
  )

df_vol_day <- df_vol_period %>%
  group_by(date) %>%
  summarise(
    n_p = n(),                                      # Number of periods per day
    n_k = sum(n_kp),                                # Number of counts per day
    N_k = sum(N_kp),                                # Number of 10-min intervals per day (NOTE! only includes daily hours, 0700-1900)
    Y_k = sum(Y_kp),                                # Daily estimated run (Eq 12)
    varY_k = sum(varY_kp),                          # Variance of daily estimated run (Eq 13)
    se_k = sqrt(varY_k),
    df_num = sum(a_kp * s_kp ^ 2),                  # numerator of Eq 9
    df_den = sum((a_kp * s_kp ^ 2) ^ 2 / (n_kp - 1), na.rm = TRUE), # denominator of Eq 9
    df = df_num ^ 2 / df_den,                       # degrees of freedom (Eq 9)
    df = round(df),
    t_star = map_dbl(df, ~ qt(0.975, df = .)),      # t distribution statistic, two-sided 95% CI
    df = coalesce(df, 0),
    t_star = coalesce(t_star, 0),
    ci_lower = Y_k - t_star * sqrt(varY_k),         # Lower 95% CI Bound (Eq 14)
    ci_upper = Y_k + t_star * sqrt(varY_k)          # Upper 95% CI Bound (Eq 14)
  ) %>%
  mutate(
    Y_k = round(Y_k),
    ci_lower = round(ci_lower),
    ci_upper = round(ci_upper)
  )

df_vol_run <- df_vol_day %>%
  summarise(
    N = sum(N_k),
    total = sum(Y_k),                            # Total run estimate
    se = sqrt(sum(varY_k)),                      # Std. error of total run estimate
    df = sum(df_num) ^ 2 / sum(df_den),          # Degrees of freedom (Eq 9)
    df = round(df),
    t_star = map_dbl(df, ~ qt(0.975, df = .)),   # t statistic
    ci_range = t_star * se,                      # 95% CI Bound Range
    ci_lower = total - ci_range,                 # Lower 95% CI Bound (Eq 14)
    ci_upper = total + ci_range                  # Upper 95% CI Bound (Eq 14)
  )

print(df_vol_counts) # individual counts
print(df_vol_period) # period statistics
print(df_vol_day)    # daily statistics
print(df_vol_run)    # total run statistics

# plot daily run estimates with 95% CI
df_vol_day %>%
  ggplot(aes(date, Y_k)) +
  geom_col() +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper)) +
  coord_cartesian(ylim = c(0, 100000)) +
  labs(
    x = "Date",
    y = "Estimate Daily Run (95% CI)"
  )


# run estimate (3p) - vol -------------------------------------------------

df_vol_counts_3p <- df_vol %>%
  filter(
    month(date) < 7,
    hour(start) < 19,
    hour(end) >= 7,
    !(hour(start) != hour(end) & hour(end) %in% c(7, 11, 15, 19) & minute(end) > 0) # exclude any 10-min periods that cross from one 4-hour period to the next
  ) %>%
  mutate(
    hour = hour(start),
    period = case_when(
      hour >= 7 & hour < 11 ~ 1,
      hour >= 11 & hour < 15 ~ 2,
      hour >= 15 & hour < 19 ~ 3,
      TRUE ~ NA_real_
    )
  ) %>%
  rename(
    y_kpi = count
  ) %>%
  select(date, start, end, hour, period, y_kpi)

df_vol_period_3p <- df_vol_counts_3p %>%
  group_by(date, period) %>%
  summarise(
    y_kp = mean(y_kpi),            # mean count per period
    n_kp = n(),
    s_kp = coalesce(sd(y_kpi), 0), # st. dev of period count (Eq 13)
    N_kp = 6 * 4
  ) %>%
  ungroup() %>%
  mutate(
    Y_kp = N_kp * y_kp,                              # estimated total coun per period (Eq 12)
    varY_kp = N_kp * (N_kp - n_kp) * s_kp^2 / n_kp,  # variance of total count per period (Eq 13)
    a_kp = N_kp * (N_kp - n_kp) / n_kp               # coefficient used to estimate deg. of freedom (Eq 9)
  )

df_vol_day_3p <- df_vol_period_3p %>%
  group_by(date) %>%
  summarise(
    n_p = n(),                                      # Number of periods per day
    n_k = sum(n_kp),                                # Number of counts per day
    N_k = sum(N_kp),                                # Number of 10-min intervals per day (NOTE! only includes daily hours, 0700-1900)
    Y_k = sum(Y_kp),                                # Daily estimated run (Eq 12)
    varY_k = sum(varY_kp),                          # Variance of daily estimated run (Eq 13)
    se_k = sqrt(varY_k),
    df_num = sum(a_kp * s_kp ^ 2),                  # numerator of Eq 9
    df_den = sum((a_kp * s_kp ^ 2) ^ 2 / (n_kp - 1), na.rm = TRUE), # denominator of Eq 9
    df = df_num ^ 2 / df_den,                       # degrees of freedom (Eq 9)
    df = round(df),
    t_star = map_dbl(df, ~ qt(0.975, df = .)),      # t distribution statistic, two-sided 95% CI
    df = coalesce(df, 0),
    t_star = coalesce(t_star, 0),
    ci_lower = Y_k - t_star * sqrt(varY_k),         # Lower 95% CI Bound (Eq 14)
    ci_upper = Y_k + t_star * sqrt(varY_k)          # Upper 95% CI Bound (Eq 14)
  ) %>%
  mutate(
    Y_k = round(Y_k),
    ci_lower = round(ci_lower),
    ci_upper = round(ci_upper)
  )

df_vol_run_3p <- df_vol_day_3p %>%
  summarise(
    N = sum(N_k),
    total = sum(Y_k),                            # Total run estimate
    se = sqrt(sum(varY_k)),                      # Std. error of total run estimate
    df = sum(df_num) ^ 2 / sum(df_den),          # Degrees of freedom (Eq 9)
    df = round(df),
    t_star = map_dbl(df, ~ qt(0.975, df = .)),   # t statistic
    ci_range = t_star * se,                      # 95% CI Bound Range
    ci_lower = total - ci_range,                 # Lower 95% CI Bound (Eq 14)
    ci_upper = total + ci_range                  # Upper 95% CI Bound (Eq 14)
  )

print(df_vol_run)
print(df_vol_run_3p)


# compare -----------------------------------------------------------------

bind_rows(
  run_vid_day %>%
    select(date, Y, ci_lower, ci_upper) %>%
    mutate(dataset = "Video"),
  df_vol_day %>%
    select(date, Y = Y_k, ci_lower, ci_upper) %>%
    mutate(dataset = "Volunteer")
) %>%
  ggplot(aes(date, Y)) +
  geom_col(fill = "gray50") +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper)) +
  facet_wrap(~ dataset, ncol = 1)


bind_rows(
  run_vid_day %>%
    select(date, Y, ci_lower, ci_upper) %>%
    mutate(dataset = "Video"),
  df_vol_day %>%
    select(date, Y = Y_k, ci_lower, ci_upper) %>%
    mutate(dataset = "Volunteer")
) %>%
  select(date, Y, dataset) %>%
  spread(dataset, Y) %>%
  mutate(
    date_label = format(date, "%b %d"),
    label = if_else(abs(Video - Volunteer) / ((Video + Volunteer) / 2) > 0.25 & (Video + Volunteer) / 2 > 5000, date_label, ""),
    label = coalesce(label, "")
  ) %>%
  ggplot(aes(Volunteer, Video)) +
  geom_abline() +
  geom_point() +
  geom_text(aes(label = label), hjust = 0)
