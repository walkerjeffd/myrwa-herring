CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  location_description TEXT
);

CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  url TEXT,
  filename TEXT,
  duration REAL,
  filesize REAL,
  start_timestamp TIMESTAMP WITH TIME ZONE,
  end_timestamp TIMESTAMP WITH TIME ZONE,
  location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
  flagged BOOLEAN DEFAULT FALSE
);

CREATE TABLE counts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  session TEXT,
  count INT,
  comment TEXT,
  flagged BOOLEAN DEFAULT FALSE
);
