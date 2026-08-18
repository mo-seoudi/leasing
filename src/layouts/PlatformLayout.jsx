import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  MdRestaurant,
  MdSportsTennis,
} from "react-icons/md";
import { FaBusSimple, FaShirt } from "react-icons/fa6";

import { useAuth } from "../auth/AuthProvider";
import "./PlatformLayout.css";

const LAPTOP_BREAKPOINT = 1450;

const SIDEBAR_STORAGE_KEY =
  "commercial-operations-sidebar-collapsed";

const leasingLinks = [
  {
    label: "Programme Directory",
    path: "/leasing/programmes",
  },
  {
    label: "Year-on-Year Comparison",
    path: "/leasing/year-comparison",
  },
];

const cateringLinks = [
  {
    label: "Catering Dashboard",
    path: "/catering",
  },
  {
    label: "Year-on-Year Comparison",
    path: "/catering/comparison",
  },
];

const uniformLinks = [
  {
    label: "Uniform Dashboard",
    path: "/uniform",
  },
  {
    label: "Year-on-Year Comparison",
    path: "/uniform/comparison",
  },
];

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />
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

function CollapseIcon({ collapsed }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={
          collapsed
            ? "m9 6 6 6-6 6"
            : "m15 6-6 6 6 6"
        }
      />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={
        open
          ? "chevron open"
          : "chevron"
      }
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function getPageDetails(pathname) {
  if (pathname === "/dashboard") {
    return {
      section: "",
      title: "Commercial Operations Dashboard",
    };
  }

  if (pathname === "/leasing/programmes") {
    return {
      section: "Leasing",
      title: "Programme Directory",
    };
  }

  if (
    pathname ===
    "/leasing/year-comparison"
  ) {
    return {
      section: "Leasing",
      title: "Year-on-Year Comparison",
    };
  }

  if (pathname === "/catering") {
    return {
      section: "Catering",
      title: "Catering Dashboard",
    };
  }

  if (pathname === "/catering/comparison") {
    return {
      section: "Catering",
      title: "Year-on-Year Comparison",
    };
  }

  if (pathname === "/uniform") {
    return {
      section: "Uniform",
      title: "Uniform Dashboard",
    };
  }

  if (pathname === "/uniform/comparison") {
    return {
      section: "Uniform",
      title: "Year-on-Year Comparison",
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

function getInitialCollapsedState() {
  if (typeof window === "undefined") {
    return false;
  }

  const storedValue =
    window.localStorage.getItem(
      SIDEBAR_STORAGE_KEY,
    );

  if (storedValue !== null) {
    return storedValue === "true";
  }

  return (
    window.innerWidth <= LAPTOP_BREAKPOINT &&
    window.innerWidth > 900
  );
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function formatRole(role) {
  if (!role) {
    return "User";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function PlatformLayout() {
  const { user, profile, role } = useAuth();

  const [headerControls, setHeaderControls] = useState(null);
  const location = useLocation();

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const userInitials = getInitials(userName);
  const userRole = formatRole(role);

  const isLeasingRoute =
    location.pathname.startsWith("/leasing");

  const isCateringRoute =
    location.pathname.startsWith("/catering");

  const isUniformRoute =
    location.pathname.startsWith("/uniform");

  const [leasingOpen, setLeasingOpen] =
    useState(isLeasingRoute);

  const [cateringOpen, setCateringOpen] =
    useState(isCateringRoute);

  const [uniformOpen, setUniformOpen] =
    useState(isUniformRoute);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(getInitialCollapsedState);

  const pageDetails = getPageDetails(
    location.pathname,
  );

  useEffect(() => {
    if (isLeasingRoute) {
      setLeasingOpen(true);
    }

    if (isCateringRoute) {
      setCateringOpen(true);
    }

    if (isUniformRoute) {
      setUniformOpen(true);
    }

    setMobileOpen(false);
  }, [
    isCateringRoute,
    isLeasingRoute,
    isUniformRoute,
    location.pathname,
  ]);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(
      (current) => !current,
    );
  };

  const handleLeasingToggle = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setLeasingOpen(true);
      return;
    }

    setLeasingOpen(
      (current) => !current,
    );
  };

  const handleCateringToggle = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setCateringOpen(true);
      return;
    }

    setCateringOpen(
      (current) => !current,
    );
  };

  const handleUniformToggle = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setUniformOpen(true);
      return;
    }

    setUniformOpen(
      (current) => !current,
    );
  };

  return (
    <div
      className={`platform-layout ${
        sidebarCollapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`platform-sidebar ${
          mobileOpen
            ? "mobile-open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            CO
          </div>

          <div className="brand-copy">
            <strong>
              ComOps
            </strong>

            <span>
              Commercial workspace
            </span>
          </div>

          <button
            type="button"
            className="sidebar-collapse-button"
            aria-label={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            onClick={toggleSidebar}
          >
            <CollapseIcon
              collapsed={
                sidebarCollapsed
              }
            />
          </button>

          <button
            type="button"
            className="mobile-close-button"
            aria-label="Close menu"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <div className="navigation-group">
            <span className="navigation-label">
              Workspace
            </span>

            <NavLink
              to="/dashboard"
              title={
                sidebarCollapsed
                  ? "Dashboard"
                  : undefined
              }
              onClick={() => {
                if (sidebarCollapsed) {
                  setSidebarCollapsed(false);
                }
              }}
              className={({
                isActive,
              }) =>
                `navigation-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span className="navigation-icon">
                <DashboardIcon />
              </span>

              <span className="navigation-text">
                Dashboard
              </span>
            </NavLink>
          </div>

          <div className="navigation-group">
            <span className="navigation-label">
              Revenue Streams
            </span>

            <button
              type="button"
              className={`navigation-link navigation-parent ${
                isLeasingRoute
                  ? "module-active"
                  : ""
              }`}
              onClick={
                handleLeasingToggle
              }
              aria-expanded={
                !sidebarCollapsed &&
                leasingOpen
              }
              title={
                sidebarCollapsed
                  ? "Leasing"
                  : undefined
              }
            >
              <span className="navigation-link-content">
                <span className="navigation-icon">
                  <MdSportsTennis className="stream-react-icon" />
                </span>

                <span className="navigation-text">
                  Leasing
                </span>
              </span>

              <ChevronIcon
                open={leasingOpen}
              />
            </button>

            {!sidebarCollapsed &&
              leasingOpen && (
                <div className="navigation-submenu">
                  {leasingLinks.map(
                    (link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        className={({
                          isActive,
                        }) =>
                          `submenu-link ${
                            isActive
                              ? "active"
                              : ""
                          }`
                        }
                      >
                        <span className="submenu-dot" />

                        <span>
                          {link.label}
                        </span>
                      </NavLink>
                    ),
                  )}
                </div>
              )}

            <button
              type="button"
              className={`navigation-link navigation-parent ${
                isCateringRoute
                  ? "module-active"
                  : ""
              }`}
              onClick={handleCateringToggle}
              aria-expanded={
                !sidebarCollapsed &&
                cateringOpen
              }
              title={
                sidebarCollapsed
                  ? "Catering"
                  : undefined
              }
            >
              <span className="navigation-link-content">
                <span className="navigation-icon">
                  <MdRestaurant className="stream-react-icon" />
                </span>

                <span className="navigation-text">
                  Catering
                </span>
              </span>

              <ChevronIcon
                open={cateringOpen}
              />
            </button>

            {!sidebarCollapsed &&
              cateringOpen && (
                <div className="navigation-submenu">
                  {cateringLinks.map(
                    (link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === "/catering"}
                        className={({
                          isActive,
                        }) =>
                          `submenu-link ${
                            isActive
                              ? "active"
                              : ""
                          }`
                        }
                      >
                        <span className="submenu-dot" />

                        <span>
                          {link.label}
                        </span>
                      </NavLink>
                    ),
                  )}
                </div>
              )}

            <button
              type="button"
              className={`navigation-link navigation-parent ${
                isUniformRoute
                  ? "module-active"
                  : ""
              }`}
              onClick={handleUniformToggle}
              aria-expanded={
                !sidebarCollapsed &&
                uniformOpen
              }
              title={
                sidebarCollapsed
                  ? "Uniform"
                  : undefined
              }
            >
              <span className="navigation-link-content">
                <span className="navigation-icon">
                  <FaShirt className="stream-react-icon" />
                </span>

                <span className="navigation-text">
                  Uniform
                </span>
              </span>

              <ChevronIcon
                open={uniformOpen}
              />
            </button>

            {!sidebarCollapsed &&
              uniformOpen && (
                <div className="navigation-submenu">
                  {uniformLinks.map(
                    (link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === "/uniform"}
                        className={({
                          isActive,
                        }) =>
                          `submenu-link ${
                            isActive
                              ? "active"
                              : ""
                          }`
                        }
                      >
                        <span className="submenu-dot" />

                        <span>
                          {link.label}
                        </span>
                      </NavLink>
                    ),
                  )}
                </div>
              )}

            <div
              className="future-module"
              title={
                sidebarCollapsed
                  ? "Transport — Soon"
                  : undefined
              }
            >
              <span className="future-module-content">
                <span className="navigation-icon">
                  <FaBusSimple className="stream-react-icon" />
                </span>

                <span className="future-module-name">
                  Transport
                </span>
              </span>

              <span className="status-badge">
                Soon
              </span>
            </div>
          </div>

          <div className="navigation-group navigation-group-bottom">
            <span className="navigation-label">
              Administration
            </span>

            <NavLink
              to="/settings"
              title={
                sidebarCollapsed
                  ? "Settings"
                  : undefined
              }
              className={({
                isActive,
              }) =>
                `navigation-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span className="navigation-icon">
                <SettingsIcon />
              </span>

              <span className="navigation-text">
                Settings
              </span>
            </NavLink>
          </div>
        </nav>

        <div
          className="sidebar-footer"
          title={
            sidebarCollapsed
              ? userName
              : undefined
          }
        >
          <div className="user-avatar">
            {userInitials}
          </div>

          <div className="user-details">
            <strong>
              {userName}
            </strong>

            <span>
              {userRole}
            </span>
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
              onClick={() =>
                setMobileOpen(true)
              }
            >
              <MenuIcon />
            </button>

            <button
              type="button"
              className="header-sidebar-toggle"
              aria-label={
                sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              title={
                sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              onClick={toggleSidebar}
            >
              <CollapseIcon
                collapsed={
                  sidebarCollapsed
                }
              />
            </button>

            <div>
              {pageDetails.section && (
                <div className="breadcrumb">
                  <span>
                    Commercial Operations
                  </span>

                  <span className="breadcrumb-divider">
                    /
                  </span>

                  <span>
                    {pageDetails.section}
                  </span>
                </div>
              )}

              <h1>
                {pageDetails.title}
              </h1>
            </div>
          </div>
          <div
            className={`header-actions ${
              headerControls
                ? "has-page-controls"
                : ""
            }`}
          >
            {headerControls && (
              <div className="header-page-controls">
                {headerControls}
              </div>
            )}
          </div>
        </header>

        <main className="platform-content">
          <Outlet context={{ setHeaderControls }} />
        </main>
      </div>
    </div>
  );
}
