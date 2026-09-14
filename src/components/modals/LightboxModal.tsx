import { ITID_IMAGES } from "../../constants/carousel";

interface LightboxModalProps {
  lightboxIndex: number | null;
  setLightboxIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export function LightboxModal({ lightboxIndex, setLightboxIndex }: LightboxModalProps) {
  if (lightboxIndex === null) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={() => setLightboxIndex(null)}
    >
      <button
        onClick={() => setLightboxIndex(null)}
        className="absolute top-6 right-6 text-white text-4xl opacity-70 hover:opacity-100 transition-opacity"
      >
        &times;
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setLightboxIndex((prev) => (prev! - 1 + ITID_IMAGES.length) % ITID_IMAGES.length);
        }}
        className="absolute left-4 md:left-10 text-white text-6xl opacity-60 hover:opacity-100 transition-opacity select-none p-4"
      >
        &lsaquo;
      </button>

      <img
        src={`/image_itid/${ITID_IMAGES[lightboxIndex]}`}
        alt={`Galerie image ${lightboxIndex + 1}`}
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          setLightboxIndex((prev) => (prev! + 1) % ITID_IMAGES.length);
        }}
        className="absolute right-4 md:right-10 text-white text-6xl opacity-60 hover:opacity-100 transition-opacity select-none p-4"
      >
        &rsaquo;
      </button>
    </div>
  );
}
