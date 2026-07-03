/**
 * Compute the relative savings of a package vs. the Mini baseline.
 * Returns a Chilean user-facing string (e.g. "25% más barato") or null when
 * there is no savings (i.e. the package is the baseline).
 *
 * @param {{ unitPriceCLP: number }} pkg
 * @param {{ unitPriceCLP: number }} baselineMini
 * @returns {string | null}
 */
export function computeSavingsVsMini(pkg, baselineMini) {
  if (!pkg || !baselineMini || baselineMini.unitPriceCLP <= 0) {
    return null;
  }

  if (pkg.unitPriceCLP >= baselineMini.unitPriceCLP) {
    return null;
  }

  const savings = (baselineMini.unitPriceCLP - pkg.unitPriceCLP) / baselineMini.unitPriceCLP;
  const percentage = Math.round(savings * 100);

  return `${percentage}% más barato`;
}
