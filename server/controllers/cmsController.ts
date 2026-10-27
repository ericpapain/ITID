import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import fs from 'fs';
import path from 'path';

export interface CasCliniqueItem {
  id: number;
  title_fr: string;
  title_en: string;
  category_fr: string;
  category_en: string;
  image: string;
  display_order: number;
  is_active: number;
  traitement_slug: string;
  traitement_name?: string;
  pathologie_slug?: string;
  short_desc_fr?: string;
  short_desc_en?: string;
  created_at?: string;
  updated_at?: string;
}

const realClinicalImages = [
  "/images/treatments/infiltrations_rachidiennes.jpg",
  "/images/treatments/radiofrequence.jpg",
  "/images/lombalgie.jpg",
  "/images/treatments/blocs_anesthesiques.jpg",
  "/images/treatments/hypnovr.jpg",
  "/images/migraine.jpg",
  "/images/nevralgie_arnold.jpg",
  "/images/sdrc.jpg",
  "/images/treatments/stimulation_ganglion_dorsal.jpg"
];

export function sanitizeCaseImage(img: string | undefined | null, index: number = 0): string {
  const fallback = realClinicalImages[index % realClinicalImages.length] || realClinicalImages[0];
  if (!img || typeof img !== 'string' || img.trim().length === 0) return fallback;
  const trimmed = img.trim();
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('unsplash.com')) return fallback;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:') && !trimmed.startsWith('/')) {
    return '/' + trimmed;
  }
  return trimmed;
}

// Initial seed data for Cas Cliniques avec liaison directe Traitement & Pathologie
const initialCasCliniques: CasCliniqueItem[] = [
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
    short_desc_en: "52-year-old patient with severe L5-S1 sciatica resistant to conventional analgesics. Image-guided foraminal infiltration resulting in complete radicular pain relief within 48h."
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


const dataDir = path.resolve(process.cwd(), 'server/data');
const casCliniquesFilePath = path.join(dataDir, 'cms_cas_cliniques.json');
const pagesFilePath = path.join(dataDir, 'cms_pages.json');
const pathologiesFilePath = path.join(dataDir, 'cms_pathologies.json');
const traitementsFilePath = path.join(dataDir, 'cms_traitements.json');
const articlesFilePath = path.join(dataDir, 'cms_articles.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadJsonFromDisk<T>(filePath: string, defaultVal: T): T {
  ensureDataDir();
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed as unknown as T;
      if (parsed !== null && parsed !== undefined && typeof parsed === 'object') return parsed;
    } catch {}
  }
  saveJsonToDisk(filePath, defaultVal);
  return defaultVal;
}

function saveJsonToDisk(filePath: string, data: any) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

const defaultPathologies = [
  { id: 1, slug: "lombalgie-chronique", title_fr: "Lombalgie chronique & Sciatique", title_en: "Chronic Lower Back Pain & Sciatica", icon: "🦴", color: "#48d1c2", short_desc_fr: "Douleurs lombaires persistantes de plus de 3 mois, souvent associées à des irradiations de type sciatique ou cruralgie.", short_desc_en: "Persistent lower back pain lasting more than 3 months.", card_image: "/images/lombalgie.jpg", hero_gallery: ["/images/lombalgie.jpg", "/images/spine_isolated.jpg", "/images/glowing_3d_spine.jpg"], display_order: 1, is_active: 1 },
  { id: 2, slug: "nevralgie-arnold", title_fr: "Névralgie d'Arnold (Occipitale)", title_en: "Occipital Neuralgia", icon: "⚡", color: "#2a9d8f", short_desc_fr: "Douleur neuropathique intense partant de la base du crâne et irradiant vers le sommet de la tête.", short_desc_en: "Severe neuropathic pain radiating from the skull base to the vertex.", card_image: "/images/nevralgie_arnold.jpg", hero_gallery: ["/images/nevralgie_arnold.jpg", "/images/migraine.jpg"], display_order: 2, is_active: 1 },
  { id: 3, slug: "sdrc", title_fr: "Syndrome Douloureux Régional Complexe (SDRC)", title_en: "Complex Regional Pain Syndrome (CRPS)", icon: "🔥", color: "#e76f51", short_desc_fr: "Syndrome douloureux disproportionné survenant après un traumatisme ou une chirurgie d'un membre.", short_desc_en: "Severe chronic neuropathic pain condition typically affecting a limb after trauma.", card_image: "/images/sdrc.jpg", hero_gallery: ["/images/sdrc.jpg", "/images/douleurs_articulaires.jpg"], display_order: 3, is_active: 1 },
  { id: 4, slug: "endometriose", title_fr: "Endométriose & Douleurs Pelviennes", title_en: "Endometriosis & Pelvic Pain", icon: "🌸", color: "#e9c46a", short_desc_fr: "Douleurs pelviennes chroniques invalidantes et neuropathie pudendale associées.", short_desc_en: "Chronic pelvic pain and neuropathic perineal pain.", card_image: "/images/endometriose.jpg", hero_gallery: ["/images/endometriose.jpg"], display_order: 4, is_active: 1 },
  { id: 5, slug: "douleurs-articulaires", title_fr: "Douleurs Articulaires & Arthrose", title_en: "Joint Pain & Osteoarthritis", icon: "🦿", color: "#f4a261", short_desc_fr: "Arthrose réfractaire du genou, de la hanche ou de l'épaule.", short_desc_en: "Refractory osteoarthritis of knee, hip or shoulder.", card_image: "/images/douleurs_articulaires.jpg", hero_gallery: ["/images/douleurs_articulaires.jpg"], display_order: 5, is_active: 1 },
  { id: 6, slug: "fibromyalgie", title_fr: "Fibromyalgie & Sensibilisation Centrale", title_en: "Fibromyalgia & Central Sensitization", icon: "🌬️", color: "#81b29a", short_desc_fr: "Douleur chronique diffuse associée à une fatigue intense et des troubles du sommeil.", short_desc_en: "Widespread chronic musculoskeletal pain.", card_image: "/images/fibromyalgie.jpg", hero_gallery: ["/images/fibromyalgie.jpg"], display_order: 6, is_active: 1 },
  { id: 7, slug: "douleurs-neuropathiques", title_fr: "Douleurs Neuropathiques Périphériques", title_en: "Peripheral Neuropathic Pain", icon: "💥", color: "#e07a5f", short_desc_fr: "Sensations de brûlures, décharges électriques et allodynie.", short_desc_en: "Burning sensation, electric shocks and allodynia.", card_image: "/images/douleurs_neuropathiques.jpg", hero_gallery: ["/images/douleurs_neuropathiques.jpg"], display_order: 7, is_active: 1 },
  { id: 8, slug: "douleurs-post-op", title_fr: "Douleurs Chroniques Post-Chirurgicales", title_en: "Chronic Post-Surgical Pain", icon: "⚕️", color: "#3d5a80", short_desc_fr: "Douleurs persistantes plus de 3 mois après une intervention chirurgicale.", short_desc_en: "Persistent surgical pain lasting longer than 3 months.", card_image: "/images/douleurs_post_op.jpg", hero_gallery: ["/images/douleurs_post_op.jpg"], display_order: 8, is_active: 1 },
  { id: 9, slug: "migraines", title_fr: "Migraines & Céphalées Réfractaires", title_en: "Refractory Migraines & Headaches", icon: "🧠", color: "#264653", short_desc_fr: "Crises migraineuses sévères et céphalées de tension chroniques résistantes.", short_desc_en: "Severe chronic migraines resistant to conventional medications.", card_image: "/images/migraine.jpg", hero_gallery: ["/images/migraine.jpg"], display_order: 9, is_active: 1 }
];

