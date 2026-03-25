export function isValidAdminToken(token: string | null) {
  const expected = process.env.ADMIN_TOKEN || "change-me";
  return Boolean(expected && token && token === expected);
}
