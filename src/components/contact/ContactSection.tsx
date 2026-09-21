import { User, Mail, Phone } from "lucide-react";
import { SpotlightInput } from "../ui/SpotlightInput";
import { ShimmerButton } from "../ui/ShimmerButton";
import { BackgroundBeams } from "../animations/BackgroundBeams";
import { useContactForm } from "../../hooks/useContactForm";
import { useTranslation } from "react-i18next";

export function ContactSection() {
  const { t } = useTranslation();
  const { formData, setFormData, sent, loading, error, handleSubmit } = useContactForm();

  return (
    <section id="contact" className="relative py-12 overflow-hidden" style={{ background: "var(--background)" }}>
      <BackgroundBeams />
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-start">
        <div>
          <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>
            {t('contact.subtitle')}
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
            {t('contact.title')}
          </h2>
          <p className="text-base mb-8 leading-relaxed" style={{ color: "#6b7c93" }}>
            {t('contact.desc')}
          </p>

          <div className="space-y-4 mb-8">
            {[
              { icon: "📍 ", label: t('contact.address'), val: t('contact.addressVal') },
              { icon: "📞", label: t('contact.phone'), val: t('contact.phoneVal') },
              { icon: "🕒", label: t('contact.hours'), val: t('contact.hoursVal') },
              { icon: "📅", label: t('contact.appointment'), val: t('contact.appointmentVal') },
            ].map((c) => (
              <div key={c.label} className="flex gap-3 items-start">
                <span className="text-base shrink-0 mt-0.5">{c.icon}</span>
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: "#2a9d8f" }}>{c.label}</div>
                  <div className="text-sm font-medium whitespace-pre-line" style={{ color: "#1a3a5c" }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://www.doctolib.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "#2a9d8f" }}
          >
            {t('contact.doctolibBtn')}
          </a>
        </div>

        <div className="rounded-2xl p-8 relative overflow-hidden bg-[#e8f4f2]/80 backdrop-blur-xl border border-[#2a9d8f]/30 shadow-xl">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                {t('contact.sentTitle')}
              </h3>
              <p className="text-sm text-gray-600">{t('contact.sentDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <h3 className="text-lg font-bold mb-4 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                {t('contact.formTitle')}
              </h3>

              {error && (
                <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              {/* Champ Honeypot invisible pour stopper les robots */}
              <input
                type="text"
                name="_website_hp"
                value={formData._website_hp || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, _website_hp: e.target.value }))}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#1a3a5c]/80">{t('contact.youAre')}</label>
                <select
                  className="w-full px-3 py-3 rounded-xl text-sm outline-none cursor-pointer bg-white/60 text-[#1a3a5c] border border-[#2a9d8f]/20 focus:border-[#48d1c2] shadow-sm backdrop-blur-md"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value={t('contact.patient')} className="text-black">{t('contact.patient')}</option>
                  <option value={t('contact.pro')} className="text-black">{t('contact.pro')}</option>
                </select>
              </div>

              <div className="space-y-3">
                {[
                  { name: "name" as const, label: t('contact.fullName'), type: "text", icon: User },
                  { name: "email" as const, label: t('contact.email'), type: "email", icon: Mail },
                  { name: "phone" as const, label: t('contact.phoneField'), type: "tel", icon: Phone },
                ].map((f) => (
                  <SpotlightInput
                    key={f.name}
                    label={f.label}
                    type={f.type}
                    icon={f.icon}
                    required
                    value={formData[f.name]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  />
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#1a3a5c]/80">{t('contact.message')}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={t('contact.messagePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-white/60 text-[#1a3a5c] border border-[#2a9d8f]/20 focus:border-[#48d1c2] placeholder:text-gray-400 transition-colors shadow-sm backdrop-blur-md"
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <ShimmerButton
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  t('buttons.send')
                )}
              </ShimmerButton>

              <p className="text-xs text-center text-gray-500 mt-2">{t('contact.gdpr')}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