const defaultTraitements = [
  { id: 1, slug: "infiltrations-rachidiennes", num: "01", icon: "💉", title_fr: "Infiltrations Rachidiennes Guidées", title_en: "Image-Guided Spinal Injections", desc_front_fr: "Infiltrations épidurales, foraminales et articulaires postérieures sous guidage radiologique millimétrique.", desc_front_en: "Epidural, transforaminal and facet injections under precision imaging.", desc_back_fr: "Geste ciblé sous scopie permettant de déposer l'anti-inflammatoire au contact exact de la racine nerveuse enflammée.", desc_back_en: "Precision procedure depositing corticosteroid directly at the inflamed nerve root.", card_image: "/images/treatments/infiltrations_rachidiennes.jpg", hero_gallery: ["/images/treatments/infiltrations_rachidiennes.jpg"], display_order: 1, is_active: 1 },
  { id: 2, slug: "infiltrations-articulaires", num: "02", icon: "🦵", title_fr: "Infiltrations Articulaires Échoguidées", title_en: "Ultrasound-Guided Joint Injections", desc_front_fr: "Injections d'acide hyaluronique ou corticoïdes pour l'arthrose sévère de hanche, genou ou épaule.", desc_front_en: "Joint injections for hip, knee and shoulder osteoarthritis.", desc_back_fr: "Contrôle échographique continu garantissant une précision totale sans irradiation.", desc_back_en: "Real-time ultrasound guidance ensuring total accuracy without radiation.", card_image: "/images/treatments/infiltrations_articulaires.jpg", hero_gallery: ["/images/treatments/infiltrations_articulaires.jpg"], display_order: 2, is_active: 1 },
  { id: 3, slug: "perfusion-lidocaine", num: "03", icon: "💧", title_fr: "Perfusions de Lidocaïne / Kétamine", title_en: "Lidocaine / Ketamine Infusions", desc_front_fr: "Protocole hospitalier ambulatoire sous surveillance continue pour les douleurs réfractaires.", desc_front_en: "Hospital day-case infusion protocols for refractory neuropathic pain.", desc_back_fr: "Stabilisation des membranes neuronales hyper-excitables et désensibilisation centrale.", desc_back_en: "Membrane stabilization and central nervous system desensitization.", card_image: "/images/treatments/perfusion_lidocaine.jpg", hero_gallery: ["/images/treatments/perfusion_lidocaine.jpg"], display_order: 3, is_active: 1 },
  { id: 4, slug: "stimulation-ganglion-dorsal", num: "04", icon: "⚙️", title_fr: "Stimulation du Ganglion Spinal (DRG)", title_en: "Dorsal Root Ganglion Stimulation", desc_front_fr: "Neuromodulation de haute précision pour les douleurs focales rebelles.", desc_front_en: "High-precision neuromodulation for focal refractory pain.", desc_back_fr: "Ciblage électrophysiologique ultra-précis pour SDRC ou névralgie pelvienne.", desc_back_en: "Electrophysiological targeting for localized neuropathic conditions.", card_image: "/images/treatments/stimulation_ganglion_dorsal.jpg", hero_gallery: ["/images/treatments/stimulation_ganglion_dorsal.jpg"], display_order: 4, is_active: 1 },
  { id: 5, slug: "cryoneurolyse", num: "05", icon: "❄️", title_fr: "Cryoneurolyse Percutanée", title_en: "Percutaneous Cryoneurolysis", desc_front_fr: "Interruption thermique par le froid de la conduction nerveuse douloureuse.", desc_front_en: "Cold-induced temporary reversible block of sensory nerve conduction.", desc_back_fr: "Application d'un froid intense (-78°C) bloquant le signal douloureux de manière réversible.", desc_back_en: "Freezing of sensory nerves providing prolonged relief without motor deficit.", card_image: "/images/treatments/cryoneurolyse.jpg", hero_gallery: ["/images/treatments/cryoneurolyse.jpg"], display_order: 5, is_active: 1 },
  { id: 6, slug: "rtms", num: "06", icon: "🧠", title_fr: "Stimulation Magnétique Transcrânienne (rTMS)", title_en: "Repetitive Transcranial Magnetic Stimulation", desc_front_fr: "Modulation non invasive des circuits cérébraux de la douleur.", desc_front_en: "Non-invasive magnetic stimulation of cerebral pain processing networks.", desc_back_fr: "Impulsions magnétiques indolores stimulant les circuits inhibiteurs descendants.", desc_back_en: "Painless magnetic pulses activating descending pain inhibition.", card_image: "/images/treatments/rtms.jpg", hero_gallery: ["/images/treatments/rtms.jpg"], display_order: 6, is_active: 1 },
  { id: 7, slug: "blocs-anesthesiques", num: "07", icon: "🎯", title_fr: "Blocs Anesthésiques Diagnostiques & Thérapeutiques", title_en: "Diagnostic & Therapeutic Nerve Blocks", desc_front_fr: "Identification précise des branches nerveuses génératrices de douleur.", desc_front_en: "Pinpoint identification of sensory nerve pain generators.", desc_back_fr: "Blocs sélectifs d'Arnold, supra-scapulaire ou pudendal sous guidage échographique.", desc_back_en: "Selective anesthetic blocks providing crucial diagnostic confirmation.", card_image: "/images/treatments/blocs_anesthesiques.jpg", hero_gallery: ["/images/treatments/blocs_anesthesiques.jpg"], display_order: 7, is_active: 1 },
  { id: 8, slug: "radiofrequence", num: "08", icon: "🔥", title_fr: "Radiofréquence Pulsée & Thermique", title_en: "Pulsed & Thermal Radiofrequency", desc_front_fr: "Dénervation thermique ou neuromodulation pulsée sans lésion tissulaire.", desc_front_en: "Thermal denervation or non-destructive pulsed field neuromodulation.", desc_back_fr: "Rhizolyse des branches médianes pour arthrose facettaire avec soulagement prolongé.", desc_back_en: "Medial branch neurotomy providing durable relief for facet osteoarthritis.", card_image: "/images/treatments/radiofrequence.jpg", hero_gallery: ["/images/treatments/radiofrequence.jpg"], display_order: 8, is_active: 1 },
  { id: 9, slug: "toxine-botulique", num: "09", icon: "🔬", title_fr: "Injections de Toxine Botulique", title_en: "Botulinum Toxin Injections", desc_front_fr: "Traitement ciblé des migraines chroniques et syndromes myofasciaux rebelles.", desc_front_en: "Targeted therapy for chronic migraine and severe myofascial trigger points.", desc_back_fr: "Protocole PREEMPT pour migraine chronique réfractaire.", desc_back_en: "PREEMPT protocol injections relieving chronic refractory cranial headaches.", card_image: "/images/treatments/toxine_botulique.jpg", hero_gallery: ["/images/treatments/toxine_botulique.jpg"], display_order: 9, is_active: 1 },
  { id: 10, slug: "tens", num: "10", icon: "⚡", title_fr: "Neurostimulation Transcutanée (TENS)", title_en: "Transcutaneous Electrical Nerve Stimulation", desc_front_fr: "Thérapie d'auto-prise en charge à domicile via le Gate Control.", desc_front_en: "Patient-controlled home therapy via dorsal horn gate control mechanism.", desc_back_fr: "Apprentissage et réglage personnalisé de l'appareil pour un contrôle autonome quotidien.", desc_back_en: "Personalized device education and parameter setting for daily symptom modulation.", card_image: "/images/treatments/tens.jpg", hero_gallery: ["/images/treatments/tens.jpg"], display_order: 10, is_active: 1 },
  { id: 11, slug: "catheter-perinerveux", num: "11", icon: "🚰", title_fr: "Cathéters Périnerveux & Bloc Continu", title_en: "Perineural Catheters & Continuous Blocks", desc_front_fr: "Anesthésie loco-régionale prolongée pour rééducation intensive.", desc_front_en: "Prolonged regional anesthesia enabling intensive physical therapy.", desc_back_fr: "Perfusion continue d'anesthésique local brisant le cercle vicieux douleur-enraidissement.", desc_back_en: "Continuous local anesthetic infusion breaking pain-stiffness cycles.", card_image: "/images/treatments/catheter_perinerveux.jpg", hero_gallery: ["/images/treatments/catheter_perinerveux.jpg"], display_order: 11, is_active: 1 },
  { id: 12, slug: "patch-capsaicine", num: "12", icon: "🩹", title_fr: "Patch de Capsaïcine Haute Concentration (8%)", title_en: "High-Concentration Capsaicin Patch (8%)", desc_front_fr: "Désensibilisation des récepteurs TRPV1 pour douleurs neuropathiques périphériques.", desc_front_en: "TRPV1 receptor defunctionalization for localized neuropathic pain.", desc_back_fr: "Application hospitalière unique procurant jusqu'à 3 mois de soulagement.", desc_back_en: "Single application providing up to 3 months of sensory defunctionalization.", card_image: "/images/treatments/patch_capsaicine.jpg", hero_gallery: ["/images/treatments/patch_capsaicine.jpg"], display_order: 12, is_active: 1 },
  { id: 13, slug: "hypnovr", num: "13", icon: "🥽", title_fr: "Réalité Virtuelle Thérapeutique (HypnoVR)", title_en: "Medical Virtual Reality (HypnoVR)", desc_front_fr: "Hypnoanalgésie immersive pour réduire l'anxiété et la perception douloureuse lors des gestes.", desc_front_en: "Immersive hypnoanalgesia reducing peri-procedural pain and anxiety.", desc_back_fr: "Casque immersif associant visuels apaisants et suggestions hypnotiques validées scientifiquement.", desc_back_en: "Multi-sensory distraction combining soothing visuals and clinical hypnotherapy.", card_image: "/images/treatments/hypnovr.jpg", hero_gallery: ["/images/treatments/hypnovr.jpg"], display_order: 13, is_active: 1 }
];

