import React, { useState } from "react";

const TokenIcon = ({ symbol, src, size = "w-14 h-14", className = "" }) => {
  const [error, setError] = useState(false);
  // Using CoinCap for high quality icons
  const iconUrl = src || `https://assets.coincap.io/assets/icons/${symbol?.toLowerCase()}@2x.png`;

  return (
    <div className={`${size} rounded-2xl bg-[#E9B3A2]/10 flex items-center justify-center text-[#E9B3A2] text-xl font-bold overflow-hidden shadow-inner shrink-0 ${className}`}>
      {!error && (src || symbol) ? (
        <img 
          src={iconUrl} 
          alt={symbol} 
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span>{symbol?.substring(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
};

export default TokenIcon;
