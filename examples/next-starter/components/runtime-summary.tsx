type RuntimeSummaryProps = {
  mode: string;
  baseURL: string;
  model: string;
  userIdPresent: boolean;
};

export function RuntimeSummary({
  mode,
  baseURL,
  model,
  userIdPresent,
}: RuntimeSummaryProps) {
  return (
    <div className="summary-grid">
      <div className="summary-item">
        <span className="summary-label">Mode</span>
        <code>{mode}</code>
      </div>
      <div className="summary-item">
        <span className="summary-label">Model</span>
        <code className="summary-code-compact" title={model}>
          {model}
        </code>
      </div>
      <div className="summary-item summary-item-wide">
        <span className="summary-label">Base URL</span>
        <code>{baseURL}</code>
      </div>
      <div className="summary-item">
        <span className="summary-label">User ID</span>
        <code>{userIdPresent ? "set" : "not set"}</code>
      </div>
    </div>
  );
}
