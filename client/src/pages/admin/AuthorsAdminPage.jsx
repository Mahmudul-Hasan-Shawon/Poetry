import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiAuthors } from '../../api/client';
import { Stagger, Item } from '../../components/ui/motion.jsx';
import { languageLabel } from '../../utils/helpers';

export default function AuthorsAdminPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await apiAuthors.list();
      setAuthors(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete author "${name}"? Their writings will not be deleted.`)) return;
    try {
      await apiAuthors.delete(id);
      load();
    } catch {}
  };

  if (loading) return null;

  return (
    <Stagger>
      <Item y={0} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-body text-2xl text-ink-100">Authors</h1>
          <p className="font-body text-sm text-ink-500 mt-1">{authors.length} authors</p>
        </div>
        <Link to="/admin/authors/new" className="btn-primary text-xs">+ New Author</Link>
      </Item>

      <div data-lenis-prevent className="overflow-auto max-h-[calc(100vh-15rem)] border border-ink-800/30">
        <Stagger delay={0.1}>
          <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Country</th>
              <th>Language</th>
              <th>Writings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <Item as="tr" key={author.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-body text-sm text-gold-400">{author.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-ink-100">{author.name}</p>
                      {author.birth_date && (
                        <p className="text-xs text-ink-500">{author.birth_date}{author.death_date ? ` — ${author.death_date}` : ''}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-ink-400">{author.country || '—'}</td>
                <td className="text-ink-400">{languageLabel(author.primary_language)}</td>
                <td className="text-ink-400">{author.writing_count}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <Link to={`/admin/authors/${author.id}/edit`} className="text-ink-400 hover:text-gold-400 text-xs transition-colors">Edit</Link>
                    <Link to={`/authors/${author.slug}`} target="_blank" className="text-ink-400 hover:text-gold-400 text-xs transition-colors">View</Link>
                    <button onClick={() => handleDelete(author.id, author.name)} className="text-ink-400 hover:text-red-400 text-xs transition-colors">Delete</button>
                  </div>
                </td>
              </Item>
            ))}
          </tbody>
        </table>
        </Stagger>
      </div>
    </Stagger>
  );
}
