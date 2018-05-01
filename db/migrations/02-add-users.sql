-- add users table, and users_uid column to counts

CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE
);

ALTER TABLE counts ADD COLUMN users_uid TEXT REFERENCES users(uid) ON DELETE SET NULL;
