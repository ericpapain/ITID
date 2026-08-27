import doctorImg from "./images/doctor.png";
import doctoreImg from "./images/doctore.jpg";

export const NAV_LINKS = [
  { label: "Accueil", href: "/", view: "home" },
  { label: "Pathologies", href: "/pathologies", view: "pathologies" },
  { label: "Traitements", href: "/traitements", view: "traitements" },
  { label: "Équipe", href: "/equipe", view: "equipe" },
  { label: "Formations", href: "/formations", view: "formations" },
  { label: "Assistant IA", href: "/ia", view: "ia" },
  { label: "A propos de nous", href: "/a-propos", view: "a-propos" },
];

export const PATHOLOGIES = [
  {
    icon: "🦴",
    title: "Lombalgies, sciatiques & cruralgies",
    desc: "Arthrose, hernies discales, canal lombaire étroit — prise en charge interventionnelle ciblée.",
  },
  {
    icon: "⚡",
    title: "Douleurs neuropathiques",
    desc: "Brûlures, fourmillements, allodynie — atteintes nerveuses périphériques et centrales.",
  },
  {
    icon: "🔥",
    title: "SDRC / Algodystrophie",
    desc: "Syndrome douloureux régional complexe post-traumatique ou post-chirurgical.",
  },
  {
    icon: "🦿",
    title: "Douleurs articulaires",
    desc: "Épaule, hanche, genou — arthrose évoluée, tendinopathies réfractaires.",
  },
  {
    icon: "🌸",
    title: "Douleurs pelviennes & endométriose",
    desc: "Suivi pluridisciplinaire avec gynécologue et urologues spécialisés.",
  },
  {
    icon: "🧠",
    title: "Céphalées & migraines résistantes",
    desc: "Protocoles spécifiques pour les formes résistantes aux traitements standards.",
  },
];

export const TRAITEMENTS = [
  {
    num: "01",
    title: "Infiltrations rachidiennes & articulaires",
    desc: "Infiltrations de facettes, racines nerveuses, épidurales — guidées par imagerie pour une précision maximale.",
    icon: "💉",
  },
  {
    num: "02",
    title: "Perfusions de lidocaïne",
    desc: "Administrées en hôpital de jour, indiquées pour les douleurs neuropathiques réfractaires.",
    icon: "🏥",
  },
  {
    num: "03",
    title: "Stimulation du ganglion dorsal",
    desc: "Neuromodulation de pointe, particulièrement efficace dans l'algodystrophie et les douleurs radiculaires.",
    icon: "⚙️",
  },
  {
    num: "04",
    title: "Cryoneurolyse",
    desc: "Traitement par froid contrôlé de nerfs périphériques — alternative non chirurgicale durable.",
    icon: "❄️",
  },
  {
    num: "05",
    title: "Hypnose médicale & sophrologie",
    desc: "Approches intégratives complémentaires pour la gestion cognitive et émotionnelle de la douleur.",
    icon: "🧘",
  },
  {
    num: "06",
    title: "Coordination pluridisciplinaire",
    desc: "Neurologues, psychiatres, psychologues, urologues — un réseau complet autour de chaque patient.",
    icon: "🤝",
  },
];

export const TEAM_ROLES = [
  { role: "Médecins algologues", detail: "Spécialistes de l'évaluation et du traitement de la douleur. Ils incluent également des médecins en formation spécialisée, apportant expertise clinique et innovation dans chaque protocole de soins.", icon: "👨‍⚕️", img: doctorImg },
  { role: "Neurologue", detail: "Collaborateur expert du système nerveux central et périphérique. Intervient spécifiquement sur les douleurs neuropathiques et les migraines complexes.", icon: "🧠", img: doctoreImg },
  { role: "Neurologue", detail: "Collaborateur expert du système nerveux central et périphérique. Intervient spécifiquement sur les douleurs neuropathiques et les migraines complexes.", icon: "🧠", img: doctorImg },
  { role: "Neurologue", detail: "Collaborateur expert du système nerveux central et périphérique. Intervient spécifiquement sur les douleurs neuropathiques et les migraines complexes.", icon: "🧠", img: doctoreImg },
  { role: "Psychiatre", detail: "Un soutien psychologique fondamental, totalement intégré au parcours. Vous accompagne pour gérer l'impact émotionnel et cognitif de la douleur chronique.", icon: "💬", img: doctorImg },
  { role: "Psychiatre", detail: "Un soutien psychologique fondamental, totalement intégré au parcours. Vous accompagne pour gérer l'impact émotionnel et cognitif de la douleur chronique.", icon: "💬", img: doctoreImg },
  { role: "Psychologue", detail: "Un soutien psychologique fondamental, totalement intégré au parcours. Vous accompagne pour gérer l'impact émotionnel et cognitif de la douleur chronique.", icon: "💬", img: doctorImg },
  { role: "Hypnothérapeute & Sophrologue", detail: "Partenaire dédié aux approches complémentaires non-médicamenteuses. Utilise la relaxation profonde pour modifier votre perception de la douleur.", icon: "🧘", img: doctoreImg },
  { role: "Hypnothérapeute & Sophrologue", detail: "Partenaire dédié aux approches complémentaires non-médicamenteuses. Utilise la relaxation profonde pour modifier votre perception de la douleur.", icon: "🧘", img: doctorImg },
  { role: "Gynécologue", detail: "Médecin spécialisé dans la prise en charge des douleurs pelviennes, de l'endométriose et des troubles fonctionnels associés.", icon: "🩺", img: doctoreImg },
  { role: "Urologue", detail: "Médecin spécialisé dans la prise en charge des douleurs pelviennes, de l'endométriose et des troubles fonctionnels associés.", icon: "🩺", img: doctorImg },
  { role: "Urologue", detail: "Médecin spécialisé dans la prise en charge des douleurs pelviennes, de l'endométriose et des troubles fonctionnels associés.", icon: "🩺", img: doctoreImg },
  { role: "Infirmières spécialisées douleur", detail: "Véritables piliers du centre, elles sont présentes à chaque étape de votre suivi, assurent les soins techniques et garantissent un soutien continu.", icon: "💉", img: doctoreImg },
];

