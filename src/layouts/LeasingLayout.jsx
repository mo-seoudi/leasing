import { NavLink, Outlet } from "react-router-dom";
import "./LeasingLayout.css";

const menuItems = [
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

export default function LeasingLayout() {
  return (
    <div className="leasing-layout">
      <aside className="leasing-sidebar">
        <div className="leasing-sidebar-header">
          <h2>Leasing</h2>
          <p>Analysis & Reporting</p>
        </div>

        <nav className="leasing-sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `leasing-nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="leasing-content">
        <Outlet />
      </main>
    </div>
  );
}
