library(tidyverse)
library(RPostgreSQL)
library(lubridate)
library(jsonlite)

theme_set(theme_bw())

cfg <- read_json("./config.json")

con <- dbConnect(
  dbDriver("PostgreSQL"),
  dbname = cfg$db$database,
  host = cfg$db$host,
  port = cfg$db$port,
  user = cfg$db$user,
  password = cfg$db$password
)

df_v <- dbGetQuery(con, "
select
  *
  from videos
  where (start_timestamp::date >= '2018-04-27')
  and date_part('hour', start_timestamp at time zone 'US/Eastern') >= 7
  and date_part('hour', start_timestamp at time zone 'US/Eastern') < 19
  order by start_timestamp desc
")

df_v %>%
  mutate(
    days_ago = as.numeric(difftime(Sys.Date(), as.Date(start_timestamp), unit = "day"))
  ) %>%
  ggplot(aes(days_ago)) +
  geom_histogram(binwidth = 1, center = 0.5)


itexp <- function(u, m, t) { -log(1-u*(1-exp(-t*m)))/m }
rtexp <- function(n, m, t) { itexp(runif(n), m, t) }
texp <- rtexp(10000,1,pi)
hist(texp)
summary(texp)


m <- nrow(df_v)
n <- 1000
lambda <- 1 / 2000
r_u <- runif(n = n)
r_e <- round(-log(1 - r_u) / lambda)
r_et <- round(-log(1 - r_u * (1 - exp(- m * lambda))) / lambda)

hist(r_u)
hist(r_e)
hist(r_et)

summary(r_u)
summary(r_e)
summary(r_et)

sample_e <- sapply(r_e, function(x) {
  df_v[["id"]][min(nrow(df_v), round(x))]
}, simplify = TRUE) %>%
  unlist()
sample_et <- sapply(r_et, function(x) {
  df_v[["id"]][min(nrow(df_v), round(x))]
}, simplify = TRUE) %>%
  unlist()


data_frame(
  id = sample_e
) %>%
  left_join(df_v, by = "id") %>%
  mutate(
    days_ago = as.numeric(difftime(Sys.Date(), as.Date(start_timestamp), unit = "day"))
  ) %>%
  ggplot(aes(days_ago)) +
  geom_histogram(binwidth = 1, center = 0.5)

data_frame(
  id = sample_et
) %>%
  left_join(df_v, by = "id") %>%
  mutate(
    days_ago = as.numeric(difftime(Sys.Date(), as.Date(start_timestamp), unit = "day"))
  ) %>%
  ggplot(aes(days_ago)) +
  geom_histogram(binwidth = 1, center = 0.5)




# sql ---------------------------------------------------------------------

sql <- "
with v as (
  select
    *
    from videos
    where (start_timestamp::date >= '2018-04-27')
    and date_part('hour', start_timestamp at time zone 'US/Eastern') >= 7
    and date_part('hour', start_timestamp at time zone 'US/Eastern') < 19
    and location_id = 'UML'
    order by start_timestamp desc
)
select * from v offset random_exp(0.0005, (select count(*)::int from v)) limit 1
"


system.time({
  df_sim <- lapply(1:100, function (x) {
    df <- dbGetQuery(con, sql)
    df
  }) %>%
    bind_rows()
})

df_sim %>%
  mutate(
    days_ago = as.numeric(difftime(Sys.time(), start_timestamp, unit = "sec")) / 86400
  ) %>%
  ggplot(aes(days_ago)) +
  geom_histogram(binwidth = 1)
