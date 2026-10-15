<?php
// ======================================================================
// ITID France — Script de Seeding & Migration CMS (Pathologies, Traitements, Blog, Pages)
// Initialise automatiquement la base avec toutes les fiches bilingues FR/EN
// ======================================================================

require_once __DIR__ . '/../../db.php';

function seedCmsIfEmpty(PDO $pdo): void {
    try {
        // 1. Vérifier si les pathologies sont déjà initialisées
        $pathoCount = (int)$pdo->query("SELECT COUNT(*) FROM cms_pathologies")->fetchColumn();
        if ($pathoCount === 0) {
            seedPathologiesData($pdo);
        }

        // 2. Traitements
        $traitCount = (int)$pdo->query("SELECT COUNT(*) FROM cms_traitements")->fetchColumn();
        if ($traitCount === 0) {
            seedTraitementsData($pdo);
        }

        // 3. Articles (Actualités)
        $artCount = (int)$pdo->query("SELECT COUNT(*) FROM cms_articles")->fetchColumn();
        if ($artCount === 0) {
            seedArticlesData($pdo);
        }

        // 4. Pages globales
        $pageCount = (int)$pdo->query("SELECT COUNT(*) FROM cms_pages_content")->fetchColumn();
        if ($pageCount === 0) {
            seedPagesData($pdo);
        }

        // 5. Cas Cliniques (Accueil)
        $casCount = (int)$pdo->query("SELECT COUNT(*) FROM cms_cas_cliniques")->fetchColumn();
        if ($casCount === 0) {
            seedCasCliniquesData($pdo);
        }
    } catch (Throwable $e) {
        error_log("seedCmsIfEmpty error: " . $e->getMessage());
    }
}

function seedPathologiesData(PDO $pdo): void {
    $pathologies = [
        [
            'slug' => 'lombalgie-chronique',
            'title_fr' => 'Lombalgie chronique & Sciatique',
            'title_en' => 'Chronic Lower Back Pain & Sciatica',
            'icon' => '🦴',
            'color' => '#48d1c2',
            'short_desc_fr' => 'Douleurs lombaires persistantes de plus de 3 mois, souvent associées à des irradiations de type sciatique ou cruralgie.',
            'short_desc_en' => 'Persistent lower back pain lasting more than 3 months, frequently associated with radiating sciatic or crural nerve pain.',
            'card_image' => '/images/lombalgie.jpg',
            'hero_gallery' => [
                '/images/lombalgie.jpg',
                '/images/spine_isolated.jpg',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Comprendre la Lombalgie Chronique',
            's1_t_en' => 'Understanding Chronic Lower Back Pain',
            's1_txt_fr' => "La lombalgie chronique est l'une des causes majeures d'invalidité et de souffrance au quotidien. Elle résulte d'interactions complexes entre dégénérescence discale, arthrose facettaire, instabilité vertébrale et sensibilisation du système nerveux central.\n\nÀ l'ITID, nous dépassons le simple traitement symptomatique pour cibler avec précision la structure anatomique génératrice de la douleur.",
            's1_txt_en' => "Chronic low back pain is a leading cause of disability worldwide. It results from complex interactions between disc degeneration, facet joint osteoarthritis, vertebral instability, and central nervous system sensitization.\n\nAt ITID, we pinpoint the exact anatomical pain generator to provide targeted interventional relief.",
            's1_img' => '/images/lombalgie.jpg',
            's2_t_fr' => 'Quand et comment se faire diagnostiquer ?',
            's2_t_en' => 'When & How to Get Diagnosed?',
            's2_txt_fr' => "Une consultation spécialisée est recommandée lorsque la douleur persiste au-delà de 6 semaines malgré les antalgiques usuels, en cas d'engourdissements, de faiblesse motrice dans la jambe ou de perturbation sévère du sommeil.\n\nLe bilan à l'ITID associe un examen clinique algologique approfondi, l'analyse d'IRM haute résolution et, si nécessaire, des blocs anesthésiques tests ciblés.",
            's2_txt_en' => "A specialized consultation is advised when pain persists beyond 6 weeks despite standard medications, in case of numbness, leg weakness, or severe sleep disruption.\n\nDiagnostic evaluation at ITID combines deep clinical pain assessment, high-resolution MRI review, and targeted diagnostic anesthetic nerve blocks.",
            's2_img' => '/images/glowing_3d_spine.jpg',
            's3_t_fr' => 'Prise en charge interventionnelle à l\'ITID',
            's3_t_en' => 'Interventional Care at ITID',
            's3_txt_fr' => "Nous proposons des gestes thérapeutiques de pointe réalisés sous guidage fluoroscopique ou échographique millimétrique :\n• Infiltrations épidurales et foraminales de corticoïdes ciblés\n• Dénervation par radiofréquence des branches médianes articulaires\n• Infiltration des articulations sacro-iliaques\n• Neuromodulation médullaire pour les douleurs réfractaires.",
            's3_txt_en' => "We offer cutting-edge therapeutic procedures performed under millimeter-precise fluoroscopic or ultrasound guidance:\n• Targeted epidural and transforaminal corticosteroid injections\n• Radiofrequency denervation of medial facet branches\n• Sacroiliac joint injections\n• Spinal cord stimulation for refractory pain.",
            's3_img' => '/images/treatments/infiltrations_rachidiennes.jpg',
            's4_t_fr' => 'Prévention & Conseils au Quotidien',
            's4_t_en' => 'Prevention & Daily Lifestyle Advice',
            's4_txt_fr' => "Le mouvement reste le meilleur traitement du rachis. Nous accompagnons chaque patient avec un programme personnalisé : renforcement du gainage abdominal profond, étirements des chaînes postérieures, ergonomie au poste de travail et gestion du stress chronique.",
            's4_txt_en' => "Movement is medicine for the spine. We support each patient with a personalized program: deep core strengthening, posterior muscle chain stretching, workstation ergonomics, and chronic stress management.",
            's4_img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Lombalgie',
            'order' => 1
        ],
        [
            'slug' => 'nevralgie-arnold',
            'title_fr' => "Névralgie d'Arnold (Occipitale)",
            'title_en' => "Occipital Neuralgia (Arnold's Nerve)",
            'icon' => '⚡',
            'color' => '#2a9d8f',
            'short_desc_fr' => "Douleur neuropathique intense partant de la base du crâne et irradiant vers le sommet de la tête ou derrière l'œil.",
            'short_desc_en' => "Severe neuropathic pain radiating from the skull base to the vertex and behind the eye along the occipital nerve path.",
            'card_image' => '/images/nevralgie_arnold.jpg',
            'hero_gallery' => [
                '/images/nevralgie_arnold.jpg',
                'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => "Qu'est-ce que la Névralgie d'Arnold ?",
            's1_t_en' => "What is Occipital Neuralgia?",
            's1_txt_fr' => "La névralgie d'Arnold est causée par la compression ou l'inflammation du grand nerf occipital (nerf d'Arnold) entre les vertèbres C1-C2 et les muscles cervicaux. Elle provoque des décharges électriques, des brûlures et une hypersensibilité du cuir chevelu.",
            's1_txt_en' => "Occipital neuralgia arises from irritation or compression of the greater occipital nerve at the C1-C2 level and suboccipital muscles, causing sharp electric shocks, burning sensations, and scalp hypersensitivity.",
            's1_img' => '/images/nevralgie_arnold.jpg',
            's2_t_fr' => 'Diagnostic & Signes d\'alerte',
            's2_t_en' => 'Diagnosis & Warning Signs',
            's2_txt_fr' => "Le diagnostic repose sur la reproduction de la douleur à la palpation du point d'émergence du nerf occipital (signe de Tinel) et sur l'exclusion d'autres céphalées par imagerie cervicale (IRM/Scanner).",
            's2_txt_en' => "Diagnosis is established through tenderness at the occipital nerve emergence point (Tinel's sign) and cervical imaging (MRI/CT) to rule out secondary causes.",
            's2_img' => 'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Gestes d\'intervention à l\'ITID',
            's3_t_en' => 'Interventional Procedures at ITID',
            's3_txt_fr' => "• Bloc anesthésique écho-guidé du grand et petit nerf occipital\n• Radiofréquence pulsée du nerf d'Arnold pour une antalgie prolongée sans léser le nerf\n• Cryoneurolyse percutanée\n• Injections de toxine botulique dans les trapèzes et muscles sous-occipitaux.",
            's3_txt_en' => "• Ultrasound-guided greater and lesser occipital nerve blocks\n• Pulsed radiofrequency for durable non-destructive pain relief\n• Percutaneous cryoneurolysis\n• Botulinum toxin injections in suboccipital and trapezius trigger points.",
            's3_img' => '/images/treatments/blocs_anesthesiques.jpg',
            's4_t_fr' => 'Conseils & Prévention',
            's4_t_en' => 'Prevention & Ergonomics',
            's4_txt_fr' => "Correction des postures sur écran (tête penchée en avant), kinésithérapie de décoaptation cervicale, oreiller ergonomique à mémoire de forme et gestion des tensions musculaires de stress.",
            's4_txt_en' => "Forward head posture correction, cervical gentle mobilization physiotherapy, ergonomic cervical pillow, and stress-related tension reduction.",
            's4_img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/N%C3%A9vralgie_d%27Arnold',
            'order' => 2
        ],
        [
            'slug' => 'sdrc',
            'title_fr' => 'Syndrome Douloureux Régional Complexe (SDRC)',
            'title_en' => 'Complex Regional Pain Syndrome (CRPS)',
            'icon' => '🔥',
            'color' => '#e76f51',
            'short_desc_fr' => 'Trouble neurologique et vasculaire survenant après un traumatisme ou une chirurgie (œdème, brûlures intenses, hypersensibilité).',
            'short_desc_en' => 'Complex neurological and microvascular disorder typically occurring after trauma or surgery (edema, burning pain, allodynia).',
            'card_image' => '/images/sdrc.jpg',
            'hero_gallery' => [
                '/images/sdrc.jpg',
                'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Comprendre le SDRC (Algodystrophie)',
            's1_t_en' => 'Understanding CRPS (Algodystrophy)',
            's1_txt_fr' => "Le SDRC (anciennement algodystrophie) associe des douleurs disproportionnées, des modifications de température cutanée, de coloration et un gonflement du membre atteint, liés à un dérèglement du système nerveux autonome.",
            's1_txt_en' => "CRPS combines pain out of proportion to the initial injury with changes in skin temperature, color, and swelling due to autonomic nervous system dysfunction.",
            's1_img' => '/images/sdrc.jpg',
            's2_t_fr' => 'Diagnostic Précoce',
            's2_t_en' => 'Early Diagnosis',
            's2_txt_fr' => "Un diagnostic précoce (critères de Budapest) dans les premières semaines est capital pour empêcher l'enraidissement et la chronicisation. Scintigraphie osseuse et IRM confirment le stade évolutif.",
            's2_txt_en' => "Early diagnosis (Budapest criteria) is paramount to prevent permanent stiffness and severe chronification. Bone scintigraphy and MRI aid staging.",
            's2_img' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Protocoles Thérapeutiques ITID',
            's3_t_en' => 'ITID Treatment Protocols',
            's3_txt_fr' => "• Perfusions intraveineuses de Lidocaïne et magnésium en milieu sécurisé\n• Blocs sympathiques écho-guidés (ganglion stellaire ou lombaire)\n• Neurostimulation médullaire ou du ganglion spinal dorsal (DRG)\n• rTMS pour rééquilibrer le cortex somatosensoriel.",
            's3_txt_en' => "• Monitored intravenous Lidocaine and magnesium infusions\n• Ultrasound-guided sympathetic blocks (stellate or lumbar)\n• Dorsal Root Ganglion (DRG) or spinal cord stimulation\n• rTMS brain modulation to recalibrate somatosensory mapping.",
            's3_img' => '/images/treatments/perfusion_lidocaine.jpg',
            's4_t_fr' => 'Rééducation & Thérapie Miroir',
            's4_t_en' => 'Rehabilitation & Mirror Therapy',
            's4_txt_fr' => "Désensibilisation tactile progressive, rééducation par imagerie motrice graduée et thérapie par miroir pour reprogrammer la perception cérébrale du membre.",
            's4_txt_en' => "Graded tactile desensitization, motor imagery training, and mirror therapy to restore brain body map perception.",
            's4_img' => 'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Syndrome_douloureux_r%C3%A9gional_complexe',
            'order' => 3
        ],
        [
            'slug' => 'endometriose',
            'title_fr' => 'Endométriose & Douleurs Pelviennes Chroniques',
            'title_en' => 'Endometriosis & Chronic Pelvic Pain',
            'icon' => '🌸',
            'color' => '#e9c46a',
            'short_desc_fr' => 'Douleurs pelvi-périnéales invalidantes, règles douloureuses sévères, dyspareunie et névralgie pudendale.',
            'short_desc_en' => 'Severe pelvic pain, dysmenorrhea, dyspareunia, and pudendal nerve entrapment associated with endometriosis.',
            'card_image' => '/images/endometriose.jpg',
            'hero_gallery' => [
                '/images/endometriose.jpg',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'L\'Endométriose et le Système Nerveux Pelvien',
            's1_t_en' => 'Endometriosis & The Pelvic Nervous System',
            's1_txt_fr' => "L'endométriose induit une inflammation chronique et une prolifération nerveuse qui entraînent une sensibilisation centrale. Même après chirurgie, la douleur neuropathique peut persister.",
            's1_txt_en' => "Endometriosis triggers chronic pelvic neuroinflammation and nerve sprouting leading to central sensitization, where pain signals persist even after surgery.",
            's1_img' => '/images/endometriose.jpg',
            's2_t_fr' => 'Bilan Algologique Pelvien',
            's2_t_en' => 'Algological Pelvic Assessment',
            's2_txt_fr' => "Évaluation pluridisciplinaire associant algologue, gynécologue et radiologue expert, avec IRM pelvienne dédiée et cartographie précise des points douloureux myo-fasciaux.",
            's2_txt_en' => "Multidisciplinary assessment involving pain specialist, gynecologist, and specialized MRI mapping of myo-fascial trigger zones and pudendal nerve trajectory.",
            's2_img' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Traitements Spécifiques ITID',
            's3_t_en' => 'Dedicated ITID Treatments',
            's3_txt_fr' => "• Infiltrations écho-guidées du nerf pudendal et du nerf ilio-inguinal\n• Blocs du plexus hypogastrique supérieur\n• Injections de toxine botulique dans le muscle élévateur de l'anus (levator ani)\n• Neurostimulation transcutanée TENS pelvienne.",
            's3_txt_en' => "• Ultrasound-guided pudendal and ilio-inguinal nerve blocks\n• Superior hypogastric plexus blocks\n• Pelvic floor Botox injections for severe levator ani hypertonia\n• Tailored pelvic TENS neuromodulation.",
            's3_img' => '/images/treatments/infiltrations_articulaires.jpg',
            's4_t_fr' => 'Approche Intégrative & Nutrition',
            's4_t_en' => 'Integrative Approach & Diet',
            's4_txt_fr' => "Alimentation anti-inflammatoire personnalisée, kinésithérapie périnéale douce, hypnose médicale pour l'atténuation du stress et relaxation pelvienne.",
            's4_txt_en' => "Customized anti-inflammatory nutrition, gentle pelvic floor physiotherapy, medical hypnosis for pain perception regulation and somatic relaxation.",
            's4_img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Endom%C3%A9triose',
            'order' => 4
        ],
        [
            'slug' => 'douleurs-articulaires',
            'title_fr' => 'Douleurs Articulaires (Épaule, Genou, Hanche)',
            'title_en' => 'Joint Pain (Shoulder, Knee, Hip)',
            'icon' => '🦿',
            'color' => '#f4a261',
            'short_desc_fr' => 'Arthrose réfractaire, tendinopathies chroniques, conflits articulaires et douleurs post-prothèse persistantes.',
            'short_desc_en' => 'Refractory osteoarthritis, chronic tendinopathies, joint impingement, and persistent pain following joint replacement.',
            'card_image' => '/images/douleurs_articulaires.jpg',
            'hero_gallery' => [
                '/images/douleurs_articulaires.jpg',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Mécanisme des Douleurs Articulaires',
            's1_t_en' => 'Mechanisms of Chronic Joint Pain',
            's1_txt_fr' => "La dégénérescence cartilagineuse s'accompagne d'une synovite inflammatoire et d'une hypersensibilisation des nerfs péri-articulaires, créant un cercle vicieux de douleur et d'impotence fonctionnelle.",
            's1_txt_en' => "Cartilage wear is accompanied by chronic synovial inflammation and peripheral nerve hypersensitization, creating a persistent cycle of pain and functional impairment.",
            's1_img' => '/images/douleurs_articulaires.jpg',
            's2_t_fr' => 'Quand consulter ?',
            's2_t_en' => 'When to Seek Interventional Evaluation?',
            's2_txt_fr' => "Lorsque les antalgiques habituels ne suffisent plus, que la marche ou les mouvements simples deviennent pénibles, ou chez les patients non opérables souhaitant éviter la chirurgie lourde.",
            's2_txt_en' => "When oral pain medications fail to provide relief, daily mobility is constrained, or for patients seeking non-surgical alternatives to heavy joint surgery.",
            's2_img' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Gestes Thérapeutiques ITID',
            's3_t_en' => 'ITID Interventional Procedures',
            's3_txt_fr' => "• Infiltrations écho-guidées d'acide hyaluronique et corticoïdes retard\n• Dénervation par radiofréquence refroidie des nerfs géniculés (genou) et supra-scapulaires (épaule)\n• Cryoneurolyse articulaire\n• Viscosupplémentation de nouvelle génération.",
            's3_txt_en' => "• Ultrasound-guided hyaluronic acid and targeted corticosteroid injections\n• Cooled radiofrequency denervation of genicular nerves (knee) and suprascapular nerve (shoulder)\n• Percutaneous articular cryoneurolysis\n• Advanced viscosupplementation.",
            's3_img' => '/images/treatments/infiltrations_articulaires.jpg',
            's4_t_fr' => 'Récupération & Activité Physique',
            's4_t_en' => 'Recovery & Physical Activity',
            's4_txt_fr' => "Renforcement musculaire ciblé sans impact (balnéothérapie, vélo, marche douce), contrôle du poids corporel et supplémentation protectrice.",
            's4_txt_en' => "Low-impact muscle strengthening (water therapy, cycling, walking), joint load optimization, and supportive nutritional measures.",
            's4_img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Arthralgie',
            'order' => 5
        ],
        [
            'slug' => 'fibromyalgie',
            'title_fr' => 'Fibromyalgie & Douleurs Généralisées',
            'title_en' => 'Fibromyalgia & Widespread Pain',
            'icon' => '🌬️',
            'color' => '#81b29a',
            'short_desc_fr' => 'Sensibilisation centrale caractérisée par des douleurs diffuses, une fatigue chronique intense et des troubles du sommeil.',
            'short_desc_en' => 'Central sensitization syndrome marked by widespread chronic musculoskeletal pain, profound fatigue, and sleep disturbances.',
            'card_image' => '/images/fibromyalgie.jpg',
            'hero_gallery' => [
                '/images/fibromyalgie.jpg',
                'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Comprendre la Sensibilisation Centrale',
            's1_t_en' => 'Understanding Central Sensitization',
            's1_txt_fr' => "Dans la fibromyalgie, le système nerveux amplifie les signaux sensoriels ordinaires. Le seuil de perception de la douleur est abaissé, rendant tout stimulus corporel douloureux.",
            's1_txt_en' => "In fibromyalgia, the central nervous system amplifies sensory signals, lowering the pain threshold and causing widespread tenderness and hyperalgesia.",
            's1_img' => '/images/fibromyalgie.jpg',
            's2_t_fr' => 'Évaluation Multidisciplinaire',
            's2_t_en' => 'Multidisciplinary Assessment',
            's2_txt_fr' => "Le diagnostic repose sur un interrogatoire précis, la recherche des points douloureux myo-fasciaux et l'évaluation du sommeil, de l'humeur et du niveau d'énergie.",
            's2_txt_en' => "Comprehensive evaluation incorporates tender point examination, polysomnography review, cognitive assessment, and quality-of-life mapping.",
            's2_img' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Traitements Innovants ITID',
            's3_t_en' => 'Innovative Treatments at ITID',
            's3_txt_fr' => "• Séances de rTMS (Stimulation Magnétique Transcrânienne) sur le cortex moteur pour réguler les voies inhibitrices de la douleur\n• Perfusions antalgiques individualisées de Kétamine / Lidocaïne\n• Casques de Réalité Virtuelle HypnoVR pour la relaxation profonde.",
            's3_txt_en' => "• rTMS (Repetitive Transcranial Magnetic Stimulation) targeting motor cortex to activate descending pain inhibitory pathways\n• Individualized Ketamine / Lidocaine infusions\n• HypnoVR clinical therapeutic virtual reality sessions.",
            's3_img' => '/images/treatments/rtms.jpg',
            's4_t_fr' => 'Reprogrammation Corporelle',
            's4_t_en' => 'Body Reprogramming & Lifestyle',
            's4_txt_fr' => "Réentraînement doux à l'effort aérobie progressif, régulation du rythme circadien et méditation de pleine conscience.",
            's4_txt_en' => "Graded aerobic conditioning, circadian rhythm hygiene, and mindfulness-based stress reduction.",
            's4_img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Fibromyalgie',
            'order' => 6
        ],
        [
            'slug' => 'douleurs-neuropathiques',
            'title_fr' => 'Douleurs Neuropathiques Périphériques & Centrales',
            'title_en' => 'Neuropathic Pain (Peripheral & Central)',
            'icon' => '💥',
            'color' => '#e07a5f',
            'short_desc_fr' => 'Brûlures, décharges électriques, allodynie post-zona, diabète, séquelles chirurgicales ou lésions médullaires.',
            'short_desc_en' => 'Burning pain, electric shocks, and allodynia resulting from post-herpetic neuralgia, diabetic neuropathy, or nerve trauma.',
            'card_image' => '/images/douleurs_neuropathiques.jpg',
            'hero_gallery' => [
                '/images/douleurs_neuropathiques.jpg',
                'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Origine de la Douleur Neuropathique',
            's1_t_en' => 'Origin of Neuropathic Pain',
            's1_txt_fr' => "Elle est due à une lésion ou maladie du système somatosensoriel. Les fibres nerveuses endommagées envoient des signaux douloureux continus et anormaux vers le cerveau.",
            's1_txt_en' => "Neuropathic pain arises directly from damage or pathology affecting the somatosensory nervous system, generating spontaneous ectopic pain impulses.",
            's1_img' => '/images/douleurs_neuropathiques.jpg',
            's2_t_fr' => 'Diagnostic & Questionnaire DN4',
            's2_t_en' => 'Diagnostic Criteria (DN4 Score)',
            's2_txt_fr' => "Le diagnostic est confirmé par le score DN4 (brûlures, froid douloureux, décharges, allodynie au frottement) complété par électromyogramme et imagerie.",
            's2_txt_en' => "Assessment utilizes the validated DN4 scoring tool (burning, electric shock, pinprick sensitivity, dynamic allodynia) paired with EMG and imaging.",
            's2_img' => 'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Traitements Hautement Spécialisés',
            's3_t_en' => 'Highly Specialized Treatments at ITID',
            's3_txt_fr' => "• Application de patchs de Capsaïcine haute concentration (Qutenza) en ambulatoire\n• Stimulation médullaire épidurale (SCS)\n• Blocs périnerveux continus\n• Radiofréquence pulsée sur les racines dorsales.",
            's3_txt_en' => "• High-concentration Capsaicin patch (Qutenza) application\n• Spinal Cord Stimulation (SCS)\n• Continuous ultrasound-guided perineural blocks\n• Pulsed radiofrequency on dorsal root ganglia.",
            's3_img' => '/images/treatments/patch_capsaicine.jpg',
            's4_t_fr' => 'Prévention & Suivi',
            's4_t_en' => 'Prevention & Management',
            's4_txt_fr' => "Contrôle strict des facteurs métaboliques (glycémie), protection cutanée et adaptation thérapeutique précoce dès l'apparition des premiers symptômes.",
            's4_txt_en' => "Metabolic control (glycemia), skin barrier care, and rapid therapeutic titration to prevent long-term central hypersensitivity.",
            's4_img' => 'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Douleur_neuropathique',
            'order' => 7
        ],
        [
            'slug' => 'douleurs-post-op',
            'title_fr' => 'Douleurs Post-Opératoires & Post-Traumatiques Chroniques',
            'title_en' => 'Chronic Post-Surgical & Post-Traumatic Pain',
            'icon' => '⚕️',
            'color' => '#3d5a80',
            'short_desc_fr' => 'Douleurs persistantes plus de 3 mois après une chirurgie (rachis, prothèse, thoracotomie, hernie, mastectomie).',
            'short_desc_en' => 'Persistent pain lasting beyond 3 months post-surgery (spinal fusion, joint replacement, thoracotomy, hernia, mastectomy).',
            'card_image' => '/images/douleurs_post_op.jpg',
            'hero_gallery' => [
                '/images/douleurs_post_op.jpg',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Pourquoi la douleur persiste après une chirurgie ?',
            's1_t_en' => 'Why Pain Persists After Surgery?',
            's1_txt_fr' => "Une cicatrice fibreuse, l'étirement d'un rameau nerveux ou une sensibilisation des récepteurs périphériques peuvent maintenir un signal d'alarme alors que les tissus sont guéris.",
            's1_txt_en' => "Perineural scar tissue, surgical nerve entrapment, or regional receptor hypersensitization can sustain chronic alarm signals long after wound healing.",
            's1_img' => '/images/douleurs_post_op.jpg',
            's2_t_fr' => 'Diagnostic Différentiel',
            's2_t_en' => 'Differential Diagnosis',
            's2_txt_fr' => "Vérification minutieuse de l'intégrité du matériel chirurgical, élimination de complications infectieuses et cartographie précise du territoire neurologique atteint.",
            's2_txt_en' => "Hardware placement verification, surgical complication rule-out, and precise neurological dermatomal mapping.",
            's2_img' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Traitements Dédiés ITID',
            's3_t_en' => 'Dedicated Interventions at ITID',
            's3_txt_fr' => "• Infiltrations cicatricielles écho-guidées avec anesthésique local et corticoïdes\n• Cryoneurolyse percutanée des névromes cicatriciels\n• Radiofréquence pulsée\n• Neurostimulation médullaire pour Failed Back Surgery Syndrome (FBSS).",
            's3_txt_en' => "• Ultrasound-guided scar and neuroma infiltrations\n• Percutaneous cryoneurolysis for painful surgical neuromas\n• Pulsed radiofrequency\n• Spinal cord stimulation for Failed Back Surgery Syndrome.",
            's3_img' => '/images/treatments/cryoneurolyse.jpg',
            's4_t_fr' => 'Accompagnement Global',
            's4_t_en' => 'Comprehensive Recovery Plan',
            's4_txt_fr' => "Désensibilisation manuelle douce de la cicatrice, reprise progressive des mouvements et thérapies cognitivo-comportementales de la douleur.",
            's4_txt_en' => "Gentle scar desensitization techniques, progressive movement restoration, and cognitive-behavioral pain coping strategies.",
            's4_img' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Douleur',
            'order' => 8
        ],
        [
            'slug' => 'migraines',
            'title_fr' => 'Céphalées Rebelles & Migraines Chroniques',
            'title_en' => 'Intractable Headaches & Chronic Migraines',
            'icon' => '🧠',
            'color' => '#264653',
            'short_desc_fr' => 'Crises céphaliques sévères plus de 15 jours par mois, résistantes aux triptans et aux traitements de fond usuels.',
            'short_desc_en' => 'Severe recurrent migraines occurring 15+ days per month, refractory to conventional triptans and oral prophylactics.',
            'card_image' => '/images/migraine.jpg',
            'hero_gallery' => [
                '/images/migraine.jpg',
                'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Comprendre la Migraine Chronique',
            's1_t_en' => 'Understanding Chronic Migraines',
            's1_txt_fr' => "La migraine chronique implique une activation excessive du complexe trigémino-vasculaire. Les crises provoquent nausées, photophobie et douleurs pulsatiles invalidantes.",
            's1_txt_en' => "Chronic migraine involves persistent hyperactivity within the trigeminovascular complex, causing severe throbbing pain, photophobia, and nausea.",
            's1_img' => '/images/migraine.jpg',
            's2_t_fr' => 'Critères Diagnostiques',
            's2_t_en' => 'Diagnostic Criteria',
            's2_txt_fr' => "Présence de céphalées plus de 15 jours par mois depuis au moins 3 mois, dont au moins 8 jours avec caractéristiques migraineuses typiques.",
            's2_txt_en' => "Headaches on 15 or more days per month for at least 3 months, with at least 8 days meeting strict migraine features.",
            's2_img' => 'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Protocoles Thérapeutiques ITID',
            's3_t_en' => 'ITID Treatment Protocols',
            's3_txt_fr' => "• Injections de Toxine Botulique selon le protocole PREEMPT (31 points spécifiques)\n• Blocs du ganglion sphéno-palatin sous guidage\n• Blocs du nerf grand occipital\n• Séances de rTMS pour stabiliser l'excitabilité corticale.",
            's3_txt_en' => "• Botulinum Toxin injections following international PREEMPT protocol (31 targeted sites)\n• Sphenopalatine ganglion blocks\n• Greater occipital nerve blocks\n• rTMS neuro-stimulation to recalibrate cortical excitability.",
            's3_img' => '/images/treatments/toxine_botulique.jpg',
            's4_t_fr' => 'Hygiène de Vie & Prévention',
            's4_t_en' => 'Lifestyle & Trigger Management',
            's4_txt_fr' => "Identification et éviction des facteurs déclenchants (sommeil irrégulier, déshydratation, aliments spécifiques), biofeedback et relaxation guidée.",
            's4_txt_en' => "Trigger identification and avoidance (sleep irregularities, dietary triggers, hydration), biofeedback training, and guided autonomic relaxation.",
            's4_img' => 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop',
            'wiki' => 'https://fr.wikipedia.org/wiki/Migraine',
            'order' => 9
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO cms_pathologies (
        slug, title_fr, title_en, icon, color, short_desc_fr, short_desc_en, card_image, hero_gallery_json,
        section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
        section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
        section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
        section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
        wikipedia_url, display_order, is_active
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, 1
    )");

    foreach ($pathologies as $p) {
        $stmt->execute([
            $p['slug'], $p['title_fr'], $p['title_en'], $p['icon'], $p['color'], $p['short_desc_fr'], $p['short_desc_en'], $p['card_image'], json_encode($p['hero_gallery']),
            $p['s1_t_fr'], $p['s1_t_en'], $p['s1_txt_fr'], $p['s1_txt_en'], $p['s1_img'],
            $p['s2_t_fr'], $p['s2_t_en'], $p['s2_txt_fr'], $p['s2_txt_en'], $p['s2_img'],
            $p['s3_t_fr'], $p['s3_t_en'], $p['s3_txt_fr'], $p['s3_txt_en'], $p['s3_img'],
            $p['s4_t_fr'], $p['s4_t_en'], $p['s4_txt_fr'], $p['s4_txt_en'], $p['s4_img'],
            $p['wiki'], $p['order']
        ]);
    }
}

function seedTraitementsData(PDO $pdo): void {
    $traitements = [
        [
            'slug' => 'infiltrations-rachidiennes',
            'num' => '01',
            'icon' => '💉',
            'title_fr' => 'Infiltrations épidurales & rachidiennes',
            'title_en' => 'Epidural & Spinal Targeted Injections',
            'desc_front_fr' => "Injection ciblée de corticoïdes sous guidage radiologique ou échographique pour éteindre l'inflammation du nerf comprimé.",
            'desc_front_en' => "Targeted corticosteroid injection under imaging guidance to extinguish inflammation of compressed spinal nerves.",
            'desc_back_fr' => "Les infiltrations épidurales et foraminales permettent d'amener une dose minimale de produit anti-inflammatoire directement au contact de la racine nerveuse enflammée. Réalisées en ambulatoire sous anesthésie locale.",
            'desc_back_en' => "Epidural and transforaminal injections deliver concentrated anti-inflammatory medication directly to the inflamed spinal root under local anesthesia in day-hospital.",
            'card_image' => '/images/treatments/infiltrations_rachidiennes.jpg',
            'hero_gallery' => [
                '/images/treatments/infiltrations_rachidiennes.jpg',
                '/images/spine_isolated.jpg',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Indications Cliniques',
            's1_t_en' => 'Clinical Indications',
            's1_txt_fr' => "• Hernie discale lombaire ou cervicale avec sciatique ou névralgie cervico-brachiale\n• Canal lombaire étroit avec claudication neurogène\n• Arthrose facettaire aiguë récidivante.",
            's1_txt_en' => "• Lumbar or cervical disc herniation with sciatica or radiculopathy\n• Spinal canal stenosis with neurogenic claudication\n• Acute facet joint inflammatory flare-ups.",
            's1_img' => '/images/treatments/infiltrations_rachidiennes.jpg',
            's2_t_fr' => 'Déroulement du Geste à l\'ITID',
            's2_t_en' => 'Procedure Protocol at ITID',
            's2_txt_fr' => "Réalisé au bloc interventionnel en position ventrale. Après désinfection et anesthésie locale cutanée, l'aiguille est guidée au millimètre près sous contrôle radiologique scopique. Un produit de contraste confirme le bon positionnement avant l'injection. Durée : 15 minutes.",
            's2_txt_en' => "Performed in interventional suite under local anesthesia. Real-time fluoroscopy and contrast dye verify precise needle placement before administering medication. Procedure duration: 15 minutes.",
            's2_img' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Bénéfices Attendus & Suites',
            's3_t_en' => 'Expected Benefits & Follow-Up',
            's3_txt_fr' => "Soulagement progressif en 48 à 72 heures, permettant la reprise des activités et de la kinésithérapie active. Repos relatif de 24h conseillé.",
            's3_txt_en' => "Progressive pain reduction within 48 to 72 hours, enabling return to daily activities and active physiotherapy. 24-hour relative rest advised.",
            's3_img' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop',
            's4_t_fr' => 'Pathologies Traitées Associées',
            's4_t_en' => 'Associated Conditions Treated',
            's4_txt_fr' => "Lombalgies chroniques, sciatiques, cruralgies et douleurs post-opératoires du rachis.",
            's4_txt_en' => "Chronic lower back pain, sciatica, cruralgia, and post-surgical spinal pain.",
            's4_img' => '/images/lombalgie.jpg',
            'order' => 1
        ],
        [
            'slug' => 'infiltrations-articulaires',
            'num' => '02',
            'icon' => '🦵',
            'title_fr' => 'Infiltrations articulaires & Viscosupplémentation',
            'title_en' => 'Joint Injections & Viscosupplementation',
            'desc_front_fr' => "Infiltration écho-guidée d'acide hyaluronique ou de corticoïdes pour restaurer la mobilité articulaire.",
            'desc_front_en' => "Ultrasound-guided hyaluronic acid or corticosteroid injections to restore joint lubrication and mobility.",
            'desc_back_fr' => "Traitement de choix pour les arthropathies du genou, de l'épaule et de la hanche. L'écho-guidage garantit un dépôt intra-articulaire parfait sans douleur.",
            'desc_back_en' => "Optimal approach for knee, shoulder, and hip osteoarthritis. Real-time ultrasound guidance ensures exact intra-articular delivery with minimal discomfort.",
            'card_image' => '/images/treatments/infiltrations_articulaires.jpg',
            'hero_gallery' => [
                '/images/treatments/infiltrations_articulaires.jpg',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Indications Principales',
            's1_t_en' => 'Primary Indications',
            's1_txt_fr' => "Gonarthrose (genou), omarthrose et conflits sous-acromiaux (épaule), coxarthrose (hanche), arthrose de cheville et rhizarthrose.",
            's1_txt_en' => "Knee osteoarthritis, shoulder impingement and wear, hip osteoarthritis, ankle arthrosis, and thumb rhizarthrosis.",
            's1_img' => '/images/treatments/infiltrations_articulaires.jpg',
            's2_t_fr' => 'Déroulement du Geste',
            's2_t_en' => 'Procedure Details',
            's2_txt_fr' => "Geste rapide en consultation ou au bloc ambulatoire sous échographie haute fréquence. Permet de lubrifier le cartilage et d'éteindre la poussée inflammatoire synoviale.",
            's2_txt_en' => "Quick outpatient procedure under high-frequency ultrasound guidance. Re-lubricates articular surfaces and calms synovial inflammatory surges.",
            's2_img' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Bénéfices & Durabilité',
            's3_t_en' => 'Durability & Benefits',
            's3_txt_fr' => "Amélioration fonctionnelle durant 6 à 12 mois, diminution de la prise d'anti-inflammatoires oraux et protection du capital articulaire.",
            's3_txt_en' => "Functional relief lasting 6 to 12 months, reduced reliance on oral NSAIDs, and joint preservation.",
            's3_img' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&auto=format&fit=crop',
            's4_t_fr' => 'Pathologies Associées',
            's4_t_en' => 'Associated Conditions',
            's4_txt_fr' => "Douleurs articulaires de hanche, genou et épaule, suites de prothèses douloureuses.",
            's4_txt_en' => "Shoulder, hip, and knee chronic joint pain, persistent discomfort after prosthesis.",
            's4_img' => '/images/douleurs_articulaires.jpg',
            'order' => 2
        ],
        [
            'slug' => 'perfusion-lidocaine',
            'num' => '03',
            'icon' => '💧',
            'title_fr' => 'Perfusions antalgiques de Lidocaïne & Kétamine',
            'title_en' => 'Intravenous Lidocaine & Ketamine Infusions',
            'desc_front_fr' => "Perfusions intraveineuses sous surveillance continue pour réinitialiser les circuits hypersensibilisés de la douleur.",
            'desc_front_en' => "Monitored intravenous infusions to reset hypersensitized central and peripheral pain pathways.",
            'desc_back_fr' => "Protocole hospitalier ambulatoire de 2 à 4 heures sous monitorage cardiaque continu pour briser les crises hyperalgiques sévères et rebelles.",
            'desc_back_en' => "Day-care protocol under continuous cardiac monitoring designed to interrupt severe refractory hyperalgesia and central pain storms.",
            'card_image' => '/images/treatments/perfusion_lidocaine.jpg',
            'hero_gallery' => [
                '/images/treatments/perfusion_lidocaine.jpg',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Indications',
            's1_t_en' => 'Indications',
            's1_txt_fr' => "SDRC (Algodystrophie), fibromyalgie sévère, douleurs neuropathiques diffuses, céphalées de tension réfractaires.",
            's1_txt_en' => "CRPS, severe fibromyalgia, diffuse refractory neuropathic pain, and intractable headache flares.",
            's1_img' => '/images/treatments/perfusion_lidocaine.jpg',
            's2_t_fr' => 'Déroulement Sécurisé',
            's2_t_en' => 'Safety & Monitoring',
            's2_txt_fr' => "Administration par pousse-seringue électrique en chambre individuelle de repos avec présence infirmière dédiée et casque de réalité virtuelle de relaxation.",
            's2_txt_en' => "Infusion pump delivery in private recovery suite with dedicated nurse monitoring and virtual reality relaxation headset.",
            's2_img' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Effet Reset Cérébral',
            's3_t_en' => 'Central Reset Effect',
            's3_txt_fr' => "Diminution drastique de l'allodynie et de l'hyperpathie, sensation de soulagement profond et durable sur plusieurs semaines.",
            's3_txt_en' => "Dramatic reduction in allodynia and hyperpathia, delivering profound relief sustained over multiple weeks.",
            's3_img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            's4_t_fr' => 'Pathologies Cibles',
            's4_t_en' => 'Targeted Conditions',
            's4_txt_fr' => "SDRC, Fibromyalgie, Douleurs neuropathiques chroniques.",
            's4_txt_en' => "CRPS, Fibromyalgia, Chronic neuropathic pain syndromes.",
            's4_img' => '/images/sdrc.jpg',
            'order' => 3
        ],
        [
            'slug' => 'radiofrequence',
            'num' => '04',
            'icon' => '🔥',
            'title_fr' => 'Radiofréquence pulsée & thermique',
            'title_en' => 'Pulsed & Thermal Radiofrequency',
            'desc_front_fr' => "Neuromodulation de haute précision par ondes de radiofréquence pour bloquer durablement la transmission de la douleur.",
            'desc_front_en' => "High-precision radiofrequency waves targeting sensory nerves to durably interrupt pain conduction.",
            'desc_back_fr' => "Technique mini-invasive permettant de désactiver de façon ciblée les récepteurs douloureux sans affecter la motricité. Efficacité de 6 à 24 mois.",
            'desc_back_en' => "Minimally invasive intervention selectively desensitizing pain transmitters without motor deficit, providing 6 to 24 months of relief.",
            'card_image' => '/images/treatments/radiofrequence.jpg',
            'hero_gallery' => [
                '/images/treatments/radiofrequence.jpg',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Indications Principales',
            's1_t_en' => 'Key Indications',
            's1_txt_fr' => "Arthrose facettaire lombaire et cervicale, névralgie d'Arnold, douleurs sacro-iliaques, nerfs géniculés du genou.",
            's1_txt_en' => "Lumbar and cervical facet arthrosis, Arnold's occipital neuralgia, sacroiliac pain, genicular knee nerves.",
            's1_img' => '/images/treatments/radiofrequence.jpg',
            's2_t_fr' => 'Déroulement de la Procédure',
            's2_t_en' => 'Procedure Protocol',
            's2_txt_fr' => "Réalisé au bloc sous anesthésie locale et contrôle scopique. Une sonde millimétrique délivre un courant ciblé à température contrôlée pendant 90 secondes.",
            's2_txt_en' => "Performed under local anesthesia and fluoroscopy. A micro-probe delivers controlled-temperature waves for 90 seconds per target.",
            's2_img' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Bénéfices',
            's3_t_en' => 'Long-Term Benefits',
            's3_txt_fr' => "Soulagement majeur et pérenne (jusqu'à 2 ans), renouvelable en toute sécurité.",
            's3_txt_en' => "Major long-lasting relief (up to 2 years), safely repeatable when needed.",
            's3_img' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&auto=format&fit=crop',
            's4_t_fr' => 'Pathologies Associées',
            's4_t_en' => 'Related Conditions',
            's4_txt_fr' => "Lombalgies, Névralgies d'Arnold, Douleurs articulaires.",
            's4_txt_en' => "Lower back pain, Occipital neuralgia, Joint pain.",
            's4_img' => '/images/nevralgie_arnold.jpg',
            'order' => 4
        ],
        [
            'slug' => 'cryoneurolyse',
            'num' => '05',
            'icon' => '❄️',
            'title_fr' => 'Cryoneurolyse percutanée',
            'title_en' => 'Percutaneous Cryoneurolysis',
            'desc_front_fr' => "Application contrôlée de froid extrême (-70°C) pour interrompre la conduction douloureuse des nerfs périphériques.",
            'desc_front_en' => "Controlled extreme cold application (-70°C) to interrupt peripheral nerve pain conduction reversibly.",
            'desc_back_fr' => "La cryoneurolyse détruit la gaine de myéline sans léser l'architecture conjonctive du nerf, garantissant une régénération saine tout en offrant une analgésie prolongée.",
            'desc_back_en' => "Cryoneurolysis disrupts myelin without damaging nerve connective architecture, allowing clean nerve regeneration while providing months of pain relief.",
            'card_image' => '/images/treatments/cryoneurolyse.jpg',
            'hero_gallery' => [
                '/images/treatments/cryoneurolyse.jpg',
                'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Indications',
            's1_t_en' => 'Indications',
            's1_txt_fr' => "Névromes cicatriciels post-chirurgicaux, névralgie intercostale, douleurs de paroi abdominale, névralgie d'Arnold réfractaire.",
            's1_txt_en' => "Post-surgical painful neuromas, intercostal neuralgia, abdominal wall nerve entrapment, refractory occipital pain.",
            's1_img' => '/images/treatments/cryoneurolyse.jpg',
            's2_t_fr' => 'Technique du Geste',
            's2_t_en' => 'Technical Execution',
            's2_txt_fr' => "Geste écho-guidé sous anesthésie locale. La cryosonde forme une bille de glace sphérique au contact exact du nerf douloureux.",
            's2_txt_en' => "Ultrasound-guided procedure. The cryoprobe creates an exact micro-ice ball freezing the target sensory nerve safely.",
            's2_img' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Bénéfices',
            's3_t_en' => 'Clinical Benefits',
            's3_txt_fr' => "Analgésie immédiate et prolongée (4 à 9 mois) sans formation de névrome secondaire.",
            's3_txt_en' => "Immediate and prolonged analgesia (4 to 9 months) without risk of secondary neuroma formation.",
            's3_img' => 'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?w=800&auto=format&fit=crop',
            's4_t_fr' => 'Pathologies Traitées',
            's4_t_en' => 'Treated Conditions',
            's4_txt_fr' => "Douleurs post-opératoires, Névralgies thoraciques et pelviennes.",
            's4_txt_en' => "Post-surgical pain, Thoracic and pelvic neuralgias.",
            's4_img' => '/images/douleurs_post_op.jpg',
            'order' => 5
        ],
        [
            'slug' => 'rtms',
            'num' => '06',
            'icon' => '🧠',
            'title_fr' => 'rTMS - Stimulation Magnétique Transcrânienne',
            'title_en' => 'rTMS - Repetitive Transcranial Magnetic Stimulation',
            'desc_front_fr' => "Neuromodulation cérébrale non invasive par impulsions magnétiques pour rééquilibrer le contrôle central de la douleur.",
            'desc_front_en' => "Non-invasive brain neuromodulation utilizing magnetic pulses to recalibrate central pain perception.",
            'desc_back_fr' => "Séances de 20 minutes totalement indolores et sans anesthésie ciblant le cortex moteur (M1) ou préfrontal (DLPFC). Recommandé dans les douleurs chroniques rebelles et la fibromyalgie.",
            'desc_back_en' => "Painless 20-minute sessions targeting motor cortex (M1) or DLPFC to activate natural descending pain control pathways.",
            'card_image' => '/images/treatments/rtms.jpg',
            'hero_gallery' => [
                '/images/treatments/rtms.jpg',
                'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=1200&auto=format&fit=crop'
            ],
            's1_t_fr' => 'Indications',
            's1_t_en' => 'Indications',
            's1_txt_fr' => "Fibromyalgie, douleurs neuropathiques centrales (post-AVC, sclérose en plaques), migraines chroniques, dépression associée à la douleur.",
            's1_txt_en' => "Fibromyalgia, central neuropathic pain (post-stroke, MS), chronic migraines, pain-related depressive fatigue.",
            's1_img' => '/images/treatments/rtms.jpg',
            's2_t_fr' => 'Déroulement du Protocole',
            's2_t_en' => 'Protocol Schedule',
            's2_txt_fr' => "Protocole d'attaque de 10 séances consécutives suivi de séances d'entretien mensuelles. Le patient reste confortablement assis.",
            's2_txt_en' => "Induction protocol of 10 daily sessions followed by monthly maintenance sessions. The patient remains comfortably seated.",
            's2_img' => 'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?w=800&auto=format&fit=crop',
            's3_t_fr' => 'Efficacité',
            's3_t_en' => 'Efficacy',
            's3_txt_fr' => "Amélioration globale de la qualité de vie, du sommeil et réduction sensible de l'intensité douloureuse.",
            's3_txt_en' => "Substantial improvement in pain scores, sleep quality, and daily functional vitality.",
            's3_img' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            's4_t_fr' => 'Pathologies Liées',
            's4_t_en' => 'Related Conditions',
            's4_txt_fr' => "Fibromyalgie, Migraines chroniques, Douleurs neuropathiques.",
            's4_txt_en' => "Fibromyalgia, Chronic migraines, Neuropathic pain.",
            's4_img' => '/images/fibromyalgie.jpg',
            'order' => 6
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO cms_traitements (
        slug, num, icon, title_fr, title_en, desc_front_fr, desc_front_en, desc_back_fr, desc_back_en,
        card_image, hero_gallery_json,
        section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
        section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
        section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
        section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
        cta_text_fr, cta_text_en, cta_url, display_order, is_active
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        'Prendre rendez-vous', 'Book Appointment', '#contact', ?, 1
    )");

    foreach ($traitements as $t) {
        $stmt->execute([
            $t['slug'], $t['num'], $t['icon'], $t['title_fr'], $t['title_en'], $t['desc_front_fr'], $t['desc_front_en'], $t['desc_back_fr'], $t['desc_back_en'],
            $t['card_image'], json_encode($t['hero_gallery']),
            $t['s1_t_fr'], $t['s1_t_en'], $t['s1_txt_fr'], $t['s1_txt_en'], $t['s1_img'],
            $t['s2_t_fr'], $t['s2_t_en'], $t['s2_txt_fr'], $t['s2_txt_en'], $t['s2_img'],
            $t['s3_t_fr'], $t['s3_t_en'], $t['s3_txt_fr'], $t['s3_txt_en'], $t['s3_img'],
            $t['s4_t_fr'], $t['s4_t_en'], $t['s4_txt_fr'], $t['s4_txt_en'], $t['s4_img'],
            $t['order']
        ]);
    }
}

function seedArticlesData(PDO $pdo): void {
    $articles = [
        [
            'slug' => 'nouvelle-approche-neuromodulation',
            'title_fr' => 'La Neuromodulation Médullaire : Une révolution silencieuse',
            'title_en' => 'Spinal Cord Stimulation: A Silent Revolution',
            'summary_fr' => 'Découvrez comment les implants de nouvelle génération transforment le quotidien des patients souffrant de douleurs neuropathiques réfractaires.',
            'summary_en' => 'Discover how next-generation neuro-implants are transforming daily life for patients with refractory neuropathic pain.',
            'content_fr' => "La stimulation médullaire est une technique chirurgicale consistant à implanter des électrodes au niveau de la moelle épinière. Ces électrodes délivrent de faibles impulsions électriques qui bloquent ou modifient le signal douloureux avant qu'il n'atteigne le cerveau.\n\nAujourd'hui, les nouveaux générateurs ajustent la stimulation en temps réel selon la position du patient. C'est une avancée majeure pour les syndromes douloureux régionaux complexes et les douleurs après chirurgie lombaire.",
            'content_en' => "Spinal cord stimulation involves placing micro-electrodes near the dorsal column of the spinal cord. These deliver gentle electrical pulses that modulate pain signals before they reach the brain.\n\nModern smart generators adjust stimulation in real-time based on patient posture, marking a milestone for complex regional pain and post-surgical spinal pain.",
            'category' => 'Innovations',
            'author' => 'Dr. Marc Moreau',
            'author_role_fr' => 'Neurochirurgien / Algologue',
            'author_role_en' => 'Neurosurgeon / Pain Specialist',
            'date_published' => '12 Septembre 2026',
            'read_time_fr' => '5 min',
            'read_time_en' => '5 min',
            'cover_image' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop',
            'gallery' => [
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop'
            ],
            'tags' => '#ITID, #Neuromodulation, #Innovation, #Algologie, #MoelleÉpinière',
            'is_featured' => 1,
            'show_in_home' => 1,
            'sections' => [
                [
                    'id' => 'sec-1',
                    'title' => 'Prise en charge guidée par imagerie interventionnelle',
                    'content' => "À l'ITID, l'implantation d'électrodes de neuromodulation médullaire bénéficie des dernières avancées en scopie haute résolution. Les praticiens ciblent avec une exactitude submillimétrique les fibres dorsales responsables de la transmission des signaux douloureux réfractaires.\n\nCette précision d'imagerie réduit considérablement les temps d'intervention et garantit un positionnement optimal.",
                    'image' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop'
                ],
                [
                    'id' => 'sec-2',
                    'title' => 'Générateurs intelligents & Boucle fermée (Closed-Loop)',
                    'content' => "Les nouveaux stimulateurs d'aujourd'hui enregistrent en continu les potentiels d'action évoqués composites (ECAP) et adaptent la puissance de stimulation microseconde par microseconde.\n\nLe patient ne ressent plus d'à-coups désagréables lors des changements de position (debout, assis, couché) et retrouve un confort de vie inédit au quotidien.",
                    'image' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop'
                ],
                [
                    'id' => 'sec-3',
                    'title' => 'Une alternative pérenne aux antalgiques lourds',
                    'content' => "Pour les personnes souffrant de lombalgies chroniques post-chirurgicales (failed back surgery syndrome) ou de SDRC, la neuromodulation offre une réduction de 50 à 80% de l'intensité douloureuse.\n\nElle permet un sevrage sécurisé et progressif des opioïdes et favorise une reprise active des activités professionnelles et familiales.",
                    'image' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop'
                ]
            ]
        ],
        [
            'slug' => 'hypnose-gestion-douleur',
            'title_fr' => "L'Hypnose Médicale : Reprendre le contrôle sur sa douleur",
            'title_en' => 'Medical Hypnosis: Regaining Control Over Chronic Pain',
            'summary_fr' => "Souvent perçue avec scepticisme, l'hypnose médicale est aujourd'hui une arme thérapeutique redoutable et validée scientifiquement contre la douleur chronique.",
            'summary_en' => 'Far from spectacle, medical hypnosis is a scientifically validated therapeutic approach to modify central pain perception.',
            'content_fr' => "L'hypnose médicale n'a rien à voir avec l'hypnose de spectacle. Il s'agit d'un état de conscience modifiée naturel qui permet de modifier la perception du signal douloureux par le cerveau, diminuant ainsi son intensité et son impact émotionnel.",
            'content_en' => "Medical hypnosis is an altered state of focused attention that allows the brain to re-interpret painful afferent signals, drastically reducing pain intensity and emotional distress.",
            'category' => 'Traitements',
            'author' => 'Sophie Laurent',
            'author_role_fr' => 'Psychologue / Hypnothérapeute',
            'author_role_en' => 'Clinical Psychologist / Hypnotherapist',
            'date_published' => '05 Septembre 2026',
            'read_time_fr' => '4 min',
            'read_time_en' => '4 min',
            'cover_image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
            'gallery' => [
                'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1559757175-9b2f3bc13a07?q=80&w=800&auto=format&fit=crop'
            ]
        ],
        [
            'slug' => 'alimentation-anti-inflammatoire',
            'title_fr' => "Nutrition et Douleur : L'assiette anti-inflammatoire",
            'title_en' => 'Nutrition & Pain: The Anti-Inflammatory Plate',
            'summary_fr' => "Ce que nous mangeons influence directement notre niveau d'inflammation corporelle. Guide pratique des aliments à privilégier pour soulager ses douleurs.",
            'summary_en' => 'Diet directly modulates systemic neuroinflammation. Discover the evidence-based nutritional pillars to soothe chronic pain.',
            'content_fr' => "Notre microbiote intestinal joue un rôle clé dans la régulation de notre système immunitaire. Une alimentation riche en oméga-3, en antioxydants et pauvre en sucres raffinés réduit l'inflammation de bas grade et soulage durablement.",
            'content_en' => "Gut microbiota profoundly influences our immune and nervous balance. An anti-inflammatory nutritional strategy rich in Omega-3s, polyphenols, and fiber calms systemic low-grade inflammation.",
            'category' => 'Conseils Patients',
            'author' => 'Dr. Emma Petit',
            'author_role_fr' => 'Médecin Nutritionniste',
            'author_role_en' => 'Medical Nutritionist',
            'date_published' => '28 Août 2026',
            'read_time_fr' => '6 min',
            'read_time_en' => '6 min',
            'cover_image' => 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
            'gallery' => [
                'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&auto=format&fit=crop'
            ]
        ],
        [
            'slug' => 'inauguration-nouveau-plateau',
            'title_fr' => 'Inauguration de notre nouveau plateau technique 4.0',
            'title_en' => 'Inauguration of our New State-of-the-Art Interventional Suite',
            'summary_fr' => "L'ITID s'agrandit avec un tout nouveau bloc dédié aux interventions percutanées sous écho-guidage et fluoroscopie de pointe.",
            'summary_en' => 'ITID expands with an advanced interventional platform equipped with AI-assisted ultrasound and digital fluoroscopy.',
            'content_fr' => "Nous sommes fiers d'annoncer l'ouverture de notre plateau technique de 250m² doté d'échographes dernière génération et de casques de réalité virtuelle per-opératoires pour un confort maximal.",
            'content_en' => "We proudly unveil our modern 250m² interventional suite featuring high-definition ultrasound, digital imaging, and immersive perioperative virtual reality.",
            'category' => "Vie de l'Institut",
            'author' => 'Jean Dubois',
            'author_role_fr' => "Directeur de l'ITID",
            'author_role_en' => 'Managing Director',
            'date_published' => '15 Août 2026',
            'read_time_fr' => '3 min',
            'read_time_en' => '3 min',
            'cover_image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop',
            'gallery' => [
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop'
            ]
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO cms_articles (
        slug, title_fr, title_en, summary_fr, summary_en, content_fr, content_en,
        category, author, author_role_fr, author_role_en, date_published, read_time_fr, read_time_en,
        cover_image, gallery_images_json, is_published,
        show_in_home, is_featured, sections_json, tags
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, 1,
        ?, ?, ?, ?
    )");

    foreach ($articles as $a) {
        $stmt->execute([
            $a['slug'], $a['title_fr'], $a['title_en'], $a['summary_fr'], $a['summary_en'], $a['content_fr'], $a['content_en'],
            $a['category'], $a['author'], $a['author_role_fr'], $a['author_role_en'], $a['date_published'], $a['read_time_fr'], $a['read_time_en'],
            $a['cover_image'], json_encode($a['gallery']),
            $a['show_in_home'] ?? 1,
            $a['is_featured'] ?? 0,
            json_encode($a['sections'] ?? []),
            $a['tags'] ?? ''
        ]);
    }
}
function seedPagesData(PDO $pdo): void {
    $defaultHeroMedia = [
        [
            'id' => 'media-1',
            'type' => 'video',
            'url' => '/images/video-fond.mp4',
            'title' => 'Vidéo Fond Institut (Originale)',
            'duration' => 10
        ],
        [
            'id' => 'media-2',
            'type' => 'image',
            'url' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop',
            'title' => 'Plateau Interventionnel Guidé',
            'duration' => 6
        ],
        [
            'id' => 'media-3',
            'type' => 'image',
            'url' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&auto=format&fit=crop',
            'title' => 'Imagerie Médicale Haute Définition',
            'duration' => 6
        ]
    ];

    $homeFr = [
        'heroTitle1' => "Institut du Traitement",
        'heroTitle2' => "Interventionnel de la Douleur",
        'heroSubtitle' => "Centre d'excellence dédié au diagnostic de précision et aux thérapeutiques interventionnelles guidées par imagerie pour les douleurs chroniques rebelles.",
        'heroBtn1' => "Prendre Rendez-vous",
        'heroBtn1Url' => "https://www.doctolib.fr",
        'heroVideoUrl' => "/images/ITID-VIDEO-fond.mp4",
        'heroVideoLoop' => true,
        'heroMediaList' => $defaultHeroMedia,
        'parcoursTitle' => "Votre Parcours de Soins à l'ITID",
    ];

    $homeEn = [
        'heroTitle1' => "Institute for Interventional",
        'heroTitle2' => "Pain Management & Relief",
        'heroSubtitle' => "Center of excellence dedicated to precision diagnostics and image-guided interventional therapies for refractory chronic pain.",
        'heroBtn1' => "Book Appointment",
        'heroBtn1Url' => "https://www.doctolib.fr",
        'heroVideoUrl' => "/images/ITID-VIDEO-fond.mp4",
        'heroVideoLoop' => true,
        'heroMediaList' => $defaultHeroMedia,
        'parcoursTitle' => "Your Care Pathway at ITID",
    ];

    $aboutFr = [
        'aboutTitle' => "L'Excellence Médicale au Service du Patient Douloureux",
        'aboutDesc' => "Fondé par une équipe de médecins spécialistes en anesthésie, réanimation et algologie interventionnelle, l'ITID est né de la volonté d'offrir des solutions concrètes, minimalement invasives et personnalisées aux patients en échec thérapeutique.",
    ];

    $aboutEn = [
        'aboutTitle' => "Medical Excellence Dedicated to Patients in Pain",
        'aboutDesc' => "Founded by an expert team of pain physicians, anesthesiologists, and interventional algologists, ITID provides advanced, minimally invasive, and personalized therapies for refractory pain conditions.",
    ];

    $stmt = $pdo->prepare("INSERT INTO cms_pages_content (page_key, content_fr, content_en) VALUES (?, ?, ?)");
    $stmt->execute(['home', json_encode($homeFr), json_encode($homeEn)]);
    $stmt->execute(['about', json_encode($aboutFr), json_encode($aboutEn)]);
}

function seedCasCliniquesData(PDO $pdo): void {
    $cases = [
        [
            'title_fr' => 'Cas Clinique #1',
            'title_en' => 'Clinical Case #1',
            'category_fr' => 'Infiltration lombaire',
            'category_en' => 'Lumbar Infiltration',
            'image' => 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop',
            'order' => 1
        ],
        [
            'title_fr' => 'Cas Clinique #2',
            'title_en' => 'Clinical Case #2',
            'category_fr' => 'Radiofréquence',
            'category_en' => 'Radiofrequency',
            'image' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
            'order' => 2
        ],
        [
            'title_fr' => 'Cas Clinique #3',
            'title_en' => 'Clinical Case #3',
            'category_fr' => 'Douleur pelvienne',
            'category_en' => 'Pelvic Pain',
            'image' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
            'order' => 3
        ],
        [
            'title_fr' => 'Cas Clinique #4',
            'title_en' => 'Clinical Case #4',
            'category_fr' => 'Bloc nerveux',
            'category_en' => 'Nerve Block',
            'image' => 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop',
            'order' => 4
        ],
        [
            'title_fr' => 'Innovation #5',
            'title_en' => 'Innovation #5',
            'category_fr' => 'Réalité Virtuelle',
            'category_en' => 'Virtual Reality',
            'image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
            'order' => 5
        ],
        [
            'title_fr' => 'Cas Clinique #6',
            'title_en' => 'Clinical Case #6',
            'category_fr' => 'Céphalées chroniques',
            'category_en' => 'Chronic Headaches',
            'image' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop',
            'order' => 6
        ],
        [
            'title_fr' => 'Cas Clinique #7',
            'title_en' => 'Clinical Case #7',
            'category_fr' => 'Névralgie cervico-brachiale',
            'category_en' => 'Cervicobrachial Neuralgia',
            'image' => 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=800&auto=format&fit=crop',
            'order' => 7
        ],
        [
            'title_fr' => 'Cas Clinique #8',
            'title_en' => 'Clinical Case #8',
            'category_fr' => 'SDRC Type 1',
            'category_en' => 'CRPS Type 1',
            'image' => 'https://images.unsplash.com/photo-1582719478250-c89af14eb2de?q=80&w=800&auto=format&fit=crop',
            'order' => 8
        ],
        [
            'title_fr' => 'Innovation #9',
            'title_en' => 'Innovation #9',
            'category_fr' => 'Neuromodulation',
            'category_en' => 'Neuromodulation',
            'image' => 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop',
            'order' => 9
        ],
    ];

    $stmt = $pdo->prepare("INSERT INTO cms_cas_cliniques (
        title_fr, title_en, category_fr, category_en, image, display_order, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, 1)");

    foreach ($cases as $c) {
        $stmt->execute([
            $c['title_fr'],
            $c['title_en'],
            $c['category_fr'],
            $c['category_en'],
            $c['image'],
            $c['order']
        ]);
    }
}

// Si appelé directement en HTTP GET par l'admin
if (php_sapi_name() !== 'cli' && isset($_GET['run'])) {
    header('Content-Type: application/json');
    $pdo = getItidDb();
    seedCmsIfEmpty($pdo);
    echo json_encode(['success' => true, 'message' => 'CMS seeding complete.']);
}
