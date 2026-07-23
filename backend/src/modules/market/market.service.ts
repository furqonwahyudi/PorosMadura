import fs from 'fs';
import path from 'path';
import { logger } from '../../config/logger';

declare const fetch: any;

export interface MarketRate {
  price: number | null;
  change: number | null;
  status: 'up' | 'down' | 'stable';
  updatedAt: string;
}

export interface MarketRates {
  ihsg: MarketRate | null;
  usd: MarketRate | null;
  gold: MarketRate | null;
  crypto: MarketRate | null;
}

export interface MarketSettings {
  enabled: boolean;
  ihsgEnabled: boolean;
  ihsgProvider: string;
  ihsgInterval: number; // in seconds
  usdEnabled: boolean;
  usdProvider: string;
  usdInterval: number; // in seconds
  goldEnabled: boolean;
  goldProvider: string;
  goldInterval: number; // in seconds
  kriptoEnabled: boolean;
  kriptoProvider: string;
  kriptoInterval: number; // in seconds
}

const dataDir = path.resolve(__dirname, '../../../data');
const cachePath = path.join(dataDir, 'market_rates_cache.json');
const settingsPath = path.join(dataDir, 'market_settings.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default initial rates to fallback if fetching fails
const defaultRates: MarketRates = {
  ihsg: { price: 6094.793, change: 0.87, status: 'up', updatedAt: new Date().toISOString() },
  usd: { price: 17975, change: -0.47, status: 'down', updatedAt: new Date().toISOString() },
  gold: { price: 2648766, change: -0.8, status: 'down', updatedAt: new Date().toISOString() },
  crypto: { price: 984500000, change: 1.25, status: 'up', updatedAt: new Date().toISOString() }
};

// Default settings
const defaultSettings: MarketSettings = {
  enabled: true,
  ihsgEnabled: true,
  ihsgProvider: 'yahoo',
  ihsgInterval: 30,
  usdEnabled: true,
  usdProvider: 'yahoo',
  usdInterval: 60,
  goldEnabled: true,
  goldProvider: 'logammulia',
  goldInterval: 60,
  kriptoEnabled: false,
  kriptoProvider: 'yahoo',
  kriptoInterval: 60
};

// Initialize settings file if it doesn't exist
if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
}

// Initialize cache file if it doesn't exist
if (!fs.existsSync(cachePath)) {
  fs.writeFileSync(cachePath, JSON.stringify({
    rates: defaultRates,
    expireAt: 0 // force update on first request
  }, null, 2));
}

let isUpdating = false;

