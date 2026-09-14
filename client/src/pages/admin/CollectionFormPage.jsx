import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCollections } from '../../api/client';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function CollectionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', cover_image: '' });

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        const data = await apiCollections.list();
        const col = data.find((c) => c.id == id);
        if (col) setForm({ name: col.name, description: col.description || '', cover_image: col.cover_image || '' });
      } catch {}
      setLoading(false);
    }
    load();
  }, [id, isEdit]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Name is required');
    setSaving(true);
    try {
      if (isEdit) {
        await apiCollections.update(id, form);
      } else {
        await apiCollections.create(form);
      }
      navigate('/admin/collections');
    } catch (err) {
      alert(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <Stagger className="max-w-3xl">
      <Item as="h1" y={0} className="font-body text-2xl text-ink-100 mb-6">
        {isEdit ? 'Edit Collection' : 'New Collection'}
      </Item>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Item y={0}>
          <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Name *</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" required placeholder="e.g. On Love, Midnight Thoughts" />
        </Item>
        <Item y={0}>
          <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="textarea-field min-h-[120px]" placeholder="Brief description of this collection..." />
        </Item>
        <Item y={0} className="flex items-center gap-4 pt-4 border-t border-ink-800/30">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Collection' : 'Create Collection'}
          </button>
          <button type="button" onClick={() => navigate('/admin/collections')} className="btn-ghost">Cancel</button>
        </Item>
      </form>
    </Stagger>
  );
}
