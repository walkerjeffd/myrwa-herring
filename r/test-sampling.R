library(tidyverse)
library(lubridate)
library(gridExtra)
library(jsonlite)
library(glue)
library(DBI)

theme_set(theme_bw())

cfg <- read_json("./config.json")

con <- dbConnect(
  RPostgreSQL::PostgreSQL(),
  dbname = cfg$db$database,
  host = cfg$db$host,
  port = cfg$db$port,
  user = cfg$db$user,
  password = cfg$db$password
)

res <- dbSendQuery(con, "SELECT id, location_id, start_timestamp at time zone 'US/Eastern' as start_timestamp, row_number() over () as row from f_candidate_videos('UML', '2019-04-18', '2019-04-25', 4, 20)")
df_videos_uml <- dbFetch(res) %>%
  as_tibble()
dbClearResult(res)

res <- dbSendQuery(con, "SELECT id, location_id, start_timestamp at time zone 'US/Eastern' as start_timestamp, row_number() over () as row from f_candidate_videos('PLY', '2019-04-01', '2019-04-25', 7, 18)")
df_videos_ply <- dbFetch(res) %>%
  as_tibble()
dbClearResult(res)

df_videos <- bind_rows(df_videos_uml, df_videos_ply)

df_videos %>%
  ggplot(aes(start_timestamp)) +
  geom_histogram() +
  facet_wrap(~location_id, ncol = 1)

# exponential distribution ------------------------------------------------

get_exp_samples <- function(lambda, location_id, start_date, end_date, start_hour, end_hour) {
  sql <- glue_sql("with v as (
      SELECT *, row_number() over () as row
      from f_candidate_videos({location_id}, {start_date}, {end_date}, {start_hour}, {end_hour})
    ), t as (
      select generate_series(1, 1000) as trial, random_exp({lambda}, (SELECT count(*)::int FROM v))::bigint + 1 as row
    )
    select t.*, v.id, v.start_timestamp at time zone 'US/Eastern' as start_timestamp
    from t
    left join v on t.row=v.row;",
    lambda = lambda,
    location_id = location_id,
    start_date = start_date, end_date = end_date,
    start_hour = start_hour, end_hour = end_hour,
    .con = con
  )

  res <- dbSendQuery(con, sql)
  df <- dbFetch(res)
  dbClearResult(res)
  df %>%
    as_tibble() %>%
    mutate(
      location_id = location_id,
      lambda = lambda
    )
}
# get_exp_samples(0.01, 'UML', '2019-04-18', '2019-04-25', 4, 20)

lambdas <- c(0.1, 0.05, 0.01, 0.005, 0.001)

df_exp_uml <- map_df(lambdas, ~ get_exp_samples(., 'UML', '2019-04-18', '2019-04-25', 4, 20))
df_exp_ply <- map_df(lambdas, ~ get_exp_samples(., 'PLY', '2019-04-01', '2019-04-25', 7, 18))

df_exp <- bind_rows(df_exp_uml, df_exp_ply)

df_exp %>% filter(is.na(id))

df_exp %>%
  ggplot(aes(start_timestamp)) +
  geom_histogram() +
  facet_grid(lambda~location_id, scales = "free_x", labeller = label_both)


# uniform distribution ----------------------------------------------------

get_uni_samples <- function(location_id, start_date, end_date, start_hour, end_hour) {
  sql <- glue_sql("with v as (
      SELECT *, row_number() over () as row
      from f_candidate_videos({location_id}, {start_date}, {end_date}, {start_hour}, {end_hour})
    ), t as (
      select generate_series(1, 1000) as trial, FLOOR(RANDOM() * (SELECT COUNT(*) FROM v) ) + 1 as row
    )
    select t.*, v.id, v.start_timestamp at time zone 'US/Eastern' as start_timestamp
    from t
    left join v on t.row=v.row;", .con = con)

  res <- dbSendQuery(con, sql)
  df <- dbFetch(res)
  dbClearResult(res)
  df %>%
    as_tibble() %>%
    mutate(
      location_id = location_id
    )
}
# get_uni_samples('UML', '2019-04-18', '2019-04-25', 4, 20)

df_uni_uml <- get_uni_samples('UML', '2019-04-18', '2019-04-25', 4, 20)
df_uni_ply <- get_uni_samples('PLY', '2019-04-01', '2019-04-25', 7, 18)

df_uni <- bind_rows(df_uni_uml, df_uni_ply)

df_uni %>%
  ggplot(aes(start_timestamp)) +
  geom_histogram() +
  facet_grid(.~location_id, scales = "free_x", labeller = label_both)

