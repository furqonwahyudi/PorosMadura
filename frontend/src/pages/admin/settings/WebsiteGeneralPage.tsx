import React, { useState } from "react";
import { Info, Image, Save, CheckCircle } from "lucide-react";

export default function WebsiteGeneralPage() {
  const [siteName, setSiteName] = useState("Poros Madura");
  const [slogan, setSlogan] = useState("Mata Rakyat Madura Terkini");
  const [pt, setPt] = useState("PT Poros Madura Media");
  const [address, setAddress] = useState("Jl. Trunojoyo No. 45, Pamekasan, Madura, Jawa Timur");
  const [phone, setPhone] = useState("0812-3456-7890");
  const [email, setEmail] = useState("redaksi@porosmadura.com");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Core System &amp; News Portal Identity Configuration
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Konfigurasikan nama portal berita, badan hukum perusahaan pers, alamat redaksi, kontak resmi, dan aset logo
        </p>
      </div>

      {saved && (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
          maxWidth: 600
        }}>
          <CheckCircle size={15} style={{ color: "var(--green)" }} />
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Identitas portal berita berhasil disimpan.</span>
        </div>
      )}

      {/* Grid: Forms */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Form fields */}
        <form onSubmit={handleSave} style={{
          flex: 1.2, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16,
          maxWidth: 600
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Info size={15} style={{ color: "var(--brand)" }} /> Corporate Identity Metadata Fields
          </h2>

          {/* Site name */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Portal Berita *</label>
            <input
              type="text" value={siteName} onChange={e => setSiteName(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* Slogan */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Slogan Portal *</label>
            <input
              type="text" value={slogan} onChange={e => setSlogan(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* PT */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Badan Hukum PT Perusahaan Pers *</label>
            <input
              type="text" value={pt} onChange={e => setPt(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* Address */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Alamat Fisik Kantor Redaksi *</label>
            <textarea
              value={address} onChange={e => setAddress(e.target.value)}
              rows={3}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                resize: "none"
              }}
              required
            />
          </div>

          {/* Contacts */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nomor Kontak *</label>
              <input
                type="text" value={phone} onChange={e => setPhone(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Email Resmi Redaksi *</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 6
          }}>
            <Save size={14} /> Simpan Identitas Portal
          </button>
        </form>

        {/* Branding Assets Manager */}
        <div style={{
          flex: 1, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Image size={15} style={{ color: "var(--brand)" }} /> Branding Graphics Asset Manager
          </h2>

          {/* Logo Light */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Logo - Versi Light Mode</label>
            <input type="file" accept="image/*" style={{ fontSize: 11, color: "var(--text-secondary)" }} />
          </div>

          {/* Logo Dark */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Logo - Versi Dark Mode</label>
            <input type="file" accept="image/*" style={{ fontSize: 11, color: "var(--text-secondary)" }} />
          </div>

          {/* Favicon */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Favicon Browser (ICO/PNG)</label>
            <input type="file" accept="image/x-icon,image/png" style={{ fontSize: 11, color: "var(--text-secondary)" }} />
          </div>
        </div>

      </div>
    </div>
  );
}