export const MarketService = {
  getSettings(): MarketSettings {
    try {
      if (fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      logger.error('Gagal membaca market settings:', e);
    }
    return defaultSettings;
  },

  updateSettings(settings: Partial<MarketSettings>): MarketSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));
    
    // Force refresh rates cache on settings update
    this.refreshRatesCache(true);
    
    return updated;
  },

  async getRates(): Promise<MarketRates> {
    try {
      if (fs.existsSync(cachePath)) {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        
        // If expired and not already updating, trigger async refresh in background
        if (Date.now() > cacheData.expireAt && !isUpdating) {
          this.refreshRatesCache();
        }
        
        return cacheData.rates;
      }
    } catch (e) {
      logger.error('Gagal membaca market rates cache:', e);
    }
    return defaultRates;
  },

  async refreshRatesCache(force = false) {
    if (isUpdating) return;
    isUpdating = true;
    
    try {
      const settings = this.getSettings();
      
      // Load current cache
      let currentCache = { rates: defaultRates, expireAt: 0 };
      if (fs.existsSync(cachePath)) {
        currentCache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      }

      // If not forced and not expired, skip
      if (!force && Date.now() < currentCache.expireAt) {
        isUpdating = false;
        return;
      }

      logger.info('🔄 Memulai sinkronisasi data pasar finansial real-time...');

      const newRates = { ...currentCache.rates };

      // Helper function to fetch Yahoo Finance Chart data
      const fetchYahooChart = async (ticker: string) => {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data: any = await res.json();
        const result = data.chart?.result?.[0];
        if (!result) throw new Error('Data chart tidak ditemukan');
        
        const closeArr = result.indicators?.quote?.[0]?.close || [];
        const lastClose = [...closeArr].filter((x: any) => x !== null && x !== undefined).pop();
        
        const price = result.meta?.regularMarketPrice ?? lastClose;
        const prevClose = result.meta?.chartPreviousClose ?? result.meta?.previousClose ?? closeArr[0] ?? price;
        
        if (price === undefined || price === null || prevClose === undefined || prevClose === null) {
          throw new Error('Harga regular/previousClose tidak valid');
        }
        
        const change = ((price - prevClose) / prevClose) * 100;
        const status: 'up' | 'down' | 'stable' = change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'stable';
        
        return { price, change, status, updatedAt: new Date().toISOString() };
      };

      // 1. Fetch IHSG
      if (settings.ihsgEnabled) {
        try {
          const ihsgData = await fetchYahooChart('^JKSE');
          newRates.ihsg = ihsgData;
          logger.info(`✓ IHSG Berhasil di-update: ${ihsgData.price} (${ihsgData.change.toFixed(2)}%)`);
        } catch (e: any) {
          logger.warn(`✗ Gagal update IHSG: ${e.message}. Menggunakan cache lama.`);
        }
      }

      // 2. Fetch USD / IDR
      let usdPrice = newRates.usd?.price || 16000; // fallback if fetch fails
      if (settings.usdEnabled) {
        try {
          const usdData = await fetchYahooChart('IDR=X');
          newRates.usd = usdData;
          usdPrice = usdData.price;
          logger.info(`✓ USD/IDR Berhasil di-update: ${usdData.price} (${usdData.change.toFixed(2)}%)`);
        } catch (e: any) {
          logger.warn(`✗ Gagal update USD/IDR: ${e.message}. Menggunakan cache lama.`);
        }
      }

      // 3. Fetch Gold (Antam) via Logam Mulia API or fallback to Math conversion
      if (settings.goldEnabled) {
        let goldFetched = false;
        
        // Try official scraping API
        try {
          const goldUrl = settings.goldProvider === 'pegadaian'
            ? 'https://logam-mulia-api.iamutaki.workers.dev/api/prices/pegadaian'
            : 'https://logam-mulia-api.iamutaki.workers.dev/api/prices/logammulia';
            
          const goldRes = await fetch(goldUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          
          if (goldRes.ok) {
            const goldData: any = await goldRes.json();
            if (goldData.success && Array.isArray(goldData.data)) {
              // Find 1 gram item
              const oneGram = goldData.data.find((item: any) => item.weight === 1 && item.materialType?.toLowerCase().includes('antam'));
              // If not found, find the first item with weight 1
              const item = oneGram || goldData.data.find((item: any) => item.weight === 1) || goldData.data[0];
              
              if (item && item.sellPrice) {
                newRates.gold = {
                  price: item.sellPrice,
                  buybackPrice: item.buybackPrice || Math.round(item.sellPrice * 0.90),
                  change: newRates.gold?.change || 0, // preserve trend change from yahoo if available
                  status: newRates.gold?.status || 'stable',
                  updatedAt: new Date().toISOString()
                };
                goldFetched = true;
                logger.info(`✓ Emas Antam Berhasil di-update dari API Scraper: Beli Rp ${item.sellPrice.toLocaleString('id-ID')}, Jual Rp ${item.buybackPrice?.toLocaleString('id-ID')}`);
              }
            }
          }
        } catch (e: any) {
          logger.warn(`✗ Gagal update Emas Antam via API Scraper: ${e.message}. Mencoba fallback matematis.`);
        }
        
        // Fallback to mathematical spot gold conversion with a premium multiplier of 1.11 (approx. Antam retail premium)
        if (!goldFetched) {
          try {
            const goldUSD = await fetchYahooChart('GC=F');
            // Raw spot conversion: (USD/ounce * USDIDR) / 31.1034768
            const rawSpotPricePerGram = (goldUSD.price * usdPrice) / 31.1034768;
            // Apply 11% manufacturing/logistics/tax premium for retail Antam
            const pricePerGramIDR = Math.round(rawSpotPricePerGram * 1.11);
            
            newRates.gold = {
              price: pricePerGramIDR,
              buybackPrice: Math.round(pricePerGramIDR * 0.905), // Spread ~9.5% to align with Antam buyback
              change: goldUSD.change,
              status: goldUSD.status,
              updatedAt: new Date().toISOString()
            };
            logger.info(`✓ Emas Antam Berhasil di-update (Fallback Matematis): Rp ${pricePerGramIDR.toLocaleString('id-ID')}/g (${goldUSD.change.toFixed(2)}%)`);
          } catch (e: any) {
            logger.warn(`✗ Gagal update Emas Antam: ${e.message}. Menggunakan cache lama.`);
          }
        }
      }

      // 4. Fetch Crypto (BTC / IDR)
      if (settings.kriptoEnabled) {
        try {
          const btcData = await fetchYahooChart('BTC-IDR');
          newRates.crypto = btcData;
          logger.info(`✓ BTC/IDR Berhasil di-update: Rp ${btcData.price.toLocaleString('id-ID')} (${btcData.change.toFixed(2)}%)`);
        } catch (e: any) {
          logger.warn(`✗ Gagal update BTC/IDR: ${e.message}. Menggunakan cache lama.`);
        }
      }

      // Write updated cache with new expireAt timestamp
      const intervals = [
        settings.ihsgEnabled ? settings.ihsgInterval : null,
        settings.usdEnabled ? settings.usdInterval : null,
        settings.goldEnabled ? settings.goldInterval : null,
        settings.kriptoEnabled ? settings.kriptoInterval : null
      ].filter((x): x is number => x !== null && x > 0);
      
      const minIntervalSec = intervals.length > 0 ? Math.min(...intervals) : 60;
      const expireAt = Date.now() + minIntervalSec * 1000;

      fs.writeFileSync(cachePath, JSON.stringify({ rates: newRates, expireAt }, null, 2));
      logger.info('✓ Cache data pasar finansial berhasil diperbarui.');

    } catch (e: any) {
      logger.error('✗ Gagal melakukan sinkronisasi market rates:', e.message);
    } finally {
      isUpdating = false;
    }
  }
};
