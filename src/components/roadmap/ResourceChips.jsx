function openUrl(url) {
  const safeUrl = url?.startsWith('http') ? url : `https://${url}`;
  window.open(safeUrl, '_blank', 'noopener,noreferrer');
}

export default function ResourceChips({ resources = [], youtubeSearchQueries = [] }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="mb-3 font-heading text-sm font-bold text-cyan">📚 Resources</h4>
        <div className="flex flex-wrap gap-2">
          {resources.length ? (
            resources.map((resource) => (
              <button
                type="button"
                key={`${resource.name}-${resource.url}`}
                onClick={() => openUrl(resource.url)}
                className="rounded-full border border-[rgba(0,212,255,0.2)] px-3 py-2 text-xs font-bold text-textPrimary transition hover:border-cyan hover:text-cyan hover:shadow-glow"
              >
                {resource.name}
              </button>
            ))
          ) : (
            <span className="text-sm text-textMuted">No resources listed yet.</span>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-heading text-sm font-bold text-danger">▶️ YouTube</h4>
        <div className="flex flex-wrap gap-2">
          {youtubeSearchQueries.length ? (
            youtubeSearchQueries.map((query) => (
              <button
                type="button"
                key={query}
                onClick={() =>
                  openUrl(
                    `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
                  )
                }
                className="rounded-full border border-[rgba(255,68,68,0.35)] px-3 py-2 text-xs font-bold text-textPrimary transition hover:border-danger hover:text-danger"
              >
                {query}
              </button>
            ))
          ) : (
            <span className="text-sm text-textMuted">No video searches listed yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