export const PARCOURS = [
  { step: "01", title: "Orientation médicale", desc: "Adressé par votre médecin traitant ou un spécialiste." },
  { step: "02", title: "Consultation d'évaluation", desc: "Bilan complet avec un médecin algologue." },
  { step: "03", title: "Plan de traitement", desc: "Protocole personnalisé, co-construit avec l'équipe." },
  { step: "04", title: "Suivi & réévaluation", desc: "Ajustements réguliers pour une prise en charge optimale." },
];

const PRO_TITLES = [
  "Infiltration échoguidée lombaire",
  "Neuromodulation sacrée avancée",
  "Gestion des douleurs neuropathiques sévères",
  "Radiofréquence pulsée du ganglion dorsal",
  "Cryoneurolyse des nerfs périphériques",
  "Échographie musculo-squelettique interventionnelle",
  "Approches pharmacologiques complexes",
  "Blocs sympathiques et prise en charge du SDRC"
];

const PUBLIC_TITLES = [
  "Comprendre l'origine de la douleur",
  "Exercices d'étirement pour soulager le dos",
  "Méditation et pleine conscience",
  "Alimentation anti-inflammatoire",
  "Améliorer son sommeil malgré la douleur",
  "Gérer les crises douloureuses aiguës",
  "L'impact psychologique de la douleur",
  "Ergonomie au travail et à la maison"
];

const PARA_TITLES = [
  "Outils d'évaluation de la douleur",
  "Suivi post-opératoire des patients",
  "Accompagnement psychologique de 1ère ligne",
  "Rééducation douce et mobilisation",
  "Éducation thérapeutique du patient",
  "Dépistage des signaux d'alerte",
  "Gestion des effets secondaires des traitements",
  "Hypnose et relaxation en soins infirmiers"
];

const getRandomTitles = (titles: string[]) => {
  const count = Math.floor(Math.random() * 4) + 3; // 3 to 6
  const shuffled = [...titles].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateSubVideos = () => {
  const count = Math.floor(Math.random() * 4) + 3; // 3 to 6
  const prefixes = ["Théorie", "Pratique", "Cas d'étude", "Q&A", "Démonstration", "Évaluation"];
  return Array.from({ length: count }).map((_, i) => ({
    title: `Vidéos ${i + 1} : ${prefixes[Math.floor(Math.random() * prefixes.length)]}`,
    duration: `${Math.floor(Math.random() * 15) + 5} min`
  }));
};

export const CATEGORIES_FORMATIONS = [
  {
    id: "pro",
    tag: "Professionnel de santé",
    title: "Douleur Chronique : Évaluation & Prise en Charge Interventionnelle",
    desc: "Découvrez notre parcours complet de formations vidéo à destination des médecins et spécialistes.",
    videos: getRandomTitles(PRO_TITLES).map((title, i) => ({
      id: `pro-${i}`,
      title: title,
      duration: `${Math.floor(Math.random() * 3) + 1}h${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      price: "290 €",
      img: `https://images.unsplash.com/photo-1758691462749-a95ce1bd7f96?w=600&h=380&fit=crop&auto=format&q=${i}`,
      subVideos: generateSubVideos()
    }))
  },
  {
    id: "public",
    tag: "Grand public",
    title: "Comprendre et Mieux Vivre avec la Douleur Chronique",
    desc: "Modules pédagogiques pour vous aider à comprendre et apaiser votre douleur au quotidien.",
    videos: getRandomTitles(PUBLIC_TITLES).map((title, i) => ({
      id: `pub-${i}`,
      title: title,
      duration: `${Math.floor(Math.random() * 2) + 1}h${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      price: "89 €",
      img: `https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?w=600&h=380&fit=crop&auto=format&q=${i}`,
      subVideos: generateSubVideos()
    }))
  },
  {
    id: "paramedical",
    tag: "Infirmier·ère / Kiné",
    title: "Techniques d'Évaluation et Outils d'Accompagnement",
    desc: "Catalogue de formations sur le suivi et l'accompagnement thérapeutique.",
    videos: getRandomTitles(PARA_TITLES).map((title, i) => ({
      id: `para-${i}`,
      title: title,
      duration: `${Math.floor(Math.random() * 2) + 1}h${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      price: "149 €",
      img: `https://images.unsplash.com/photo-1758691462743-f9fc9e430d39?w=600&h=380&fit=crop&auto=format&q=${i}`,
      subVideos: generateSubVideos()
    }))
  },
];

export type Video = { id: string; title: string; duration: string; price: string; img: string; subVideos: { title: string; duration: string }[] };
export type Category = typeof CATEGORIES_FORMATIONS[0];
