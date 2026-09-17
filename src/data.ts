import doctorImg from "./images/doctor.png";
import doctoreImg from "./images/doctore.jpg";

import lombalgieImg from "./images/lombalgie.jpg";
import nevralgieArnoldImg from "./images/nevralgie_arnold.jpg";
import sdrcImg from "./images/sdrc.jpg";
import endometrioseImg from "./images/endometriose.jpg";
import douleursArticulairesImg from "./images/douleurs_articulaires.jpg";
import fibromyalgieImg from "./images/fibromyalgie.jpg";
import douleursNeuropathiquesImg from "./images/douleurs_neuropathiques.jpg";
import douleursPostOpImg from "./images/douleurs_post_op.jpg";
import migraineImg from "./images/migraine.jpg";

import traitement1Img from "./images/treatments/infiltrations_rachidiennes.jpg";
import traitement2Img from "./images/treatments/infiltrations_articulaires.jpg";
import traitement3Img from "./images/treatments/perfusion_lidocaine.jpg";
import traitement4Img from "./images/treatments/stimulation_ganglion_dorsal.jpg";
import traitement5Img from "./images/treatments/cryoneurolyse.jpg";
import traitement6Img from "./images/treatments/rtms.jpg";
import traitement7Img from "./images/treatments/blocs_anesthesiques.jpg";
import traitement8Img from "./images/treatments/radiofrequence.jpg";
import traitement9Img from "./images/treatments/toxine_botulique.jpg";
import traitement10Img from "./images/treatments/tens.jpg";
import traitement11Img from "./images/treatments/catheter_perinerveux.jpg";
import traitement12Img from "./images/treatments/patch_capsaicine.jpg";
import traitement13Img from "./images/treatments/hypnovr.jpg";

export const NAV_LINKS = [
  { label: "nav.home", href: "/", view: "home" },
  { label: "nav.pathologies", href: "/pathologies", view: "pathologies" },
  { label: "nav.treatments", href: "/traitements", view: "traitements" },
  { label: "nav.news", href: "/actualites", view: "actualites" },
  // { label: "nav.team", href: "/equipe", view: "equipe" },
  { label: "nav.training", href: "/formations", view: "formations" },
  { label: "nav.ai", href: "/ia", view: "ia" },
  { label: "nav.about", href: "/a-propos", view: "a-propos" },
];

export const PATHOLOGIES = [
  { icon: "🦴", title: "pathologies.lombalgie.title", desc: "pathologies.lombalgie.desc", color: "#48d1c2", borderColor: "#48d1c240", wikipediaUrl: "https://fr.wikipedia.org/wiki/Lombalgie", img: lombalgieImg },
  { icon: "⚡", title: "pathologies.nevralgie_arnold.title", desc: "pathologies.nevralgie_arnold.desc", color: "#2a9d8f", borderColor: "#2a9d8f40", wikipediaUrl: "https://fr.wikipedia.org/wiki/N%C3%A9vralgie_d%27Arnold", img: nevralgieArnoldImg },
  { icon: "🔥", title: "pathologies.sdrc.title", desc: "pathologies.sdrc.desc", color: "#e76f51", borderColor: "#e76f5140", wikipediaUrl: "https://fr.wikipedia.org/wiki/Syndrome_douloureux_r%C3%A9gional_complexe", img: sdrcImg },
  { icon: "🌸", title: "pathologies.endometriose.title", desc: "pathologies.endometriose.desc", color: "#e9c46a", borderColor: "#e9c46a40", wikipediaUrl: "https://fr.wikipedia.org/wiki/Endom%C3%A9triose", img: endometrioseImg },
  { icon: "🦿", title: "pathologies.douleurs_articulaires.title", desc: "pathologies.douleurs_articulaires.desc", color: "#f4a261", borderColor: "#f4a26140", wikipediaUrl: "https://fr.wikipedia.org/wiki/Arthralgie", img: douleursArticulairesImg },
  { icon: "🌬️", title: "pathologies.fibromyalgie.title", desc: "pathologies.fibromyalgie.desc", color: "#81b29a", borderColor: "#81b29a40", wikipediaUrl: "https://fr.wikipedia.org/wiki/Fibromyalgie", img: fibromyalgieImg },
  { icon: "💥", title: "pathologies.douleurs_neuropathiques.title", desc: "pathologies.douleurs_neuropathiques.desc", color: "#e07a5f", borderColor: "#e07a5f40", wikipediaUrl: "https://fr.wikipedia.org/wiki/Douleur_neuropathique", img: douleursNeuropathiquesImg },
  { icon: "⚕️", title: "pathologies.douleurs_post_op.title", desc: "pathologies.douleurs_post_op.desc", color: "#3d5a80", borderColor: "#3d5a8040", wikipediaUrl: "https://fr.wikipedia.org/wiki/Douleur", img: douleursPostOpImg },
  { icon: "🧠", title: "pathologies.migraine.title", desc: "pathologies.migraine.desc", color: "#264653", borderColor: "#26465340", wikipediaUrl: "https://fr.wikipedia.org/wiki/Migraine", img: migraineImg }
];

export const TRAITEMENTS = [
  { num: "01", title: "treatments.t01.title", desc: "treatments.t01.desc", icon: "💉", img: traitement1Img },
  { num: "02", title: "treatments.t02.title", desc: "treatments.t02.desc", icon: "🦵", img: traitement2Img },
  { num: "03", title: "treatments.t03.title", desc: "treatments.t03.desc", icon: "💧", img: traitement3Img },
  { num: "04", title: "treatments.t04.title", desc: "treatments.t04.desc", icon: "⚙️", img: traitement4Img },
  { num: "05", title: "treatments.t05.title", desc: "treatments.t05.desc", icon: "❄️", img: traitement5Img },
  { num: "06", title: "treatments.t06.title", desc: "treatments.t06.desc", icon: "🧠", img: traitement6Img },
  { num: "07", title: "treatments.t07.title", desc: "treatments.t07.desc", icon: "🎯", img: traitement7Img },
  { num: "08", title: "treatments.t08.title", desc: "treatments.t08.desc", icon: "🔥", img: traitement8Img },
  { num: "09", title: "treatments.t09.title", desc: "treatments.t09.desc", icon: "🔬", img: traitement9Img },
  { num: "10", title: "treatments.t10.title", desc: "treatments.t10.desc", icon: "⚡", img: traitement10Img },
  { num: "11", title: "treatments.t11.title", desc: "treatments.t11.desc", icon: "🚰", img: traitement11Img },
  { num: "12", title: "treatments.t12.title", desc: "treatments.t12.desc", icon: "🩹", img: traitement12Img },
  { num: "13", title: "treatments.t13.title", desc: "treatments.t13.desc", icon: "🥽", img: traitement13Img },
  { num: "14", title: "treatments.t14.title", desc: "treatments.t14.desc", icon: "⚡", img: "https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=600&h=450&fit=crop" }
];

export const TEAM_ROLES = [
  // Medecin
  { category: "Medecin", role: "team.medecin_algologue.role", detail: "team.medecin_algologue.detail", icon: "👨‍⚕️", img: doctorImg },
  { category: "Medecin", role: "team.neurologue.role", detail: "team.neurologue.detail", icon: "🧠", img: doctoreImg },
  { category: "Medecin", role: "team.psychiatre.role", detail: "team.psychiatre.detail", icon: "💬", img: doctorImg },
  { category: "Medecin", role: "team.gynecologue.role", detail: "team.gynecologue.detail", icon: "🩺", img: doctoreImg },
  { category: "Medecin", role: "team.urologue.role", detail: "team.urologue.detail", icon: "🩺", img: doctorImg },
  // Infirmière & paramédical
  { category: "Infirmière", role: "team.infirmiere_douleur.role", detail: "team.infirmiere_douleur.detail", icon: "💉", img: doctoreImg },
  { category: "Infirmière", role: "team.psychologue.role", detail: "team.psychologue.detail", icon: "💬", img: doctorImg },
  { category: "Infirmière", role: "team.hypno_sophro.role", detail: "team.hypno_sophro.detail", icon: "🧘", img: doctoreImg },
  // Secretaire
  { category: "Secretaire", role: "team.secretaire.role", detail: "team.secretaire.detail", icon: "📝", img: doctoreImg },
];

export const PARCOURS = [
  { step: "01", title: "parcours.step1.title", desc: "parcours.step1.desc" },
  { step: "02", title: "parcours.step2.title", desc: "parcours.step2.desc" },
  { step: "03", title: "parcours.step3.title", desc: "parcours.step3.desc" },
  { step: "04", title: "parcours.step4.title", desc: "parcours.step4.desc" },
];

const PRO_TITLES = [
  "formations.pro_titles.v0",
  "formations.pro_titles.v1",
  "formations.pro_titles.v2",
  "formations.pro_titles.v3",
  "formations.pro_titles.v4",
  "formations.pro_titles.v5",
  "formations.pro_titles.v6",
  "formations.pro_titles.v7"
];

const PUBLIC_TITLES = [
  "formations.public_titles.v0",
  "formations.public_titles.v1",
  "formations.public_titles.v2",
  "formations.public_titles.v3",
  "formations.public_titles.v4",
  "formations.public_titles.v5",
  "formations.public_titles.v6",
  "formations.public_titles.v7"
];

const PARA_TITLES = [
  "formations.para_titles.v0",
  "formations.para_titles.v1",
  "formations.para_titles.v2",
  "formations.para_titles.v3",
  "formations.para_titles.v4",
  "formations.para_titles.v5",
  "formations.para_titles.v6",
  "formations.para_titles.v7"
];

const getRandomTitles = (titles: string[]) => {
  const count = Math.floor(Math.random() * 4) + 3;
  const shuffled = [...titles].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateSubVideos = () => {
  const count = Math.floor(Math.random() * 4) + 3;
  const prefixes = [
    "formations.prefixes.theory", 
    "formations.prefixes.practice", 
    "formations.prefixes.case", 
    "formations.prefixes.qa", 
    "formations.prefixes.demo", 
    "formations.prefixes.eval"
  ];
  return Array.from({ length: count }).map((_, i) => ({
    title: prefixes[Math.floor(Math.random() * prefixes.length)],
    index: i + 1,
    duration: `${Math.floor(Math.random() * 15) + 5} min`
  }));
};

export const CATEGORIES_FORMATIONS = [
  {
    id: "pro",
    tag: "formations.pro.tag",
    title: "formations.pro.title",
    desc: "formations.pro.desc",
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
    tag: "formations.public.tag",
    title: "formations.public.title",
    desc: "formations.public.desc",
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
    tag: "formations.paramedical.tag",
    title: "formations.paramedical.title",
    desc: "formations.paramedical.desc",
    videos: getRandomTitles(PARA_TITLES).map((title, i) => ({
      id: `para-${i}`,
      title: title,
      duration: `${Math.floor(Math.random() * 2) + 1}h${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      price: "149 €",
      img: `https://images.unsplash.com/photo-1758691462743-f9fc9e430d39?w=600&h=380&fit=crop&auto=format&q=${i}`,
      subVideos: generateSubVideos()
    }))
  }
];

export type Video = { id: string; title: string; duration: string; price: string; img: string; subVideos: { title: string; index: number; duration: string }[] };
export type Category = typeof CATEGORIES_FORMATIONS[0];