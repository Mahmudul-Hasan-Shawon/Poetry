import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCollections } from '../../api/client';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function CollectionsAdminPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await apiCollections.list();
      setCollections(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await apiCollections.delete(id);
      load();
    } catch {}
  };

  if (loading) return null;

  return (
    <Stagger>
      <Item y={0} className="flex items-center justify-between mb-6">
        <h1 className="font-body text-2xl text-ink-100">Collections</h1>
        <Link to="/admin/collections/new" className="btn-primary text-xs">+ New Collection</Link>
      </Item>

      <div data-lenis-prevent className="space-y-3 overflow-auto max-h-[calc(100vh-15rem)] pr-1">
        {collections.map((col) => (
          <Item key={col.id} className="flex items-center justify-between p-4 bg-ink-900/30 border border-ink-800/30 rounded-sm">
            <div>
              <h3 className="font-body text-lg text-ink-100">{col.name}</h3>
              {col.description && <p className="font-body text-xs text-ink-400 mt-1 line-clamp-2">{col.description}</p>}
              <p className="font-body text-xs text-ink-500 mt-1">{col.writing_count} writings</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/admin/collections/${col.id}/edit`} className="text-ink-400 hover:text-gold-400 text-xs transition-colors">Edit</Link>
              <Link to={`/collections/${col.slug}`} target="_blank" className="text-ink-400 hover:text-gold-400 text-xs transition-colors">View</Link>
              <button onClick={() => handleDelete(col.id)} className="text-ink-400 hover:text-red-400 text-xs transition-colors">Delete</button>
            </div>
          </Item>
        ))}
      </div>
    </Stagger>
  );
}
