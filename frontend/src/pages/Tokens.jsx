import React, { useState, useMemo, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import { TrendingUp, TrendingDown, ArrowUpRight, Search, Loader2 } from "lucide-react";
import TokenIcon from "../components/ui/TokenIcon";

const TokenCard = memo(({ token, onClick }) => (
  <div 
    className="luxe-card p-6 flex flex-col group relative overflow-hidden cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
    onClick={onClick}
  >
     <div className="flex justify-between items-start mb-6 relative z-10">
        <TokenIcon symbol={token.symbol} />
        {!token.isSearchRes ? (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-full ${token.change >= 0 ? 'bg-[#16C784]/10 text-[#16C784]' : 'bg-[#FF5A5A]/10 text-[#FF5A5A]'}`}>
            {token.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(token.change || 0).toFixed(2)}%
          </div>
        ) : (
          <div className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-white/5 text-muted">New Asset</div>
        )}
     </div>

     <div className="relative z-10">
        <h3 className="text-lg font-black tracking-tight text-theme leading-none mb-1">{token.symbol}</h3>
        <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-6">USDT Pair</p>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-2xl font-black tracking-tighter text-theme">
              {token.price > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(token.price) : "---"}
            </p>
          </div>
          <button className="w-10 h-10 rounded-2xl bg-theme text-bg flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg">
            <ArrowUpRight size={18} strokeWidth={3} />
          </button>
        </div>
     </div>
     <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#E9B3A2]/5 rounded-full blur-2xl group-hover:bg-[#E9B3A2]/10 transition-all" />
  </div>
));

export default function Tokens() {
  const { marketData, updateSingleAsset } = useWalletStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [limit, setLimit] = useState(12);
  const [isSearching, setIsSearching] = useState(false);

  // Handle live search for any coin on market
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`http://localhost:5000/api/search?q=${search}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const tokenList = useMemo(() => {
    const baseList = Object.keys(marketData).map(symbol => {
      const data = marketData[symbol] || {};
      return {
        ...data,
        id: symbol,
        symbol: symbol.replace("USDT", ""),
        price: data.price || 0,
        change: data.change || 0,
      };
    });

    if (search.length > 1) {
      // Prioritize local data, then add search results that aren't in local
      const filtered = baseList.filter(t => t.symbol.toLowerCase().includes(search.toLowerCase()));
      const searchIds = new Set(filtered.map(t => t.id));
      
      searchResults.forEach(res => {
        if (!searchIds.has(res.symbol)) {
          filtered.push({
            id: res.symbol,
            symbol: res.baseAsset,
            price: 0,
            change: 0,
            isSearchRes: true
          });
        }
      });
      return filtered;
    }

    return baseList.slice(0, limit);
  }, [marketData, search, searchResults, limit]);

  const hasMore = Object.keys(marketData).length > limit && search.length <= 1;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-theme">Live Market</h1>
          <p className="text-muted font-bold uppercase text-[10px] tracking-[0.2em]">Real-time tracking of 5,000+ global assets</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96 group">
            <Search size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? "text-accent animate-pulse" : "text-muted"}`} />
            <input 
              type="text" 
              placeholder="Search any coin (e.g. PEPE, LINK)..." 
              className="bg-surface border border-theme rounded-[24px] py-4 pl-14 pr-6 outline-none focus:border-accent/40 transition-all w-full text-sm text-theme shadow-lg group-focus-within:ring-4 ring-accent-light"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isSearching && <Loader2 size={16} className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-accent" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {tokenList.map((token) => (
          <div 
            key={token.id} 
            className="luxe-card p-6 flex flex-col group relative overflow-hidden cursor-pointer hover:bg-secondary transition-all"
            onClick={() => navigate(`/coin/${token.id}`)}
          >
             <div className="flex justify-between items-start mb-6 relative z-10">
                <TokenIcon symbol={token.symbol} />
                {!token.isSearchRes ? (
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-full ${token.change >= 0 ? 'bg-[#16C784]/10 text-[#16C784]' : 'bg-[#FF5A5A]/10 text-[#FF5A5A]'}`}>
                    {token.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(token.change).toFixed(2)}%
                  </div>
                ) : (
                  <div className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-secondary text-muted">New Asset</div>
                )}
             </div>

             <div className="relative z-10">
                <h3 className="text-lg font-black tracking-tight text-theme leading-none mb-1">{token.symbol}</h3>
                <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-6">USDT Pair</p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-black tracking-tighter text-theme">
                      {token.price > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(token.price) : "---"}
                    </p>
                  </div>
                  <button className="w-10 h-10 rounded-2xl bg-theme text-bg-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg">
                    <ArrowUpRight size={18} strokeWidth={3} />
                  </button>
                </div>
             </div>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-light rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={() => setLimit(l => l + 12)}
            className="px-10 py-4 bg-surface border border-theme rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all"
          >
            Load More Assets
          </button>
        </div>
      )}

      {tokenList.length === 0 && !isSearching && (
        <div className="col-span-full py-40 text-center">
           <p className="text-muted font-black uppercase tracking-[0.3em]">No assets found for "{search}"</p>
        </div>
      )}
    </div>
  );
}
