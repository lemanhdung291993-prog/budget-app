import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthScreen({ configured }) {
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const result = mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      if (mode === 'sign-up' && !result.data.session) {
        setMessage('Check your email to confirm your account, then sign in.');
      }
    } catch (authError) {
      setError(authError.message || 'Could not authenticate. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand"><span className="brand-mark">p</span><span>Pennywise</span></div>
        {!configured ? (
          <>
            <h1>Connect Supabase</h1>
            <p>Add your project URL and publishable key to a <code>.env.local</code> file in the project root, then restart the dev server.</p>
            <pre>VITE_SUPABASE_URL=...{'\n'}VITE_SUPABASE_PUBLISHABLE_KEY=...</pre>
          </>
        ) : (
          <>
            <h1>{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
            <p>Sign in to securely access your budget from any device.</p>
            <form onSubmit={submit}>
              <label>Email<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
              <label>Password<input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} /></label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-message" role="status">{message}</p>}
              <button className="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
            </form>
            <button className="auth-switch" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); setMessage(''); }}>
              {mode === 'sign-in' ? 'New to Pennywise? Create an account' : 'Already have an account? Sign in'}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
