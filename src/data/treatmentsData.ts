// ======================================================================
// ITID France || Données Canoniques des Traitements (Fiches Médicales Détaillées)
// Contenu médical riche pré-rempli garantissant zéro perte et zéro régression
// ======================================================================

export interface TreatmentDetailedItem {
  id: number;
  slug: string;
  num: string;
  icon: string;
  title_fr: string;
  title_en: string;
  desc_front_fr: string;
  desc_front_en: string;
  desc_back_fr: string;
  desc_back_en: string;
  card_image: string;
  hero_gallery: string[];
  section1_title_fr: string;
  section1_title_en: string;
  section1_text_fr: string;
  section1_text_en: string;
  section1_image: string;
  section1_image_position?: "left" | "right" | "none";
  section2_title_fr: string;
  section2_title_en: string;
  section2_text_fr: string;
  section2_text_en: string;
  section2_image: string;
  section2_image_position?: "left" | "right" | "none";
  section3_title_fr: string;
  section3_title_en: string;
  section3_text_fr: string;
  section3_text_en: string;
  section3_image: string;
  section3_image_position?: "left" | "right" | "none";
  section4_title_fr: string;
  section4_title_en: string;
  section4_text_fr: string;
  section4_text_en: string;
  section4_image: string;
  section4_image_position?: "left" | "right" | "none";
  sections?: Array<{
    id: string;
    badge?: string;
    title_fr?: string;
    title_en?: string;
    text_fr?: string;
    text_en?: string;
    image?: string;
    image_position?: "left" | "right" | "none";
  }>;
  cta_text_fr?: string;
  cta_text_en?: string;
  cta_url?: string;
  display_order: number;
  is_active: number;
}

