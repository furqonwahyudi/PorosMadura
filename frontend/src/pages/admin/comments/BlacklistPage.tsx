import React, { useState } from "react";
import { ShieldAlert, Plus, X, Save, CheckCircle, AlertTriangle, Globe, Mail } from "lucide-react";

const INITIAL_WORDS = [
  "judi", "slot", "casino", "togel", "bokep", "porno", "p0rn0", "b0kep",
  "babi", "anjing", "bangsat", "bajingan", "radikalisme", "teroris", "ISIS",
  "pinjol ilegal", "investasi bodong",
];

const BANNED_IPS = ["45.14.10.233", "103.28.90.11", "5.188.206.90", "202.95.170.4"];
const BANNED_EMAILS = ["spam@spambot.ru", "promo@promo.biz", "bot@mailinator.com", "promo@casino88.id"];

export default function CommentBlacklistPage() {
  const [words, setWords] = useState(INITIAL_WORDS);
  const [wordInput, setWordInput] = useState("");
  const [ips, setIps] = useState(BANNED_IPS);
  const [ipInput, setIpInput] = useState("");
  const [emails, setEmails] = useState(BANNED_EMAILS);
  const [emailInput, setEmailInput] = useState("");
  const [saved, setSaved] = useState(false);

  const addWord = () => {
    const w = wordInput.trim().toLowerCase();
    if (w && !words.includes(w)) { setWords(p => [...p, w]); setWordInput(""); }
  };
  const removeWord = (w: string) => setWords(p => p.filter(x => x !== w));

  const addIp = () => {
    const ip = ipInput.trim();
    if (ip && !ips.includes(ip)) { setIps(p => [...p, ip]); setIpInput(""); }
  };
  const removeIp = (ip: string) => setIps(p => p.filter(x => x !== ip));

  const addEmail = () => {
    const em = emailInput.trim().toLowerCase();
    if (em && !emails.includes(em)) { setEmails(p => [...p, em]); setEmailInput(""); }
  };
  const removeEmail = (em: string) => setEmails(p => p.filter(x => x !== em));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Forbidden Comment Keywords &amp; User Ban Lists
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kata terlarang, IP, dan email yang diblokir dari kolom komentar
        </p>
      </div>

      {/* Warning banner */}
      <div style={{
        background: "var(--red-subtle)", border: "1px solid var(--red)",
        borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <AlertTriangle size={15} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>
          <strong>Penting:</strong> Komentar yang mengandung kata atau berasal dari IP/email di bawah akan otomatis dipindah ke folder Spam tanpa notifikasi ke pembaca.
        </p>
      </div>

      {/* Section 1: Keywords */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ShieldAlert size={15} style={{ color: "var(--red)" }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Profanity &amp; Sensitive Word Filter
            </h2>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: "var(--red-subtle)", color: "var(--red)",
            }}>{words.length} kata</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            Satu kata atau frasa per baris. Sistem akan mencocokkan dengan seluruh isi komentar (case-insensitive).
          </p>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {/* Input */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              value={wordInput}
              onChange={e => setWordInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addWord()}
              placeholder="Tambah kata terlarang..."
              style={{
                flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 13, color: "var(--text-primary)", outline: "none",
              }}
            />
            <button onClick={addWord}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
                borderRadius: 8, border: "none", background: "var(--brand)",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <Plus size={14} /> Tambah
            </button>
          </div>

          {/* Word cloud */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {words.map(w => (
              <div key={w} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 20,
                background: "var(--red-subtle)", border: "1px solid var(--red)",
                fontSize: 12, color: "var(--red)", fontWeight: 500,
              }}>
                {w}
                <button
                  onClick={() => removeWord(w)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", lineHeight: 0, padding: 0 }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Banned IDs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Banned IPs */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
              <Globe size={14} style={{ color: "var(--orange)" }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Banned IP Addresses
              </h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "var(--orange-subtle)", color: "var(--orange)" }}>{ips.length}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Blokir akses komentar dari IP tertentu</p>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input value={ipInput} onChange={e => setIpInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addIp()}
                placeholder="192.168.x.x" style={{ flex: 1, padding: "7px 10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, color: "var(--text-primary)", outline: "none" }} />
              <button onClick={addIp} style={{ padding: "7px 11px", borderRadius: 7, border: "none", background: "var(--orange)", color: "#fff", fontSize: 12, cursor: "pointer" }}><Plus size={13} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {ips.map(ip => (
                <div key={ip} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-subtle)", borderRadius: 6 }}>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-primary)" }}>{ip}</span>
                  <button onClick={() => removeIp(ip)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banned Emails */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
              <Mail size={14} style={{ color: "var(--purple)" }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Banned Email Addresses
              </h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "var(--purple-subtle)", color: "var(--purple)" }}>{emails.length}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Cegah pendaftaran dari email mencurigakan</p>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addEmail()}
                placeholder="email@domain.com" style={{ flex: 1, padding: "7px 10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, color: "var(--text-primary)", outline: "none" }} />
              <button onClick={addEmail} style={{ padding: "7px 11px", borderRadius: 7, border: "none", background: "var(--purple)", color: "#fff", fontSize: 12, cursor: "pointer" }}><Plus size={13} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {emails.map(em => (
                <div key={em} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-subtle)", borderRadius: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{em}</span>
                  <button onClick={() => removeEmail(em)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", flexShrink: 0 }}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div>
        <button onClick={handleSave}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "10px 22px",
            background: saved ? "var(--green)" : "var(--brand)",
            border: "none", borderRadius: 9, cursor: "pointer",
            color: "#fff", fontSize: 13, fontWeight: 600, transition: "background 0.3s",
          }}
        >
          {saved ? <><CheckCircle size={15} /> Tersimpan!</> : <><Save size={15} /> Simpan Daftar Blokir</>}
        </button>
      </div>
    </div>
  );
}
