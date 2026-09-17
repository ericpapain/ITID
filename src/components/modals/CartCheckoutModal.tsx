import { ShimmerButton } from "../ui/ShimmerButton";
import type { Video } from "../../data";
import { useTranslation } from "react-i18next";

interface CartCheckoutModalProps {
  showCartCheckoutModal: boolean;
  setShowCartCheckoutModal: (v: boolean) => void;
  cart: Video[];
  setCart: React.Dispatch<React.SetStateAction<Video[]>>;
  setPurchasedFormations: React.Dispatch<React.SetStateAction<Video[]>>;
}

export function CartCheckoutModal({
  showCartCheckoutModal,
  setShowCartCheckoutModal,
  cart,
  setCart,
  setPurchasedFormations,
}: CartCheckoutModalProps) {
  const { t } = useTranslation();

  if (!showCartCheckoutModal) return null;

  const total = cart.reduce((acc, item) => {
    const priceVal = parseFloat(item.price.replace(/[^0-9,.-]/g, "").replace(",", "."));
    return acc + (isNaN(priceVal) ? 0 : priceVal);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2440]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setShowCartCheckoutModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors z-10"
        >
          ✕
        </button>

        <div className="p-6 border-b border-gray-100 bg-[#f0f7f6]">
          <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#2a9d8f" }}>
            {t('checkout.title')}
          </div>
          <h3 className="text-base font-semibold leading-snug" style={{ color: "#f8fafc" }}>
            {t('checkout.subtitle', { count: cart.length })}
          </h3>
        </div>

        <div className="px-6 py-4 flex justify-between items-center text-sm font-semibold border-b border-gray-100">
          <span style={{ color: "#cbd5e1" }}>{t('checkout.total')}</span>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>
            {total} €
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="pt-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#f8fafc" }}>
              {t('checkout.paymentInfo')}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('checkout.cardNumber')}
                className="w-full px-3 py-2.5 pl-10 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💳</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                type="text"
                placeholder="MM/AA"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all"
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all"
              />
            </div>
          </div>

          <ShimmerButton
            onClick={() => {
              alert(t('checkout.success'));
              setPurchasedFormations((prev) => {
                const newFormations = cart.filter((c) => !prev.some((p) => p.id === c.id));
                return [...prev, ...newFormations];
              });
              setCart([]);
              setShowCartCheckoutModal(false);
            }}
            className="w-full py-3.5 mt-2 rounded-xl shadow-md"
          >
            {t('checkout.payBtn')}
          </ShimmerButton>

          <p className="text-center text-[10px] text-gray-400 mt-2">
            {t('checkout.secure')}
          </p>
        </div>
      </div>
    </div>
  );
}
