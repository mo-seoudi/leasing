import { Link } from "react-router-dom";
import "./ManageRecordsLink.css";

export default function ManageRecordsLink({ label, to, description = "Review or update the source records behind this dashboard." }) {
  return (
    <section className="manage-records-shortcut">
      <div>
        <span>DATA MANAGEMENT</span>
        <p>{description}</p>
      </div>
      <Link to={to}>{label} <span aria-hidden="true">→</span></Link>
    </section>
  );
}
