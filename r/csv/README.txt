# Mystic River Herring Dataset

## Tables

videos: each row contains the metadata for a single video
  id: unique ID for each video
  created_at: date/time when video was uploaded
  url: URL to video file
  filename: name of video file
  duration: length of video (seconds)
  filesize: size of video file (bytes)
  start_timestamp: date/time at start of video
  end_timestamp: date/time at end of video
  flagged: true/false indicating if video should be excluded from website and analyses (e.g., test videos)
counts: each row contains a single video count
  id: unique ID for each count
  created_at: date/time count was submitted by user
  video_id: ID of video that was counted (foreign key to video.id)
  session: unique ID of count session (if a user counts multiple videos in a row, all of those counts will have the same session ID)
  count: number of fish counted by user
  comment: comment submitted by user
  flagged: true/false indicating if count should be excluded from analysis (e.g., exceeded maximum allowable value, identified as data vandal, or user did not watch entire video)
  users_uid: unique user ID (foreign key to users.uid), or blank of user was not logged in or did not have an account
users: each row contains a single user
  uid: unique ID for user
  username: username of user
  created_at: date/time user account was created
  disabled: true/false indicating if user was banned/disabled (e.g., data vandal)

## Relationships

videos.id -> counts.video_id (1 to many)
users.uid -> counts.users_uid (1 to many)

