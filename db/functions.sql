-- random row using truncated exponential distribution
CREATE OR REPLACE FUNCTION random_exp(lambda REAL, hi INT) RETURNS integer AS $$
  BEGIN
    RETURN round(- ln(1 - random() * (1 - exp(- hi * lambda))) / lambda);
  END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO myrwa_www;
