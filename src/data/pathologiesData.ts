// ======================================================================
// ITID France || Données Canoniques des Pathologies (Fiches Médicales Détaillées)
// Contenu médical riche pré-rempli garantissant zéro perte et zéro régression
// ======================================================================

export interface PathologyDetailedItem {
  id: number;
  slug: string;
  title_fr: string;
  title_en: string;
  icon: string;
  color: string;
  short_desc_fr: string;
  short_desc_en: string;
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
  wikipedia_url?: string;
  display_order: number;
  is_active: number;
}

export const DEFAULT_PATHOLOGIES: PathologyDetailedItem[] = [
  {
    id: 1,
    slug: "lombalgie-chronique",
    title_fr: "Lombalgie chronique & Sciatique",
    title_en: "Chronic Lower Back Pain & Sciatica",
    icon: "🦴",
    color: "#48d1c2",
    short_desc_fr: "Douleurs lombaires persistantes de plus de 3 mois, souvent associées à des irradiations de type sciatique ou cruralgie.",
    short_desc_en: "Persistent lower back pain lasting more than 3 months, frequently associated with radiating sciatic or crural nerve pain.",
    card_image: "/images/lombalgie.jpg",
    hero_gallery: [
      "/images/lombalgie.jpg",
      "/images/spine_isolated.png",
      "/images/glowing_3d_spine.jpg",
      "/images/treatments/infiltrations_rachidiennes.jpg"
    ],
    section1_title_fr: "Comprendre la Lombalgie Chronique",
    section1_title_en: "Understanding Chronic Lower Back Pain",
    section1_text_fr: "La lombalgie chronique est l'une des causes majeures d'invalidité et de souffrance au quotidien. Elle résulte d'interactions complexes entre dégénérescence discale, arthrose facettaire, instabilité vertébrale et sensibilisation du système nerveux central.\n\nÀ l'ITID, nous dépassons le simple traitement symptomatique pour cibler avec précision la structure anatomique génératrice de la douleur.",
    section1_text_en: "Chronic low back pain is a leading cause of disability worldwide. It results from complex interactions between disc degeneration, facet joint osteoarthritis, vertebral instability, and central nervous system sensitization.\n\nAt ITID, we pinpoint the exact anatomical pain generator to provide targeted interventional relief.",
    section1_image: "/images/lombalgie.jpg",
    section1_image_position: "left",

    section2_title_fr: "Quand et comment se faire diagnostiquer ?",
    section2_title_en: "When & How to Get Diagnosed?",
    section2_text_fr: "Une consultation spécialisée est recommandée lorsque la douleur persiste au-delà de 6 semaines malgré les antalgiques usuels, en cas d'engourdissements, de faiblesse motrice dans la jambe ou de perturbation sévère du sommeil.\n\nLe bilan à l'ITID associe un examen clinique algologique approfondi, l'analyse d'IRM haute résolution et, si nécessaire, des blocs anesthésiques tests ciblés.",
    section2_text_en: "A specialized consultation is advised when pain persists beyond 6 weeks despite standard medications, in case of numbness, leg weakness, or severe sleep disruption.\n\nDiagnostic evaluation at ITID combines deep clinical pain assessment, high-resolution MRI review, and targeted diagnostic anesthetic nerve blocks.",
    section2_image: "/images/glowing_3d_spine.jpg",
    section2_image_position: "right",

    section3_title_fr: "Prise en charge interventionnelle à l'ITID",
    section3_title_en: "Interventional Care at ITID",
    section3_text_fr: "Nous proposons des gestes thérapeutiques de pointe réalisés sous guidage fluoroscopique ou échographique millimétrique :\n• Infiltrations épidurales et foraminales de corticoïdes ciblés\n• Dénervation par radiofréquence des branches médianes articulaires\n• Infiltration des articulations sacro-iliaques\n• Neuromodulation médullaire pour les douleurs réfractaires.",
    section3_text_en: "We offer cutting-edge therapeutic procedures performed under millimeter-precise fluoroscopic or ultrasound guidance:\n• Targeted epidural and transforaminal corticosteroid injections\n• Radiofrequency denervation of medial facet branches\n• Sacroiliac joint injections\n• Spinal cord stimulation for refractory pain.",
    section3_image: "/images/treatments/infiltrations_rachidiennes.jpg",
    section3_image_position: "left",

    section4_title_fr: "Prévention & Conseils au Quotidien",
    section4_title_en: "Prevention & Daily Lifestyle Advice",
    section4_text_fr: "Le mouvement reste le meilleur traitement du rachis. Nous accompagnons chaque patient avec un programme personnalisé : renforcement du gainage abdominal profond, étirements des chaînes postérieures, ergonomie au poste de travail et gestion du stress chronique.",
    section4_text_en: "Movement is medicine for the spine. We support each patient with a personalized program: deep core strengthening, posterior muscle chain stretching, workstation ergonomics, and chronic stress management.",
    section4_image: "/images/spine_isolated.png",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Lombalgie",
    display_order: 1,
    is_active: 1
  },
  {
    id: 2,
    slug: "nevralgie-arnold",
    title_fr: "Névralgie d'Arnold (Occipitale)",
    title_en: "Occipital Neuralgia (Arnold's Nerve)",
    icon: "⚡",
    color: "#2a9d8f",
    short_desc_fr: "Douleur neuropathique intense partant de la base du crâne et irradiant vers le sommet de la tête ou derrière l'œil.",
    short_desc_en: "Severe neuropathic pain radiating from the skull base to the vertex and behind the eye along the occipital nerve path.",
    card_image: "/images/nevralgie_arnold.jpg",
    hero_gallery: [
      "/images/nevralgie_arnold.jpg",
      "/images/treatments/radiofrequence.jpg",
      "/images/treatments/blocs_anesthesiques.jpg"
    ],
    section1_title_fr: "Qu'est-ce que la Névralgie d'Arnold ?",
    section1_title_en: "What is Occipital Neuralgia?",
    section1_text_fr: "La névralgie d'Arnold est causée par la compression ou l'inflammation du grand nerf occipital (nerf d'Arnold) entre les vertèbres C1-C2 et les muscles cervicaux. Elle provoque des décharges électriques, des brûlures et une hypersensibilité du cuir chevelu.",
    section1_text_en: "Occipital neuralgia arises from irritation or compression of the greater occipital nerve at the C1-C2 level and suboccipital muscles, causing sharp electric shocks, burning sensations, and scalp hypersensitivity.",
    section1_image: "/images/nevralgie_arnold.jpg",
    section1_image_position: "left",

    section2_title_fr: "Diagnostic & Signes d'alerte",
    section2_title_en: "Diagnosis & Warning Signs",
    section2_text_fr: "Le diagnostic repose sur la reproduction de la douleur à la palpation du point d'émergence du nerf occipital (signe de Tinel) et sur l'exclusion d'autres céphalées par imagerie cervicale (IRM/Scanner).",
    section2_text_en: "Diagnosis is established through tenderness at the occipital nerve emergence point (Tinel's sign) and cervical imaging (MRI/CT) to rule out secondary causes.",
    section2_image: "/images/sdrc.jpg",
    section2_image_position: "right",

    section3_title_fr: "Gestes d'intervention à l'ITID",
    section3_title_en: "Interventional Procedures at ITID",
    section3_text_fr: "• Bloc anesthésique écho-guidé du grand et petit nerf occipital\n• Radiofréquence pulsée du nerf d'Arnold pour une antalgie prolongée sans léser le nerf\n• Cryoneurolyse percutanée\n• Injections de toxine botulique dans les trapèzes et muscles sous-occipitaux.",
    section3_text_en: "• Ultrasound-guided greater and lesser occipital nerve blocks\n• Pulsed radiofrequency for durable non-destructive pain relief\n• Percutaneous cryoneurolysis\n• Botulinum toxin injections in suboccipital and trapezius trigger points.",
    section3_image: "/images/treatments/blocs_anesthesiques.jpg",
    section3_image_position: "left",

    section4_title_fr: "Conseils & Prévention",
    section4_title_en: "Prevention & Ergonomics",
    section4_text_fr: "Correction des postures sur écran (tête penchée en avant), kinésithérapie de décoaptation cervicale, oreiller ergonomique à mémoire de forme et gestion des tensions musculaires de stress.",
    section4_text_en: "Forward head posture correction, cervical gentle mobilization physiotherapy, ergonomic cervical pillow, and stress-related tension reduction.",
    section4_image: "/images/treatments/hypnovr.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/N%C3%A9vralgie_d%27Arnold",
    display_order: 2,
    is_active: 1
  },
  {
    id: 3,
    slug: "sdrc",
    title_fr: "Syndrome Douloureux Régional Complexe (SDRC)",
    title_en: "Complex Regional Pain Syndrome (CRPS)",
    icon: "🔥",
    color: "#e76f51",
    short_desc_fr: "Trouble neurologique et vasculaire survenant après un traumatisme ou une chirurgie (œdème, brûlures intenses, hypersensibilité).",
    short_desc_en: "Complex neurological and microvascular disorder typically occurring after trauma or surgery (edema, burning pain, allodynia).",
    card_image: "/images/sdrc.jpg",
    hero_gallery: [
      "/images/sdrc.jpg",
      "/images/migraine.jpg",
      "/images/treatments/infiltrations_articulaires.jpg"
    ],
    section1_title_fr: "Comprendre le SDRC (Algodystrophie)",
    section1_title_en: "Understanding CRPS (Algodystrophy)",
    section1_text_fr: "Le SDRC (anciennement algodystrophie) associe des douleurs disproportionnées, des modifications de température cutanée, de coloration et un gonflement du membre atteint, liés à un dérèglement du système nerveux autonome.",
    section1_text_en: "CRPS combines pain out of proportion to the initial injury with changes in skin temperature, color, and swelling due to autonomic nervous system dysfunction.",
    section1_image: "/images/sdrc.jpg",
    section1_image_position: "left",

    section2_title_fr: "Diagnostic Précoce",
    section2_title_en: "Early Diagnosis",
    section2_text_fr: "Un diagnostic précoce (critères de Budapest) dans les premières semaines est capital pour empêcher l'enraidissement et la chronicisation. Scintigraphie osseuse et IRM confirment le stade évolutif.",
    section2_text_en: "Early diagnosis (Budapest criteria) is paramount to prevent permanent stiffness and severe chronification. Bone scintigraphy and MRI aid staging.",
    section2_image: "/images/douleurs_articulaires.jpg",
    section2_image_position: "right",

    section3_title_fr: "Protocoles Thérapeutiques ITID",
    section3_title_en: "ITID Treatment Protocols",
    section3_text_fr: "• Perfusions intraveineuses de Lidocaïne et magnésium en milieu sécurisé\n• Blocs sympathiques écho-guidés (ganglion stellaire ou lombaire)\n• Neurostimulation médullaire ou du ganglion spinal dorsal (DRG)\n• rTMS pour rééquilibrer le cortex somatosensoriel.",
    section3_text_en: "• Monitored intravenous Lidocaine and magnesium infusions\n• Ultrasound-guided sympathetic blocks (stellate or lumbar)\n• Dorsal Root Ganglion (DRG) or spinal cord stimulation\n• rTMS brain modulation to recalibrate somatosensory mapping.",
    section3_image: "/images/treatments/perfusion_lidocaine.jpg",
    section3_image_position: "left",

    section4_title_fr: "Rééducation & Thérapie Miroir",
    section4_title_en: "Rehabilitation & Mirror Therapy",
    section4_text_fr: "Désensibilisation tactile progressive, rééducation par imagerie motrice graduée et thérapie par miroir pour reprogrammer la perception cérébrale du membre.",
    section4_text_en: "Graded tactile desensitization, motor imagery training, and mirror therapy to restore brain body map perception.",
    section4_image: "/images/treatments/cryoneurolyse.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Syndrome_douloureux_r%C3%A9gional_complexe",
    display_order: 3,
    is_active: 1
  },
  {
    id: 4,
    slug: "endometriose",
    title_fr: "Endométriose & Douleurs Pelviennes Chroniques",
    title_en: "Endometriosis & Chronic Pelvic Pain",
    icon: "🌸",
    color: "#e9c46a",
    short_desc_fr: "Douleurs pelvi-périnéales invalidantes, règles douloureuses sévères, dyspareunie et névralgie pudendale.",
    short_desc_en: "Severe pelvic pain, dysmenorrhea, dyspareunia, and pudendal nerve entrapment associated with endometriosis.",
    card_image: "/images/endometriose.jpg",
    hero_gallery: [
      "/images/endometriose.jpg",
      "/images/treatments/perfusion_lidocaine.jpg"
    ],
    section1_title_fr: "L'Endométriose et le Système Nerveux Pelvien",
    section1_title_en: "Endometriosis & The Pelvic Nervous System",
    section1_text_fr: "L'endométriose induit une inflammation chronique et une prolifération nerveuse qui entraînent une sensibilisation centrale. Même après chirurgie, la douleur neuropathique peut persister.",
    section1_text_en: "Endometriosis triggers chronic pelvic neuroinflammation and nerve sprouting leading to central sensitization, where pain signals persist even after surgery.",
    section1_image: "/images/endometriose.jpg",
    section1_image_position: "left",

    section2_title_fr: "Bilan Algologique Pelvien",
    section2_title_en: "Algological Pelvic Assessment",
    section2_text_fr: "Évaluation pluridisciplinaire associant algologue, gynécologue et radiologue expert, avec IRM pelvienne dédiée et cartographie précise des points douloureux myo-fasciaux.",
    section2_text_en: "Multidisciplinary assessment involving pain specialist, gynecologist, and specialized MRI mapping of myo-fascial trigger zones and pudendal nerve trajectory.",
    section2_image: "/images/treatments/stimulation_ganglion_dorsal.jpg",
    section2_image_position: "right",

    section3_title_fr: "Traitements Spécifiques ITID",
    section3_title_en: "Dedicated ITID Treatments",
    section3_text_fr: "• Infiltrations écho-guidées du nerf pudendal et du nerf ilio-inguinal\n• Blocs du plexus hypogastrique supérieur\n• Injections de toxine botulique dans le muscle élévateur de l'anus (levator ani)\n• Neurostimulation transcutanée TENS pelvienne.",
    section3_text_en: "• Ultrasound-guided pudendal and ilio-inguinal nerve blocks\n• Superior hypogastric plexus blocks\n• Pelvic floor Botox injections for severe levator ani hypertonia\n• Tailored pelvic TENS neuromodulation.",
    section3_image: "/images/treatments/infiltrations_articulaires.jpg",
    section3_image_position: "left",

    section4_title_fr: "Approche Intégrative & Nutrition",
    section4_title_en: "Integrative Approach & Diet",
    section4_text_fr: "Alimentation anti-inflammatoire personnalisée, kinésithérapie périnéale douce, hypnose médicale pour l'atténuation du stress et relaxation pelvienne.",
    section4_text_en: "Customized anti-inflammatory nutrition, gentle pelvic floor physiotherapy, medical hypnosis for pain perception regulation and somatic relaxation.",
    section4_image: "/images/treatments/tens.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Endom%C3%A9triose",
    display_order: 4,
    is_active: 1
  },
  {
    id: 5,
    slug: "douleurs-articulaires",
    title_fr: "Douleurs Articulaires (Épaule, Genou, Hanche)",
    title_en: "Joint Pain (Shoulder, Knee, Hip)",
    icon: "🦿",
    color: "#f4a261",
    short_desc_fr: "Arthrose réfractaire, tendinopathies chroniques, conflits articulaires et douleurs post-prothèse persistantes.",
    short_desc_en: "Refractory osteoarthritis, chronic tendinopathies, joint impingement, and persistent pain following joint replacement.",
    card_image: "/images/douleurs_articulaires.jpg",
    hero_gallery: [
      "/images/douleurs_articulaires.jpg",
      "/images/treatments/toxine_botulique.jpg",
      "/images/treatments/patch_capsaicine.jpg"
    ],
    section1_title_fr: "Mécanisme des Douleurs Articulaires",
    section1_title_en: "Mechanisms of Chronic Joint Pain",
    section1_text_fr: "La dégénérescence cartilagineuse s'accompagne d'une synovite inflammatoire et d'une hypersensibilisation des nerfs péri-articulaires, créant un cercle vicieux de douleur et d'impotence fonctionnelle.",
    section1_text_en: "Cartilage wear is accompanied by chronic synovial inflammation and peripheral nerve hypersensitization, creating a persistent cycle of pain and functional impairment.",
    section1_image: "/images/douleurs_articulaires.jpg",
    section1_image_position: "left",

    section2_title_fr: "Quand consulter ?",
    section2_title_en: "When to Seek Interventional Evaluation?",
    section2_text_fr: "Lorsque les antalgiques habituels ne suffisent plus, que la marche ou les mouvements simples deviennent pénibles, ou chez les patients non opérables souhaitant éviter la chirurgie lourde.",
    section2_text_en: "When oral pain medications fail to provide relief, daily mobility is constrained, or for patients seeking non-surgical alternatives to heavy joint surgery.",
    section2_image: "/images/treatments/catheter_perinerveux.jpg",
    section2_image_position: "right",

    section3_title_fr: "Gestes Thérapeutiques ITID",
    section3_title_en: "ITID Interventional Procedures",
    section3_text_fr: "• Infiltrations écho-guidées d'acide hyaluronique et corticoïdes retard\n• Dénervation par radiofréquence refroidie des nerfs géniculés (genou) et supra-scapulaires (épaule)\n• Cryoneurolyse articulaire\n• Viscosupplémentation de nouvelle génération.",
    section3_text_en: "• Ultrasound-guided hyaluronic acid and targeted corticosteroid injections\n• Cooled radiofrequency denervation of genicular nerves (knee) and suprascapular nerve (shoulder)\n• Percutaneous articular cryoneurolysis\n• Advanced viscosupplementation.",
    section3_image: "/images/treatments/infiltrations_articulaires.jpg",
    section3_image_position: "left",

    section4_title_fr: "Récupération & Activité Physique",
    section4_title_en: "Recovery & Physical Activity",
    section4_text_fr: "Renforcement musculaire ciblé sans impact (balnéothérapie, vélo, marche douce), contrôle du poids corporel et supplémentation protectrice.",
    section4_text_en: "Low-impact muscle strengthening (water therapy, cycling, walking), joint load optimization, and supportive nutritional measures.",
    section4_image: "/images/lombalgie.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Arthralgie",
    display_order: 5,
    is_active: 1
  },
  {
    id: 6,
    slug: "fibromyalgie",
    title_fr: "Fibromyalgie & Sensibilisation Centrale",
    title_en: "Fibromyalgia & Central Sensitization",
    icon: "🌬️",
    color: "#81b29a",
    short_desc_fr: "Sensibilisation centrale caractérisée par des douleurs diffuses, une fatigue chronique intense et des troubles du sommeil.",
    short_desc_en: "Central sensitization syndrome marked by widespread chronic musculoskeletal pain, profound fatigue, and sleep disturbances.",
    card_image: "/images/fibromyalgie.jpg",
    hero_gallery: [
      "/images/fibromyalgie.jpg",
      "/images/glowing_3d_spine.jpg",
      "/images/treatments/infiltrations_rachidiennes.jpg"
    ],
    section1_title_fr: "Comprendre la Sensibilisation Centrale",
    section1_title_en: "Understanding Central Sensitization",
    section1_text_fr: "Dans la fibromyalgie, le système nerveux amplifie les signaux sensoriels ordinaires. Le seuil de perception de la douleur est abaissé, rendant tout stimulus corporel douloureux.",
    section1_text_en: "In fibromyalgia, the central nervous system amplifies sensory signals, lowering the pain threshold and causing widespread tenderness and hyperalgesia.",
    section1_image: "/images/fibromyalgie.jpg",
    section1_image_position: "left",

    section2_title_fr: "Évaluation Multidisciplinaire",
    section2_title_en: "Multidisciplinary Assessment",
    section2_text_fr: "Le diagnostic repose sur un interrogatoire précis, la recherche des points douloureux myo-fasciaux et l'évaluation du sommeil, de l'humeur et du niveau d'énergie.",
    section2_text_en: "Comprehensive evaluation incorporates tender point examination, polysomnography review, cognitive assessment, and quality-of-life mapping.",
    section2_image: "/images/spine_isolated.png",
    section2_image_position: "right",

    section3_title_fr: "Traitements Innovants ITID",
    section3_title_en: "Innovative Treatments at ITID",
    section3_text_fr: "• Séances de rTMS (Stimulation Magnétique Transcrânienne) sur le cortex moteur pour réguler les voies inhibitrices de la douleur\n• Perfusions antalgiques individualisées de Kétamine / Lidocaïne\n• Casques de Réalité Virtuelle HypnoVR pour la relaxation profonde.",
    section3_text_en: "• rTMS (Repetitive Transcranial Magnetic Stimulation) targeting motor cortex to activate descending pain inhibitory pathways\n• Individualized Ketamine / Lidocaine infusions\n• HypnoVR clinical therapeutic virtual reality sessions.",
    section3_image: "/images/treatments/rtms.jpg",
    section3_image_position: "left",

    section4_title_fr: "Reprogrammation Corporelle",
    section4_title_en: "Body Reprogramming & Lifestyle",
    section4_text_fr: "Réentraînement doux à l'effort aérobie progressif, régulation du rythme circadien et méditation de pleine conscience.",
    section4_text_en: "Graded aerobic conditioning, circadian rhythm hygiene, and mindfulness-based stress reduction.",
    section4_image: "/images/treatments/radiofrequence.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Fibromyalgie",
    display_order: 6,
    is_active: 1
  },
  {
    id: 7,
    slug: "douleurs-neuropathiques",
    title_fr: "Douleurs Neuropathiques Périphériques & Centrales",
    title_en: "Neuropathic Pain (Peripheral & Central)",
    icon: "💥",
    color: "#e07a5f",
    short_desc_fr: "Brûlures, décharges électriques, allodynie post-zona, diabète, séquelles chirurgicales ou lésions nerveuses.",
    short_desc_en: "Burning pain, electric shocks, and allodynia resulting from post-herpetic neuralgia, diabetic neuropathy, or nerve trauma.",
    card_image: "/images/douleurs_neuropathiques.jpg",
    hero_gallery: [
      "/images/douleurs_neuropathiques.jpg",
      "/images/nevralgie_arnold.jpg",
      "/images/treatments/blocs_anesthesiques.jpg"
    ],
    section1_title_fr: "Origine de la Douleur Neuropathique",
    section1_title_en: "Origin of Neuropathic Pain",
    section1_text_fr: "Elle est due à une lésion ou maladie du système somatosensoriel. Les fibres nerveuses endommagées envoient des signaux douloureux continus et anormaux vers le cerveau.",
    section1_text_en: "Neuropathic pain arises directly from damage or pathology affecting the somatosensory nervous system, generating spontaneous ectopic pain impulses.",
    section1_image: "/images/douleurs_neuropathiques.jpg",
    section1_image_position: "left",

    section2_title_fr: "Diagnostic & Questionnaire DN4",
    section2_title_en: "Diagnostic Criteria (DN4 Score)",
    section2_text_fr: "Le diagnostic est confirmé par le score DN4 (brûlures, froid douloureux, décharges, allodynie au frottement) complété par électromyogramme et imagerie.",
    section2_text_en: "Assessment utilizes the validated DN4 scoring tool (burning, electric shock, pinprick sensitivity, dynamic allodynia) paired with EMG and imaging.",
    section2_image: "/images/sdrc.jpg",
    section2_image_position: "right",

    section3_title_fr: "Traitements Hautement Spécialisés",
    section3_title_en: "Highly Specialized Treatments at ITID",
    section3_text_fr: "• Application de patchs de Capsaïcine haute concentration (Qutenza) en ambulatoire\n• Stimulation médullaire épidurale (SCS)\n• Blocs périnerveux continus\n• Radiofréquence pulsée sur les racines dorsales.",
    section3_text_en: "• High-concentration Capsaicin patch (Qutenza) application\n• Spinal Cord Stimulation (SCS)\n• Continuous ultrasound-guided perineural blocks\n• Pulsed radiofrequency on dorsal root ganglia.",
    section3_image: "/images/treatments/patch_capsaicine.jpg",
    section3_image_position: "left",

    section4_title_fr: "Prévention & Suivi",
    section4_title_en: "Prevention & Management",
    section4_text_fr: "Contrôle strict des facteurs métaboliques (glycémie), protection cutanée et adaptation thérapeutique précoce dès l'apparition des premiers symptômes.",
    section4_text_en: "Metabolic control (glycemia), skin barrier care, and rapid therapeutic titration to prevent long-term central hypersensitivity.",
    section4_image: "/images/treatments/hypnovr.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Douleur_neuropathique",
    display_order: 7,
    is_active: 1
  },
  {
    id: 8,
    slug: "douleurs-post-op",
    title_fr: "Douleurs Post-Opératoires & Post-Traumatiques Chroniques",
    title_en: "Chronic Post-Surgical & Post-Traumatic Pain",
    icon: "⚕️",
    color: "#3d5a80",
    short_desc_fr: "Douleurs persistantes plus de 3 mois après une chirurgie (rachis, prothèse, thoracotomie, hernie, mastectomie).",
    short_desc_en: "Persistent pain lasting beyond 3 months post-surgery (spinal fusion, joint replacement, thoracotomy, hernia, mastectomy).",
    card_image: "/images/douleurs_post_op.jpg",
    hero_gallery: [
      "/images/douleurs_post_op.jpg",
      "/images/migraine.jpg",
      "/images/treatments/infiltrations_articulaires.jpg"
    ],
    section1_title_fr: "Pourquoi la douleur persiste après une chirurgie ?",
    section1_title_en: "Why Pain Persists After Surgery?",
    section1_text_fr: "Une cicatrice fibreuse, l'étirement d'un rameau nerveux ou une sensibilisation des récepteurs périphériques peuvent maintenir un signal d'alarme alors que les tissus sont guéris.",
    section1_text_en: "Perineural scar tissue, surgical nerve entrapment, or regional receptor hypersensitization can sustain chronic alarm signals long after wound healing.",
    section1_image: "/images/douleurs_post_op.jpg",
    section1_image_position: "left",

    section2_title_fr: "Diagnostic Différentiel",
    section2_title_en: "Differential Diagnosis",
    section2_text_fr: "Vérification minutieuse de l'intégrité du matériel chirurgical, élimination de complications infectieuses et cartographie précise du territoire neurologique atteint.",
    section2_text_en: "Hardware placement verification, surgical complication rule-out, and precise neurological dermatomal mapping.",
    section2_image: "/images/douleurs_articulaires.jpg",
    section2_image_position: "right",

    section3_title_fr: "Traitements Dédiés ITID",
    section3_title_en: "Dedicated Interventions at ITID",
    section3_text_fr: "• Infiltrations cicatricielles écho-guidées avec anesthésique local et corticoïdes\n• Cryoneurolyse percutanée des névromes cicatriciels\n• Radiofréquence pulsée\n• Neurostimulation médullaire pour Failed Back Surgery Syndrome (FBSS).",
    section3_text_en: "• Ultrasound-guided scar and neuroma infiltrations\n• Percutaneous cryoneurolysis for painful surgical neuromas\n• Pulsed radiofrequency\n• Spinal cord stimulation for Failed Back Surgery Syndrome.",
    section3_image: "/images/treatments/cryoneurolyse.jpg",
    section3_image_position: "left",

    section4_title_fr: "Accompagnement Global",
    section4_title_en: "Comprehensive Recovery Plan",
    section4_text_fr: "Désensibilisation manuelle douce de la cicatrice, reprise progressive des mouvements et thérapies cognitivo-comportementales de la douleur.",
    section4_text_en: "Gentle scar desensitization techniques, progressive movement restoration, and cognitive-behavioral pain coping strategies.",
    section4_image: "/images/treatments/hypnovr.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Douleur",
    display_order: 8,
    is_active: 1
  },
  {
    id: 9,
    slug: "migraines",
    title_fr: "Céphalées Rebelles & Migraines Chroniques",
    title_en: "Intractable Headaches & Chronic Migraines",
    icon: "🧠",
    color: "#264653",
    short_desc_fr: "Crises céphaliques sévères plus de 15 jours par mois, résistantes aux triptans et aux traitements de fond usuels.",
    short_desc_en: "Severe recurrent migraines occurring 15+ days per month, refractory to conventional triptans and oral prophylactics.",
    card_image: "/images/migraine.jpg",
    hero_gallery: [
      "/images/migraine.jpg",
      "/images/endometriose.jpg",
      "/images/treatments/perfusion_lidocaine.jpg"
    ],
    section1_title_fr: "Comprendre la Migraine Chronique",
    section1_title_en: "Understanding Chronic Migraines",
    section1_text_fr: "La migraine chronique implique une activation excessive du complexe trigémino-vasculaire. Les crises provoquent nausées, photophobie et douleurs pulsatiles invalidantes.",
    section1_text_en: "Chronic migraine involves persistent hyperactivity within the trigeminovascular complex, causing severe throbbing pain, photophobia, and nausea.",
    section1_image: "/images/migraine.jpg",
    section1_image_position: "left",

    section2_title_fr: "Critères Diagnostiques",
    section2_title_en: "Diagnostic Criteria",
    section2_text_fr: "Présence de céphalées plus de 15 jours par mois depuis au moins 3 mois, dont au moins 8 jours avec caractéristiques migraineuses typiques.",
    section2_text_en: "Headaches on 15 or more days per month for at least 3 months, with at least 8 days meeting strict migraine features.",
    section2_image: "/images/treatments/stimulation_ganglion_dorsal.jpg",
    section2_image_position: "right",

    section3_title_fr: "Protocoles Thérapeutiques ITID",
    section3_title_en: "ITID Treatment Protocols",
    section3_text_fr: "• Injections de Toxine Botulique selon le protocole PREEMPT (31 points spécifiques)\n• Blocs du ganglion sphéno-palatin sous guidage\n• Blocs du nerf grand occipital\n• Séances de rTMS pour stabiliser l'excitabilité corticale.",
    section3_text_en: "• Botulinum Toxin injections following international PREEMPT protocol (31 targeted sites)\n• Sphenopalatine ganglion blocks\n• Greater occipital nerve blocks\n• rTMS neuro-stimulation to recalibrate cortical excitability.",
    section3_image: "/images/treatments/toxine_botulique.jpg",
    section3_image_position: "left",

    section4_title_fr: "Hygiène de Vie & Prévention",
    section4_title_en: "Lifestyle & Trigger Management",
    section4_text_fr: "Identification et éviction des facteurs déclenchants (sommeil irrégulier, déshydratation, aliments spécifiques), biofeedback et relaxation guidée.",
    section4_text_en: "Trigger identification and avoidance (sleep irregularities, dietary triggers, hydration), biofeedback training, and guided autonomic relaxation.",
    section4_image: "/images/treatments/tens.jpg",
    section4_image_position: "right",

    wikipedia_url: "https://fr.wikipedia.org/wiki/Migraine",
    display_order: 9,
    is_active: 1
  }
];
