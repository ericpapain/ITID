// ======================================================================
// ITID France — Données Canoniques des Cas Cliniques (Page d'Accueil)
// Contenu médical riche pré-rempli garantissant zéro perte et zéro régression
// ======================================================================

export interface CasCliniqueItem {
  id: number | string;
  title_fr: string;
  title_en: string;
  category_fr: string;
  category_en: string;
  image: string;
  display_order: number;
  is_active: number;
  traitement_slug: string;
  traitement_name?: string;
  pathologie_slug: string;
  short_desc_fr: string;
  short_desc_en: string;
}

export const DEFAULT_CAS_CLINIQUES: CasCliniqueItem[] = [
  {
    id: 1,
    title_fr: "Infiltration Lombaire Guidée",
    title_en: "Guided Lumbar Infiltration",
    category_fr: "Rachis & Lombalgie",
    category_en: "Spine & Low Back Pain",
    image: "/images/treatments/infiltrations_rachidiennes.jpg",
    display_order: 1,
    is_active: 1,
    traitement_slug: "infiltrations-rachidiennes",
    traitement_name: "Infiltrations Rachidiennes Guidées",
    pathologie_slug: "lombalgie-chronique",
    short_desc_fr: "Patient de 52 ans présentant une lombosciatique L5-S1 hyperalgique résistante aux antalgiques majeurs. Infiltration foraminale sous contrôle scopique millimétrique permettant une disparition de la douleur radiculaire à 48h et reprise des activités.",
    short_desc_en: "52-year-old patient with severe L5-S1 sciatica resistant to conventional analgesics. Image-guided foraminal infiltration resulting in complete radicular pain relief within 48h and rapid return to daily living."
  },
  {
    id: 2,
    title_fr: "Radiofréquence Facettaire Lombaire",
    title_en: "Lumbar Facet Radiofrequency",
    category_fr: "Arthrose Rachidienne",
    category_en: "Spinal Osteoarthritis",
    image: "/images/treatments/radiofrequence.jpg",
    display_order: 2,
    is_active: 1,
    traitement_slug: "radiofrequence",
    traitement_name: "Radiofréquence Pulsée & Thermique",
    pathologie_slug: "lombalgie-chronique",
    short_desc_fr: "Patiente de 64 ans avec lombalgie facettaire bilatérale chronique évoluant depuis 4 ans. Dénervation par thermocoagulation ciblée des rameaux médiaux L3-L4-L5 après bloc test anesthésique positif. Gain fonctionnel de 80% à 6 mois.",
    short_desc_en: "64-year-old patient with chronic bilateral facet lumbar pain. Targeted medial branch thermal neurotomy following positive diagnostic block. 80% functional improvement sustained at 6 months."
  },
  {
    id: 3,
    title_fr: "Prise en charge Neurostimulative du SDRC",
    title_en: "CRPS Neuromodulation Management",
    category_fr: "Douleur Neuropathique Complexe",
    category_en: "Complex Regional Pain",
    image: "/images/sdrc.jpg",
    display_order: 3,
    is_active: 1,
    traitement_slug: "stimulation-ganglion-dorsal",
    traitement_name: "Stimulation du Ganglion Spinal (DRG)",
    pathologie_slug: "sdrc",
    short_desc_fr: "Syndrome douloureux régional complexe de type 1 du pied post-traumatique avec allodynie cutanée sévère et œdème. Implantation d'un système de stimulation du ganglion spinal (DRG) L4-L5 permettant le sevrage complet des opioïdes et rééducation active.",
    short_desc_en: "Post-traumatic foot CRPS Type 1 with severe tactile allodynia and vasomotor changes. Dorsal root ganglion (DRG) stimulation yielding complete opioid cessation and active gait rehabilitation."
  },
  {
    id: 4,
    title_fr: "Bloc Diagnostique & Thérapeutique d'Arnold",
    title_en: "Arnold Nerve Diagnostic & Therapeutic Block",
    category_fr: "Céphalées & Névralgies",
    category_en: "Headaches & Neuralgias",
    image: "/images/treatments/blocs_anesthesiques.jpg",
    display_order: 4,
    is_active: 1,
    traitement_slug: "blocs-anesthesiques",
    traitement_name: "Blocs Anesthésiques Diagnostiques & Thérapeutiques",
    pathologie_slug: "nevralgie-arnold",
    short_desc_fr: "Névralgie occipitale unilatérale en coup d'éclair déclenchée par la rotation cervicale. Bloc échoguidé du grand nerf occipital avec anesthésique local et anti-inflammatoire ciblé, confirmant le diagnostic et stoppant les crises.",
    short_desc_en: "Unilateral occipital paroxysmal electric shock pain. Ultrasound-guided greater occipital nerve block providing definitive diagnostic confirmation and immediate cessation of crises."
  },
  {
    id: 5,
    title_fr: "Hypnoanalgésie & Réalité Virtuelle en Séance",
    title_en: "Medical Virtual Reality (HypnoVR) Session",
    category_fr: "Thérapie Innovante & Gestion Anxiété",
    category_en: "Virtual Therapy & Anxiety Control",
    image: "/images/treatments/hypnovr.jpg",
    display_order: 5,
    is_active: 1,
    traitement_slug: "hypnovr",
    traitement_name: "Réalité Virtuelle Thérapeutique (HypnoVR)",
    pathologie_slug: "douleurs-neuropathiques",
    short_desc_fr: "Protocole associant casque immersif 3D et suggestions hypnotiques cliniques lors de gestes interventionnels pour désactiver l'anticipation anxieuse et moduler les voies cortico-limbiques de la douleur.",
    short_desc_en: "Immersive 3D audio-visual protocol with clinical hypnotherapy suggestions during interventional procedures, reducing procedural anxiety and modulating pain pathways."
  },
  {
    id: 6,
    title_fr: "Traitement de la Migraine Réfractaire",
    title_en: "Refractory Chronic Migraine Treatment",
    category_fr: "Neurologie & Céphalées Chroniques",
    category_en: "Neurology & Chronic Headaches",
    image: "/images/migraine.jpg",
    display_order: 6,
    is_active: 1,
    traitement_slug: "toxine-botulique",
    traitement_name: "Injections de Toxine Botulique",
    pathologie_slug: "migraines",
    short_desc_fr: "Migraine chronique évoluant depuis plus de 6 ans, réfractaire aux triptans et bêtabloquants (>18 jours douloureux/mois). Application du protocole PREEMPT par micro-injections péricrâniennes avec diminution de 70% des crises.",
    short_desc_en: "Chronic migraine persisting for over 6 years (>18 headache days/month). Specialized PREEMPT protocol pericranial botulinum toxin injections reducing monthly crisis frequency by 70%."
  }
];
