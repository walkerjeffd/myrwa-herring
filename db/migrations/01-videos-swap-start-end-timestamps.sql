-- fix start/end timestamps to be in UTC and use filename as end timestamp
-- end_timestamp = start_timestamp + 4 hours - 2 seconds
-- start_timestamp = end_timestamp - duration

UPDATE videos SET end_timestamp = start_timestamp + interval '4 hours' - interval '2 seconds';
UPDATE videos SET start_timestamp = end_timestamp - interval '1 second' * round(duration);
