CREATE OR REPLACE FUNCTION increment_loyalty_points(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET loyalty_points = COALESCE(loyalty_points, 0) + p_points,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
