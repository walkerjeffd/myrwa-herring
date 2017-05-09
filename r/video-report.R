library(dplyr)
library(tidyr)
library(ggplot2)
library(lubridate)
library(RColorBrewer)
library(gridExtra)
library(jsonlite)

theme_set(theme_bw())

updated_at <- paste0("Updated: ", with_tz(now(), "America/New_York"))

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


# pdf ---------------------------------------------------------------------

pdf("pdf/video-report.pdf", width = 11, height = 8.5)


# TILES -------------------------------------------------------------------

p1 <- videos_hour_tally %>%
  ggplot(aes(date, hour, fill = n)) +
  geom_tile() +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_fill_gradientn("# Videos\nRecorded", colours = rev(brewer.pal(8, "Spectral")), limits = c(0, NA)) +
  labs(
    x = "Date",
    y = "Hour of Day",
    title = "# Videos Recorded"
  ) +
  theme(
    panel.grid.minor = element_blank()
  )

p2 <- videos_hour_tally %>%
  ggplot(aes(date, hour, fill = sum_duration)) +
  geom_tile() +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_fill_gradientn("Duration\n(min)", colours = rev(brewer.pal(8, "Spectral")), limits = c(0, NA)) +
  labs(
    x = "Date",
    y = "Hour of Day",
    title = "Total Duration of Recorded Videos"
  ) +
  theme(
    panel.grid.minor = element_blank()
  )

p3 <- videos_hour_tally %>%
  ggplot(aes(date, hour, fill = n_watched)) +
  geom_tile(aes(alpha = n_watched > 0)) +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_alpha_manual("", values = c("TRUE" = 1, "FALSE" = 0), guide = FALSE) +
  scale_fill_gradientn("# Videos\nCounted", colours = rev(brewer.pal(8, "Spectral")), limits = c(1, NA)) +
  labs(
    x = "Date",
    y = "Hour of Day",
    title = "# Videos Counted"
  ) +
  theme(
    panel.grid.minor = element_blank()
  )

p4 <- videos_hour_tally %>%
  ggplot(aes(date, hour, fill = sum_count)) +
  geom_tile(aes(alpha = n_watched > 0)) +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_alpha_manual("", values = c("TRUE" = 1, "FALSE" = 0), guide = FALSE) +
  scale_fill_gradientn("# Fish\nCounted", colours = rev(brewer.pal(8, "Spectral")), limits = c(0, NA)) +
  labs(
    x = "Date",
    y = "Hour of Day",
    title = "# Fish Counted"
  ) +
  theme(
    panel.grid.minor = element_blank()
  )

grid.arrange(p1, p2, p3, p4, ncol = 2, top = "Mystic River Herring | Hourly Video Summary", bottom = updated_at)



# HEX DENSITY -------------------------------------------------------------

p1a <- videos %>%
  filter(n_count > 0) %>%
  ggplot(aes(duration, mean_count)) +
  geom_point(shape = 21, alpha = 0.5) +
  xlim(0, NA) +
  labs(
    x = "Video Duration (min)",
    y = "# Fish per Video",
    title = "# Fish per Video vs. Video Duration",
    subtitle = "[ Scatter Plot ]"
  ) +
  theme(
    aspect.ratio = 1
  )

p1b <- videos %>%
  filter(n_count > 0) %>%
  ggplot(aes(duration, mean_count)) +
  geom_hex(bins = 30) +
  xlim(0, NA) +
  scale_fill_gradientn(
    name = "# Videos",
    colors = rev(RColorBrewer::brewer.pal(n = 8, name = "Spectral")),
    limits = c(0, NA)
  ) +
  labs(
    x = "Video Duration (min)",
    y = "# Fish per Video",
    title = "# Fish per Video vs. Video Duration",
    subtitle = "[ 2D Density Hex ]"
  ) +
  theme(
    aspect.ratio = 1
  )

