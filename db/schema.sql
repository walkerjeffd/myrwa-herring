CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE
);

CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  location_description TEXT
);

CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  url TEXT,
  url_webm TEXT,
  filename TEXT,
  duration REAL,
  filesize REAL,
  start_timestamp TIMESTAMP WITH TIME ZONE,
  end_timestamp TIMESTAMP WITH TIME ZONE,
  location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
  flagged BOOLEAN DEFAULT FALSE,
  mp4_converted BOOLEAN
);

CREATE TABLE counts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  session TEXT,
  count INT,
  comment TEXT,
  flagged BOOLEAN DEFAULT FALSE,
  users_uid TEXT REFERENCES users(uid) ON DELETE SET NULL
);

CREATE TABLE sensor (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE,
  temperature_degc REAL,
  specificconductance_us_cm REAL,
  depth_m REAL,
  battery_v REAL,
  turbidity_ntu REAL,
  nh3_ammonia_mg_l REAL,
  chlorophyll_ug_l REAL,
  chlorophyll_rfu REAL,
  odo_pcsat REAL,
  odo_mg_l REAL,
  bga_pc_ug_l REAL
);
