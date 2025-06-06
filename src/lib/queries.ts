export const GET_USER_VENUE_BENEFITS_QUERY = `
  SELECT
    b.id,
    b.name,
    EXISTS (
      SELECT 1 FROM user_benefits ub
      WHERE ub.benefit_id = b.id AND ub.user_id = $1
    ) AS used
  FROM benefits b
  WHERE b.venue_id = $2
  ORDER BY b.name;
`;