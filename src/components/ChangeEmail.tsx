'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChangeEmail({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newEmail || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (newEmail === currentEmail) {
      setMessage({ type: 'error', text: 'New email must be different from current email' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);

    try {
      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: password,
      });

      if (signInError) {
        setMessage({ type: 'error', text: 'Password is incorrect' });
        setLoading(false);
        return;
      }

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage({ 
        type: 'info', 
        text: 'Confirmation email sent! Please check both your old and new email addresses to confirm the change.' 
      });
      
      // Clear form
      setNewEmail('');
      setPassword('');

    } catch (error: any) {
      console.error('Error changing email:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to change email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium leading-6 text-slate-900">
        Change Email Address
      </h3>
      <div className="mt-2 text-sm text-slate-600">
        <p>
          Current email: <span className="font-medium text-slate-900">{currentEmail}</span>
        </p>
        <p className="mt-1">
          You'll receive a confirmation email at both addresses to verify this change.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="new-email" className="block text-sm font-medium text-slate-700">
            New Email Address
          </label>
          <input
            type="email"
            id="new-email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="email-password" className="block text-sm font-medium text-slate-700">
            Confirm Your Password
          </label>
          <input
            type="password"
            id="email-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        {message && (
          <div
            className={`rounded-md p-4 ${
              message.type === 'success' ? 'bg-green-50' :
              message.type === 'info' ? 'bg-blue-50' :
              'bg-red-50'
            }`}
          >
            <p
              className={`text-sm ${
                message.type === 'success' ? 'text-green-800' :
                message.type === 'info' ? 'text-blue-800' :
                'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating Email...' : 'Update Email'}
          </button>
        </div>
      </form>
    </section>
  );
}