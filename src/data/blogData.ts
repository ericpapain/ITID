export type BlogCategory = "Innovations" | "Conseils Patients" | "Traitements" | "Vie de l'Institut";

export interface ArticleSection {
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
  content: string | string[];
  imageUrl?: string;
  imageAlt?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: BlogCategory;
  coverImage: string;
  sections: ArticleSection[];
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Innovations",
  "Conseils Patients",
  "Traitements",
  "Vie de l'Institut"
];

export const BLOG_ARTICLES: Article[] = [
  {
    id: "nouvelle-approche-neuromodulation",
    title: "La Neuromodulation Médullaire : Une révolution silencieuse",
    summary: "Découvrez comment les implants de nouvelle génération transforment le quotidien des patients souffrant de douleurs neuropathiques réfractaires.",
    author: "Dr. Marc Moreau",
    authorRole: "Neurochirurgien / Algologue",
    date: "12 Septembre 2026",
    readTime: "5 min",
    category: "Innovations",
    coverImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop",
    sections: [
      {
        type: 'heading',
        content: "Qu'est-ce que la neuromodulation médullaire ?"
      },
      {
        type: 'paragraph',
        content: "La stimulation médullaire est une technique chirurgicale consistant à implanter des électrodes au niveau de la moelle épinière. Ces électrodes délivrent de faibles impulsions électriques qui bloquent ou modifient le signal douloureux avant qu'il n'atteigne le cerveau."
      },
      {
        type: 'quote',
        content: "Aujourd'hui, les nouveaux générateurs ajustent la stimulation en temps réel selon la position du patient. C'est une avancée majeure."
      },
      {
        type: 'heading',
        content: "Pour qui est-ce indiqué ?"
      },
      {
        type: 'list',
        content: [
          "Syndromes Douloureux Régionaux Complexes (SDRC)",
          "Douleurs neuropathiques périphériques persistantes",
          "Lombosciatiques chroniques après chirurgie (FBSS)"
        ]
      },
      {
        type: 'paragraph',
        content: "À l'ITID, nous proposons une évaluation multidisciplinaire complète avant d'envisager cette solution, garantissant ainsi un taux de succès optimal pour nos patients."
      }
    ]
  },
  {
    id: "hypnose-gestion-douleur",
    title: "L'Hypnose Médicale : Reprendre le contrôle sur sa douleur",
    summary: "Souvent perçue avec scepticisme, l'hypnose médicale est aujourd'hui une arme thérapeutique redoutable et validée scientifiquement contre la douleur chronique.",
    author: "Sophie Laurent",
    authorRole: "Psychologue / Hypnothérapeute",
    date: "05 Septembre 2026",
    readTime: "4 min",
    category: "Traitements",
    coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop",
    sections: [
      {
        type: 'heading',
        content: "Démystifier l'hypnose"
      },
      {
        type: 'paragraph',
        content: "L'hypnose médicale n'a rien à voir avec l'hypnose de spectacle. Il s'agit d'un état de conscience modifiée, naturel, que nous expérimentons tous (par exemple, lorsque nous sommes absorbés par un livre ou un film)."
      },
      {
        type: 'paragraph',
        content: "Dans le cadre de la douleur chronique, l'hypnose permet de modifier la perception du signal douloureux par le cerveau, diminuant ainsi son intensité et son impact émotionnel."
      },
      {
        type: 'heading',
        content: "Les bénéfices concrets"
      },
      {
        type: 'list',
        content: [
          "Réduction de l'intensité douloureuse",
          "Diminution de l'anxiété liée à la douleur anticipatoire",
          "Amélioration de la qualité du sommeil",
          "Réduction de la consommation d'antalgiques"
        ]
      }
    ]
  },
  {
    id: "alimentation-anti-inflammatoire",
    title: "Nutrition et Douleur : L'assiette anti-inflammatoire",
    summary: "Ce que nous mangeons influence directement notre niveau d'inflammation corporelle. Guide pratique des aliments à privilégier pour soulager ses douleurs.",
    author: "Dr. Emma Petit",
    authorRole: "Médecin Nutritionniste",
    date: "28 Août 2026",
    readTime: "6 min",
    category: "Conseils Patients",
    coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop",
    sections: [
      {
        type: 'heading',
        content: "Le lien entre intestin et inflammation"
      },
      {
        type: 'paragraph',
        content: "Notre microbiote intestinal joue un rôle clé dans la régulation de notre système immunitaire. Une flore intestinale déséquilibrée (dysbiose) peut favoriser une inflammation systémique de bas grade, exacerbant les douleurs chroniques existantes."
      },
      {
        type: 'heading',
        content: "Les piliers de l'alimentation anti-inflammatoire"
      },
      {
        type: 'list',
        content: [
          "Oméga-3 (petits poissons gras, huile de noix, graines de lin)",
          "Antioxydants (fruits rouges, légumes colorés, épices comme le curcuma)",
          "Réduction des sucres raffinés et des aliments ultra-transformés",
          "Hydratation optimale (eau, thé vert)"
        ]
      },
      {
        type: 'quote',
        content: "L'alimentation ne remplace pas un traitement médical, mais elle est le terrain sur lequel la guérison peut s'enraciner."
      }
    ]
  },
  {
    id: "inauguration-nouveau-plateau",
    title: "Inauguration de notre nouveau plateau technique 4.0",
    summary: "L'ITID s'agrandit avec un tout nouveau bloc dédié aux interventions percutanées sous écho-guidage et fluoroscopie de pointe.",
    author: "Jean Dubois",
    authorRole: "Directeur de l'ITID",
    date: "15 Août 2026",
    readTime: "3 min",
    category: "Vie de l'Institut",
    coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop",
    sections: [
      {
        type: 'paragraph',
        content: "Nous sommes fiers d'annoncer l'ouverture officielle de notre nouveau plateau technique, pensé intégralement pour le confort et la sécurité de nos patients."
      },
      {
        type: 'paragraph',
        content: "Cet espace de 250m² intègre des échographes de dernière génération dotés d'intelligence artificielle, permettant des infiltrations et des blocs nerveux avec une précision millimétrique inédite."
      },
      {
        type: 'heading',
        content: "Un espace apaisant"
      },
      {
        type: 'paragraph',
        content: "Conçu avec les principes de l'architecture curative, le nouveau bloc diffuse de la lumière thérapeutique, une isolation acoustique optimale et offre un casque de réalité virtuelle pour la relaxation per-opératoire."
      }
    ]
  },
  {
    id: "tens-mode-d-emploi",
    title: "Neurostimulation TENS : Comment bien l'utiliser chez soi ?",
    summary: "Le TENS est un dispositif fantastique, à condition de savoir s'en servir. Voici les erreurs communes à éviter et les réglages optimaux.",
    author: "Infirmière Sarah",
    authorRole: "Infirmière Ressource Douleur",
    date: "10 Août 2026",
    readTime: "5 min",
    category: "Conseils Patients",
    coverImage: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=1200&auto=format&fit=crop",
    sections: [
      {
        type: 'heading',
        content: "Principe du Gate Control"
      },
      {
        type: 'paragraph',
        content: "Le TENS (Neurostimulation Électrique Transcutanée) utilise un courant électrique faible pour stimuler les nerfs via des électrodes placées sur la peau. En stimulant les fibres tactiles (grosses fibres), on \"ferme la porte\" au signal de la douleur (petites fibres)."
      },
      {
        type: 'heading',
        content: "Où placer les électrodes ?"
      },
      {
        type: 'paragraph',
        content: "La règle d'or : encadrer la zone douloureuse. Les électrodes ne doivent jamais se toucher et doivent être posées sur une peau propre, sèche, et non lésée."
      },
      {
        type: 'list',
        content: [
          "Ne pas placer sur l'avant du cou (carotides)",
          "Ne pas utiliser avec un pacemaker (sauf avis cardio strict)",
          "Changer les électrodes dès qu'elles ne collent plus bien pour éviter les brûlures"
        ]
      }
    ]
  },
  {
    id: "realite-virtuelle-analgesie",
    title: "L'analgésie par Réalité Virtuelle : Le futur est là",
    summary: "Comment l'immersion dans des univers apaisants générés par ordinateur parvient à diminuer la douleur ressentie pendant nos soins.",
    author: "Dr. Marc Moreau",
    authorRole: "Neurochirurgien / Algologue",
    date: "02 Août 2026",
    readTime: "4 min",
    category: "Innovations",
    coverImage: "https://images.unsplash.com/photo-1614064641913-a5509971bc39?q=80&w=1200&auto=format&fit=crop",
    sections: [
      {
        type: 'paragraph',
        content: "La douleur est en grande partie une expérience cérébrale. En saturant les capacités d'attention du cerveau avec un environnement visuel et sonore immersif, la réalité virtuelle agit comme un analgésique puissant."
      },
      {
        type: 'heading',
        content: "Utilisation à l'ITID"
      },
      {
        type: 'paragraph',
        content: "Nous utilisons les casques de réalité virtuelle thérapeutique lors d'actes potentiellement anxiogènes (infiltrations, pose de voies veineuses, radiofréquence). Les patients choisissent leur univers (plage, montagne, fond marin)."
      },
      {
        type: 'quote',
        content: "C'est impressionnant : certains patients sous réalité virtuelle ont une fréquence cardiaque qui diminue pendant le soin, au lieu d'augmenter."
      }
    ]
  }
];
