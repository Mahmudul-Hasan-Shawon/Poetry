import { Link, useSearchParams } from 'react-router-dom';

export default function Pagination({ pagination }) {
  const [searchParams] = useSearchParams();
  const { page, pages, total } = pagination;

  if (pages <= 1) return null;

  function buildUrl(p) {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    return `?${params.toString()}`;
  }

  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(pages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {page > 1 && (
        <Link
          to={buildUrl(page - 1)}
          className="px-3 py-2 font-body text-sm text-ink-400 hover:text-gold-400 transition-colors"
        >
          Previous
        </Link>
      )}

      {start > 1 && (
        <>
          <Link to={buildUrl(1)} className="w-9 h-9 flex items-center justify-center font-body text-sm text-ink-400 hover:text-gold-400 transition-colors rounded-sm hover:bg-ink-800/50">1</Link>
          {start > 2 && <span className="text-ink-600">...</span>}
        </>
      )}

      {pageNumbers.map((p) => (
        <Link
          key={p}
          to={buildUrl(p)}
          className={`w-9 h-9 flex items-center justify-center font-body text-sm rounded-sm transition-all ${
            p === page
              ? 'bg-gold-500 text-ink-950 font-medium'
              : 'text-ink-400 hover:text-gold-400 hover:bg-ink-800/50'
          }`}
        >
          {p}
        </Link>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="text-ink-600">...</span>}
          <Link to={buildUrl(pages)} className="w-9 h-9 flex items-center justify-center font-body text-sm text-ink-400 hover:text-gold-400 transition-colors rounded-sm hover:bg-ink-800/50">{pages}</Link>
        </>
      )}

      {page < pages && (
        <Link
          to={buildUrl(page + 1)}
          className="px-3 py-2 font-body text-sm text-ink-400 hover:text-gold-400 transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  );
}
