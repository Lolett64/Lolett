export function TopBar() {
    return (
        <div className="bg-[#1B0B94] text-[#F3EFEA] text-[9px] uppercase tracking-[0.3em] font-medium py-2.5 overflow-hidden flex whitespace-nowrap relative z-[100] border-b border-[#B89547]/30">
            <div className="animate-[marquee_30s_linear_infinite] flex items-center gap-12 opacity-90 hover:opacity-100 transition-opacity">
                {/* We repeat the phrase multiple times for a seamless marquee effect */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-12">
                        <span>Livraison offerte dès 100€</span>
                        <span className="w-1 h-1 rounded-full bg-[#B89547]" />
                        <span>Retours gratuits (30 jours)</span>
                        <span className="w-1 h-1 rounded-full bg-[#B89547]" />
                        <span>Paiement 100% sécurisé</span>
                        <span className="w-1 h-1 rounded-full bg-[#B89547]" />
                        <span>Design exclusif Bordeaux</span>
                        <span className="w-1 h-1 rounded-full bg-[#B89547]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
