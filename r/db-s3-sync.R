# compare db videos table to s3 objects
suppressWarnings(suppressMessages(library(dplyr)))
suppressWarnings(suppressMessages(library(tidyr)))
suppressWarnings(suppressMessages(library(jsonlite)))
suppressWarnings(suppressMessages(library(aws.s3)))
suppressWarnings(suppressMessages(library(tools)))
suppressWarnings(suppressMessages(library(stringr)))
suppressWarnings(suppressMessages(library(purrr)))

# load config -------------------------------------------------------------

cfg <- read_json("./config.local.json")

# load s3 -----------------------------------------------------------------

dirnames <- paste0(cfg$s3$path, c("TEST", "UML", "WIN"))

s3 <- get_bucket(
  bucket = cfg$s3$bucket,
  key = cfg$s3$accessKeyId,
  secret = cfg$s3$secretAccessKey,
  max = Inf
) %>%
  as_data_frame() %>%
  mutate(
    dirname = dirname(Key),
    filename = basename(Key),
    ext = file_ext(filename),
    rel_path = str_replace(Key, cfg$s3$path, ""),
    base_rel_path = map2_chr(rel_path, ext, function (x, y) {
      str_replace(x, paste0(".", y), "")
    })
  ) %>%
  filter(dirname %in% dirnames)

s3_mp4 <- s3 %>%
  filter(ext == "mp4")


# load db -----------------------------------------------------------------

pg <- src_postgres(
  dbname = cfg$db$database,
  host = cfg$db$host,
  port = cfg$db$port,
  user = cfg$db$user,
  password = cfg$db$password
)

db <- pg %>%
  tbl("videos") %>%
  collect()

if (nrow(db) > 0) {
  db <- db %>%
    mutate(
      rel_path = paste(location_id, filename, sep = "/")
    ) %>%
    select(id, created_at, url, url_webm, location_id, filename, rel_path)
} else {
  stop("Videos table is empty in database")
}



# compare -----------------------------------------------------------------

# files in database not in s3
missing_s3 <- db %>%
  filter(!(rel_path %in% s3_mp4$rel_path))

if (nrow(missing_s3) > 0) {
  cat("Missing", nrow(missing_s3), "file(s) in s3 found in database: ")
  cat(paste(missing_s3$rel_path, collapse = ", "))
  cat("\n\n")
}

# files in s3 not in database
missing_db <- s3_mp4 %>%
  filter(!(rel_path %in% db$rel_path))

if (nrow(missing_db) > 0) {
  cat("Missing", nrow(missing_db), "file(s) in database found in s3: ")
  cat(paste(missing_db$rel_path, collapse = ", "))
  cat("\n\n")
}

# mp4 files in s3 missing webm
missing_s3_webm <- s3 %>%
  select(base_rel_path, ext, filename) %>%
  spread(ext, filename) %>%
  filter(is.na(webm))

if (nrow(missing_s3_webm) > 0) {
  cat("Missing", nrow(missing_s3_webm), "WebM file(s) in s3: ")
  cat(paste(missing_s3_webm$base_rel_path, collapse = ", "))
  cat("\n\n")
}

# files in db missing webm
missing_db_webm <- db %>%
  filter(is.na(url_webm))

if (nrow(missing_db_webm) > 0) {
  cat("Missing", nrow(missing_db_webm), "WebM URL(s) in db: ")
  cat(paste(missing_db_webm$rel_path, collapse = ", "))
  cat("\n\n")
}