          <Route path="/pathologies" element={
            <div className="pt-32 pb-24 min-h-screen" style={{ background: "var(--background)" }}>
              <div className="max-w-7xl mx-auto px-6">
                <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}>
                  ← Retour à l'accueil
                </Link>
                <div className="mb-14">
                  <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Pathologies prises en charge</div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Les grandes familles de pathologies</h2>
                  <p className="text-lg leading-relaxed max-w-3xl" style={{ color: "#6b7c93" }}>
                    L'ITID prend en charge différentes formes de douleurs chroniques et aiguës, en coordination avec votre médecin traitant et les spécialistes référents.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    { title: "Lombalgie chronique", desc: "Douleurs lombaires persistantes, avec ou sans irradiation dans la jambe, liées à l’arthrose, aux disques, au canal lombaire étroit ou à d’autres atteintes du rachis.", icon: "🦴", color: "#fef6f6", borderColor: "#fcdcdc" },
                    { title: "Névralgies d’Arnold", desc: "Douleurs de la nuque et de l’arrière de la tête, souvent en casque, liées à une irritation du nerf d’Arnold, parfois déclenchées par certains mouvements du cou.", icon: "🧠", color: "#f4f8fe", borderColor: "#dbe9fc" },
                    { title: "Syndrome douloureux régional complexe (SDRC)", desc: "Douleur persistante après traumatisme ou chirurgie, avec hypersensibilité, troubles de la peau, de la température et de la mobilité du membre atteint.", icon: "⚡", color: "#fef9f4", borderColor: "#fce9d6" },
                    { title: "Endométriose & douleurs pelviennes", desc: "Douleurs pelviennes parfois très invalidantes, souvent cycliques, associées ou non à des troubles gynécologiques. Prise en charge en lien avec le gynécologue.", icon: "🌸", color: "#fdf4fb", borderColor: "#f9dceb" },
                    { title: "Douleurs articulaires", desc: "Douleurs liées à l’arthrose, aux tendinites, aux conflits articulaires ou aux séquelles de traumatisme, touchant notamment l’épaule, la hanche et le genou.", icon: "🦵", color: "#f4fdf8", borderColor: "#dcf6e9" },
                    { title: "Fibromyalgies", desc: "Douleurs diffuses dans tout le corps, associées à une grande fatigue, des troubles du sommeil et de la concentration. Prise en charge globale.", icon: "🧘", color: "#fcf4fd", borderColor: "#f5dcf6" },
                    { title: "Douleurs neuropathiques", desc: "Brûlures, décharges électriques, fourmillements liés à une atteinte des nerfs ou de la moelle (chirurgie, zona, diabète, lésion centrale...).", icon: "🔥", color: "#fefdf4", borderColor: "#fcf5dc" },
                    { title: "Douleurs post-op et post-trauma", desc: "Douleurs qui persistent plusieurs mois après une chirurgie ou un traumatisme, dépassant le délai habituel de cicatrisation.", icon: "🩹", color: "#f6fefd", borderColor: "#dcf9f6" },
                    { title: "Céphalées et migraines résistantes", desc: "Maux de tête fréquents ou quasi quotidiens, parfois résistants aux traitements habituels, avec un retentissement important.", icon: "🤕", color: "#f8f4fe", borderColor: "#ebdcfc" }
                  ].map((p, i) => (
                    <div key={i} className="group relative rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl" style={{ backgroundColor: p.color, border: "2px solid", borderColor: p.borderColor }}>
                      <div className="absolute -right-8 -bottom-8 text-[10rem] opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 select-none pointer-events-none">{p.icon}</div>
                      <div className="h-48 overflow-hidden">
                        <img src="/image_itid/maladie.jpg" alt={p.title} className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="p-8 relative z-10">
                        <div className="text-4xl mb-4">{p.icon}</div>
                        <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{p.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "#4a5568" }}>{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />

          <Route path="/traitements" element={
            <div className="pt-32 pb-24 min-h-screen" style={{ background: "var(--background)" }}>
              <div className="max-w-7xl mx-auto px-6">
                <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#3bb5a6]" style={{ color: "#6b7c93" }}>
                  ← Retour à l'accueil
                </Link>
                <div className="mb-14">
                  <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#3bb5a6" }}>Nos traitements contre la douleur</div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Principaux traitements interventionnels</h2>
                  <p className="text-lg leading-relaxed max-w-3xl" style={{ color: "#6b7c93" }}>
                    Les traitements présentés ci-dessous ne sont proposés qu'après une évaluation médicale personnalisée et une décision partagée avec vous.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    { title: "Infiltrations rachidiennes et épidurales", desc: "Infiltrations guidées pour soulager des douleurs liées à l’arthrose, tendinites ou séquelles traumatiques (épaule, hanche, genou...).", icon: "💉", color: "#f4fdf8", borderColor: "#dcf6e9" },
                    { title: "Perfusions de lidocaïne", desc: "Perfusion utilisée dans certaines douleurs chroniques, notamment neuropathiques ou diffuses, lorsque les traitements classiques sont insuffisants.", icon: "💧", color: "#f4f8fe", borderColor: "#dbe9fc" },
                    { title: "Stimulation du ganglion dorsal", desc: "Technique de neuromodulation proposée dans certaines douleurs neuropathiques sévères ou SDRC/algodystrophies résistantes.", icon: "⚙️", color: "#fef9f4", borderColor: "#fce9d6" },
                    { title: "Cryoneurolyse", desc: "Traitement visant à diminuer une douleur localisée ou une spasticité par action ciblée sur certains nerfs.", icon: "❄️", color: "#f6fefd", borderColor: "#dcf9f6" },
                    { title: "RTMS", desc: "Technique non invasive agissant sur les circuits de la douleur et certaines douleurs chroniques rebelles.", icon: "🧲", color: "#f8f4fe", borderColor: "#ebdcfc" },
                    { title: "Blocs anesthésiques péri-nerveux", desc: "Injection ciblée d’anesthésique près d’un nerf responsable de la douleur. Peuvent soulager rapidement certaines douleurs.", icon: "🎯", color: "#fef6f6", borderColor: "#fcdcdc" },
                    { title: "Radio-fréquence", desc: "Traitement qui utilise des ondes de radio-fréquence pour agir sur la transmission nerveuse de la douleur.", icon: "📻", color: "#fdf4fb", borderColor: "#f9dceb" },
                    { title: "Toxine botulique", desc: "Peut être utilisée à visée antalgique dans certaines douleurs musculaires ou neuropathiques, après évaluation.", icon: "🧪", color: "#fcf4fd", borderColor: "#f5dcf6" },
                    { title: "TENS", desc: "Dispositif portable qui stimule la peau par de faibles impulsions électriques. Diminue certaines douleurs chroniques.", icon: "⚡", color: "#fefdf4", borderColor: "#fcf5dc" },
                    { title: "Cathéter péri-nerveux", desc: "Petit cathéter placé près d’un nerf pour délivrer un anesthésique local sur plusieurs heures ou jours.", icon: "🪡", color: "#f6fefd", borderColor: "#dcf9f6" },
                    { title: "Patch de capsaïcine (Qutenza®)", desc: "Patch antalgique à base de capsaïcine, indiqué dans certaines douleurs neuropathiques localisées.", icon: "🌶️", color: "#fef6f6", borderColor: "#fcdcdc" },
                    { title: "Hypnose par réalité virtuelle (HypnoVR)", desc: "Association d’hypnose médicale et de réalité virtuelle pour réduire douleur, anxiété ou inconfort lors de certains soins.", icon: "🥽", color: "#f4f8fe", borderColor: "#dbe9fc" },
                    { title: "Stimulation médullaire", desc: "Technique de neuromodulation indiquée dans certaines douleurs chroniques sévères résistantes.", icon: "🔌", color: "#fef9f4", borderColor: "#fce9d6" }
                  ].map((t, i) => (
                    <div key={i} className="group relative rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl" style={{ backgroundColor: t.color, border: "2px solid", borderColor: t.borderColor }}>
                      <div className="absolute -right-8 -bottom-8 text-[10rem] opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 select-none pointer-events-none">{t.icon}</div>
                      <div className="h-48 overflow-hidden">
                        <img src="/image_itid/seringue.jpg" alt={t.title} className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="p-8 relative z-10">
                        <div className="text-4xl mb-4">{t.icon}</div>
                        <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "#4a5568" }}>{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />
