import { useMemo, useState } from "react";

import { createProgramme, updateProgramme } from "../../lib/financialData";

const DEFAULT_CATEGORIES = ["Sports Academies", "Other Programs"];

export default function LeasingProgrammeManager({ programmes = [], providers = [], canEdit, onRefresh }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", providerName: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...programmes.map((item) => item.category).filter(Boolean)])].sort(),
    [programmes]
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return programmes.filter((programme) => {
      if (categoryFilter && programme.category !== categoryFilter) return false;
      if (!query) return true;
      return [programme.name, programme.category, programme.provider_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [programmes, search, categoryFilter]);

  function beginCreate() {
    setEditing(null);
    setCreating(true);
    setForm({ name: "", category: "", providerName: "" });
    setMessage("");
    setError("");
  }

  function beginEdit(programme) {
    setCreating(false);
    setEditing(programme);
    setForm({
      name: programme.name || "",
      category: programme.category || "",
      providerName: programme.provider_name || "",
    });
    setMessage("");
    setError("");
  }

  function closeEditor() {
    setCreating(false);
    setEditing(null);
    setError("");
  }

  async function save(event) {
    event.preventDefault();
    if (!canEdit) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      if (editing) {
        await updateProgramme(editing.id, form);
        setMessage(`${form.name.trim()} updated.`);
      } else {
        await createProgramme(form);
        setMessage(`${form.name.trim()} added.`);
      }
      closeEditor();
      await onRefresh?.();
    } catch (saveError) {
      setError(saveError?.message || "Unable to save the programme.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="manage-records-card programme-manager-card">
      <div className="manage-records-header">
        <div>
          <span className="entry-step">LEASING MASTER DATA</span>
          <h3>Manage Programmes</h3>
          <p className="programme-manager-description">
            Add programmes or change their category and provider. Existing financial records stay linked through the programme ID.
          </p>
        </div>
        <div className="programme-manager-header-actions">
          <div className="record-count-badge">{visible.length} programmes</div>
          {canEdit && <button type="button" className="entry-save-button programme-add-button" onClick={beginCreate}>＋ Add Programme</button>}
        </div>
      </div>

      <div className="programme-manager-filters">
        <label className="entry-field search-field">
          <span>Search</span>
          <input type="search" placeholder="Programme, category or provider…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="entry-field">
          <span>Category</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
      </div>

      {message && <div className="entry-message success manage-message">{message}</div>}
      {error && !editing && !creating && <div className="entry-message error manage-message">{error}</div>}

      <div className="records-table-wrap">
        <table className="records-table programme-manager-table">
          <thead><tr><th>Programme</th><th>Category</th><th>Provider</th><th /></tr></thead>
          <tbody>
            {visible.map((programme) => (
              <tr key={programme.id}>
                <td><strong>{programme.name}</strong><span>ID {programme.id}</span></td>
                <td><span className="programme-category-pill">{programme.category || "Uncategorised"}</span></td>
                <td>{programme.provider_name || "—"}</td>
                <td className="record-actions-cell">{canEdit && <button type="button" className="record-action" onClick={() => beginEdit(programme)}>Edit</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <div className="record-modal-backdrop">
          <form className="record-modal programme-editor-modal" onSubmit={save}>
            <div className="record-modal-header">
              <div><span className="entry-step">{editing ? "EDIT PROGRAMME" : "NEW PROGRAMME"}</span><h3>{editing ? editing.name : "Add Leasing Programme"}</h3><p>Programme master data used by Leasing reporting and financial records.</p></div>
              <button type="button" className="modal-close" onClick={closeEditor}>×</button>
            </div>
            <div className="programme-editor-fields">
              <label className="entry-field"><span>Programme Name</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required autoFocus /></label>
              <label className="entry-field"><span>Category</span><input list="leasing-programme-categories" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Select or enter category" required /><datalist id="leasing-programme-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist></label>
              <label className="entry-field"><span>Provider</span><input list="leasing-programme-providers" value={form.providerName} onChange={(event) => setForm((current) => ({ ...current, providerName: event.target.value }))} placeholder="Select or enter provider" /><datalist id="leasing-programme-providers">{providers.map((provider) => <option key={provider.id} value={provider.name} />)}</datalist></label>
            </div>
            {error && <div className="entry-message error">{error}</div>}
            <div className="record-modal-actions"><button type="button" className="entry-reset-button" onClick={closeEditor}>Cancel</button><button type="submit" className="entry-save-button" disabled={saving}>{saving ? "Saving…" : editing ? "Save Changes" : "Add Programme"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}
