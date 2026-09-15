// The original backend had a utils/privacy.js with this exact canSee()
// logic, but it was never imported into profileController.js — getUserProfile
// just returned every field unconditionally. This version is actually wired
// up to GET /api/users/[id] below, and does it in one query instead of three.
export function canSee(privacy, isContact) {
  if (privacy === "everyone") return true;
  if (privacy === "nobody") return false;
  if (privacy === "contacts") return isContact;
  return false;
}
