import { ShimmerButton } from "../ui/ShimmerButton";
import type { Video } from "../../data";

interface CartModalProps {
  showCartModal: boolean;
  setShowCartModal: (v: boolean) => void;
  cart: Video[];
  setCart: React.Dispatch<React.SetStateAction<Video[]>>;
  setShowCartCheckoutModal: (v: boolean) => void;
}

export function CartModal({ showCartModal, setShowCartModal, cart, setCart, setShowCartCheckoutModal }: CartModalProps) {
  if (!showCartModal) return null;

  const total = cart.reduce((acc, item) => {
    const priceVal = parseFloat(item.price.replace(/[^0-9,.-]/g, "").replace(",", "."));
    return acc + (isNaN(priceVal) ? 0 : priceVal);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2440]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#f0f7f6] flex items-center justify-center text-xl">🛒</div>
            <button onClick={() => setShowCartModal(false)} className="text-[#cbd5e1] hover:text-[#f8fafc] text-xl font-bold">×</button>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-[#f8fafc]" style={{ fontFamily: "var(--font-display)" }}>Mon Panier</h2>

          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#cbd5e1] mb-4">Votre panier est vide.</p>
              <button onClick={() => setShowCartModal(false)} className="px-6 py-3 bg-gray-100 text-[#f8fafc] font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Explorer les formations
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <img src={item.img} alt={item.title} className="w-20 h-14 object-cover rounded-lg shadow-sm" />
                  <div className="flex-1">
                    <h4 className="font-bold text-[#f8fafc] text-sm line-clamp-2">{item.title}</h4>
                    <div className="text-xs text-[#cbd5e1] mt-1">{item.duration}</div>
                  </div>
                  <div className="font-bold text-[#2a9d8f]">{item.price}</div>
                  <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 p-2">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-100 shrink-0">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#cbd5e1] font-semibold">Total à régler</span>
              <span className="text-2xl font-bold text-[#f8fafc]">{total} €</span>
            </div>
            <ShimmerButton
              onClick={() => { setShowCartModal(false); setShowCartCheckoutModal(true); }}
              className="w-full py-4 rounded-xl text-base shadow-lg"
            >
              Passer la commande
            </ShimmerButton>
          </div>
        )}
      </div>
    </div>
  );
}
