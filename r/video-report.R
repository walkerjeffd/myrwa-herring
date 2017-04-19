library(tidyverse)
library(lubridate)
library(RColorBrewer)
library(gridExtra)
library(jsonlite)

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
    date = as.Date(start_timestamp, tz = "UTC")
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
    sum_count = sum(mean_count)
  )

stats_by_count_day <- tbl_counts %>%
  filter(video_id %in% videos$id) %>%
  mutate(
    date = as.Date(created_at, tz = "UTC")
  ) %>%
  group_by(date) %>%
  summarise(
    n = n(),
    sum = sum(count)
  )

videos_hour_tally <- videos %>%
  mutate(
    hour = hour(with_tz(start_timestamp, "UTC"))
  ) %>%
  group_by(date, hour) %>%
  summarise(
    n = n(),
    mean_duration = mean(duration)/60, # sec -> min
    sum_duration = sum(duration)/60, # sec -> min
    n_watched = sum(counted),
    n_count = sum(n_count),
    sum_count = sum(mean_count)
  )
# complete(date, hour = seq(0, 23, by = 1), fill = list(n = 0))


# pdf ---------------------------------------------------------------------

updated_at <- paste0("Updated: ", now())

pdf(cfg$out, width = 11, height = 8.5)

p1 <- videos_hour_tally %>%
  ggplot(aes(date, hour, fill = n)) +
  geom_tile() +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_fill_gradientn("# Videos\nRecorded", colours = rev(brewer.pal(8, "Spectral")), limits = c(1, NA)) +
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
  geom_tile() +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
  scale_fill_gradientn("# Videos\nCounted", colours = rev(brewer.pal(8, "Spectral")), limits = c(0, NA)) +
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
  geom_tile() +
  scale_x_date(expand = c(0, 0)) +
  scale_y_continuous(breaks = seq(0, 23), expand = c(0, 0)) +
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



p <- stats_by_video_day %>%
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
  labs(
    x = "Date",
    y = "# Videos",
    title = "Number of Videos per Day",
    subtitle = "Date = when video was recorded"
  )

grid.arrange(p, nrow = 2, bottom = updated_at)



p1 <- stats_by_video_day %>%
  ggplot(aes(date, n_count)) +
  geom_bar(fill = "orangered", stat = "identity") +
  labs(
    x = "Date",
    y = "# Counts",
    title = "Number of Counts per Day",
    subtitle = "Date = when video was recorded"
  )

p2 <- stats_by_video_day %>%
  ggplot(aes(date, sum_count)) +
  geom_bar(fill = "orangered", stat = "identity") +
  labs(
    x = "Date",
    y = "# Fish",
    title = "Number of Fish Counted per Day",
    subtitle = "Date = when video was recorded"
  )

grid.arrange(p1, p2, ncol = 1, bottom = updated_at)



p1 <- stats_by_count_day %>%
  ggplot(aes(date, n)) +
  geom_bar(fill = "chartreuse3", stat = "identity") +
  labs(
    x = "Date",
    y = "# Video Counts",
    title = "Number of Video Counts per Day",
    subtitle = "Date = when video was counted"
  )

p2 <- stats_by_count_day %>%
  ggplot(aes(date, sum)) +
  geom_bar(fill = "chartreuse3", stat = "identity") +
  labs(
    x = "Date",
    y = "# Fish Counted",
    title = "Number of Fish Counted per Day",
    subtitle = "Date = when video was counted"
  )

grid.arrange(p1, p2, ncol = 1, bottom = updated_at)

dev.off()