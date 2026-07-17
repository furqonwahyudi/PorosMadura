import React, { useState, useEffect, useRef } from "react";
import { useAdSystem } from "../../context/AdContext";
import { AdSlot } from "../../types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PREMIUM FLOATING ADVERTISEMENT LAYOUT ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Implementasi 3-kolom CSS Grid — seperti Kompas, Detik, Tribun, CNBC Indonesia.
 *
 *   [Left Skyscraper] [GAP] [WEBSITE CONTENT] [GAP] [Right Skyscraper]
 *
 * ATURAN WAJIB:
 *   ✓ BUKAN overlay — floating ads TIDAK menutupi website sama sekali
 *   ✓ Menggunakan CSS Grid — content otomatis mengecil memberi ruang untuk ads
 *   ✓ Tidak ada tombol Close, X, minimize, countdown — PREMIUM slot
 *   ✓ Selalu tampil selama campaign aktif
 *   ✓ Sticky scroll (position: sticky, bukan fixed)
 *   ✓ Responsive: ≥1700px full, 1500–1699px compact, <1500px disabled
 *   ✓ Pengaturan seluruhnya dari CMS via floatingConfig di AdSlot
 *
 * LAYOUT ENGINE — Kalkulasi lebar container otomatis:
 *   Viewport = AdW_Left + Gap + WebsiteW + Gap + AdW_Right
 *   WebsiteW = Viewport - AdW_Left - Gap_Left - Gap_Right - AdW_Right
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface FloatingAdLayoutProps {
  children: React.ReactNode;
  page: string;
  category?: string | null;
}

/** Breakpoints (viewport width) */
const BP_FULL = 1700;  // ≥1700px → 160px skyscrapers
const BP_MINI = 1500;  // 1500–1699px → 120px skyscrapers

/** Default dimensions when floatingConfig is not set */
const DEFAULT_AD_W_FULL = 160;
const DEFAULT_AD_W_MINI = 120;
const DEFAULT_AD_H = 600;
const DEFAULT_GAP = 20;
const DEFAULT_TOP_OFFSET = 88; // clears fixed header

