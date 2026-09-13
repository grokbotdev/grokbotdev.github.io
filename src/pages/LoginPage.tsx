import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_PASSWORD, DEMO_USERS } from "../data/seed";

export function LoginPage() {
  const { user, login, mode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = login(email, password);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="login-wrap">
      <aside className="login-hero">
        <div>
          <p className="kicker">
            AE Officials Association
          </p>
          <h1>Post-game reporting</h1>
          <p>Invite-only crew packets, last-four review, and supervisor film notes.</p>
        </div>
        <p className="meta">
          No public sign-up. Access is provisioned by the association.
        </p>
      </aside>
      <main className="login-main">
        <div className="card login-card">
          <p className="kicker">Sign in</p>
          <h2>Crew portal</h2>
          {mode === "demo" ? (
            <p className="notice" style={{ marginTop: 12 }}>
              Local demo mode. Production Firebase is not configured.
            </p>
          ) : null}
          <form className="grid" onSubmit={onSubmit} style={{ marginTop: 16 }}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? <div className="error">{error}</div> : null}
            <button className="primary" type="submit">
              Sign in
            </button>
          </form>
          <div className="demo-accounts">
            <p className="label">Demo accounts — {DEMO_PASSWORD}</p>
            {DEMO_USERS.map((account) => (
              <button
                key={account.id}
                type="button"
                className="account-btn"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError("");
                }}
              >
                <strong>
                  {account.name} · {account.role}
                </strong>
                <span className="meta">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
