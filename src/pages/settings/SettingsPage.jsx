import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthProvider";
import { VAT_BASES } from "../../lib/vat";
import { useFinancialPreferences } from "../../settings/FinancialPreferencesProvider";
import "./SettingsPage.css";

function getInitials(name = "") { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U"; }
function formatRole(role) { return role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"; }

export default function SettingsPage() {
  const { user, profile, role, signOut } = useAuth();
  const { vatDisplayBasis, vatDisplayNotice, setVatDisplayBasis } = useFinancialPreferences();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "—";
  const initials = getInitials(displayName);

  async function handleSignOut() { setSigningOut(true); const { error } = await signOut(); if (error) { console.error("Unable to sign out:", error); setSigningOut(false); return; } navigate("/login", { replace: true }); }

  return <section className="settings-page">
    <div className="settings-card financial-preferences-card">
      <div className="settings-card-header"><h2>Financial Preferences</h2><p>Set how monetary figures are presented across ComOps. This does not change the original amounts stored in financial records.</p></div>
      <div className="financial-preference-row">
        <div className="financial-preference-copy"><strong>VAT Display Basis</strong><span>Changing this recalculates monetary figures across every dashboard. Future exported reports will use the same presentation basis.</span></div>
        <div className="vat-basis-toggle" role="group" aria-label="VAT display basis">
          <button type="button" className={vatDisplayBasis === VAT_BASES.EXCLUSIVE ? "active" : ""} onClick={() => setVatDisplayBasis(VAT_BASES.EXCLUSIVE)}>Excl. VAT</button>
          <button type="button" className={vatDisplayBasis === VAT_BASES.INCLUSIVE ? "active" : ""} onClick={() => setVatDisplayBasis(VAT_BASES.INCLUSIVE)}>Incl. VAT</button>
        </div>
      </div>
      <div className="financial-preference-note">Current platform display: <strong>{vatDisplayBasis === VAT_BASES.INCLUSIVE ? "VAT Inclusive" : "VAT Exclusive"}</strong></div>
      {vatDisplayNotice && <div className="vat-recalculation-confirmation" role="status">✓ {vatDisplayNotice}</div>}
    </div>

    <div className="settings-card">
      <div className="settings-card-header"><h2>Account</h2><p>Your signed-in ComOps profile and access level.</p></div>
      <div className="settings-profile"><div className="settings-avatar" aria-hidden="true">{initials}</div><div className="settings-profile-copy"><strong>{displayName}</strong><span>{email}</span></div></div>
      <div className="settings-details"><div className="settings-detail-row"><span>Full name</span><strong>{displayName}</strong></div><div className="settings-detail-row"><span>Email</span><strong>{email}</strong></div><div className="settings-detail-row"><span>Role</span><strong>{formatRole(role)}</strong></div></div>
      <div className="settings-actions"><button type="button" className="settings-signout-button" onClick={handleSignOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button></div>
    </div>
  </section>;
}