const defaultArticles = [
  {
    id: 1,
    slug: "nouvelle-approche-neuromodulation",
    title_fr: "La Neuromodulation Médullaire : Une révolution silencieuse",
    title_en: "Spinal Cord Stimulation: A Silent Revolution",
    summary_fr: "Découvrez comment les implants de nouvelle génération transforment le quotidien des patients souffrant de douleurs neuropathiques réfractaires.",
    summary_en: "Discover how next-generation implants are transforming daily life for patients with refractory neuropathic pain.",
    category: "Innovations",
    author: "Dr. Marc Moreau",
    author_role_fr: "Neurochirurgien / Algologue",
    author_role_en: "Pain Specialist",
    date_published: "12 Octobre 2026",
    read_time_fr: "5 min",
    read_time_en: "5 min",
    cover_image: "/images/lombalgie.jpg",
    gallery_images: ["/images/lombalgie.jpg", "/images/spine_isolated.jpg", "/images/glowing_3d_spine.jpg"],
    is_published: 1,
    show_in_home: 1,
    is_featured: 1,
    home_title_fr: "La Neuromodulation Médullaire",
    home_title_en: "Spinal Cord Stimulation",
    home_desc_fr: "Comment les implants de nouvelle génération soulagent les douleurs chroniques rebelles.",
    home_desc_en: "How new generation implants relieve refractory chronic pain.",
    sections: [
      { id: "s1", title: "Qu'est-ce que la neuromodulation ?", content: "La stimulation médullaire consiste à implanter de fines électrodes au niveau de la moelle épinière pour intercepter le signal douloureux avant son arrivée au cerveau." }
    ],
    tags: "Neuromodulation, SDRC, Algologie"
  },
  {
    id: 2,
    slug: "hypnose-gestion-douleur",
    title_fr: "L'Hypnose Médicale : Reprendre le contrôle sur sa douleur",
    title_en: "Medical Hypnosis: Regaining Control Over Pain",
    summary_fr: "Une arme thérapeutique redoutable et validée scientifiquement contre les douleurs chroniques et l'anxiété.",
    summary_en: "A scientifically validated therapeutic tool against chronic pain and anxiety.",
    category: "Traitements",
    author: "Sophie Laurent",
    author_role_fr: "Psychologue / Hypnothérapeute",
    author_role_en: "Clinical Psychologist",
    date_published: "05 Octobre 2026",
    read_time_fr: "4 min",
    read_time_en: "4 min",
    cover_image: "/images/treatments/hypnovr.jpg",
    gallery_images: ["/images/treatments/hypnovr.jpg", "/images/sdrc.jpg"],
    is_published: 1,
    show_in_home: 1,
    is_featured: 0,
    home_title_fr: "L'Hypnose Médicale & Réalité Virtuelle",
    home_title_en: "Medical Hypnosis & Virtual Reality",
    home_desc_fr: "Reprendre le contrôle sur la perception douloureuse.",
    home_desc_en: "Regaining control over pain perception.",
    sections: [
      { id: "s1", title: "Mécanismes d'action", content: "L'hypnose permet de moduler l'activité du cortex cingulaire antérieur et de réactiver les circuits inhibiteurs de la douleur." }
    ],
    tags: "Hypnose, HypnoVR, Gestion Douleur"
  }
];

let inMemoryCasCliniques: CasCliniqueItem[] = loadJsonFromDisk(casCliniquesFilePath, initialCasCliniques);
let inMemoryPathologies: any[] = loadJsonFromDisk(pathologiesFilePath, defaultPathologies);
let inMemoryTraitements: any[] = loadJsonFromDisk(traitementsFilePath, defaultTraitements);
let inMemoryArticles: any[] = loadJsonFromDisk(articlesFilePath, defaultArticles);

// Initial pages
const defaultHeroMedia = [
  {
    id: 'media-1',
    type: 'video',
    url: '/images/video-fond.mp4',
    title: 'Vidéo Fond Institut (Originale)',
    duration: 12
  },
  {
    id: 'media-2',
    type: 'image',
    url: '/images/lombalgie.jpg',
    title: 'Plateau Interventionnel Guidé',
    duration: 7
  },
  {
    id: 'media-3',
    type: 'image',
    url: '/images/glowing_3d_spine.jpg',
    title: 'Imagerie Médicale Haute Définition',
    duration: 7
  }
];

const initialPages: Record<string, { content_fr: any; content_en: any }> = {
  home: {
    content_fr: {
      heroTitle1: "Institut du Traitement",
      heroTitle2: "Interventionnel de la Douleur",
      heroSubtitle: "Centre d'excellence dédié au diagnostic de précision et aux thérapeutiques interventionnelles guidées par imagerie pour les douleurs chroniques rebelles.",
      heroBtn1: "Prendre Rendez-vous",
      heroBtn1Url: "https://www.doctolib.fr",
      heroMediaList: defaultHeroMedia
    },
    content_en: {
      heroTitle1: "Institute for Interventional",
      heroTitle2: "Pain Management & Relief",
      heroSubtitle: "Center of excellence dedicated to precision diagnostics and image-guided interventional therapies for refractory chronic pain.",
      heroBtn1: "Book Appointment",
      heroBtn1Url: "https://www.doctolib.fr",
      heroMediaList: defaultHeroMedia
    }
  }
};

let inMemoryPages: Record<string, { content_fr: any; content_en: any }> = loadJsonFromDisk(pagesFilePath, initialPages);

// ----------------------------------------------------------------------
// Endpoints Publics
// ----------------------------------------------------------------------

