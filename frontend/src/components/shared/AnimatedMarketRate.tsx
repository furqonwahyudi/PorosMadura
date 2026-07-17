import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

export interface AnimatedMarketRateProps {
  price: number | null;
  buybackPrice?: number | null;
  change: number | null;
  status: "up" | "down" | "stable";
  prefix?: string;
  isInteger?: boolean;
}

export default function AnimatedMarketRate({ price, buybackPrice, change, status, prefix = "", isInteger = false }: AnimatedMarketRateProps) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevPriceRef = React.useRef<number | null>(price);

  useEffect(() => {
    if (price !== null && prevPriceRef.current !== null && price !== prevPriceRef.current) {
      if (price > prevPriceRef.current) {
        setFlash("up");
      } else if (price < prevPriceRef.current) {
        setFlash("down");
      }
      prevPriceRef.current = price;
      const timer = setTimeout(() => setFlash(null), 1200);
      return () => clearTimeout(timer);
    } else if (price !== null && prevPriceRef.current === null) {
      prevPriceRef.current = price;
    }
  }, [price]);

  if (price === null) {
    return (
      <span className="text-[10px] font-semibold text-gray-400 italic font-sans">
        Data sementara tidak tersedia
      </span>
    );
  }

  const formattedPrice = isInteger
    ? price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formattedBuybackPrice = buybackPrice !== undefined && buybackPrice !== null
    ? (isInteger
        ? buybackPrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : buybackPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    : null;

  const formattedChange = change !== null
    ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
    : "0.00%";

  const textClass = "text-xs sm:text-sm font-black text-slate-900 block font-mono transition-colors duration-300";

  let changeClass = "inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 font-mono transition-all duration-300 ";
  if (status === "up") {
    changeClass += "text-emerald-600 bg-emerald-50";
  } else if (status === "down") {
    changeClass += "text-red-600 bg-red-50";
  } else {
    changeClass += "text-gray-500 bg-gray-50";
  }

  if (formattedBuybackPrice !== null) {
    return (
      <div className="text-right flex flex-col items-end">
        <div className="flex flex-col gap-0.5 mb-1">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Beli:</span>
            <motion.span
              key={price}
              initial={{ y: flash === "up" ? -3 : flash === "down" ? 3 : 0, opacity: 0.8 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                color: flash === "up" ? "#10B981" : flash === "down" ? "#EF4444" : "#0F172A"
              }}
              transition={{ duration: 0.3 }}
              className="text-xs font-black text-slate-900 font-mono"
            >
              {prefix}{formattedPrice}
            </motion.span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jual:</span>
            <span className="text-xs font-black text-slate-600 font-mono">
              {prefix}{formattedBuybackPrice}
            </span>
          </div>
        </div>
        <motion.span 
          animate={{ scale: flash ? [1, 1.05, 1] : 1 }}
          className={changeClass}
        >
          {status === "up" ? "▲" : status === "down" ? "▼" : "▬"} {formattedChange}
        </motion.span>
      </div>
    );
  }

  return (
    <div className="text-right flex flex-col items-end">
      <motion.span
        key={price}
        initial={{ y: flash === "up" ? -3 : flash === "down" ? 3 : 0, opacity: 0.8 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          color: flash === "up" ? "#10B981" : flash === "down" ? "#EF4444" : "#0F172A"
        }}
        transition={{ duration: 0.3 }}
        className={textClass}
      >
        {prefix}{formattedPrice}
      </motion.span>
      <motion.span 
        animate={{ scale: flash ? [1, 1.05, 1] : 1 }}
        className={changeClass}
      >
        {status === "up" ? "▲" : status === "down" ? "▼" : "▬"} {formattedChange}
      </motion.span>
    </div>
  );
}
