export function getTierFromScore(score) {
  if (score >= 800) return "Conqueror";
  if (score >= 500) return "Voyager";
  if (score >= 300) return "Explorer";
  if (score >= 100) return "Pathfinder";
  return "Beginner";
}
