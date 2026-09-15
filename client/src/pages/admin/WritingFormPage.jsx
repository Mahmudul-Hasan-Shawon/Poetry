import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiWritings, apiAuthors, apiCategories, apiCollections } from '../../api/client';
import { WRITING_TYPES, LANGUAGES, STATUSES, VERIFICATION_STATUSES, friendlyDate, toInputDate } from '../../utils/helpers';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function WritingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    author_id: '',
    title: '',
    text: '',
    original_text: '',
    english_translation: '',
    bangla_translation: '',
    urdu_translation: '',
    type: 'quote',
    language: 'english',
    direction: 'ltr',
    source: '',
    source_url: '',
    translator: '',
    source_book: '',
    source_chapter: '',
    source_page: '',
    source_notes: '',
    date: '',
    status: 'draft',
    featured: false,
    editors_pick: false,
    verification_status: 'attributed',
    category_ids: [],
    collection_ids: [],
  });

  useEffect(() => {
    async function load() {
      try {
        const [a, c, col] = await Promise.all([
          apiAuthors.list(),
          apiCategories.list(),
          apiCollections.list(),
        ]);
        setAuthors(a);
        setCategories(c);
        setCollectionsList(col);

        if (isEdit) {
          const writing = await apiWritings.get(id);
          setForm({
            author_id: writing.author_id || '',
            title: writing.title || '',
            text: writing.text || '',
            original_text: writing.original_text || '',
            english_translation: writing.english_translation || '',
            bangla_translation: writing.bangla_translation || '',
            urdu_translation: writing.urdu_translation || '',
            type: writing.type || 'quote',
            language: writing.language || 'english',
            direction: writing.direction || 'ltr',
            source: writing.source || '',
            source_url: writing.source_url || '',
            translator: writing.translator || '',
            source_book: writing.source_book || '',
            source_chapter: writing.source_chapter || '',
            source_page: writing.source_page || '',
            source_notes: writing.source_notes || '',
            date: writing.date || '',
            status: writing.status || 'draft',
            featured: writing.featured === 1,
            editors_pick: writing.editors_pick === 1,
            verification_status: writing.verification_status || 'attributed',
            category_ids: writing.categories?.map((c) => c.id) || [],
            collection_ids: [],
          });
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [id, isEdit]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCategory = (catId) => {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter((id) => id !== catId)
        : [...prev.category_ids, catId],
    }));
  };

  const toggleCollection = (colId) => {
    setForm((prev) => ({
      ...prev,
      collection_ids: prev.collection_ids.includes(colId)
        ? prev.collection_ids.filter((id) => id !== colId)
        : [...prev.collection_ids, colId],
    }));
  };

  const handleAddAuthor = async () => {
    if (!newAuthorName.trim()) return;
    try {
      const author = await apiAuthors.create({ name: newAuthorName.trim() });
      setAuthors((prev) => [...prev, author]);
      update('author_id', author.id);
      setNewAuthorName('');
      setShowNewAuthor(false);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return alert('Writing text is required');
    setSaving(true);
    try {
      if (isEdit) {
        await apiWritings.update(id, form);
      } else {
        await apiWritings.create(form);
      }
      navigate('/admin/writings');
    } catch (err) {
      alert(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <Stagger className="max-w-4xl">
      <Item y={0} className="flex items-center justify-between mb-6">
        <h1 className="font-body text-2xl text-ink-100">
          {isEdit ? 'Edit Writing' : 'New Writing'}
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setPreview(!preview)} className="btn-ghost text-xs">
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={() => navigate('/admin/writings')} className="btn-ghost text-xs">Cancel</button>
        </div>
      </Item>

      {preview ? (
        <Item className="p-12 bg-ink-900/30 border border-ink-800/30 rounded-sm">
          {form.title && <h2 className="font-display text-2xl text-ink-100 mb-6 text-center">{form.title}</h2>}
          <blockquote className={`text-center mb-8 ${form.direction === 'rtl' ? 'writing-rtl' : ''}`}>
            <p className={`${form.language === 'bangla' ? 'font-bangla' : 'font-display'} text-2xl md:text-3xl leading-relaxed text-ink-100 whitespace-pre-line`}>
              {form.text || 'No text entered'}
            </p>
          </blockquote>
          {form.author_id && (
            <p className="text-center font-body text-gold-400">
              {authors.find((a) => a.id == form.author_id)?.name || ''}
            </p>
          )}
          {form.date && (
            <p className="text-center font-body text-xs text-ink-500 mt-2">{form.date}</p>
          )}
        </Item>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Author */}
          <Item y={0}>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Author</label>
            <div className="flex gap-3">
              <select value={form.author_id} onChange={(e) => update('author_id', e.target.value)} className="select-field flex-1">
                <option value="">Select Author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowNewAuthor(!showNewAuthor)} className="btn-secondary text-xs whitespace-nowrap">
                + New Author
              </button>
            </div>
            {showNewAuthor && (
              <div className="flex gap-3 mt-3">
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="Author name"
                  className="input-field flex-1"
                />
                <button type="button" onClick={handleAddAuthor} className="btn-primary text-xs">Add</button>
              </div>
            )}
          </Item>

          {/* Title */}
          <Item y={0}>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Title (Optional)</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="Writing title" />
          </Item>

          {/* Date */}
          <Item y={0}>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Date (Optional)</label>
            <input
              type="date"
              value={toInputDate(form.date)}
              onChange={(e) => update('date', e.target.value ? friendlyDate(e.target.value) : '')}
              className="input-field max-w-xs"
            />
          </Item>

          {/* Main Text */}
          <Item y={0}>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Writing *</label>
            <textarea
              value={form.text}
              onChange={(e) => update('text', e.target.value)}
              className={`textarea-field min-h-[250px] text-lg leading-relaxed ${form.language === 'bangla' ? 'font-bangla' : 'font-display'}`}
              placeholder="Enter the writing text here... Preserve line breaks for poetry."
              required
            />
            <p className="font-body text-xs text-ink-600 mt-1">Preserve line breaks exactly as you want them to appear.</p>
          </Item>

          {/* Translations */}
          <Item y={0} className="border border-ink-800/30 rounded-sm p-4 space-y-4">
            <h3 className="font-body text-xs text-ink-400 uppercase tracking-wider">Translations (Optional)</h3>
            <div>
              <label className="font-body text-xs text-ink-500 mb-1 block">Original Text (if different)</label>
              <textarea value={form.original_text} onChange={(e) => update('original_text', e.target.value)} className="textarea-field min-h-[120px]" placeholder="Original language text" />
            </div>
            <div>
              <label className="font-body text-xs text-ink-500 mb-1 block">English Translation</label>
              <textarea value={form.english_translation} onChange={(e) => update('english_translation', e.target.value)} className="textarea-field min-h-[120px]" placeholder="English translation" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Bangla Translation</label>
                <textarea value={form.bangla_translation} onChange={(e) => update('bangla_translation', e.target.value)} className="textarea-field min-h-[100px]" />
              </div>
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Urdu Translation</label>
                <textarea value={form.urdu_translation} onChange={(e) => update('urdu_translation', e.target.value)} className="textarea-field min-h-[100px]" />
              </div>
            </div>
          </Item>

          {/* Metadata row */}
          <Item y={0} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className="select-field">
                {WRITING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Language</label>
              <select value={form.language} onChange={(e) => update('language', e.target.value)} className="select-field">
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Direction</label>
              <select value={form.direction} onChange={(e) => update('direction', e.target.value)} className="select-field">
                <option value="ltr">Left to Right</option>
                <option value="rtl">Right to Left</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-2 block">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="select-field">
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </Item>

          {/* Source info */}
          <Item y={0} className="border border-ink-800/30 rounded-sm p-4 space-y-4">
            <h3 className="font-body text-xs text-ink-400 uppercase tracking-wider">Source / Attribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Source / Work Name</label>
                <input type="text" value={form.source} onChange={(e) => update('source', e.target.value)} className="input-field" placeholder="e.g. The Essential Rumi" />
              </div>
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Translator</label>
                <input type="text" value={form.translator} onChange={(e) => update('translator', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Book</label>
                <input type="text" value={form.source_book} onChange={(e) => update('source_book', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Source URL</label>
                <input type="url" value={form.source_url} onChange={(e) => update('source_url', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Chapter</label>
                <input type="text" value={form.source_chapter} onChange={(e) => update('source_chapter', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="font-body text-xs text-ink-500 mb-1 block">Page</label>
                <input type="text" value={form.source_page} onChange={(e) => update('source_page', e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="font-body text-xs text-ink-500 mb-1 block">Verification Status</label>
              <select value={form.verification_status} onChange={(e) => update('verification_status', e.target.value)} className="select-field max-w-xs">
                {VERIFICATION_STATUSES.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-ink-500 mb-1 block">Notes</label>
              <textarea value={form.source_notes} onChange={(e) => update('source_notes', e.target.value)} className="textarea-field min-h-[80px]" placeholder="Any notes about attribution or sourcing..." />
            </div>
          </Item>

          {/* Categories */}
          <Item y={0}>
            <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-3 block">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`font-body text-xs px-3 py-1.5 rounded-sm transition-all ${
                    form.category_ids.includes(cat.id)
                      ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                      : 'text-ink-400 border border-ink-700 hover:border-ink-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Item>

          {/* Collections */}
          {collectionsList.length > 0 && (
            <Item y={0}>
              <label className="font-body text-xs text-ink-400 uppercase tracking-wider mb-3 block">Collections</label>
              <div className="flex flex-wrap gap-2">
                {collectionsList.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleCollection(col.id)}
                    className={`font-body text-xs px-3 py-1.5 rounded-sm transition-all ${
                      form.collection_ids.includes(col.id)
                        ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                        : 'text-ink-400 border border-ink-700 hover:border-ink-500'
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </Item>
          )}

          {/* Featured options */}
          <Item y={0} className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="rounded" />
              <span className="font-body text-sm text-ink-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.editors_pick} onChange={(e) => update('editors_pick', e.target.checked)} className="rounded" />
              <span className="font-body text-sm text-ink-300">Editor's Pick</span>
            </label>
          </Item>

          {/* Submit */}
          <Item y={0} className="flex items-center gap-4 pt-4 border-t border-ink-800/30">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Writing' : 'Create Writing'}
            </button>
            <button type="button" onClick={() => navigate('/admin/writings')} className="btn-ghost">Cancel</button>
          </Item>
        </form>
      )}
    </Stagger>
  );
}