p2a <- videos %>%
  filter(n_count > 0) %>%
  ggplot(aes(duration, mean_count / (duration / 60))) +
  geom_point(shape = 21, alpha = 0.5) +
  xlim(0, NA) +
  labs(
    x = "Video Duration (seconds)",
    y = "# Fish per Minute",
    title = "Duration v. # Fish per Minute",
    subtitle = "[ Scatter Plot ]"
  ) +
  theme(
    aspect.ratio = 1
  )

p2b <- videos %>%
  filter(n_count > 0) %>%
  ggplot(aes(duration, mean_count / (duration / 60))) +
  geom_hex(bins = 30) +
  xlim(0, NA) +
  scale_fill_gradientn(
    name = "# Videos",
    colors = rev(RColorBrewer::brewer.pal(n = 8, name = "Spectral")),
    limits = c(0, NA)
  ) +
  labs(
    x = "Video Duration (seconds)",
    y = "# Fish per Minute",
    title = "Duration v. # Fish per Minute",
    subtitle = "[ 2D Density Hex ]"
  ) +
  theme(
    aspect.ratio = 1
  )

grid.arrange(p1a, p1b, p2a, p2b, ncol = 2, bottom = updated_at)


# BAR CHARTS - DAILY VIDEOS -----------------------------------------------

p1 <- stats_by_video_day %>%
  select(date, n_unwatched, n_watched) %>%
  gather(var, value, -date) %>%
  mutate(
    var = ordered(var, levels = c("n_watched", "n_unwatched"))
  ) %>%
  ggplot(aes(date, value, fill = var)) +
  geom_bar(position = "stack", stat = "identity") +
  scale_fill_manual(
    "",
    values = c("n_unwatched" = "gray50", "n_watched" = "deepskyblue"),
    labels = c("n_unwatched" = "Not Watched", "n_watched" = "Watched")
  ) +
  scale_x_date(expand = c(0, 0)) +
  labs(
    x = "Date",
    y = "# Videos",
    title = "Number of Videos per Day",
    subtitle = "Date = when video was recorded"
  )

p2 <- stats_by_video_day %>%
  select(date, n_video, n_watched) %>%
  ggplot(aes(date, n_watched / n_video, fill = "% Watched")) +
  geom_bar(position = "stack", stat = "identity") +
  scale_fill_manual(
    "",
    values = c("deepskyblue")
  ) +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(labels = scales::percent, expand = c(0, 0), limits = c(0, 1)) +
  labs(
    x = "Date",
    y = "% Videos Watched",
    title = "Percent of Videos Watched per Day",
    subtitle = "Date = when video was recorded"
  )

grid.arrange(p1, p2, nrow = 2, bottom = updated_at)


#### BAR CHARTS - BY VIDEO DATE

p1 <- stats_by_video_day %>%
  ggplot(aes(date, n_count)) +
  geom_bar(fill = "orangered", stat = "identity") +
  labs(
    x = "Date Video was Recorded",
    y = "# Counts",
    title = "Number of Counts per Day"
  )

p2 <- stats_by_video_day %>%
  ggplot(aes(date, sum_count)) +
  geom_bar(fill = "orangered", stat = "identity") +
  labs(
    x = "Date Video was Recorded",
    y = "# Fish",
    title = "Number of Fish Counted per Day"
  )

p3 <- stats_by_video_day %>%
  ggplot(aes(date, mean_count_per_min)) +
  geom_bar(fill = "orangered", stat = "identity") +
  labs(
    x = "Date Video was Recorded",
    y = "Average # Fish per Minute",
    title = "Fish Passage Rate per Day"
  )

grid.arrange(p1, p2, p3, ncol = 2, top = "Daily Stats by Date Video was Recorded", bottom = updated_at)


# BAR CHARTS - BY COUNT DATE ----------------------------------------------

