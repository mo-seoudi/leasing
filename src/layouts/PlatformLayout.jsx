import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./PlatformLayout.css";

const leasingLinks = [
  {
    label: "Programme Summary",
    path: "/leasing/summary",
  },
  {
    label: "Year-on-Year Comparison",
    path: "/leasing/year-comparison",
  },
  {
    label: "Programme Comparison",
    path: "/leasing/program-comparison",
  },
];

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21h-4v-.08A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H3v-4h.08A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.08V3h4v.08A1.7 1.7 0 0 0 15.4 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.18.38.4.72.6 1 .28.38.66.6 1.08.6H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={open ? "chevron open" : "chevron"}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function getPageDetails(pathname) {
  if (pathname === "/dashboard") {
    return {
      section: "Overview",
      title: "Dashboard",
    };
  }

  if (pathname === "/leasing/summary") {
    return {
      section: "Leasing",
      title: "Programme Summary",
    };
  }

  if (pathname === "/leasing/year-comparison") {
    return {
      section: "Leasing",
      title: "Year-on-Year Comparison",
    };
  }

  if (pathname === "/leasing/program-comparison") {
    return {
      section: "Leasing",
      title: "Programme Comparison",
    };
  }

  if (pathname === "/settings") {
    return {
      section: "Administration",
      title: "Settings",
    };
  }

  return {
    section: "Commercial Operations",
    title: "Platform",
  };
}

export default function PlatformLayout() {
  const location = useLocation();

  const isLeasingRoute = location.pathname.startsWith("/leasing");

  const [leasingOpen, setLeasingOpen] = useState(isLeasingRoute);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageDetails = getPageDetails(location.pathname);

  useEffect(() => {
    if (isLeasingRoute) {
      setLeasingOpen(true);
    }

    setMobileOpen(false);
  }, [isLeasingRoute, location.pathname]);

  return (
    <div className="platform-layout">
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`platform-sidebar ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">CO</div>

          <div className="brand-copy">
            <strong>Commercial Operations</strong>
            <span>Analytics Platform</span>
          </div>

          <button
            type="button"
            className="mobile-close-button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <div className="navigation-group">
            <span className="navigation-label">Workspace</span>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `navigation-link ${isActive ? "active" : ""}`
              }
            >
              <span className="navigation-icon">
                <DashboardIcon />
              </span>

              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="navigation-group">
            <span className="navigation-label">Revenue Streams</span>

            <button
              type="button"
              className={`navigation-link navigation-parent ${
                isLeasingRoute ? "module-active" : ""
              }`}
              onClick={() => setLeasingOpen((current) => !current)}
              aria-expanded={leasingOpen}
            >
              <span className="navigation-link-content">
                <span className="navigation-icon">
                  <RevenueIcon />
                </span>

                <span>Leasing</span>
              </span>

              <ChevronIcon open={leasingOpen} />
            </button>

            {leasingOpen && (
              <div className="navigation-submenu">
                {leasingLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="submenu-dot" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            )}

            <div className="future-module">
              <span>Catering</span>
              <span className="status-badge">Soon</span>
            </div>

            <div className="future-module">
              <span>Uniform</span>
              <span className="status-badge">Soon</span>
            </div>

            <div className="future-module">
              <span>Transport</span>
              <span className="status-badge">Soon</span>
            </div>
          </div>

          <div className="navigation-group navigation-group-bottom">
            <span className="navigation-label">Administration</span>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `navigation-link ${isActive ? "active" : ""}`
              }
            >
              <span className="navigation-icon">
                <SettingsIcon />
              </span>

              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">MS</div>

          <div className="user-details">
            <strong>Mohammed Seoudi</strong>
            <span>Commercial Operations</span>
          </div>
        </div>
      </aside>

      <div className="platform-main">
        <header className="platform-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </button>

            <div>
              <div className="breadcrumb">
                <span>Commercial Operations</span>
                <span className="breadcrumb-divider">/</span>
                <span>{pageDetails.section}</span>
              </div>

              <h1>{pageDetails.title}</h1>
            </div>
          </div>

          <div className="header-actions">
            <div className="environment-pill">
              <span className="environment-dot" />
              Live data
            </div>
          </div>
        </header>

        <main className="platform-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
