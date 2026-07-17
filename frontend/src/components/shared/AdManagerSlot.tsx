import React, { useState, useEffect, useRef } from "react";
import { useAdSystem } from "../../context/AdContext";
import { Ad, AdSlot } from "../../types";
import { X } from "lucide-react";

interface AdManagerSlotProps {
  slug: string;
  page: string;
  category?: string | null;
  paragraphIndex?: number;
}

export default function AdManagerSlot({ slug, page, category, paragraphIndex }: AdManagerSlotProps) {
  const { getAdForSlot, adSlots, trackImpression, trackClick } = useAdSystem();
  const [ad, setAd] = useState<Ad | null>(null);
  const [slotInfo, setSlotInfo] = useState<AdSlot | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef<string | null>(null);

  // Load target Ad and Slot configurations
  useEffect(() => {
    const slotObj = adSlots.find(s => s.slug === slug);
    setSlotInfo(slotObj || null);

    if (slotObj && slotObj.status === "inactive") {
      setAd(null);
      return;
    }

    // Page-match check: slot must be configured for the current page (or "all")
    if (slotObj && slotObj.page) {
      const allowedPages = slotObj.page.split(",").map(p => p.trim().toLowerCase());
      const currentPageNorm = page.trim().toLowerCase();
      const pageAllowed =
        allowedPages.includes("all") ||
        allowedPages.includes(currentPageNorm);
      if (!pageAllowed) {
        setAd(null);
        return;
      }
    }

    const matchedAd = getAdForSlot(slug, page, category);
    setAd(matchedAd);

    // If popup format with a close countdown (e.g. 5 seconds)
    if (matchedAd && slug === "popup-interstitial") {
      setCountdown(5);
    }
  }, [slug, page, category, adSlots, getAdForSlot]);

  // Countdown timer logic for Popups
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Lazy load with IntersectionObserver to track impressions
  useEffect(() => {
    if (!ad || isClosed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && trackedRef.current !== ad.id) {
          trackedRef.current = ad.id;
          trackImpression(ad.id);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [ad, isClosed, trackImpression]);

  // Handle ad click tracking
  const handleAdClick = (e: React.MouseEvent) => {
    if (ad) {
      trackClick(ad.id);
    }
  };

  if (isClosed) return null;
  if (!slotInfo || slotInfo.status === "inactive") return null;

  // Page-match guard: hide entire slot (even placeholder) if this page is not configured
  if (slotInfo.page) {
    const allowedPages = slotInfo.page.split(",").map(p => p.trim().toLowerCase());
    const currentPageNorm = page.trim().toLowerCase();
    const pageAllowed =
      allowedPages.includes("all") ||
      allowedPages.includes(currentPageNorm);
    if (!pageAllowed) return null;
  }

  // Render placeholder if no active campaign ad is assigned to this active slot
  if (!ad) {
    if (
      slug === "popup-interstitial" || 
      slug === "mobile-anchor-banner" || 
      slug === "floating-left-skyscraper" || 
      slug === "floating-right-skyscraper"
    ) {
      return null;
    }

    const [wStr, hStr] = slotInfo.size.split("x");
    const wVal = Number(wStr);
    const hVal = Number(hStr);

    const placeholderStyle: React.CSSProperties = {
      minHeight: `${hVal}px`,
      maxWidth: `${wVal}px`,
    };

    return (
      <div 
        ref={containerRef}
        style={placeholderStyle}
        className={`w-full mx-auto my-3 flex flex-col items-center justify-center bg-[#EEEEEE] text-gray-400 select-none p-4 text-center${slug.startsWith("mobile-") ? " md:hidden" : ""}`}
      >
        <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-gray-500">
          RUANG IKLAN TERSEDIA ({slotInfo.size})
        </span>
        <span className="text-[8px] font-sans tracking-wide text-gray-400 mt-1 uppercase font-bold">
          Slot: {slotInfo.name}
        </span>
      </div>
    );
  }

  // Determine size layout
  const [widthStr, heightStr] = slotInfo ? slotInfo.size.split("x") : ["728", "90"];
  const widthVal = Number(widthStr);
  const heightVal = Number(heightStr);

  const slotStyle: React.CSSProperties = {
    minHeight: slotInfo?.type !== "popup" && slotInfo?.type !== "interstitial" ? `${heightVal}px` : "auto",
    maxWidth: slotInfo?.type !== "popup" && slotInfo?.type !== "interstitial" ? `${widthVal}px` : "100%",
  };

  const isMobileSlot = slug.startsWith("mobile-");
  const responsiveClass = isMobileSlot ? " md:hidden" : "";

  // 1. Popup Overlay Format
  if (slug === "popup-interstitial") {
    return (
      <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
        <div className="bg-white overflow-hidden shadow-2xl relative max-w-lg w-full flex flex-col items-center p-5 border border-gray-100 animate-scale-up">
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-[10px] font-mono tracking-wider font-bold text-gray-400 bg-gray-100 px-2 py-0.5 uppercase">SPONSORED POPUP</span>
            <button 
              disabled={countdown !== null && countdown > 0}
              onClick={() => setIsClosed(true)}
              className="p-1 text-gray-500 hover:text-red-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              {countdown !== null && countdown > 0 ? (
                <span className="text-xs font-mono font-bold text-gray-400">Tutup dalam {countdown}s</span>
              ) : (
                <X size={18} />
              )}
            </button>
          </div>
          
          <a href={ad.landingUrl} target={ad.targetBlank ? "_blank" : "_self"} rel="noreferrer" onClick={handleAdClick} className="block w-full">
            <img 
              src={ad.imageDesktop} 
              alt={ad.altText} 
              className="w-full h-auto object-contain max-h-[400px]"
            />
          </a>
        </div>
      </div>
    );
  }

  // 2. Floating Skyscrapers are now rendered exclusively by FloatingAdLayout.tsx
  //    (position:sticky inside CSS Grid, not position:fixed overlapping content).
  //    Returning null here prevents double-rendering.
  if (slug === "floating-left-skyscraper" || slug === "floating-right-skyscraper") {
    return null;
  }

  // 3. Anchor Mobile Sticky Bottom
  if (slug === "mobile-anchor-banner") {
    return (
      <div 
        ref={containerRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 shadow-xl flex flex-col items-center"
      >
        <div className="flex justify-between items-center w-full bg-slate-900 text-white text-[9px] font-mono font-bold px-3 py-1 select-none">
          <span>IKLAN SPONSOR MOBILE</span>
          <button onClick={() => setIsClosed(true)} className="hover:text-red-400 cursor-pointer"><X size={12} /></button>
        </div>
        <div className="w-full flex justify-center py-1.5 px-2 bg-gray-50">
          <a href={ad.landingUrl} target={ad.targetBlank ? "_blank" : "_self"} rel="noreferrer" onClick={handleAdClick} className="block w-full max-w-[320px] h-[50px]">
            <img src={ad.imageMobile || ad.imageDesktop} alt={ad.altText} className="w-full h-full object-cover" />
          </a>
        </div>
      </div>
    );
  }

  // 4. In Article paragraphs, leaderboards, standard layouts
  return (
    <div 
      ref={containerRef}
      style={slotStyle}
      className={`w-full mx-auto my-3 relative bg-[#EEEEEE] p-0 shadow-2xs${responsiveClass}`}
    >
      <div className="w-full sticky top-[88px] flex flex-col justify-center items-center">
        {slotInfo?.closeButton && (
          <div className="w-full flex justify-end items-center mb-1 text-[8px] font-mono font-bold text-gray-400 select-none px-1">
            <button onClick={() => setIsClosed(true)} className="hover:text-red-500 cursor-pointer flex items-center gap-0.5">
              <X size={10} />
              <span>Tutup</span>
            </button>
          </div>
        )}

        <div className="w-full flex justify-center items-center">
        {ad.format === "image" && (
          <a 
            href={ad.landingUrl} 
            target={ad.targetBlank ? "_blank" : "_self"} 
            rel="noreferrer" 
            onClick={handleAdClick}
            className="block w-full text-center"
          >
            <picture>
              {ad.imageMobile && <source media="(max-width: 767px)" srcSet={ad.imageMobile} />}
              <img 
                src={ad.imageDesktop} 
                alt={ad.altText} 
                className="mx-auto max-w-full h-auto object-contain hover:opacity-98 transition-opacity"
              />
            </picture>
          </a>
        )}

        {ad.format === "adsense" && ad.htmlCode && (
          <div 
            dangerouslySetInnerHTML={{ __html: ad.htmlCode }} 
            className="w-full flex justify-center" 
          />
        )}

        {ad.format === "html" && ad.htmlCode && (
          <div 
            dangerouslySetInnerHTML={{ __html: ad.htmlCode }} 
            className="w-full flex justify-center" 
          />
        )}

        {ad.format === "javascript" && ad.scriptCode && (
          <div className="w-full flex justify-center">
            {/* Safe mock representation of Javascript tag rendering in react */}
            <div className="border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center w-full text-[11px] font-mono text-gray-500">
              [ Dynamic JS Ad Container: {ad.name} ]
            </div>
          </div>
        )}

        {ad.format === "video" && (
          <div className="w-full max-w-3xl aspect-video overflow-hidden bg-black shadow">
            <video 
              controls 
              muted 
              className="w-full h-full object-cover"
              onClick={handleAdClick}
            >
              <source src={ad.imageDesktop} type="video/mp4" />
              Browser Anda tidak mendukung tag video.
            </video>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

