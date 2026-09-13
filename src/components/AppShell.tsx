import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { navForRole } from "../lib/rules";

export function AppShell() {
  const { user, logout, mode } = useAuth();
  const { resetDemo } = useAppData();
  if (!user) return null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="monogram">AE</span>
            <span className="brand-text">
              <small>AE Officials Association</small>
              <span className="wordmark">Post-Game Reporting</span>
            </span>
          </NavLink>
          <nav className="nav">
            {navForRole(user.role).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="session">
            <span className="mode-pill">{mode === "demo" ? "Local demo" : mode}</span>
            <span>
              {user.name}
              <span className="role-chip"> {user.role}</span>
            </span>
            <button className="text-btn" type="button" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner row">
          <span>AE Officials Association · invite-only crew reporting</span>
          {mode === "demo" ? (
            <button className="text-btn" type="button" onClick={resetDemo}>
              Reset demo data
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