p1 <- stats_by_count_day %>%
  ggplot(aes(date, n_count)) +
  geom_bar(fill = "chartreuse3", stat = "identity") +
  labs(
    x = "Date Video was Counted",
    y = "# Video Counts",
    title = "Number of Video Counts per Day"
  )

p2 <- stats_by_count_day %>%
  ggplot(aes(date, sum_count)) +
  geom_bar(fill = "chartreuse3", stat = "identity") +
  labs(
    x = "Date Video was Counted",
    y = "# Fish Counted",
    title = "Number of Fish Counted per Day"
  )

p3 <- stats_by_count_day %>%
  ggplot(aes(date, n_count/n_session)) +
  geom_bar(fill = "chartreuse3", stat = "identity") +
  labs(
    x = "Date Video was Counted",
    y = "# Videos Counted",
    title = "Avg Number of Videos Counted per Session"
  )

p4 <- stats_by_count_day %>%
  ggplot(aes(date, n_count_zero / n_count)) +
  geom_bar(fill = "chartreuse3", stat = "identity") +
  scale_y_continuous(labels = scales::percent) +
  labs(
    x = "Date Video was Counted",
    y = "% Videos with Zero Count",
    title = "Percent of Videos Watched with Zero Fish"
  )

grid.arrange(p1, p2, p3, p4, ncol = 2, top = "Daily Stats by Count Date", bottom = updated_at)


# HISTOGRAMS --------------------------------------------------------------

p1 <- videos %>%
  filter(mean_count > 0) %>%
  ggplot(aes(mean_count)) +
  geom_histogram(binwidth = 2) +
  labs(
    x = "# Fish / Video",
    y = "# Videos",
    title = "# Fish per Video (excluding 0 counts)",
    subtitle = "How many fish are counted per video?"
  ) +
  theme(
    strip.background = element_blank(),
    strip.placement = "outside"
  )
p2 <- videos %>%
  filter(mean_count > 0) %>%
  ggplot(aes(mean_count/(duration / 60))) +
  geom_histogram() +
  labs(
    x = "# Fish / Minute",
    y = "# Videos",
    title = "# Fish per Video Minute (excluding 0 counts)",
    subtitle = "How many fish pass per minute of video?"
  ) +
  theme(
    strip.background = element_blank(),
    strip.placement = "outside"
  )
p3 <- videos %>%
  filter(duration < 100) %>%
  ggplot(aes(duration)) +
  geom_histogram() +
  labs(
    x = "Duration (seconds)",
    y = "# Videos",
    title = "Video Duration",
    subtitle = "How long are the videos?"
  ) +
  theme(
    strip.background = element_blank(),
    strip.placement = "outside"
  )
p4 <- videos %>%
  filter(!is.na(n_count), n_count > 0) %>%
  ggplot(aes(factor(n_count))) +
  geom_bar() +
  labs(
    x = "# Times Video was Counted",
    y = "# Videos",
    title = "# Counts per Video",
    subtitle = "How many times has the same video been watched?"
  ) +
  theme(
    strip.background = element_blank(),
    strip.placement = "outside"
  )
grid.arrange(p1, p2, p3, p4, nrow = 2, top = "Histograms", bottom = updated_at)

dev.off()




# SCRATCH -----------------------------------------------------------------

# videos_hour_tally %>%
#   ggplot(aes(date, hour, fill = sum_duration_watched / sum_duration)) +
#   geom_tile(aes(alpha = n > 0)) +
#   scale_x_date(expand = c(0, 0)) +
#   scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
#   scale_fill_gradientn("% Watched", colours = rev(brewer.pal(8, "Spectral")), limits = c(0, NA)) +
#   scale_alpha_manual("", values = c("TRUE" = 1, "FALSE" = 0), guide = FALSE) +
#   labs(
#     x = "Date",
#     y = "Hour of Day",
#     title = "% of Total Video Duration Watched"
#   ) +
#   theme(
#     panel.grid.minor = element_blank()
#   )

