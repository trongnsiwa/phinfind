/**
 * Unit tests for pure badge calculation logic (FEAT-05).
 * Note: Test runner configuration is tracked in roadmap item TD-08.
 */
import {
  computeTier,
  computeCategoryBadges,
  computeTotalContributions,
  TIER_THRESHOLDS,
  CATEGORY_THRESHOLDS,
} from './badges';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runBadgeTests() {
  // 1. Contribution weighting calculation
  const points = computeTotalContributions({ reviews: 2, visits: 3, favorites: 5 });
  assert(points === 2 * 3 + 3 * 1 + 5 * 1, 'computeTotalContributions weights reviews as 3, visits as 1, favorites as 1');

  // 2. Boundary: 0 points (tier: dong, next: bac, progress: 0%, remaining: 10)
  const tier0 = computeTier(0);
  assert(tier0.tier === 'dong', '0 points should be dong');
  assert(tier0.nextTier === 'bac', 'Next tier should be bac');
  assert(tier0.nextThreshold === 10, 'Next threshold should be 10');
  assert(tier0.progressPercent === 0, 'Progress should be 0%');
  assert(tier0.remaining === 10, 'Remaining points should be 10');

  // 3. Boundary: 9 points (tier: dong, next: bac, progress: 90%, remaining: 1)
  const tier9 = computeTier(9);
  assert(tier9.tier === 'dong', '9 points should still be dong');
  assert(tier9.progressPercent === 90, 'Progress should be 90%');
  assert(tier9.remaining === 1, 'Remaining should be 1');

  // 4. Boundary: 10 points (tier: bac, next: vang, progress: 0%, remaining: 40)
  const tier10 = computeTier(10);
  assert(tier10.tier === 'bac', '10 points should advance to bac');
  assert(tier10.nextTier === 'vang', 'Next tier should be vang');
  assert(tier10.nextThreshold === 50, 'Next threshold should be 50');
  assert(tier10.progressPercent === 0, 'Progress should be 0%');
  assert(tier10.remaining === 40, 'Remaining should be 40');

  // 5. Boundary: 49 points (tier: bac, remaining: 1, progress: 98%)
  const tier49 = computeTier(49);
  assert(tier49.tier === 'bac', '49 points should still be bac');
  assert(tier49.remaining === 1, 'Remaining should be 1 point to vang');

  // 6. Boundary: 50 points (tier: vang, next: kim-cuong, progress: 0%, remaining: 150)
  const tier50 = computeTier(50);
  assert(tier50.tier === 'vang', '50 points should advance to vang');
  assert(tier50.nextTier === 'kim-cuong', 'Next tier should be kim-cuong');
  assert(tier50.nextThreshold === 200, 'Next threshold should be 200');
  assert(tier50.remaining === 150, 'Remaining should be 150');

  // 7. Boundary: 199 points (tier: vang, remaining: 1)
  const tier199 = computeTier(199);
  assert(tier199.tier === 'vang', '199 points should still be vang');
  assert(tier199.remaining === 1, 'Remaining should be 1 point to kim-cuong');

  // 8. Boundary: 200 points (tier: kim-cuong, nextTier: null, progress: 100%, remaining: 0)
  const tier200 = computeTier(200);
  assert(tier200.tier === 'kim-cuong', '200 points should advance to kim-cuong');
  assert(tier200.nextTier === null, 'Top tier should have no nextTier');
  assert(tier200.nextThreshold === null, 'Top tier should have no nextThreshold');
  assert(tier200.progressPercent === 100, 'Top tier should be 100% progress');
  assert(tier200.remaining === 0, 'Top tier should have 0 remaining');

  // 9. Category badges with 0 count return 'dong'
  const zeroCats = computeCategoryBadges({ reviews: 0, visits: 0, favorites: 0 });
  assert(zeroCats.length === 3, 'Should return 3 categories');
  assert(zeroCats.every((c) => c.tier === 'dong'), 'All 0 counts should be dong');

  // 10. Category badges thresholds
  const catTests = computeCategoryBadges({
    reviews: CATEGORY_THRESHOLDS.reviewer.vang,
    visits: CATEGORY_THRESHOLDS.explorer.kimCuong,
    favorites: CATEGORY_THRESHOLDS.curator.bac,
  });
  const reviewer = catTests.find((c) => c.id === 'reviewer');
  const explorer = catTests.find((c) => c.id === 'explorer');
  const curator = catTests.find((c) => c.id === 'curator');

  assert(reviewer?.tier === 'vang', 'Reviewer should be vang');
  assert(explorer?.tier === 'kim-cuong', 'Explorer should be kim-cuong');
  assert(curator?.tier === 'bac', 'Curator should be bac');

  // 11. Deterministic idempotence
  assert(JSON.stringify(computeTier(35)) === JSON.stringify(computeTier(35)), 'computeTier must be deterministic');
}

// Execute tests if run directly in Node
if (typeof process !== 'undefined' && process.argv[1]?.includes('badges.test')) {
  try {
    runBadgeTests();
    console.log('All badge unit tests passed successfully!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