export default function FloatingAdLayout({ children, page, category }: FloatingAdLayoutProps) {
  const { getAdForSlot, adSlots } = useAdSystem();
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1920);
  const [leftAd, setLeftAd] = useState<any>(null);
  const [rightAd, setRightAd] = useState<any>(null);

  // Slot metadata (premium config)
  const [leftSlot, setLeftSlot] = useState<AdSlot | null>(null);
  const [rightSlot, setRightSlot] = useState<AdSlot | null>(null);

  const leftImgRef = useRef<HTMLDivElement>(null);
  const rightImgRef = useRef<HTMLDivElement>(null);
  const leftTracked = useRef<string | null>(null);
  const rightTracked = useRef<string | null>(null);

  // ── Resize listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Load ads + slot metadata ───────────────────────────────────────────────
  useEffect(() => {
    const lSlot = adSlots.find(s => s.slug === "floating-left-skyscraper") ?? null;
    const rSlot = adSlots.find(s => s.slug === "floating-right-skyscraper") ?? null;
    setLeftSlot(lSlot);
    setRightSlot(rSlot);

    // Helper: does a slot's page config include the current page?
    const pageMatches = (slot: AdSlot | null): boolean => {
      if (!slot) return false;
      if (!slot.page) return true; // no restriction → show everywhere
      const allowed = slot.page.split(",").map(p => p.trim().toLowerCase());
      return allowed.includes("all") || allowed.includes(page.trim().toLowerCase());
    };

    const lAd = pageMatches(lSlot) ? getAdForSlot("floating-left-skyscraper", page, category) : null;
    const rAd = pageMatches(rSlot) ? getAdForSlot("floating-right-skyscraper", page, category) : null;
    setLeftAd(lAd);
    setRightAd(rAd);
  }, [getAdForSlot, adSlots, page, category]);

  // ── Impression tracking ────────────────────────────────────────────────────
  const fireImpression = (adId: string, ref: React.MutableRefObject<string | null>) => {
    if (ref.current === adId) return;
    ref.current = adId;
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, action: "impression" }),
    }).catch(() => {});
  };

  useEffect(() => {
    if (!leftAd) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) fireImpression(leftAd.id, leftTracked); },
      { threshold: 0.1 }
    );
    if (leftImgRef.current) obs.observe(leftImgRef.current);
    return () => obs.disconnect();
  }, [leftAd]);

  useEffect(() => {
    if (!rightAd) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) fireImpression(rightAd.id, rightTracked); },
      { threshold: 0.1 }
    );
    if (rightImgRef.current) obs.observe(rightImgRef.current);
    return () => obs.disconnect();
  }, [rightAd]);

  // ── Click tracker ──────────────────────────────────────────────────────────
  const handleClick = (ad: any) => {
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, action: "click" }),
    }).catch(() => {});
  };

  // ── Layout Engine ──────────────────────────────────────────────────────────
  // Determine active state (enable floating skyscrapers on screens 1024px and wider)
  const floatingActive = vw >= 1024;

  // Read dimensions from CMS config (floatingConfig) or use defaults
  const leftConfig  = leftSlot?.floatingConfig;
  const rightConfig = rightSlot?.floatingConfig;

  const leftW     = leftConfig?.width  ?? DEFAULT_AD_W_FULL;
  const rightW    = rightConfig?.width ?? DEFAULT_AD_W_FULL;
  const leftH     = leftConfig?.height  ?? DEFAULT_AD_H;
  const rightH    = rightConfig?.height ?? DEFAULT_AD_H;
  const topOffset = leftConfig?.topOffset ?? DEFAULT_TOP_OFFSET;

  // Only show ad if: floating is active, slot exists + active, AND page matches
  const pageMatches = (slot: AdSlot | null): boolean => {
    if (!slot) return false;
    if (!slot.page) return true;
    const allowed = slot.page.split(",").map(p => p.trim().toLowerCase());
    return allowed.includes("all") || allowed.includes(page.trim().toLowerCase());
  };

  const showLeft  = floatingActive && leftSlot?.status  === "active" && pageMatches(leftSlot);
  const showRight = floatingActive && rightSlot?.status === "active" && pageMatches(rightSlot);

  // ── Skyscraper renderer ────────────────────────────────────────────────────
  // NO close button — premium slot, always visible
  const renderSkyscraper = (
    ad: any,
    slot: AdSlot | null,
    adW: number,
    adH: number,
    ref: React.RefObject<HTMLDivElement>,
    side: "left" | "right"
  ) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: side === "left" ? "flex-end" : "flex-start",
          height: "100%", /* Stretch parent container to match full grid content height */
          paddingRight: side === "left" ? "20px" : "0px", /* 20px constant gap next to content */
          paddingLeft: side === "right" ? "20px" : "0px", /* 20px constant gap next to content */
          boxSizing: "border-box",
        }}
      >
        <div
          ref={ref}
          style={{
            width: "100%",
            maxWidth: `${adW}px`, /* Max out at the ad's native width */
            position: "sticky",
            top: `${topOffset}px`, /* Sticky offset from top of viewport */
            display: "flex",
            flexDirection: "column",
            alignSelf: "flex-start", /* Prevent the sticky box itself from stretching */
          }}
        >
          {ad ? (
            /* ── Ad image ── */
            <div
              style={{
                width: "100%",
                height: `${adH}px`,
                border: "none",
                borderRadius: "0px",
                overflow: "hidden",
                background: "#EEEEEE",
                boxShadow: side === "left"
                  ? "4px 0 24px rgba(0,0,0,0.06)"
                  : "-4px 0 24px rgba(0,0,0,0.06)",
              }}
            >
              <a
                href={ad.landingUrl}
                target={ad.targetBlank ? "_blank" : "_self"}
                rel="noreferrer noopener"
                onClick={() => handleClick(ad)}
                style={{ display: "block", width: "100%", height: "100%" }}
                aria-label={ad.altText}
              >
                <img
                  src={ad.imageDesktop}
                  alt={ad.altText}
                  loading="eager"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.25s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLImageElement).style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
                  }}
                />
              </a>
            </div>
          ) : (
            /* ── Skyscraper placeholder container ── */
            <div
              style={{
                width: "100%",
                height: `${adH}px`,
                border: "none",
                background: "#EEEEEE",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                textAlign: "center",
                color: "#64748b",
                fontFamily: "sans-serif",
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", lineHeight: "1.4" }}>
                RUANG IKLAN TERSEDIA
              </span>
              <span style={{ fontSize: "8px", fontWeight: 700, fontFamily: "monospace", color: "#94a3b8", marginTop: "8px" }}>
                {adW}×{adH} px
              </span>
              <span style={{ fontSize: "7px", color: "#94a3b8", marginTop: "4px", textTransform: "uppercase", fontWeight: "bold" }}>
                {slot?.name}
              </span>
            </div>
          )}

          {/* ── Size indicator ── */}
          <div style={{
            textAlign: "center",
            fontSize: "7px",
            color: "#cbd5e1",
            fontFamily: "monospace",
            marginTop: "3px",
            userSelect: "none",
            letterSpacing: "0.05em",
          }}>
            {adW}×{adH} px
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  // If no active floating ads or viewport too narrow → pass-through, no grid
  if (!showLeft && !showRight) {
    return <>{children}</>;
  }

  return (
    <div
      id="premium-floating-ad-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "15% 70% 15%", /* Exact layout: 15% Left, 70% Website Content, 15% Right */
        alignItems: "start",
        justifyContent: "center",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Column 1 (Left 15%) */}
      {showLeft ? (
        renderSkyscraper(leftAd, leftSlot, leftW, leftH, leftImgRef, "left")
      ) : (
        <div aria-hidden="true" role="none" />
      )}

      {/* Column 2 (Center 70%) */}
      <div
        id="website-content-column"
        style={{ minWidth: 0, width: "100%" }}
      >
        {children}
      </div>

      {/* Column 3 (Right 15%) */}
      {showRight ? (
        renderSkyscraper(rightAd, rightSlot, rightW, rightH, rightImgRef, "right")
      ) : (
        <div aria-hidden="true" role="none" />
      )}
    </div>
  );
}
