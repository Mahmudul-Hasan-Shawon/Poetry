import { useState, useEffect } from 'react';
import { apiCategories } from '../../api/client';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const load = async () => {
    try {
      const data = await apiCategories.list();
      setCategories(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await apiCategories.create({ name: newName.trim() });
      setNewName('');
      load();
    } catch (err) {
      alert(err.message || 'Failed to create');
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await apiCategories.update(id, { name: editName.trim() });
      setEditId(null);
      setEditName('');
      load();
    } catch (err) {
      alert(err.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await apiCategories.delete(id);
      load();
    } catch {}
  };

  if (loading) return null;

  return (
    <Stagger className="max-w-3xl">
      <Item as="h1" y={0} className="font-body text-2xl text-ink-100 mb-6">Categories</Item>

      <Item y={0}>
        <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary text-xs whitespace-nowrap">Add Category</button>
        </form>
      </Item>

      <div className="space-y-2 overflow-auto max-h-[calc(100vh-15rem)] pr-1">
        {categories.map((cat) => (
          <Item key={cat.id} className="flex items-center justify-between p-4 bg-ink-900/30 border border-ink-800/30 rounded-sm">
            {editId === cat.id ? (
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field flex-1"
                  autoFocus
                />
                <button onClick={() => handleUpdate(cat.id)} className="btn-primary text-xs">Save</button>
                <button onClick={() => setEditId(null)} className="btn-ghost text-xs">Cancel</button>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-body text-sm text-ink-100">{cat.name}</span>
                  <span className="font-body text-xs text-ink-500 ml-3">{cat.writing_count} writings</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                    className="text-ink-400 hover:text-gold-400 text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-ink-400 hover:text-red-400 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </Item>
        ))}
      </div>
    </Stagger>
  );
}
