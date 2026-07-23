import React, { useState, useEffect } from "react";
import { CheckCircle, Save, BarChart2, Coins, Calendar } from "lucide-react";
import { adminApi } from "../../../lib/adminApi";

interface MarketRates {
  ihsg: { price: number | null; change: number | null; status: string; updatedAt: string } | null;
  usd: { price: number | null; change: number | null; status: string; updatedAt: string } | null;
  gold: { price: number | null; buybackPrice?: number | null; change: number | null; status: string; updatedAt: string } | null;
  crypto: { price: number | null; change: number | null; status: string; updatedAt: string } | null;
}

export default function MarketWidgetPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Cache Rates Preview
  const [marketRates, setMarketRates] = useState<MarketRates>({
    ihsg: null,
    usd: null,
    gold: null,
    crypto: null
  });

  // Settings State
  const [enabled, setEnabled] = useState(true);
  const [ihsgEnabled, setIhsgEnabled] = useState(true);
  const [ihsgProvider, setIhsgProvider] = useState("yahoo");
  const [ihsgInterval, setIhsgInterval] = useState(30);

  const [usdEnabled, setUsdEnabled] = useState(true);
  const [usdProvider, setUsdProvider] = useState("yahoo");
  const [usdInterval, setUsdInterval] = useState(60);

  const [goldEnabled, setGoldEnabled] = useState(true);
  const [goldProvider, setGoldProvider] = useState("logammulia");
  const [goldInterval, setGoldInterval] = useState(60);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch Settings & Rates in parallel
        const [settingsRes, ratesRes] = await Promise.all([
          adminApi.get<{ success: boolean; data: any }>("/api/market/settings"),
          adminApi.get<{ success: boolean; data: any }>("/api/market/rates")
        ]);

        if (settingsRes.success && settingsRes.data) {
          const s = settingsRes.data;
          setEnabled(s.enabled ?? true);
          setIhsgEnabled(s.ihsgEnabled ?? true);
          setIhsgProvider(s.ihsgProvider ?? "yahoo");
          setIhsgInterval(s.ihsgInterval ?? 30);

          setUsdEnabled(s.usdEnabled ?? true);
          setUsdProvider(s.usdProvider ?? "yahoo");
          setUsdInterval(s.usdInterval ?? 60);

          setGoldEnabled(s.goldEnabled ?? true);
          setGoldProvider(s.goldProvider ?? "logammulia");
          setGoldInterval(s.goldInterval ?? 60);
        }

        if (ratesRes.success && ratesRes.data) {
          setMarketRates(ratesRes.data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Gagal memuat data market widget:", err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-refresh rates in background every 15 seconds
  useEffect(() => {
    let active = true;
    let pollingInterval: NodeJS.Timeout | null = null;

    const pollRates = async () => {
      try {
        const ratesRes = await adminApi.get<{ success: boolean; data: any }>("/api/market/rates");
        if (active && ratesRes.success && ratesRes.data) {
          setMarketRates(ratesRes.data);
        }
      } catch (err) {
        console.error("Gagal melakukan polling market rates:", err);
      }
    };

    // Setup polling interval
    pollingInterval = setInterval(() => {
      pollRates();
    }, 15000);

    return () => {
      active = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.put("/api/market/settings", {
        enabled,
        ihsgEnabled,
        ihsgProvider,
        ihsgInterval,
        usdEnabled,
        usdProvider,
        usdInterval,
        goldEnabled,
        goldProvider,
        goldInterval
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // Reload rates cache to show updated data instantly
      const ratesRes = await adminApi.get<{ success: boolean; data: any }>("/api/market/rates");
      if (ratesRes.success && ratesRes.data) {
        setMarketRates(ratesRes.data);
      }
    } catch (err) {
      console.error("Gagal menyimpan pengaturan market:", err);
      alert("Gagal menyimpan pengaturan market.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500 font-medium">
        Memuat pengaturan market widget...
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in text-[#2D3748]">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 margin-0">
          Financial &amp; Market Live Ticker Feed Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Konfigurasikan aliran data pasar keuangan langsung (Ticker Feed) pada header portal berita
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex gap-2 items-center max-w-[600px] shadow-sm">
          <CheckCircle size={16} className="text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-800">
            Pengaturan market widget berhasil disimpan dan cache sistem telah diperbarui.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* Row 1: Cache Preview & Public Visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card: Nilai Terakhir di Cache (Sistem) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nilai Terakhir di Cache (Sistem)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* IHSG box */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-between min-h-[95px]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">IHSG</span>
                  <span className="text-base font-black text-slate-800 block mt-1.5 font-mono">
                    {marketRates.ihsg?.price !== null && marketRates.ihsg?.price !== undefined
                      ? marketRates.ihsg.price.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                      : "6.094,793"}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 block">
                  Provider: <span className="underline">YAHOO</span>
                </span>
              </div>

              {/* USD / IDR box */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-between min-h-[95px]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">USD / IDR</span>
                  <span className="text-base font-black text-slate-800 block mt-1.5 font-mono">
                    {marketRates.usd?.price !== null && marketRates.usd?.price !== undefined
                      ? `Rp ${marketRates.usd.price.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : "Rp 17.975"}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 block">
                  Provider: <span className="underline">YAHOO</span>
                </span>
              </div>

              {/* EMAS LM ANTAM box */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-between min-h-[95px]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">EMAS LM ANTAM</span>
                  <div className="flex flex-col gap-0.5 mt-1.5 font-mono">
                    <span className="text-xs font-bold text-slate-800 block">
                      Beli: <span className="font-black">Rp {marketRates.gold?.price !== null && marketRates.gold?.price !== undefined
                        ? marketRates.gold.price.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                        : "2.648.766"}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 block">
                      Jual: <span className="font-black">Rp {marketRates.gold?.buybackPrice !== null && marketRates.gold?.buybackPrice !== undefined
                        ? marketRates.gold.buybackPrice.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                        : "2.357.052"}</span>
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 block">
                  Provider: <span className="underline">LOGAMMULIA</span>
                </span>
              </div>

            </div>
          </div>

          {/* Card: Visibilitas Publik */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Visibilitas Publik
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Tentukan apakah widget informasi finansial ditampilkan kepada pengunjung beranda publik.
              </p>
            </div>
            
            <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 rounded-lg p-3 mt-4">
              <span className="text-xs font-bold text-slate-700">Status Widget</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={enabled} 
                  onChange={(e) => setEnabled(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D2B5C]"></div>
              </label>
            </div>
          </div>

        </div>

        {/* Row 2: Adapter & Cron Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pengaturan Adapter Provider &amp; Integrasi Cron Job
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            
            {/* Card 1: Indeks IHSG */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 relative min-h-[260px]">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 block"></span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Indeks IHSG</h3>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={ihsgEnabled} 
                    onChange={(e) => setIhsgEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  Indeks harga saham gabungan Bursa Efek Indonesia (IDX).
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Provider select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Provider Aktif (Adapter)
                  </label>
                  <select
                    value={ihsgProvider}
                    onChange={(e) => setIhsgProvider(e.target.value)}
                    disabled={!ihsgEnabled}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 outline-none focus:border-violet-400 disabled:opacity-50"
                  >
                    <option value="yahoo">Yahoo Finance API (Utama)</option>
                    <option value="reserve">ReserveAdapter (Cadangan Lokal)</option>
                  </select>
                </div>

                {/* Interval update */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Interval Update (Cron)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={ihsgInterval}
                      onChange={(e) => setIhsgInterval(Number(e.target.value))}
                      disabled={!ihsgEnabled}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-12 text-xs text-slate-700 font-mono outline-none focus:border-violet-400 disabled:opacity-50"
                      min={5}
                    />
                    <span className="absolute right-3 text-[10px] font-bold text-slate-400 uppercase">detik</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: USD / IDR RUPIAH */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 relative min-h-[260px]">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">USD / IDR RUPIAH</h3>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={usdEnabled} 
                    onChange={(e) => setUsdEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  Nilai tukar mata uang dollar amerika serikat terhadap rupiah Indonesia.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Provider select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Provider Aktif (Adapter)
                  </label>
                  <select
                    value={usdProvider}
                    onChange={(e) => setUsdProvider(e.target.value)}
                    disabled={!usdEnabled}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 outline-none focus:border-emerald-400 disabled:opacity-50"
                  >
                    <option value="yahoo">Yahoo Finance (Utama)</option>
                    <option value="exchangerate.host">exchangerate.host</option>
                    <option value="twelvedata">TwelveData (API Key)</option>
                    <option value="fixer">Fixer.io (API Key)</option>
                    <option value="openexchangerates">Open Exchange Rates (API Key)</option>
                    <option value="reserve">ReserveAdapter (Cadangan Lokal)</option>
                  </select>
                </div>

                {/* Interval update */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Interval Update (Cron)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={usdInterval}
                      onChange={(e) => setUsdInterval(Number(e.target.value))}
                      disabled={!usdEnabled}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-12 text-xs text-slate-700 font-mono outline-none focus:border-emerald-400 disabled:opacity-50"
                      min={5}
                    />
                    <span className="absolute right-3 text-[10px] font-bold text-slate-400 uppercase">detik</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: EMAS ANTAM LM */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 relative min-h-[260px]">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 block"></span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">EMAS ANTAM LM</h3>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={goldEnabled} 
                    onChange={(e) => setGoldEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  Harga emas batangan Logam Mulia sertifikasi Antam Indonesia (per gram).
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Provider select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Provider Aktif (Adapter)
                  </label>
                  <select
                    value={goldProvider}
                    onChange={(e) => setGoldProvider(e.target.value)}
                    disabled={!goldEnabled}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 outline-none focus:border-amber-400 disabled:opacity-50"
                  >
                    <option value="logammulia">Logam Mulia Scraping (Utama)</option>
                    <option value="pegadaian">Pegadaian Scraping (Cadangan)</option>
                    <option value="reserve">ReserveAdapter (Cadangan Lokal)</option>
                  </select>
                </div>

                {/* Interval update */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Interval Update (Cron)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={goldInterval}
                      onChange={(e) => setGoldInterval(Number(e.target.value))}
                      disabled={!goldEnabled}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-12 text-xs text-slate-700 font-mono outline-none focus:border-amber-400 disabled:opacity-50"
                      min={5}
                    />
                    <span className="absolute right-3 text-[10px] font-bold text-slate-400 uppercase">detik</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-2">
          <button 
            type="submit" 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D2B5C] hover:bg-[#0f3670] active:bg-[#0a2149] text-white rounded-lg cursor-pointer font-semibold text-xs transition-all duration-200 shadow-sm shadow-blue-900/10"
          >
            <CheckCircle size={15} /> 
            Simpan Pengaturan Market
          </button>
        </div>

      </form>
    </div>
  );
}
