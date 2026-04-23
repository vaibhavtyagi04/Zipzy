// pages/NFTs.jsx
import { motion } from "framer-motion";
import { Plus, Search, Filter, ExternalLink } from "lucide-react";
import Card from "../components/ui/Card";

const nfts = [
  { id: 1, name: "Zipzy Genesis #001", collection: "Zipzy Pass", image: "https://api.dicebear.com/7.x/shapes/svg?seed=nft1&backgroundColor=ab9ff2" },
  { id: 2, name: "Cyber Voyager", collection: "Voyagers", image: "https://api.dicebear.com/7.x/shapes/svg?seed=nft2&backgroundColor=d4ff75" },
  { id: 3, name: "Abstract Node", collection: "Nodes", image: "https://api.dicebear.com/7.x/shapes/svg?seed=nft3&backgroundColor=0ea5e9" },
  { id: 4, name: "Glitch Entity", collection: "Glitch", image: "https://api.dicebear.com/7.x/shapes/svg?seed=nft4&backgroundColor=f43f5e" },
];

export default function NFTs() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Collectibles</h1>
          <p className="text-gray-500 font-bold">Manage your NFT portfolio across networks</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-phantom-purple transition-colors" />
            <input 
              type="text" 
              placeholder="Search NFTs..." 
              className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-phantom-purple/20 transition-all w-full md:w-64 text-sm"
            />
          </div>
          <button className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
            <Filter size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map((nft, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={nft.id}
          >
            <Card className="p-0 group cursor-pointer overflow-hidden border-white/5 hover:border-phantom-purple/20 transition-all">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <button className="w-full py-3 bg-white text-black font-black text-xs rounded-xl shadow-2xl flex items-center justify-center gap-2">
                    <ExternalLink size={14} />
                    View on Explorer
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-black text-phantom-purple uppercase tracking-[0.2em] mb-1">{nft.collection}</p>
                <h3 className="font-black text-lg tracking-tight group-hover:text-phantom-purple transition-colors">{nft.name}</h3>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Add NFT Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="aspect-square rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 hover:border-phantom-purple/30 hover:bg-phantom-purple/5 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={32} className="text-gray-500 group-hover:text-phantom-purple" />
          </div>
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Receive NFT</span>
        </motion.div>
      </div>
    </div>
  );
}
