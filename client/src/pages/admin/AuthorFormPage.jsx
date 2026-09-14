import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiAuthors } from '../../api/client';
import { LANGUAGES } from '../../utils/helpers';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function AuthorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    short_bio: '',
    full_bio: '',
    portrait: '',
    birth_date: '',
    death_date: '',
    country: '',
    primary_language: '',
    other_languages: '',
    tags: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        const data = await apiAuthors.list();
        const author = data.find((a) => a.id == id);
        if (author) {
          setForm({
            name: author.name || '',
            short_bio: author.short_bio || '',
            full_bio: author.full_bio || '',
            portrait: author.portrait || '',
            birth_date: author.birth_date || '',
            death_date: author.death_date || '',
            country: author.country || '',
            primary_language: author.primary_language || '',
            other_languages: author.other_languages || '',
            tags: author.tags || '',
          });
        }
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
        await apiAuthors.update(id, form);
      } else {
        await apiAuthors.create(form);
      }
      navigate('/admin/authors');
    } catch (err) {
      alert(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <Stagger className="max-w-3xl">
      <Item as="h1" y={0} className="font-body text-2xl text-ink-100 mb-6">
        {isEdit ? 'Edit Author' : 'New Author'}
      </Item>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Item y={0}>
          <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Name *</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" required />
        </Item>

        <Item y={0}>
          <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Short Bio</label>
          <textarea value={form.short_bio} onChange={(e) => update('short_bio', e.target.value)} className="textarea-field min-h-[100px]" placeholder="A brief description of the author..." />
        </Item>

        <Item y={0}>
          <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Full Biography</label>
          <textarea value={form.full_bio} onChange={(e) => update('full_bio', e.target.value)} className="textarea-field min-h-[200px]" placeholder="Detailed biography..." />
        </Item>

        <Item y={0} className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Birth Date</label>
            <input type="text" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} className="input-field" placeholder="e.g. 1207 or 1861-05-07" />
          </div>
          <div>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Death Date</label>
            <input type="text" value={form.death_date} onChange={(e) => update('death_date', e.target.value)} className="input-field" placeholder="e.g. 1273 or 1941-08-07" />
          </div>
        </Item>

        <Item y={0} className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Country / Region</label>
            <input type="text" value={form.country} onChange={(e) => update('country', e.target.value)} className="input-field" placeholder="e.g. Persia, India, Chile" />
          </div>
          <div>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Primary Language</label>
            <select value={form.primary_language} onChange={(e) => update('primary_language', e.target.value)} className="select-field">
              <option value="">Select Language</option>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </Item>

        <Item y={0}>
          <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Other Languages</label>
          <input type="text" value={form.other_languages} onChange={(e) => update('other_languages', e.target.value)} className="input-field" placeholder="Comma-separated languages" />
        </Item>

        <Item y={0}>
          <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Tags</label>
          <input type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)} className="input-field" placeholder="Comma-separated tags" />
        </Item>

        <Item y={0} className="flex items-center gap-4 pt-4 border-t border-ink-800/30">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Author' : 'Create Author'}
          </button>
          <button type="button" onClick={() => navigate('/admin/authors')} className="btn-ghost">Cancel</button>
        </Item>
      </form>
    </Stagger>
  );
}
