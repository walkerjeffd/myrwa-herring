-- create new user manually in psql
-- CREATE ROLE myrwa_www WITH LOGIN PASSWORD ''

GRANT CONNECT ON DATABASE herring TO myrwa_www;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO myrwa_www;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO myrwa_www;
GRANT SELECT,INSERT ON TABLE counts TO myrwa_www;
GRANT SELECT,INSERT ON TABLE videos TO myrwa_www;
