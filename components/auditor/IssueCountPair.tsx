// Small "2 Critical  3 Warnings" text pair used in the Companies and
// Review Queue tables. Renders "Clear" in green when there are none.
export default function IssueCountPair({
  critical,
  warnings,
}: {
  critical: number;
  warnings: number;
}) {
  if (critical === 0 && warnings === 0) {
    return <span className="text-sm font-medium text-status-success">Clear</span>;
  }
  return (
    <span className="text-sm">
      {critical > 0 && (
        <span className="font-medium text-status-critical">{critical} Critical</span>
      )}
      {critical > 0 && warnings > 0 && <span className="text-gray-300"> · </span>}
      {warnings > 0 && (
        <span className="font-medium text-status-warning">{warnings} Warnings</span>
      )}
    </span>
  );
}
