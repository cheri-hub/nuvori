import { useId, useState, type ReactNode, type FormEvent } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!auth.configured) return children;
  if (auth.loading) {
    return <main className="auth-gate" aria-live="polite"><p className="eyebrow">NUVORI</p><p>Abrindo sua sessao...</p></main>;
  }
  if (auth.user) return children;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSent(false);
    try {
      await auth.requestMagicLink(email);
      setSent(true);
    } catch {
      // The hook exposes the stable error message for the form.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-gate">
      <div className="auth-panel">
        <p className="eyebrow">PRIMEIRO PASSO</p>
        <h1>Entre para continuar.</h1>
        <p className="auth-copy">Use seu email. Enviaremos um link seguro para abrir o Nuvori.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor={emailId}>Email</label>
          <input id={emailId} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required inputMode="email" />
          <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar link'}<span aria-hidden="true">&#8594;</span></button>
        </form>
        {sent && <p className="auth-status" role="status">Confira seu email para entrar.</p>}
        {auth.error && <p className="auth-error" role="alert">{auth.error}</p>}
      </div>
    </main>
  );
}
