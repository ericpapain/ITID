import { User, Mail, Phone, RotateCcw } from "lucide-react";
import { SpotlightInput } from "../ui/SpotlightInput";
import { ShimmerButton } from "../ui/ShimmerButton";
import { BackgroundBeams } from "../animations/BackgroundBeams";
import { useContactForm } from "../../hooks/useContactForm";
import { useTranslation } from "react-i18next";

export function ContactSection() {
  const { t } = useTranslation();
  const { formData, setFormData, sent, loading, error, handleSubmit, resetForm } = useContactForm();

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
            <div className="flex gap-3 items-start">
              <span className="text-base shrink-0 mt-0.5">📍</span>
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "#2a9d8f" }}>{t('contact.address')}</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#1a3a5c" }}>ITID-France</div>
                    <a href="https://maps.google.com/?q=25+Avenue+des+Mailles,+10800+Saint-Julien-les-Villas" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline whitespace-pre-line block" style={{ color: "#1a3a5c" }}>
                      25 Avenue des Mailles, 10800 Saint-Julien-les-Villas
                    </a>
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#1a3a5c" }}>Polyclinique Montier la Celle</div>
                    <a href="https://maps.google.com/?q=17+Rue+Charles+Baltet,+10120+Saint-André-les-Vergers" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline whitespace-pre-line block" style={{ color: "#1a3a5c" }}>
                      17 Rue Charles Baltet, 10120 Saint-André-les-Vergers
                    </a>
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#1a3a5c" }}>
                      <a href="https://www.elsan.care/fr/clinique-paul-picquet" target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Clinique Paul Picquet
                      </a>
                    </div>
                    <a href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x47ef1aa6e14374df:0x3eabf289bc82f0ab?sa=X&ved=1t:8290&ictx=111" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline whitespace-pre-line block" style={{ color: "#1a3a5c" }}>
                      12 Rue Pierre Castets, 89100 Sens
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {[
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
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100/90 border border-emerald-300 flex items-center justify-center text-3xl shadow-sm">
                ✅
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                {t('contact.sentTitle')}
              </h3>
              <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                {t('contact.sentDesc')}
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 cursor-pointer"
                style={{ background: "#2a9d8f" }}
              >
                <RotateCcw className="w-4 h-4" />
                {t('contact.sendNew')}
              </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#1a3a5c]/85">{t('contact.youAre')}</label>
                  <select
                    className="w-full px-3.5 py-3 rounded-xl text-sm outline-none cursor-pointer bg-white text-[#1a3a5c] font-medium border border-slate-300 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 shadow-sm transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    <option value={t('contact.patient')} className="text-black">{t('contact.patient')}</option>
                    <option value={t('contact.pro')} className="text-black">{t('contact.pro')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#1a3a5c]/85">{t('contact.subjectLabel')}</label>
                  <select
                    required
                    className="w-full px-3.5 py-3 rounded-xl text-sm outline-none cursor-pointer bg-white text-[#1a3a5c] font-medium border border-slate-300 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 shadow-sm transition-all"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  >
                    <option value={t('contact.subjects.urgent')}>{t('contact.subjects.urgent')}</option>
                    <option value={t('contact.subjects.firstConsult')}>{t('contact.subjects.firstConsult')}</option>
                    <option value={t('contact.subjects.followUp')}>{t('contact.subjects.followUp')}</option>
                    <option value={t('contact.subjects.technique')}>{t('contact.subjects.technique')}</option>
                    <option value={t('contact.subjects.peer')}>{t('contact.subjects.peer')}</option>
                    <option value={t('contact.subjects.insurance')}>{t('contact.subjects.insurance')}</option>
                    <option value={t('contact.subjects.training')}>{t('contact.subjects.training')}</option>
                    <option value={t('contact.subjects.other')}>{t('contact.subjects.other')}</option>
                  </select>
                </div>
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
                <label className="block text-xs font-semibold mb-1.5 text-[#1a3a5c]/85">{t('contact.message')}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={t('contact.messagePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-white text-[#1a3a5c] font-medium border border-slate-300 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 placeholder:text-slate-400 shadow-sm transition-all"
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