export async function getPublicCasCliniques(req: Request, res: Response) {
  try {
    try {
      const rows: any = await executeQuery('SELECT * FROM cms_cas_cliniques WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
      if (rows && rows.length > 0) {
        return res.json({
          success: true,
          items: rows.map((r: any, idx: number) => ({ ...r, image: sanitizeCaseImage(r.image, idx) }))
        });
      }
    } catch {}

    const items = inMemoryCasCliniques
      .filter(c => c.is_active !== 0)
      .sort((a, b) => a.display_order - b.display_order)
      .map((c, idx) => ({ ...c, image: sanitizeCaseImage(c.image, idx) }));

    return res.json({ success: true, items });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPublicPageContent(req: Request, res: Response) {
  try {
    const pageKey = (req.query.page as string) || 'home';
    try {
      const rows: any = await executeQuery('SELECT * FROM cms_pages_content WHERE page_key = ? LIMIT 1', [pageKey]);
      if (rows && rows.length > 0) {
        const row = rows[0];
        return res.json({
          success: true,
          page_key: pageKey,
          content_fr: typeof row.content_fr === 'string' ? JSON.parse(row.content_fr || '{}') : row.content_fr,
          content_en: typeof row.content_en === 'string' ? JSON.parse(row.content_en || '{}') : row.content_en,
        });
      }
    } catch {}

    const pageData = inMemoryPages[pageKey] || { content_fr: {}, content_en: {} };
    return res.json({
      success: true,
      page_key: pageKey,
      content_fr: pageData.content_fr || {},
      content_en: pageData.content_en || {}
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPublicPathologies(req: Request, res: Response) {
  try {
    const { slug } = req.query;
    try {
      if (slug) {
        const rows: any = await executeQuery('SELECT * FROM cms_pathologies WHERE slug = ? AND is_active = 1 LIMIT 1', [slug]);
        if (rows && rows.length > 0) {
          const item = rows[0];
          item.hero_gallery = typeof item.hero_gallery_json === 'string' ? JSON.parse(item.hero_gallery_json || '[]') : item.hero_gallery_json || [];
          item.sections = typeof item.sections_json === 'string' ? JSON.parse(item.sections_json || '[]') : item.sections_json || item.sections || [];
          const matchingTraitements = inMemoryTraitements.filter(t => (t.is_active ?? 1) !== 0 && (
            (item.traitements_lies && Array.isArray(item.traitements_lies) && item.traitements_lies.includes(t.slug)) ||
            (t.slug && slug && (
              (slug === 'lombalgie-chronique' && ['infiltrations-rachidiennes', 'radiofrequence', 'perfusion-lidocaine'].includes(t.slug)) ||
              (slug === 'nevralgie-arnold' && ['blocs-anesthesiques', 'radiofrequence', 'cryoneurolyse'].includes(t.slug)) ||
              (slug === 'sdrc' && ['stimulation-ganglion-dorsal', 'perfusion-lidocaine', 'rtms'].includes(t.slug)) ||
              (slug === 'migraines' && ['toxine-botulique', 'blocs-anesthesiques', 'rtms'].includes(t.slug)) ||
              (slug === 'douleurs-articulaires' && ['infiltrations-articulaires', 'radiofrequence', 'cryoneurolyse'].includes(t.slug)) ||
              (slug === 'endometriose' && ['blocs-anesthesiques', 'perfusion-lidocaine', 'hypnovr'].includes(t.slug)) ||
              (slug === 'fibromyalgie' && ['rtms', 'perfusion-lidocaine', 'hypnovr', 'tens'].includes(t.slug)) ||
              (slug === 'douleurs-neuropathiques' && ['patch-capsaicine', 'stimulation-ganglion-dorsal', 'catheter-perinerveux'].includes(t.slug)) ||
              (slug === 'douleurs-post-op' && ['catheter-perinerveux', 'cryoneurolyse', 'perfusion-lidocaine'].includes(t.slug))
            ))
          ));
          item.associated_traitements = matchingTraitements;
          return res.json({ success: true, pathology: item });
        }
      } else {
        const rows: any = await executeQuery('SELECT * FROM cms_pathologies WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
        if (rows && rows.length > 0) {
          const items = rows.map((r: any) => ({
            ...r,
            hero_gallery: typeof r.hero_gallery_json === 'string' ? JSON.parse(r.hero_gallery_json || '[]') : r.hero_gallery_json || [],
            sections: typeof r.sections_json === 'string' ? JSON.parse(r.sections_json || '[]') : r.sections_json || r.sections || []
          }));
          return res.json({ success: true, pathologies: items });
        }
      }
    } catch {}

    // Fallback mémoire / disque
    if (slug) {
      const cleanSlug = (slug as string).toLowerCase().trim();
      const found = inMemoryPathologies.find(p => (
        p.slug === cleanSlug ||
        (p.slug && (p.slug.includes(cleanSlug) || cleanSlug.includes(p.slug))) ||
        (p.title_fr && p.title_fr.toLowerCase().includes(cleanSlug.replace(/-/g, ' ')))
      ));
      if (found) {
        const sections = typeof found.sections_json === 'string'
          ? JSON.parse(found.sections_json || '[]')
          : (Array.isArray(found.sections) ? found.sections : []);
        const matchingTraitements = inMemoryTraitements.filter(t => (t.is_active ?? 1) !== 0 && (
          (found.traitements_lies && Array.isArray(found.traitements_lies) && found.traitements_lies.includes(t.slug)) ||
          (t.slug && slug && (
            (slug === 'lombalgie-chronique' && ['infiltrations-rachidiennes', 'radiofrequence', 'perfusion-lidocaine'].includes(t.slug)) ||
            (slug === 'nevralgie-arnold' && ['blocs-anesthesiques', 'radiofrequence', 'cryoneurolyse'].includes(t.slug)) ||
            (slug === 'sdrc' && ['stimulation-ganglion-dorsal', 'perfusion-lidocaine', 'rtms'].includes(t.slug)) ||
            (slug === 'migraines' && ['toxine-botulique', 'blocs-anesthesiques', 'rtms'].includes(t.slug)) ||
            (slug === 'douleurs-articulaires' && ['infiltrations-articulaires', 'radiofrequence', 'cryoneurolyse'].includes(t.slug)) ||
            (slug === 'endometriose' && ['blocs-anesthesiques', 'perfusion-lidocaine', 'hypnovr'].includes(t.slug)) ||
            (slug === 'fibromyalgie' && ['rtms', 'perfusion-lidocaine', 'hypnovr', 'tens'].includes(t.slug)) ||
            (slug === 'douleurs-neuropathiques' && ['patch-capsaicine', 'stimulation-ganglion-dorsal', 'catheter-perinerveux'].includes(t.slug)) ||
            (slug === 'douleurs-post-op' && ['catheter-perinerveux', 'cryoneurolyse', 'perfusion-lidocaine'].includes(t.slug))
          ))
        ));
        return res.json({ success: true, pathology: { ...found, sections, associated_traitements: matchingTraitements } });
      }
      return res.status(404).json({ success: false, error: 'Pathologie introuvable' });
    }
    return res.json({
      success: true,
      pathologies: inMemoryPathologies.map(p => ({
        ...p,
        sections: typeof p.sections_json === 'string' ? JSON.parse(p.sections_json || '[]') : (Array.isArray(p.sections) ? p.sections : [])
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPublicTraitements(req: Request, res: Response) {
  try {
    const { slug } = req.query;
    try {
      if (slug) {
        const rows: any = await executeQuery('SELECT * FROM cms_traitements WHERE slug = ? AND is_active = 1 LIMIT 1', [slug]);
        if (rows && rows.length > 0) {
          const item = rows[0];
          item.hero_gallery = typeof item.hero_gallery_json === 'string' ? JSON.parse(item.hero_gallery_json || '[]') : item.hero_gallery_json || [];
          item.sections = typeof item.sections_json === 'string' ? JSON.parse(item.sections_json || '[]') : item.sections_json || item.sections || [];
          const matchingCas = inMemoryCasCliniques
            .filter(c => (c.is_active ?? 1) !== 0 && c.traitement_slug === slug)
            .map((c, idx) => ({ ...c, image: sanitizeCaseImage(c.image, idx) }));
          item.associated_cas_cliniques = matchingCas;
          return res.json({ success: true, traitement: item });
        }
      } else {
        const rows: any = await executeQuery('SELECT * FROM cms_traitements WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
        if (rows && rows.length > 0) {
          const items = rows.map((r: any) => ({
            ...r,
            hero_gallery: typeof r.hero_gallery_json === 'string' ? JSON.parse(r.hero_gallery_json || '[]') : r.hero_gallery_json || [],
            sections: typeof r.sections_json === 'string' ? JSON.parse(r.sections_json || '[]') : r.sections_json || r.sections || []
          }));
          return res.json({ success: true, traitements: items });
        }
      }
    } catch {}

    if (slug) {
      const cleanSlug = (slug as string).toLowerCase().trim();
      const found = inMemoryTraitements.find(t => (
        t.slug === cleanSlug ||
        (t.slug && (t.slug.includes(cleanSlug) || cleanSlug.includes(t.slug))) ||
        (t.title_fr && t.title_fr.toLowerCase().includes(cleanSlug.replace(/-/g, ' ')))
      ));
      if (found) {
        const sections = typeof found.sections_json === 'string'
          ? JSON.parse(found.sections_json || '[]')
          : (Array.isArray(found.sections) ? found.sections : []);
        const matchingCas = inMemoryCasCliniques
          .filter(c => (c.is_active ?? 1) !== 0 && c.traitement_slug === slug)
          .map((c, idx) => ({ ...c, image: sanitizeCaseImage(c.image, idx) }));
        return res.json({ success: true, traitement: { ...found, sections, associated_cas_cliniques: matchingCas } });
      }
      return res.status(404).json({ success: false, error: 'Traitement introuvable' });
    }
    return res.json({
      success: true,
      traitements: inMemoryTraitements.map(t => ({
        ...t,
        sections: typeof t.sections_json === 'string' ? JSON.parse(t.sections_json || '[]') : (Array.isArray(t.sections) ? t.sections : [])
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPublicArticles(req: Request, res: Response) {
  try {
    const { slug } = req.query;
    try {
      if (slug) {
        const rows: any = await executeQuery('SELECT * FROM cms_articles WHERE slug = ? AND is_published = 1 LIMIT 1', [slug]);
        if (rows && rows.length > 0) {
          const item = rows[0];
          item.gallery_images = typeof item.gallery_images_json === 'string' ? JSON.parse(item.gallery_images_json || '[]') : item.gallery_images_json || [];
          item.sections = typeof item.sections_json === 'string' ? JSON.parse(item.sections_json || '[]') : item.sections_json || [];
          return res.json({ success: true, article: item });
        }
      } else {
        const rows: any = await executeQuery('SELECT * FROM cms_articles WHERE is_published = 1 ORDER BY is_featured DESC, id DESC');
        if (rows && rows.length > 0) {
          const items = rows.map((r: any) => ({
            ...r,
            gallery_images: typeof r.gallery_images_json === 'string' ? JSON.parse(r.gallery_images_json || '[]') : r.gallery_images_json || [],
            sections: typeof r.sections_json === 'string' ? JSON.parse(r.sections_json || '[]') : r.sections_json || []
          }));
          return res.json({ success: true, articles: items });
        }
      }
    } catch {}

    if (slug) {
      const found = inMemoryArticles.find(a => a.slug === slug);
      if (found) return res.json({ success: true, article: found });
      return res.status(404).json({ success: false, error: 'Article introuvable' });
    }
    return res.json({ success: true, articles: inMemoryArticles });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ----------------------------------------------------------------------
// Route Admin CMS Unifiée (/api/admin/cms)
// ----------------------------------------------------------------------

export async function handleAdminCms(req: Request, res: Response) {
  const method = req.method;
  const type = (req.query.type as string) || '';
  const id = req.query.id ? parseInt(req.query.id as string, 10) : null;
  const body = req.body || {};

  // 1. CAS CLINIQUES
  if (type === 'cas_cliniques') {
    if (method === 'GET') {
      try {
        const rows: any = await executeQuery('SELECT * FROM cms_cas_cliniques ORDER BY display_order ASC, id ASC');
        if (Array.isArray(rows)) {
          return res.json({ success: true, items: rows.map((r: any, idx: number) => ({ ...r, image: sanitizeCaseImage(r.image, idx) })) });
        }
      } catch {}
      return res.json({ success: true, items: inMemoryCasCliniques });
    }

    if (method === 'POST') {
      const newItem: CasCliniqueItem = {
        id: Date.now(),
        title_fr: body.title_fr || 'Nouveau Cas Clinique',
        title_en: body.title_en || 'New Clinical Case',
        category_fr: body.category_fr || 'Geste Interventionnel',
        category_en: body.category_en || 'Interventional Procedure',
        image: sanitizeCaseImage(body.image, inMemoryCasCliniques.length),
        display_order: parseInt(body.display_order ?? 0, 10),
        is_active: body.is_active !== undefined ? parseInt(body.is_active, 10) : 1,
        traitement_slug: body.traitement_slug || 'infiltrations-rachidiennes',
        traitement_name: body.traitement_name || '',
        pathologie_slug: body.pathologie_slug || 'lombalgie-chronique',
        short_desc_fr: body.short_desc_fr || '',
        short_desc_en: body.short_desc_en || '',
      };

      try {
        await executeQuery(
          'INSERT INTO cms_cas_cliniques (title_fr, title_en, category_fr, category_en, image, display_order, is_active, traitement_slug, pathologie_slug, short_desc_fr, short_desc_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newItem.title_fr, newItem.title_en, newItem.category_fr, newItem.category_en, newItem.image, newItem.display_order, newItem.is_active, newItem.traitement_slug, newItem.pathologie_slug, newItem.short_desc_fr, newItem.short_desc_en]
        );
      } catch {
        try {
          await executeQuery(
            'INSERT INTO cms_cas_cliniques (title_fr, title_en, category_fr, category_en, image, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newItem.title_fr, newItem.title_en, newItem.category_fr, newItem.category_en, newItem.image, newItem.display_order, newItem.is_active]
          );
        } catch {}
      }
      inMemoryCasCliniques.push(newItem);
      saveJsonToDisk(casCliniquesFilePath, inMemoryCasCliniques);
      return res.json({ success: true, id: newItem.id, message: 'Cas clinique créé avec succès.' });
    }

    if (method === 'PUT') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      try {
        await executeQuery(
          'UPDATE cms_cas_cliniques SET title_fr = ?, title_en = ?, category_fr = ?, category_en = ?, image = ?, display_order = ?, is_active = ?, traitement_slug = ?, pathologie_slug = ?, short_desc_fr = ?, short_desc_en = ? WHERE id = ?',
          [body.title_fr, body.title_en, body.category_fr, body.category_en, body.image, body.display_order, body.is_active, body.traitement_slug || 'infiltrations-rachidiennes', body.pathologie_slug || 'lombalgie-chronique', body.short_desc_fr || '', body.short_desc_en || '', id]
        );
      } catch {
        try {
          await executeQuery(
            'UPDATE cms_cas_cliniques SET title_fr = ?, title_en = ?, category_fr = ?, category_en = ?, image = ?, display_order = ?, is_active = ? WHERE id = ?',
            [body.title_fr, body.title_en, body.category_fr, body.category_en, body.image, body.display_order, body.is_active, id]
          );
        } catch {}
      }
      const idx = inMemoryCasCliniques.findIndex(c => c.id === id);
      if (idx !== -1) {
        inMemoryCasCliniques[idx] = { ...inMemoryCasCliniques[idx], ...body, id };
        saveJsonToDisk(casCliniquesFilePath, inMemoryCasCliniques);
      }
      return res.json({ success: true, id, message: 'Cas clinique mis à jour avec succès.' });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      try {
        await executeQuery('DELETE FROM cms_cas_cliniques WHERE id = ?', [id]);
      } catch {}
      inMemoryCasCliniques = inMemoryCasCliniques.filter(c => c.id !== id);
      saveJsonToDisk(casCliniquesFilePath, inMemoryCasCliniques);
      return res.json({ success: true, message: 'Cas clinique supprimé avec succès.' });
    }
  }


  // 2. PATHOLOGIES
  if (type === 'pathologies') {
    if (method === 'GET') {
      try {
        const rows: any = await executeQuery('SELECT * FROM cms_pathologies ORDER BY display_order ASC, id ASC');
        if (Array.isArray(rows)) {
          const items = rows.map((r: any) => ({
            ...r,
            hero_gallery: typeof r.hero_gallery_json === 'string' ? JSON.parse(r.hero_gallery_json || '[]') : r.hero_gallery_json || [],
            sections: typeof r.sections_json === 'string' ? JSON.parse(r.sections_json || '[]') : r.sections_json || r.sections || []
          }));
          return res.json({ success: true, items });
        }
      } catch {}
      return res.json({ success: true, items: inMemoryPathologies });
    }

    if (method === 'POST') {
      const slug = body.slug || `pathologie-${Date.now()}`;
      const heroGalleryJson = JSON.stringify(body.hero_gallery || []);
      const sectionsJson = JSON.stringify(body.sections || []);
      const newId = Date.now();
      try {
        await executeQuery(
          `INSERT INTO cms_pathologies (
            slug, title_fr, title_en, icon, color, short_desc_fr, short_desc_en, card_image, hero_gallery_json,
            section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
            section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
            section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
            section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
            wikipedia_url, display_order, is_active, sections_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            slug, body.title_fr, body.title_en, body.icon || '🩺', body.color || '#48d1c2',
            body.short_desc_fr || '', body.short_desc_en || '', body.card_image || '/images/lombalgie.jpg', heroGalleryJson,
            body.section1_title_fr || '', body.section1_title_en || '', body.section1_text_fr || '', body.section1_text_en || '', body.section1_image || '',
            body.section2_title_fr || '', body.section2_title_en || '', body.section2_text_fr || '', body.section2_text_en || '', body.section2_image || '',
            body.section3_title_fr || '', body.section3_title_en || '', body.section3_text_fr || '', body.section3_text_en || '', body.section3_image || '',
            body.section4_title_fr || '', body.section4_title_en || '', body.section4_text_fr || '', body.section4_text_en || '', body.section4_image || '',
            body.wikipedia_url || '', parseInt(body.display_order ?? 0, 10), body.is_active !== undefined ? parseInt(body.is_active, 10) : 1,
            sectionsJson
          ]
        );
      } catch {
        try {
          await executeQuery(
            `INSERT INTO cms_pathologies (
              slug, title_fr, title_en, icon, color, short_desc_fr, short_desc_en, card_image, hero_gallery_json,
              section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
              section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
              section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
              section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
              wikipedia_url, display_order, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              slug, body.title_fr, body.title_en, body.icon || '🩺', body.color || '#48d1c2',
              body.short_desc_fr || '', body.short_desc_en || '', body.card_image || '/images/lombalgie.jpg', heroGalleryJson,
              body.section1_title_fr || '', body.section1_title_en || '', body.section1_text_fr || '', body.section1_text_en || '', body.section1_image || '',
              body.section2_title_fr || '', body.section2_title_en || '', body.section2_text_fr || '', body.section2_text_en || '', body.section2_image || '',
              body.section3_title_fr || '', body.section3_title_en || '', body.section3_text_fr || '', body.section3_text_en || '', body.section3_image || '',
              body.section4_title_fr || '', body.section4_title_en || '', body.section4_text_fr || '', body.section4_text_en || '', body.section4_image || '',
              body.wikipedia_url || '', parseInt(body.display_order ?? 0, 10), body.is_active !== undefined ? parseInt(body.is_active, 10) : 1
            ]
          );
        } catch {}
      }
      inMemoryPathologies.push({ ...body, id: newId, slug, sections: body.sections || [] });
      saveJsonToDisk(pathologiesFilePath, inMemoryPathologies);
      return res.json({ success: true, id: newId, message: 'Pathologie créée avec succès.' });
    }

    if (method === 'PUT') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      const heroGalleryJson = JSON.stringify(body.hero_gallery || []);
      const sectionsJson = JSON.stringify(body.sections || []);
      try {
        await executeQuery(
          `UPDATE cms_pathologies SET
            slug = ?, title_fr = ?, title_en = ?, icon = ?, color = ?, short_desc_fr = ?, short_desc_en = ?, card_image = ?, hero_gallery_json = ?,
            section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
            section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
            section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
            section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
            wikipedia_url = ?, display_order = ?, is_active = ?, sections_json = ?
          WHERE id = ?`,
          [
            body.slug, body.title_fr, body.title_en, body.icon, body.color,
            body.short_desc_fr, body.short_desc_en, body.card_image, heroGalleryJson,
            body.section1_title_fr, body.section1_title_en, body.section1_text_fr, body.section1_text_en, body.section1_image,
            body.section2_title_fr, body.section2_title_en, body.section2_text_fr, body.section2_text_en, body.section2_image,
            body.section3_title_fr, body.section3_title_en, body.section3_text_fr, body.section3_text_en, body.section3_image,
            body.section4_title_fr, body.section4_title_en, body.section4_text_fr, body.section4_text_en, body.section4_image,
            body.wikipedia_url, parseInt(body.display_order ?? 0, 10), parseInt(body.is_active ?? 1, 10), sectionsJson, id
          ]
        );
      } catch {
        try {
          await executeQuery(
            `UPDATE cms_pathologies SET
              slug = ?, title_fr = ?, title_en = ?, icon = ?, color = ?, short_desc_fr = ?, short_desc_en = ?, card_image = ?, hero_gallery_json = ?,
              section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
              section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
              section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
              section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
              wikipedia_url = ?, display_order = ?, is_active = ?
            WHERE id = ?`,
            [
              body.slug, body.title_fr, body.title_en, body.icon, body.color,
              body.short_desc_fr, body.short_desc_en, body.card_image, heroGalleryJson,
              body.section1_title_fr, body.section1_title_en, body.section1_text_fr, body.section1_text_en, body.section1_image,
              body.section2_title_fr, body.section2_title_en, body.section2_text_fr, body.section2_text_en, body.section2_image,
              body.section3_title_fr, body.section3_title_en, body.section3_text_fr, body.section3_text_en, body.section3_image,
              body.section4_title_fr, body.section4_title_en, body.section4_text_fr, body.section4_text_en, body.section4_image,
              body.wikipedia_url, parseInt(body.display_order ?? 0, 10), parseInt(body.is_active ?? 1, 10), id
            ]
          );
        } catch {}
      }
      const idx = inMemoryPathologies.findIndex(p => p.id === id);
      if (idx !== -1) {
        inMemoryPathologies[idx] = { ...inMemoryPathologies[idx], ...body, id, sections: body.sections || inMemoryPathologies[idx].sections || [] };
        saveJsonToDisk(pathologiesFilePath, inMemoryPathologies);
      }
      return res.json({ success: true, message: 'Pathologie mise à jour avec succès.' });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      try {
        await executeQuery('DELETE FROM cms_pathologies WHERE id = ?', [id]);
      } catch {}
      inMemoryPathologies = inMemoryPathologies.filter(p => p.id !== id);
      saveJsonToDisk(pathologiesFilePath, inMemoryPathologies);
      return res.json({ success: true, message: 'Pathologie supprimée avec succès.' });
    }
  }

  // 3. TRAITEMENTS
  if (type === 'traitements') {
    if (method === 'GET') {
      try {
        const rows: any = await executeQuery('SELECT * FROM cms_traitements ORDER BY display_order ASC, id ASC');
        if (Array.isArray(rows)) {
          const items = rows.map((r: any) => ({
            ...r,
            hero_gallery: typeof r.hero_gallery_json === 'string' ? JSON.parse(r.hero_gallery_json || '[]') : r.hero_gallery_json || [],
            sections: typeof r.sections_json === 'string' ? JSON.parse(r.sections_json || '[]') : r.sections_json || r.sections || []
          }));
          return res.json({ success: true, items });
        }
      } catch {}
      return res.json({ success: true, items: inMemoryTraitements });
    }

    if (method === 'POST') {
      const slug = body.slug || `traitement-${Date.now()}`;
      const heroGalleryJson = JSON.stringify(body.hero_gallery || []);
      const sectionsJson = JSON.stringify(body.sections || []);
      const newId = Date.now();
      try {
        await executeQuery(
          `INSERT INTO cms_traitements (
            slug, num, icon, title_fr, title_en, desc_front_fr, desc_front_en, desc_back_fr, desc_back_en,
            card_image, hero_gallery_json,
            section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
            section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
            section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
            section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
            cta_text_fr, cta_text_en, cta_url, display_order, is_active, sections_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            slug, body.num || '01', body.icon || '💉', body.title_fr, body.title_en,
            body.desc_front_fr || '', body.desc_front_en || '', body.desc_back_fr || '', body.desc_back_en || '',
            body.card_image || '/images/treatments/infiltrations_rachidiennes.jpg', heroGalleryJson,
            body.section1_title_fr || '', body.section1_title_en || '', body.section1_text_fr || '', body.section1_text_en || '', body.section1_image || '',
            body.section2_title_fr || '', body.section2_title_en || '', body.section2_text_fr || '', body.section2_text_en || '', body.section2_image || '',
            body.section3_title_fr || '', body.section3_title_en || '', body.section3_text_fr || '', body.section3_text_en || '', body.section3_image || '',
            body.section4_title_fr || '', body.section4_title_en || '', body.section4_text_fr || '', body.section4_text_en || '', body.section4_image || '',
            body.cta_text_fr || 'Prendre rendez-vous', body.cta_text_en || 'Book Appointment', body.cta_url || '#contact',
            parseInt(body.display_order ?? 0, 10), body.is_active !== undefined ? parseInt(body.is_active, 10) : 1,
            sectionsJson
          ]
        );
      } catch {
        try {
          await executeQuery(
            `INSERT INTO cms_traitements (
              slug, num, icon, title_fr, title_en, desc_front_fr, desc_front_en, desc_back_fr, desc_back_en,
              card_image, hero_gallery_json,
              section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
              section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
              section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
              section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
              cta_text_fr, cta_text_en, cta_url, display_order, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              slug, body.num || '01', body.icon || '💉', body.title_fr, body.title_en,
              body.desc_front_fr || '', body.desc_front_en || '', body.desc_back_fr || '', body.desc_back_en || '',
              body.card_image || '/images/treatments/infiltrations_rachidiennes.jpg', heroGalleryJson,
              body.section1_title_fr || '', body.section1_title_en || '', body.section1_text_fr || '', body.section1_text_en || '', body.section1_image || '',
              body.section2_title_fr || '', body.section2_title_en || '', body.section2_text_fr || '', body.section2_text_en || '', body.section2_image || '',
              body.section3_title_fr || '', body.section3_title_en || '', body.section3_text_fr || '', body.section3_text_en || '', body.section3_image || '',
              body.section4_title_fr || '', body.section4_title_en || '', body.section4_text_fr || '', body.section4_text_en || '', body.section4_image || '',
              body.cta_text_fr || 'Prendre rendez-vous', body.cta_text_en || 'Book Appointment', body.cta_url || '#contact',
              parseInt(body.display_order ?? 0, 10), body.is_active !== undefined ? parseInt(body.is_active, 10) : 1
            ]
          );
        } catch {}
      }
      inMemoryTraitements.push({ ...body, id: newId, slug, sections: body.sections || [] });
      saveJsonToDisk(traitementsFilePath, inMemoryTraitements);
      return res.json({ success: true, id: newId, message: 'Traitement créé avec succès.' });
    }

    if (method === 'PUT') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      const heroGalleryJson = JSON.stringify(body.hero_gallery || []);
      const sectionsJson = JSON.stringify(body.sections || []);
      try {
        await executeQuery(
          `UPDATE cms_traitements SET
            slug = ?, num = ?, icon = ?, title_fr = ?, title_en = ?, desc_front_fr = ?, desc_front_en = ?, desc_back_fr = ?, desc_back_en = ?,
            card_image = ?, hero_gallery_json = ?,
            section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
            section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
            section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
            section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
            cta_text_fr = ?, cta_text_en = ?, cta_url = ?, display_order = ?, is_active = ?, sections_json = ?
          WHERE id = ?`,
          [
            body.slug, body.num, body.icon, body.title_fr, body.title_en,
            body.desc_front_fr, body.desc_front_en, body.desc_back_fr, body.desc_back_en,
            body.card_image, heroGalleryJson,
            body.section1_title_fr, body.section1_title_en, body.section1_text_fr, body.section1_text_en, body.section1_image,
            body.section2_title_fr, body.section2_title_en, body.section2_text_fr, body.section2_text_en, body.section2_image,
            body.section3_title_fr, body.section3_title_en, body.section3_text_fr, body.section3_text_en, body.section3_image,
            body.section4_title_fr, body.section4_title_en, body.section4_text_fr, body.section4_text_en, body.section4_image,
            body.cta_text_fr, body.cta_text_en, body.cta_url, parseInt(body.display_order ?? 0, 10), parseInt(body.is_active ?? 1, 10), sectionsJson, id
          ]
        );
      } catch {
        try {
          await executeQuery(
            `UPDATE cms_traitements SET
              slug = ?, num = ?, icon = ?, title_fr = ?, title_en = ?, desc_front_fr = ?, desc_front_en = ?, desc_back_fr = ?, desc_back_en = ?,
              card_image = ?, hero_gallery_json = ?,
              section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
              section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
              section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
              section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
              cta_text_fr = ?, cta_text_en = ?, cta_url = ?, display_order = ?, is_active = ?
            WHERE id = ?`,
            [
              body.slug, body.num, body.icon, body.title_fr, body.title_en,
              body.desc_front_fr, body.desc_front_en, body.desc_back_fr, body.desc_back_en,
              body.card_image, heroGalleryJson,
              body.section1_title_fr, body.section1_title_en, body.section1_text_fr, body.section1_text_en, body.section1_image,
              body.section2_title_fr, body.section2_title_en, body.section2_text_fr, body.section2_text_en, body.section2_image,
              body.section3_title_fr, body.section3_title_en, body.section3_text_fr, body.section3_text_en, body.section3_image,
              body.section4_title_fr, body.section4_title_en, body.section4_text_fr, body.section4_text_en, body.section4_image,
              body.cta_text_fr, body.cta_text_en, body.cta_url, parseInt(body.display_order ?? 0, 10), parseInt(body.is_active ?? 1, 10), id
            ]
          );
        } catch {}
      }
      const idx = inMemoryTraitements.findIndex(t => t.id === id);
      if (idx !== -1) {
        inMemoryTraitements[idx] = { ...inMemoryTraitements[idx], ...body, id, sections: body.sections || inMemoryTraitements[idx].sections || [] };
        saveJsonToDisk(traitementsFilePath, inMemoryTraitements);
      }
      return res.json({ success: true, message: 'Traitement mis à jour avec succès.' });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      try {
        await executeQuery('DELETE FROM cms_traitements WHERE id = ?', [id]);
      } catch {}
      inMemoryTraitements = inMemoryTraitements.filter(t => t.id !== id);
      saveJsonToDisk(traitementsFilePath, inMemoryTraitements);
      return res.json({ success: true, message: 'Traitement supprimé avec succès.' });
    }
  }

  // 4. ARTICLES / ACTUALITÉS
  if (type === 'articles') {
    if (method === 'GET') {
      try {
        const rows: any = await executeQuery('SELECT * FROM cms_articles ORDER BY is_featured DESC, id DESC');
        if (Array.isArray(rows)) {
          const items = rows.map((r: any, idx: number) => {
            const cleanCover = sanitizeCaseImage(r.cover_image, idx);
            const rawGallery = typeof r.gallery_images_json === 'string' ? JSON.parse(r.gallery_images_json || '[]') : r.gallery_images_json || [];
            const cleanGallery = Array.isArray(rawGallery) && rawGallery.length > 0
              ? rawGallery.map((img: string, gIdx: number) => sanitizeCaseImage(img, gIdx))
              : [cleanCover, '/images/glowing_3d_spine.jpg', '/images/treatments/infiltrations_rachidiennes.jpg'];
            
            const rawSections = typeof r.sections_json === 'string' ? JSON.parse(r.sections_json || '[]') : r.sections_json || [];
            const cleanSections = Array.isArray(rawSections) ? rawSections.map((s: any, sIdx: number) => ({
              ...s,
              image: s.image ? sanitizeCaseImage(s.image, sIdx + 1) : undefined
            })) : [];

            return {
              ...r,
              cover_image: cleanCover,
              gallery_images: cleanGallery,
              sections: cleanSections
            };
          });
          return res.json({ success: true, items });
        }
      } catch {}
      return res.json({ success: true, items: inMemoryArticles });
    }

    if (method === 'POST') {
      const slug = body.slug || `article-${Date.now()}`;
      const galleryJson = JSON.stringify(body.gallery_images || []);
      const sectionsJson = JSON.stringify(body.sections || []);
      const newId = Date.now();
      try {
        await executeQuery(
          `INSERT INTO cms_articles (
            slug, title_fr, title_en, summary_fr, summary_en, content_fr, content_en,
            category, author, author_role_fr, author_role_en, date_published, read_time_fr, read_time_en,
            cover_image, gallery_images_json, is_published,
            show_in_home, is_featured, home_title_fr, home_title_en, home_desc_fr, home_desc_en,
            sections_json, tags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            slug, body.title_fr, body.title_en, body.summary_fr, body.summary_en, body.content_fr || '', body.content_en || '',
            body.category || 'Innovations', body.author || 'Dr. Marc Moreau', body.author_role_fr || 'Algologue', body.author_role_en || 'Pain Specialist',
            body.date_published || '12 Octobre 2026', body.read_time_fr || '5 min', body.read_time_en || '5 min',
            body.cover_image || '/images/lombalgie.jpg', galleryJson, body.is_published !== undefined ? parseInt(body.is_published, 10) : 1,
            body.show_in_home !== undefined ? parseInt(body.show_in_home, 10) : 1, body.is_featured !== undefined ? parseInt(body.is_featured, 10) : 0,
            body.home_title_fr || null, body.home_title_en || null, body.home_desc_fr || null, body.home_desc_en || null,
            sectionsJson, body.tags || ''
          ]
        );
      } catch {}
      inMemoryArticles.push({ ...body, id: newId, slug });
      saveJsonToDisk(articlesFilePath, inMemoryArticles);
      return res.json({ success: true, id: newId, message: 'Article créé avec succès.' });
    }

    if (method === 'PUT') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      const galleryJson = JSON.stringify(body.gallery_images || []);
      const sectionsJson = JSON.stringify(body.sections || []);
      try {
        await executeQuery(
          `UPDATE cms_articles SET
            slug = ?, title_fr = ?, title_en = ?, summary_fr = ?, summary_en = ?, content_fr = ?, content_en = ?,
            category = ?, author = ?, author_role_fr = ?, author_role_en = ?, date_published = ?, read_time_fr = ?, read_time_en = ?,
            cover_image = ?, gallery_images_json = ?, is_published = ?,
            show_in_home = ?, is_featured = ?, home_title_fr = ?, home_title_en = ?, home_desc_fr = ?, home_desc_en = ?,
            sections_json = ?, tags = ?
          WHERE id = ?`,
          [
            body.slug, body.title_fr, body.title_en, body.summary_fr, body.summary_en, body.content_fr || '', body.content_en || '',
            body.category, body.author, body.author_role_fr, body.author_role_en, body.date_published, body.read_time_fr, body.read_time_en,
            body.cover_image, galleryJson, parseInt(body.is_published ?? 1, 10),
            parseInt(body.show_in_home ?? 1, 10), parseInt(body.is_featured ?? 0, 10), body.home_title_fr || null, body.home_title_en || null,
            body.home_desc_fr || null, body.home_desc_en || null, sectionsJson, body.tags || '', id
          ]
        );
      } catch {}
      const idx = inMemoryArticles.findIndex(a => a.id === id);
      if (idx !== -1) {
        inMemoryArticles[idx] = { ...inMemoryArticles[idx], ...body, id };
        saveJsonToDisk(articlesFilePath, inMemoryArticles);
      }
      return res.json({ success: true, message: 'Article mis à jour avec succès.' });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      try {
        await executeQuery('DELETE FROM cms_articles WHERE id = ?', [id]);
      } catch {}
      inMemoryArticles = inMemoryArticles.filter(a => a.id !== id);
      saveJsonToDisk(articlesFilePath, inMemoryArticles);
      return res.json({ success: true, message: 'Article supprimé avec succès.' });
    }
  }

  // 5. PAGES (home, about)
  if (type === 'pages') {
    const pageKey = (req.query.page as string) || 'home';

    if (method === 'GET') {
      try {
        const rows: any = await executeQuery('SELECT * FROM cms_pages_content WHERE page_key = ? LIMIT 1', [pageKey]);
        if (rows && rows.length > 0) {
          const row = rows[0];
          return res.json({
            success: true,
            page_key: pageKey,
            content_fr: typeof row.content_fr === 'string' ? JSON.parse(row.content_fr || '{}') : row.content_fr,
            content_en: typeof row.content_en === 'string' ? JSON.parse(row.content_en || '{}') : row.content_en,
          });
        }
      } catch {}

      const pageData = inMemoryPages[pageKey] || { content_fr: {}, content_en: {} };
      return res.json({
        success: true,
        page_key: pageKey,
        content_fr: pageData.content_fr || {},
        content_en: pageData.content_en || {}
      });
    }

    if (method === 'PUT' || method === 'POST') {
      const contentFrStr = JSON.stringify(body.content_fr || {});
      const contentEnStr = JSON.stringify(body.content_en || {});
      try {
        await executeQuery(
          `INSERT INTO cms_pages_content (page_key, content_fr, content_en) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE content_fr = VALUES(content_fr), content_en = VALUES(content_en)`,
          [pageKey, contentFrStr, contentEnStr]
        );
      } catch {}

      inMemoryPages[pageKey] = {
        content_fr: body.content_fr || {},
        content_en: body.content_en || {}
      };
      saveJsonToDisk(pagesFilePath, inMemoryPages);
      return res.json({ success: true, message: 'Page enregistrée avec succès.' });
    }
  }

  // 6. BACKUP & RESTORE CMS
  if (type === 'backup') {
    const action = (req.query.action as string) || 'export';

    if (action === 'export') {
      const backupPayload = {
        export_version: '1.0',
        exported_at: new Date().toISOString(),
        source: 'ITID France CMS',
        counts: {
          pages: Object.keys(inMemoryPages).length,
          articles: inMemoryArticles.length,
          cas_cliniques: inMemoryCasCliniques.length,
          pathologies: inMemoryPathologies.length,
          traitements: inMemoryTraitements.length
        },
        data: {
          pages: inMemoryPages,
          articles: inMemoryArticles,
          cas_cliniques: inMemoryCasCliniques,
          pathologies: inMemoryPathologies,
          traitements: inMemoryTraitements
        }
      };

      if (req.query.download === '1') {
        const filename = `itid_cms_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(JSON.stringify(backupPayload, null, 2));
      }

      return res.json({ success: true, backup: backupPayload });
    }

    if (action === 'export_images') {
      try {
        const archiverModule = await import('archiver');
        const archiver = archiverModule.default;
        const filename = `itid_images_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        archive.append(`ITID France — Sauvegarde Médias\nDate: ${new Date().toISOString()}\n`, { name: 'INFO_ARCHIVE_ITID.txt' });

        const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
        if (fs.existsSync(uploadsPath)) {
          archive.directory(uploadsPath, 'uploads');
        }

        const imagesPath = path.join(process.cwd(), 'public', 'images');
        if (fs.existsSync(imagesPath)) {
          archive.directory(imagesPath, 'images');
        }

        await archive.finalize();
        return;
      } catch (err: any) {
        return res.status(500).json({ success: false, error: "Erreur d'exportation des images : " + err.message });
      }
    }

    if (action === 'restore' && method === 'POST') {
      const data = body.data || (body.backup?.data || (body.backup || body));
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, error: 'Données de sauvegarde invalides.' });
      }

      const restoredCounts = {
        pages: 0,
        articles: 0,
        cas_cliniques: 0,
        pathologies: 0,
        traitements: 0
      };

      if (data.pages && typeof data.pages === 'object') {
        inMemoryPages = data.pages;
        saveJsonToDisk(pagesFilePath, inMemoryPages);
        restoredCounts.pages = Object.keys(inMemoryPages).length;
      }
      if (Array.isArray(data.articles)) {
        inMemoryArticles = data.articles;
        saveJsonToDisk(articlesFilePath, inMemoryArticles);
        restoredCounts.articles = inMemoryArticles.length;
      }
      if (Array.isArray(data.cas_cliniques)) {
        inMemoryCasCliniques = data.cas_cliniques;
        saveJsonToDisk(casCliniquesFilePath, inMemoryCasCliniques);
        restoredCounts.cas_cliniques = inMemoryCasCliniques.length;
      }
      if (Array.isArray(data.pathologies)) {
        inMemoryPathologies = data.pathologies;
        saveJsonToDisk(pathologiesFilePath, inMemoryPathologies);
        restoredCounts.pathologies = inMemoryPathologies.length;
      }
      if (Array.isArray(data.traitements)) {
        inMemoryTraitements = data.traitements;
        saveJsonToDisk(traitementsFilePath, inMemoryTraitements);
        restoredCounts.traitements = inMemoryTraitements.length;
      }

      return res.json({
        success: true,
        message: 'Restauration complète du CMS effectuée avec succès !',
        restored_counts: restoredCounts,
        counts: restoredCounts
      });
    }

    return res.status(400).json({ success: false, error: 'Action backup inconnue' });
  }

  return res.status(400).json({ success: false, error: `Type non supporté : ${type}` });
}
