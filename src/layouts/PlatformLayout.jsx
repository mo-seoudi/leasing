import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./PlatformLayout.css";

export default function PlatformLayout() {
  const [leasingOpen, setLeasingOpen] = useState(true);

  return (
    <div className="platform-layout">
      <aside className="platform-sidebar">
        <div className="platform-sidebar-header">
          <h2>Commercial Operations</h2>
          <p>Analytics Platform</p>
        </div>

        <nav className="platform-sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `platform-nav-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <div className="nav-section">
            <div className="nav-section-label">Revenue Streams</div>

            <button
              type="button"
              className={`nav-parent-button ${leasingOpen ? "open" : ""}`}
              onClick={() => setLeasingOpen((current) => !current)}
            >
              <span>Leasing</span>
              <span className="nav-arrow">
                {leasingOpen ? "▾" : "▸"}
              </span>
            </button>

            {leasingOpen && (
              <div className="nav-submenu">
                <NavLink
                  to="/leasing/summary"
                  className={({ isActive }) =>
                    `platform-nav-link submenu-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  Programme Summary
                </NavLink>

                <NavLink
                  to="/leasing/year-comparison"
                  className={({ isActive }) =>
                    `platform-nav-link submenu-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  Year-on-Year Comparison
                </NavLink>

                <NavLink
                  to="/leasing/program-comparison"
                  className={({ isActive }) =>
                    `platform-nav-link submenu-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  Programme Comparison
                </NavLink>
              </div>
            )}

            <button
              type="button"
              className="nav-parent-button disabled"
              disabled
            >
              <span>Catering</span>
              <span className="coming-soon">Soon</span>
            </button>

            <button
              type="button"
              className="nav-parent-button disabled"
              disabled
            >
              <span>Uniform</span>
              <span className="coming-soon">Soon</span>
            </button>

            <button
              type="button"
              className="nav-parent-button disabled"
              disabled
            >
              <span>Transport</span>
              <span className="coming-soon">Soon</span>
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-label">Administration</div>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `platform-nav-link ${isActive ? "active" : ""}`
              }
            >
              Settings
            </NavLink>
          </div>
        </nav>
      </aside>

      <main className="platform-content">
        <Outlet />
      </main>
    </div>
  );
}
