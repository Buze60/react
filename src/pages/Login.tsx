import { FormEvent, useState } from 'react';
import { useAuth } from '../state/auth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Login failed');
    }
  }

  return (
    <div className="container p-4" style={{ maxWidth: 420 }}>
      <h3>Login</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-100" type="submit">Login</button>
      </form>
    </div>
  );
}
