import { useState } from 'react';
import { apiAuth } from '../../api/client';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match');
      return;
    }

    setBusy(true);
    try {
      await apiAuth.changePassword(currentPassword, newPassword);
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stagger className="max-w-xl">
      <Item as="h1" y={0} className="font-body text-2xl text-ink-100 mb-6">Security</Item>

      <Item y={0}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block font-body text-xs text-ink-400 mb-2">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field w-full"
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <label className="block font-body text-xs text-ink-400 mb-2">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field w-full"
              autoComplete="new-password"
              required
            />
            <span className="block font-body text-xs text-ink-500 mt-2">At least 6 characters</span>
          </div>

          <div>
            <label className="block font-body text-xs text-ink-400 mb-2">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-field w-full"
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" disabled={busy} className="btn-primary text-sm">
            {busy ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Item>
    </Stagger>
  );
}