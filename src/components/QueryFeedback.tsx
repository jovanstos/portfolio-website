import "../styles/Popup.css";
export default function QueryFeedback({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <p className="query-feedback" role="status">
        Loading…
      </p>
    );
  if (error)
    return (
      <div className="inline-error query-feedback" role="alert">
        <p>{error.message}</p>
        {onRetry && (
          <button className="secondary-button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  if (empty)
    return <p className="query-feedback">Nothing here yet. Come back later.</p>;
  return null;
}