export const DEFAULT_TRAITEMENTS: TreatmentDetailedItem[] = [
  {
    id: 1,
    slug: "infiltrations-rachidiennes",
    num: "01",
    icon: "💉",
    title_fr: "Infiltrations épidurales & rachidiennes",
    title_en: "Epidural & Spinal Targeted Injections",
    desc_front_fr: "Injection ciblée de corticoïdes sous guidage radiologique ou échographique pour éteindre l'inflammation du nerf comprimé.",
    desc_front_en: "Targeted corticosteroid injection under imaging guidance to extinguish inflammation of compressed spinal nerves.",
    desc_back_fr: "Les infiltrations épidurales et foraminales permettent d'amener une dose minimale de produit anti-inflammatoire directement au contact de la racine nerveuse enflammée. Réalisées en ambulatoire sous anesthésie locale.",
    desc_back_en: "Epidural and transforaminal injections deliver concentrated anti-inflammatory medication directly to the inflamed spinal root under local anesthesia in day-hospital.",
    card_image: "/images/treatments/infiltrations_rachidiennes.jpg",
    hero_gallery: [
      "/images/treatments/infiltrations_rachidiennes.jpg",
      "/images/lombalgie.jpg",
      "/images/glowing_3d_spine.jpg"
    ],
    section1_title_fr: "Indications Précises",
    section1_title_en: "Key Indications",
    section1_text_fr: "Lombosciatiques par hernie discale, sténose du canal lombaire étroit, cruralgies hyperalgiques réfractaires aux antalgiques oraux de palier 2 ou 3.",
    section1_text_en: "Sciatica caused by herniated disc, spinal stenosis, refractory cruralgia unresponsive to level 2 or 3 pain medications.",
    section1_image: "/images/treatments/infiltrations_rachidiennes.jpg",
    section1_image_position: "left",

    section2_title_fr: "Déroulement du Geste",
    section2_title_en: "Procedure Workflow",
    section2_text_fr: "Réalisée sous contrôle scopique en salle d'intervention stérile. Une injection de produit de contraste iodé valide le placement millimétrique avant administration du traitement.",
    section2_text_en: "Performed in an interventional suite under continuous fluoroscopy. Radiographic contrast confirms millimeter precision before medication delivery.",
    section2_image: "/images/lombalgie.jpg",
    section2_image_position: "right",

    section3_title_fr: "Efficacité & Suites",
    section3_title_en: "Expected Outcomes",
    section3_text_fr: "Soulagement ressenti sous 48 à 72 heures. Repos recommandé le jour même, reprise normale des activités dès le lendemain avec gain fonctionnel durable.",
    section3_text_en: "Pain relief begins within 48 to 72 hours. Rest recommended on the same day, resumption of light activities the next day.",
    section3_image: "/images/glowing_3d_spine.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Concernées",
    section4_title_en: "Target Pathologies",
    section4_text_fr: "Lombalgie chronique, sciatique, hernie discale lombaire, arthrose vertébrale.",
    section4_text_en: "Chronic low back pain, sciatica, lumbar disc herniation, spinal arthrosis.",
    section4_image: "/images/spine_isolated.png",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 1,
    is_active: 1
  },
  {
    id: 2,
    slug: "infiltrations-articulaires",
    num: "02",
    icon: "🦵",
    title_fr: "Infiltrations articulaires écho-guidées",
    title_en: "Ultrasound-Guided Joint Injections",
    desc_front_fr: "Injections de corticoïdes ou d'acide hyaluronique pour restaurer la mobilité et calmer l'arthrose.",
    desc_front_en: "Corticosteroid or hyaluronic acid injections restoring mobility and suppressing joint inflammation.",
    desc_back_fr: "Le repérage échographique haute résolution garantit une pénétration intra-articulaire directe sans léser les tendons adjacents. Idéal pour hanches, genoux et épaules.",
    desc_back_en: "High-resolution real-time ultrasound guidance ensures perfect intra-articular needle entry without injury to adjacent tendons.",
    card_image: "/images/treatments/infiltrations_articulaires.jpg",
    hero_gallery: [
      "/images/treatments/infiltrations_articulaires.jpg",
      "/images/douleurs_articulaires.jpg"
    ],
    section1_title_fr: "Indications Thérapeutiques",
    section1_title_en: "Therapeutic Indications",
    section1_text_fr: "Gonarthrose sévère, coxarthrose douloureuse, omarthrose et capsulites rétractiles de l'épaule.",
    section1_text_en: "Severe knee osteoarthritis, painful hip arthrosis, shoulder arthritis, and adhesive capsulitis.",
    section1_image: "/images/treatments/infiltrations_articulaires.jpg",
    section1_image_position: "left",

    section2_title_fr: "Avantages de l'Échoguidage",
    section2_title_en: "Advantages of Ultrasound Guidance",
    section2_text_fr: "Zéro irradiation, visualisation en direct des vaisseaux sanguins et contrôle dynamique de la diffusion du produit.",
    section2_text_en: "Zero radiation, real-time visualization of adjacent vessels, and dynamic confirmation of medicine dispersion.",
    section2_image: "/images/glowing_3d_spine.jpg",
    section2_image_position: "right",

    section3_title_fr: "Bénéfices & Durabilité",
    section3_title_en: "Durability & Benefits",
    section3_text_fr: "Amélioration fonctionnelle durant 6 à 12 mois, diminution de la prise d'anti-inflammatoires oraux et protection du capital articulaire.",
    section3_text_en: "Functional relief lasting 6 to 12 months, reduced reliance on oral NSAIDs, and joint preservation.",
    section3_image: "/images/treatments/infiltrations_rachidiennes.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Associées",
    section4_title_en: "Associated Conditions",
    section4_text_fr: "Douleurs articulaires de hanche, genou et épaule, suites de prothèses douloureuses.",
    section4_text_en: "Shoulder, hip, and knee chronic joint pain, persistent discomfort after prosthesis.",
    section4_image: "/images/douleurs_articulaires.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 2,
    is_active: 1
  },
  {
    id: 3,
    slug: "perfusion-lidocaine",
    num: "03",
    icon: "💧",
    title_fr: "Perfusions antalgiques de Lidocaïne & Kétamine",
    title_en: "Intravenous Lidocaine & Ketamine Infusions",
    desc_front_fr: "Perfusions intraveineuses sous surveillance continue pour réinitialiser les circuits hypersensibilisés de la douleur.",
    desc_front_en: "Monitored intravenous infusions to reset hypersensitized central and peripheral pain pathways.",
    desc_back_fr: "Protocole hospitalier ambulatoire de 2 à 4 heures sous monitorage cardiaque continu pour briser les crises hyperalgiques sévères et rebelles.",
    desc_back_en: "Day-care protocol under continuous cardiac monitoring designed to interrupt severe refractory hyperalgesia and central pain storms.",
    card_image: "/images/treatments/perfusion_lidocaine.jpg",
    hero_gallery: [
      "/images/treatments/perfusion_lidocaine.jpg",
      "/images/spine_isolated.png"
    ],
    section1_title_fr: "Indications",
    section1_title_en: "Indications",
    section1_text_fr: "SDRC (Algodystrophie), fibromyalgie sévère, douleurs neuropathiques diffuses, céphalées de tension réfractaires.",
    section1_text_en: "CRPS, severe fibromyalgia, diffuse refractory neuropathic pain, and intractable headache flares.",
    section1_image: "/images/treatments/perfusion_lidocaine.jpg",
    section1_image_position: "left",

    section2_title_fr: "Déroulement Sécurisé",
    section2_title_en: "Safety & Monitoring",
    section2_text_fr: "Administration par pousse-seringue électrique en chambre individuelle de repos avec présence infirmière dédiée et casque de réalité virtuelle de relaxation.",
    section2_text_en: "Infusion pump delivery in private recovery suite with dedicated nurse monitoring and virtual reality relaxation headset.",
    section2_image: "/images/treatments/radiofrequence.jpg",
    section2_image_position: "right",

    section3_title_fr: "Effet Reset Cérébral",
    section3_title_en: "Central Reset Effect",
    section3_text_fr: "Diminution drastique de l'allodynie et de l'hyperpathie, sensation de soulagement profond et durable sur plusieurs semaines.",
    section3_text_en: "Dramatic reduction in allodynia and hyperpathia, delivering profound relief sustained over multiple weeks.",
    section3_image: "/images/nevralgie_arnold.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Cibles",
    section4_title_en: "Targeted Conditions",
    section4_text_fr: "SDRC, Fibromyalgie, Douleurs neuropathiques chroniques.",
    section4_text_en: "CRPS, Fibromyalgia, Chronic neuropathic pain syndromes.",
    section4_image: "/images/sdrc.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 3,
    is_active: 1
  },
  {
    id: 4,
    slug: "radiofrequence",
    num: "04",
    icon: "🔥",
    title_fr: "Radiofréquence pulsée & thermique",
    title_en: "Pulsed & Thermal Radiofrequency",
    desc_front_fr: "Neuromodulation de haute précision par ondes de radiofréquence pour bloquer durablement la transmission de la douleur.",
    desc_front_en: "High-precision radiofrequency waves targeting sensory nerves to durably interrupt pain conduction.",
    desc_back_fr: "Technique mini-invasive permettant de désactiver de façon ciblée les récepteurs douloureux sans affecter la motricité. Efficacité de 6 à 24 mois.",
    desc_back_en: "Minimally invasive intervention selectively desensitizing pain transmitters without motor deficit, providing 6 to 24 months of relief.",
    card_image: "/images/treatments/radiofrequence.jpg",
    hero_gallery: [
      "/images/treatments/radiofrequence.jpg",
      "/images/treatments/blocs_anesthesiques.jpg"
    ],
    section1_title_fr: "Indications Principales",
    section1_title_en: "Key Indications",
    section1_text_fr: "Arthrose facettaire lombaire et cervicale, névralgie d'Arnold, douleurs sacro-iliaques, nerfs géniculés du genou.",
    section1_text_en: "Lumbar and cervical facet arthrosis, Arnold's occipital neuralgia, sacroiliac pain, genicular knee nerves.",
    section1_image: "/images/treatments/radiofrequence.jpg",
    section1_image_position: "left",

    section2_title_fr: "Déroulement de la Procédure",
    section2_title_en: "Procedure Protocol",
    section2_text_fr: "Réalisé au bloc sous anesthésie locale et contrôle scopique. Une sonde millimétrique délivre un courant ciblé à température contrôlée pendant 90 secondes.",
    section2_text_en: "Performed under local anesthesia and fluoroscopy. A micro-probe delivers controlled-temperature waves for 90 seconds per target.",
    section2_image: "/images/sdrc.jpg",
    section2_image_position: "right",

    section3_title_fr: "Bénéfices",
    section3_title_en: "Long-Term Benefits",
    section3_text_fr: "Soulagement majeur et pérenne (jusqu'à 2 ans), renouvelable en toute sécurité.",
    section3_text_en: "Major long-lasting relief (up to 2 years), safely repeatable when needed.",
    section3_image: "/images/treatments/hypnovr.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Associées",
    section4_title_en: "Related Conditions",
    section4_text_fr: "Lombalgies, Névralgies d'Arnold, Douleurs articulaires.",
    section4_text_en: "Lower back pain, Occipital neuralgia, Joint pain.",
    section4_image: "/images/nevralgie_arnold.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 4,
    is_active: 1
  },
  {
    id: 5,
    slug: "cryoneurolyse",
    num: "05",
    icon: "❄️",
    title_fr: "Cryoneurolyse percutanée",
    title_en: "Percutaneous Cryoneurolysis",
    desc_front_fr: "Application contrôlée de froid extrême (-70°C) pour interrompre la conduction douloureuse des nerfs périphériques.",
    desc_front_en: "Controlled extreme cold application (-70°C) to interrupt peripheral nerve pain conduction reversibly.",
    desc_back_fr: "La cryoneurolyse détruit la gaine de myéline sans léser l'architecture conjonctive du nerf, garantissant une régénération saine tout en offrant une analgésie prolongée.",
    desc_back_en: "Cryoneurolysis disrupts myelin without damaging nerve connective architecture, allowing clean nerve regeneration while providing months of pain relief.",
    card_image: "/images/treatments/cryoneurolyse.jpg",
    hero_gallery: [
      "/images/treatments/cryoneurolyse.jpg",
      "/images/migraine.jpg"
    ],
    section1_title_fr: "Mode d'Action du Froid Extrême",
    section1_title_en: "Cold Action Mode",
    section1_text_fr: "Une sonde de cryo-analgésie forme une bille de glace à son extrémité (-70°C) créant une axonomésis réversible.",
    section1_text_en: "A micro-probe generates a controlled ice ball at -70°C inducing reversible axonotmesis without neuroma risk.",
    section1_image: "/images/treatments/cryoneurolyse.jpg",
    section1_image_position: "left",

    section2_title_fr: "Indications de Choix",
    section2_title_en: "Prime Indications",
    section2_text_fr: "Névralgies d'Arnold rebelles, douleurs post-thoracotomie, névromes cicatriciels post-chirurgicaux, douleurs du nerf pudendal.",
    section2_text_en: "Refractory occipital neuralgia, post-thoracotomy pain, painful surgical scar neuromas, and pudendal nerve entrapment.",
    section2_image: "/images/douleurs_post_op.jpg",
    section2_image_position: "right",

    section3_title_fr: "Sécurité & Résultats",
    section3_title_en: "Safety & Durability",
    section3_text_fr: "Soulagement immédiat post-procédure durant en moyenne 6 à 9 mois.",
    section3_text_en: "Immediate procedural relief lasting on average 6 to 9 months.",
    section3_image: "/images/treatments/patch_capsaicine.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Liées",
    section4_title_en: "Linked Conditions",
    section4_text_fr: "Névralgie d'Arnold, Douleurs post-opératoires.",
    section4_text_en: "Arnold neuralgia, Post-surgical pain.",
    section4_image: "/images/treatments/blocs_anesthesiques.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 5,
    is_active: 1
  },
  {
    id: 6,
    slug: "rtms",
    num: "06",
    icon: "🧠",
    title_fr: "Stimulation Magnétique Transcrânienne (rTMS)",
    title_en: "Repetitive Transcranial Magnetic Stimulation",
    desc_front_fr: "Modulation non invasive des circuits cérébraux de la douleur chronique par impulsions magnétiques indolores.",
    desc_front_en: "Non-invasive modulation of cerebral chronic pain circuits via painless magnetic field pulses.",
    desc_back_fr: "Séances courtes de 20 minutes ciblant le cortex moteur pour réactiver les voies descendantes inhibitrices de la douleur. Sans anesthésie ni effets secondaires sédatifs.",
    desc_back_en: "Brief 20-minute outpatient sessions targeting the motor cortex to reactivate natural descending pain inhibition pathways without medication side-effects.",
    card_image: "/images/treatments/rtms.jpg",
    hero_gallery: [
      "/images/treatments/rtms.jpg",
      "/images/fibromyalgie.jpg"
    ],
    section1_title_fr: "Principe de la rTMS",
    section1_title_en: "rTMS Biological Principle",
    section1_text_fr: "Une bobine magnétique posée sur le cuir chevelu délivre des champs magnétiques focalisés stimulant la neuroplasticité cérébrale.",
    section1_text_en: "A focal magnetic coil placed over the scalp induces mild electrical micro-currents restoring adaptive brain neuroplasticity.",
    section1_image: "/images/treatments/rtms.jpg",
    section1_image_position: "left",

    section2_title_fr: "Protocole de Traitement",
    section2_title_en: "Treatment Schedule",
    section2_text_fr: "Cure initiale de 5 à 10 séances consécutives, puis séances d'entretien espacées selon l'évolution clinique.",
    section2_text_en: "Induction protocol of 5 to 10 daily sessions followed by spaced maintenance sessions tailored to response.",
    section2_image: "/images/fibromyalgie.jpg",
    section2_image_position: "right",

    section3_title_fr: "Indications Recommandées",
    section3_title_en: "Recommended Indications",
    section3_text_fr: "Fibromyalgie, douleurs neuropathiques centrales (post-AVC, lésions médullaires), migraines chroniques et douleurs faciales atypiques.",
    section3_text_en: "Fibromyalgia, central neuropathic pain (post-stroke, spinal cord injury), chronic migraine, and atypical facial pain.",
    section3_image: "/images/migraine.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Concernées",
    section4_title_en: "Target Pathologies",
    section4_text_fr: "Fibromyalgie, Douleurs neuropathiques, Migraines.",
    section4_text_en: "Fibromyalgia, Neuropathic pain, Migraines.",
    section4_image: "/images/treatments/hypnovr.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 6,
    is_active: 1
  },
  {
    id: 7,
    slug: "blocs-anesthesiques",
    num: "07",
    icon: "🎯",
    title_fr: "Blocs Anesthésiques Diagnostiques & Thérapeutiques",
    title_en: "Diagnostic & Therapeutic Nerve Blocks",
    desc_front_fr: "Infiltrations sélectives de repérage pour cartographier et neutraliser le nerf responsable de la crise douloureuse.",
    desc_front_en: "Targeted sensory nerve blocks to pinpoint and neutralize the exact nerve pathway responsible for pain flares.",
    desc_back_fr: "Véritable clé de voûte de l'algologie de précision : confirme formellement l'origine anatomique de la souffrance avant de proposer une thérapeutique pérenne (radiofréquence, cryothérapie).",
    desc_back_en: "The cornerstone of precision algology: confirms the anatomical pain driver before scheduling long-term interventions like radiofrequency or cryoneurolysis.",
    card_image: "/images/treatments/blocs_anesthesiques.jpg",
    hero_gallery: [
      "/images/treatments/blocs_anesthesiques.jpg",
      "/images/nevralgie_arnold.jpg"
    ],
    section1_title_fr: "Objectif Diagnostique & Thérapeutique",
    section1_title_en: "Diagnostic & Therapeutic Value",
    section1_text_fr: "Permet de vérifier en temps réel si l'anesthésie sélective du nerf ciblé procure une baisse d'au moins 50% à 80% du score de douleur.",
    section1_text_en: "Evaluates immediate pain reduction (at least 50-80% relief) following selective target nerve desensitization.",
    section1_image: "/images/treatments/blocs_anesthesiques.jpg",
    section1_image_position: "left",

    section2_title_fr: "Nerfs Fréquemment Ciblés",
    section2_title_en: "Frequently Targeted Nerves",
    section2_text_fr: "Grand nerf occipital d'Arnold, nerf supra-scapulaire, nerf fémoro-cutané, branches médiales facettaires et ganglion sphéno-palatin.",
    section2_text_en: "Arnold's occipital nerve, suprascapular nerve, lateral femoral cutaneous nerve, facet medial branches, and sphenopalatine ganglion.",
    section2_image: "/images/nevralgie_arnold.jpg",
    section2_image_position: "right",

    section3_title_fr: "Technique Échoguidée Sécurisée",
    section3_title_en: "Safe Ultrasound Technique",
    section3_text_fr: "Guidage visuel millimétrique sans risque vasculaire ni musculaire.",
    section3_text_en: "Millimeter visual guidance eliminating vascular or muscular trauma.",
    section3_image: "/images/sdrc.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Liées",
    section4_title_en: "Associated Conditions",
    section4_text_fr: "Névralgie d'Arnold, Migraines, Douleurs articulaires.",
    section4_text_en: "Occipital neuralgia, Migraines, Joint pain.",
    section4_image: "/images/treatments/radiofrequence.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 7,
    is_active: 1
  },
  {
    id: 8,
    slug: "stimulation-ganglion-dorsal",
    num: "08",
    icon: "⚙️",
    title_fr: "Stimulation du Ganglion Spinal (DRG)",
    title_en: "Dorsal Root Ganglion Stimulation (DRG)",
    desc_front_fr: "Neuromodulation de haute précision ciblant les foyers de douleurs neuropathiques focales isolées.",
    desc_front_en: "High-precision neuromodulation targeting isolated focal neuropathic pain generators.",
    desc_back_fr: "Cible anatomique majeure située dans le foramen vertébral, le ganglion spinal permet de soulager des zones précises (pied, aine, genou, bassin) inaccessibles à la stimulation médullaire standard.",
    desc_back_en: "The dorsal root ganglion serves as a prime relay station in the neural foramen, enabling targeted relief for localized zones unreachable by classic spinal cord stimulation.",
    card_image: "/images/treatments/stimulation_ganglion_dorsal.jpg",
    hero_gallery: [
      "/images/treatments/stimulation_ganglion_dorsal.jpg",
      "/images/sdrc.jpg"
    ],
    section1_title_fr: "Précision Anatomique DRG",
    section1_title_en: "DRG Anatomical Targeting",
    section1_text_fr: "Des électrodes ultra-fines sont positionnées directement au contact du ganglion spinal de la racine nerveuse responsable du foyer douloureux.",
    section1_text_en: "Micro-electrodes are placed precisely adjacent to the dorsal root ganglion mediating the exact painful dermatome.",
    section1_image: "/images/treatments/stimulation_ganglion_dorsal.jpg",
    section1_image_position: "left",

    section2_title_fr: "Indications Spécifiques",
    section2_title_en: "Specific Indications",
    section2_text_fr: "SDRC du pied ou de la main, névralgie ilio-inguinale post-hernie, douleurs post-prothèse de genou rebelles.",
    section2_text_en: "Foot or hand CRPS, post-herniorrhaphy ilio-inguinal neuralgia, refractory persistent knee replacement pain.",
    section2_image: "/images/sdrc.jpg",
    section2_image_position: "right",

    section3_title_fr: "Phase de Test Préalable",
    section3_title_en: "Preliminary Trial Period",
    section3_text_fr: "Période de test de 7 à 10 jours avec électrode externe pour valider le bénéfice avant implantation définitive sous-cutanée.",
    section3_text_en: "A 7-to-10-day trial with external generator validates clinical efficacy before permanent subcutaneous implantation.",
    section3_image: "/images/treatments/infiltrations_rachidiennes.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Concernées",
    section4_title_en: "Target Pathologies",
    section4_text_fr: "SDRC, Douleurs neuropathiques, Douleurs post-opératoires.",
    section4_text_en: "CRPS, Neuropathic pain, Post-surgical pain.",
    section4_image: "/images/spine_isolated.png",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 8,
    is_active: 1
  },
  {
    id: 9,
    slug: "toxine-botulique",
    num: "09",
    icon: "🔬",
    title_fr: "Injections de Toxine Botulique Médicale",
    title_en: "Medical Botulinum Toxin Injections",
    desc_front_fr: "Traitement spécialisé selon protocole PREEMPT pour migraine chronique et spasmes musculaires algiques sévères.",
    desc_front_en: "Specialized PREEMPT protocol injections for chronic migraine and refractory painful muscle spasm.",
    desc_back_fr: "La toxine botulique inhibe la libération des neuropeptides inflammatoires périphériques (CGRP, substance P) et bloque la transmission centrale des céphalées et spasmes réfractaires.",
    desc_back_en: "Botulinum toxin inhibits sensory neuropeptide release (CGRP, substance P) and interrupts peripheral pain inputs in refractory chronic migraine.",
    card_image: "/images/treatments/toxine_botulique.jpg",
    hero_gallery: [
      "/images/treatments/toxine_botulique.jpg",
      "/images/migraine.jpg"
    ],
    section1_title_fr: "Protocole International PREEMPT",
    section1_title_en: "PREEMPT Protocol",
    section1_text_fr: "Micro-injections précises réparties sur 31 sites péricrâniens et cervicaux pour désamorcer les boucles douloureuses trigémino-vasculaires.",
    section1_text_en: "Precise micro-injections across 31 pericranial and cervical muscle sites to defuse trigeminovascular pain circuits.",
    section1_image: "/images/treatments/toxine_botulique.jpg",
    section1_image_position: "left",

    section2_title_fr: "Indications Médicales",
    section2_title_en: "Medical Indications",
    section2_text_fr: "Migraine chronique (>15 jours de maux de tête par mois), contractures myo-fasciales cervicales sévères, spasmes algiques rebelles.",
    section2_text_en: "Chronic migraine (>15 monthly headache days), severe cervical myofascial spasms, and refractory muscle hypertonia.",
    section2_image: "/images/migraine.jpg",
    section2_image_position: "right",

    section3_title_fr: "Fréquence & Efficacité",
    section3_title_en: "Schedule & Efficacy",
    section3_text_fr: "Séances trimestrielles procurant une baisse moyenne de 60 à 75% du nombre de crises et des prises médicamenteuses.",
    section3_text_en: "Quarterly treatment providing on average 60-75% reduction in crisis days and acute medication reliance.",
    section3_image: "/images/treatments/rtms.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Associées",
    section4_title_en: "Linked Conditions",
    section4_text_fr: "Migraines chroniques, Névralgie d'Arnold.",
    section4_text_en: "Chronic migraines, Arnold neuralgia.",
    section4_image: "/images/treatments/hypnovr.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 9,
    is_active: 1
  },
  {
    id: 10,
    slug: "tens",
    num: "10",
    icon: "⚡",
    title_fr: "Neurostimulation Transcutanée (TENS)",
    title_en: "Transcutaneous Electrical Nerve Stimulation",
    desc_front_fr: "Thérapie d'auto-prise en charge à domicile via le mécanisme neurophysiologique du Gate Control.",
    desc_front_en: "Non-invasive home self-management therapy leveraging dorsal horn Gate Control mechanisms.",
    desc_back_fr: "Délivre des impulsions électriques douces via des électrodes cutanées pour court-circuiter le message douloureux avant son arrivée au cortex cérébral.",
    desc_back_en: "Delivers gentle electrical currents through skin electrodes to block pain transmission before reaching cerebral perception centers.",
    card_image: "/images/treatments/tens.jpg",
    hero_gallery: [
      "/images/treatments/tens.jpg",
      "/images/lombalgie.jpg"
    ],
    section1_title_fr: "Apprentissage & Réglage ITID",
    section1_title_en: "ITID Patient Education",
    section1_text_fr: "Séance d'initiation avec notre équipe infirmière pour définir les fréquences et l'emplacement optimal des électrodes.",
    section1_text_en: "Dedicated educational session with specialized pain nurses to determine optimal frequencies and electrode placements.",
    section1_image: "/images/treatments/tens.jpg",
    section1_image_position: "left",

    section2_title_fr: "Avantages Thérapeutiques",
    section2_title_en: "Clinical Advantages",
    section2_text_fr: "Non invasif, sans accoutumance, utilisable quotidiennement au domicile ou au travail en totale autonomie.",
    section2_text_en: "Completely non-invasive, non-addictive, easily portable for daily use at home or work.",
    section2_image: "/images/douleurs_neuropathiques.jpg",
    section2_image_position: "right",

    section3_title_fr: "Indications",
    section3_title_en: "Indications",
    section3_text_fr: "Douleurs lombaires, cervicalgies, douleurs neuropathiques diabétiques, douleurs pelviennes chroniques.",
    section3_text_en: "Lower back pain, neck pain, diabetic neuropathic pain, chronic pelvic pain.",
    section3_image: "/images/endometriose.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Concernées",
    section4_title_en: "Target Pathologies",
    section4_text_fr: "Lombalgie, Endométriose, Fibromyalgie.",
    section4_text_en: "Low back pain, Endometriosis, Fibromyalgia.",
    section4_image: "/images/spine_isolated.png",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 10,
    is_active: 1
  },
  {
    id: 11,
    slug: "catheter-perinerveux",
    num: "11",
    icon: "🚰",
    title_fr: "Cathéters Périnerveux & Blocs Continus",
    title_en: "Perineural Catheters & Continuous Blocks",
    desc_front_fr: "Anesthésie loco-régionale prolongée permettant une rééducation intensive sans douleur.",
    desc_front_en: "Prolonged targeted regional anesthesia facilitating intensive pain-free rehabilitation.",
    desc_back_fr: "Pose sous échographie d'un micro-cathéter souple au contact d'un tronc nerveux périphérique pour délivrer une perfusion continue d'anesthésique local pendant 3 à 5 jours.",
    desc_back_en: "Ultrasound placement of a micro-catheter delivering continuous localized anesthetic infusion for 3-5 days to interrupt intractable pain cascades.",
    card_image: "/images/treatments/catheter_perinerveux.jpg",
    hero_gallery: [
      "/images/treatments/catheter_perinerveux.jpg",
      "/images/douleurs_articulaires.jpg"
    ],
    section1_title_fr: "Rupture du Cercle Douleur-Enraidissement",
    section1_title_en: "Breaking Pain-Stiffness Cycles",
    section1_text_fr: "Permet de débloquer une articulation ankylosée et d'effectuer des mobilisations kinésithérapiques indispensables sans souffrance.",
    section1_text_en: "Enables painless physical therapy and mobilization of severely frozen or post-traumatic joints.",
    section1_image: "/images/treatments/catheter_perinerveux.jpg",
    section1_image_position: "left",

    section2_title_fr: "Indications d'Urgence Algologique",
    section2_title_en: "Acute Algology Indications",
    section2_text_fr: "Épaules gelées réfractaires (capsulite), genoux enraidis post-chirurgie, phase chaude hyperalgique du SDRC.",
    section2_text_en: "Refractory adhesive capsulitis, postoperative joint arthrofibrosis, acute hyperalgesic phase of CRPS.",
    section2_image: "/images/douleurs_articulaires.jpg",
    section2_image_position: "right",

    section3_title_fr: "Sécurité & Suivi Ambulatoire",
    section3_title_en: "Home Care Infusion Safety",
    section3_text_fr: "Diffuseur élastomérique sécurisé et suivi infirmier coordinateur quotidien à domicile.",
    section3_text_en: "Tamper-proof elastomeric pump and daily specialized home nursing coordination.",
    section3_image: "/images/sdrc.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Concernées",
    section4_title_en: "Target Pathologies",
    section4_text_fr: "SDRC, Douleurs articulaires, Douleurs post-opératoires.",
    section4_text_en: "CRPS, Joint pain, Post-surgical pain.",
    section4_image: "/images/treatments/infiltrations_articulaires.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 11,
    is_active: 1
  },
  {
    id: 12,
    slug: "patch-capsaicine",
    num: "12",
    icon: "🩹",
    title_fr: "Patch de Capsaïcine Haute Concentration (8%)",
    title_en: "High-Concentration Capsaicin Patch (8%)",
    desc_front_fr: "Défiscalisation et désensibilisation des récepteurs TRPV1 pour douleurs neuropathiques périphériques.",
    desc_front_en: "TRPV1 receptor defunctionalization delivering months of relief for peripheral neuropathic pain.",
    desc_back_fr: "Application cutanée hospitalière unique de 30 à 60 minutes induisant une déplétion durable des récepteurs de la douleur pour 3 mois.",
    desc_back_en: "Single in-clinic application providing sustained desensitization of hyperactive nociceptive fibers for up to 3 months.",
    card_image: "/images/treatments/patch_capsaicine.jpg",
    hero_gallery: [
      "/images/treatments/patch_capsaicine.jpg",
      "/images/douleurs_neuropathiques.jpg"
    ],
    section1_title_fr: "Mécanisme Récepteur TRPV1",
    section1_title_en: "TRPV1 Mechanism",
    section1_text_fr: "La capsaïcine à 8% surcharge les récepteurs de la douleur cutanée, entraînant une désensibilisation prolongée sans anesthésie motrice.",
    section1_text_en: "High-dose capsaicin defunctionalizes hypersensitive epidermal nociceptors without affecting motor or autonomic function.",
    section1_image: "/images/treatments/patch_capsaicine.jpg",
    section1_image_position: "left",

    section2_title_fr: "Indications Recommandées",
    section2_title_en: "Recommended Indications",
    section2_text_fr: "Névralgies post-zostériennes (post-zona), cicatrices chirurgicales hyperalgiques, neuropathie diabétique périphérique.",
    section2_text_en: "Post-herpetic neuralgia, painful postsurgical scar allodynia, focal diabetic peripheral neuropathy.",
    section2_image: "/images/douleurs_neuropathiques.jpg",
    section2_image_position: "right",

    section3_title_fr: "Application en Ambulatoire",
    section3_title_en: "Outpatient Application",
    section3_text_fr: "Réalisé en hôpital de jour avec surveillance infirmière et application de froid apaisant post-retrait.",
    section3_text_en: "Conducted under medical supervision with active cooling applied post-removal.",
    section3_image: "/images/douleurs_post_op.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Concernées",
    section4_title_en: "Target Pathologies",
    section4_text_fr: "Douleurs neuropathiques, Douleurs post-opératoires.",
    section4_text_en: "Neuropathic pain, Post-surgical pain.",
    section4_image: "/images/treatments/blocs_anesthesiques.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 12,
    is_active: 1
  },
  {
    id: 13,
    slug: "hypnovr",
    num: "13",
    icon: "🥽",
    title_fr: "Réalité Virtuelle Thérapeutique (HypnoVR)",
    title_en: "Medical Virtual Reality (HypnoVR)",
    desc_front_fr: "Hypnoanalgésie immersive pour réduire l'anxiété et la perception douloureuse lors des gestes interventionnels.",
    desc_front_en: "Immersive medical hypnoanalgesia reducing peri-procedural anxiety and pain perception.",
    desc_back_fr: "Casque immersif combinant environnements visuels 3D apaisants et suggestions hypnotiques cliniques validées par des études scientifiques publiées.",
    desc_back_en: "Multi-sensory distraction headset combining relaxing 3D visual landscapes and validated clinical hypnotherapy scripts.",
    card_image: "/images/treatments/hypnovr.jpg",
    hero_gallery: [
      "/images/treatments/hypnovr.jpg",
      "/images/sdrc.jpg"
    ],
    section1_title_fr: "Modulation Centrale & Hypnose",
    section1_title_en: "Central Modulation & Hypnosis",
    section1_text_fr: "Détourne l'attention cérébrale de la zone d'intervention et atténue l'activation des aires corticales de la douleur.",
    section1_text_en: "Diverts cerebral attention away from procedural sensations and dampens pain-matrix activation.",
    section1_image: "/images/treatments/hypnovr.jpg",
    section1_image_position: "left",

    section2_title_fr: "Confort Patient au Bloc",
    section2_title_en: "Patient Comfort in OR",
    section2_text_fr: "Diminue le besoin en sédatifs chimiques et transforme l'expérience du patient en moment de sérénité.",
    section2_text_en: "Decreases pharmacological sedative requirements and fosters a serene procedural environment.",
    section2_image: "/images/treatments/infiltrations_rachidiennes.jpg",
    section2_image_position: "right",

    section3_title_fr: "Personnalisation des Séances",
    section3_title_en: "Personalized Settings",
    section3_text_fr: "Choix de l'ambiance (forêt, plage, espace sous-marin), voix féminine ou masculine et musique binaurale relaxante.",
    section3_text_en: "Tailored environments (zen forest, tropical beach, deep sea) with personalized voice pacing.",
    section3_image: "/images/treatments/radiofrequence.jpg",
    section3_image_position: "left",

    section4_title_fr: "Pathologies Concernées",
    section4_title_en: "Target Pathologies",
    section4_text_fr: "Fibromyalgie, Lombalgie chronique, SDRC.",
    section4_text_en: "Fibromyalgia, Chronic back pain, CRPS.",
    section4_image: "/images/fibromyalgie.jpg",
    section4_image_position: "right",

    cta_text_fr: "Prendre rendez-vous",
    cta_text_en: "Book Appointment",
    cta_url: "#contact",
    display_order: 13,
    is_active: 1
  }
];
