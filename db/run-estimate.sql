-- estimate run size by period, date, season

WITH v AS (
  SELECT
    id,
    start_timestamp,
    duration,
    date_part('hour', start_timestamp AT TIME ZONE 'US/Eastern') AS start_hour,
    date_part('hour', end_timestamp AT TIME ZONE 'US/Eastern') AS end_hour,
    date_part('minute', end_timestamp AT TIME ZONE 'US/Eastern') AS end_minute
  FROM videos
  WHERE NOT flagged
  AND location_id='UML'
  AND start_timestamp::date >= '2017-04-13'
  AND start_timestamp::date <= '2017-06-27'
  AND date_part('hour', start_timestamp AT TIME ZONE 'US/Eastern') >= 7
  AND date_part('hour', start_timestamp AT TIME ZONE 'US/Eastern') < 19
),
c AS (
  SELECT video_id, count(*) as n_count, avg(count) as mean_count
  FROM counts
  WHERE NOT FLAGGED
  GROUP BY video_id
),
vpd1 AS (
  SELECT 
    v.id,
    v.start_timestamp AT TIME ZONE 'US/Eastern' as start_timestamp,
    (v.start_timestamp AT TIME ZONE 'US/Eastern')::date AS date,
    v.duration,
    CASE
      WHEN start_hour >= 7  AND start_hour < 11 THEN 1
      WHEN start_hour >= 11 AND start_hour < 15 THEN 2
      WHEN start_hour >= 15 AND start_hour < 19 THEN 3
      ELSE NULL
    END AS period,
    COALESCE(c.n_count, 0) as n_count,
    c.mean_count as mean_count
  FROM v
  LEFT JOIN c ON v.id=c.video_id
  WHERE NOT (v.end_hour != v.start_hour AND v.end_hour IN (7, 11, 15, 19) AND v.end_minute > 0)
  ORDER BY v.start_timestamp
),
pd_r AS (
  SELECT
    date,
    period,
    sum(mean_count) / sum(duration * (n_count > 0)::int) AS r
  FROM vpd1
  GROUP BY date, period
),
vpd2 AS (
  SELECT
    vpd1.*,
    pd_r.r
  FROM vpd1
  LEFT JOIN pd_r ON vpd1.date=pd_r.date AND vpd1.period=pd_r.period
),
pd1 AS (
  SELECT
    date,
    period,
    count(*) AS n,
    sum((n_count > 0)::int) AS n_count,
    sum(duration) AS t,
    sum(mean_count) AS sum_y,
    sum(duration * (n_count > 0)::int) AS sum_t,
    CASE
      WHEN sum((n_count > 0)::int) > 0 THEN sum(duration * (n_count > 0)::int) / sum((n_count > 0)::int)
      ELSE 0
    END AS mean_t,
    CASE
      WHEN sum(duration * (n_count > 0)::int) > 0 THEN sum(mean_count) / sum(duration * (n_count > 0)::int)
      ELSE 0
    END AS r,
    CASE 
      WHEN sum(duration * (n_count > 0)::int) > 0 THEN sum(mean_count) / sum(duration * (n_count > 0)::int) * sum(duration)
      ELSE 0
    END AS y,
    CASE
      WHEN (sum((n_count > 0)::int) - 1) > 0 THEN sum((mean_count - r * duration) ^ 2) / (sum((n_count > 0)::int) - 1)
      ELSE 0
    END AS se2
  FROM vpd2
  GROUP BY date, period
),
pd2 AS (
  SELECT
    pd1.*,
    CASE
     WHEN (pd1.n * pd1.n_count) > 0 THEN (pd1.t / pd1.mean_t) ^ 2 * (pd1.n - pd1.n_count) / (pd1.n * pd1.n_count) * pd1.se2
     ELSE 0
    END AS var_y,
    pd1.n_count - 1 AS df,
    CASE
      WHEN pd1.n_count > 0 THEN pd1.n * (pd1.n - pd1.n_count)::real / pd1.n_count
      ELSE 0
    END AS a
  FROM pd1
),
d1 AS (
  SELECT
    date,
    sum(n) AS n,
    sum(n_count) AS n_count,
    sum(t) AS t,
    sum(sum_y) AS sum_y,
    sum(sum_t) AS sum_t,
    sum(y) AS y,
    sum(var_y) AS var_y,
    sum(a * se2) AS df_num,
    sum(CASE WHEN n_count > 1 THEN (a * se2) ^ 2 / (n_count - 1) ELSE 0 END) AS df_den
  FROM pd2
  GROUP BY date
),
d2 AS (
  SELECT
    d1.*,
    sqrt(var_y) AS se_y,
    ROUND(CASE WHEN df_den > 0 THEN df_num ^ 2 / df_den ELSE 0 END) AS df
  FROM d1
),
r1 AS (
  SELECT
    sum(n) AS n,
    sum(n_count) AS n_count,
    sum(t) AS t,
    sum(sum_y) AS sum_y,
    sum(sum_t) AS sum_t,
    sum(y) AS y,
    sum(var_y) AS var_y,
    ROUND(sum(df_num) ^ 2 / sum(df_den)) AS df
  FROM d2
),
r2 AS (
  SELECT
    r1.*,
    sqrt(var_y) AS se_y    
  FROM r1
)
SELECT *
FROM r2;
