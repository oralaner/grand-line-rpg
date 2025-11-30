"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// COMPOSANT STATS (VERSION SÉCURISÉE & FORMAT "DE X À Y")
const StatsDisplay = ({ stats, compact = false }) => {
    // 1. Sécurité absolue : Si pas de stats, on ne rend rien
    if (!stats || typeof stats !== 'object') return null;

    const entries = Object.entries(stats);
    if (entries.length === 0) return null;

    const config = {
        force: { icon: "⚔️", color: "text-brown-400", label: "Force" },
        force_brute: { icon: "⚔️", color: "text-brown-400", label: "Force" },
        intelligence: { icon: "🧠", color: "text-red-400", label: "Intel" },
        vitalite: { icon: "❤️", color: "text-pink-400", label: "Vita" },
        agilite: { icon: "💨", color: "text-green-400", label: "Agi" },
        chance: { icon: "🍀", color: "text-cyan-400", label: "Chance" },
        sagesse: { icon: "📜", color: "text-purple-400", label: "Sagesse" },
        soin: { icon: "🧪", color: "text-rose-400", label: "Soin" },
        vitesse: { icon: "⚡", color: "text-yellow-400", label: "Vitesse" }
    };

    return (
        <div className={`flex ${compact ? 'flex-row gap-2 flex-wrap' : 'flex-col gap-1 mt-2'}`}>
            {entries.map(([key, val], i) => {
                // Ignore les valeurs vides
                if (!val) return null;

                const conf = config[key] || { label: key, icon: "🔹", color: "text-slate-300" };
                
                // Gestion sécurisée de l'affichage (Tableau ou Nombre)
                let displayVal = val;
                if (Array.isArray(val)) {
                    // MODIFICATION ICI : Format "De X à Y" au lieu de "X-Y"
                    displayVal = `De ${val[0]} à ${val[1]}`; 
                } else if (typeof val === 'number' && val > 0) {
                    displayVal = `+${val}`; // Valeur Fixe
                } else {
                    return null; // Si format inconnu ou 0, on cache
                }

                return (
                    <div key={i} className={`flex items-center gap-1 text-xs font-bold ${conf.color}`}>
                        <span>{conf.icon}</span>
                        <span>{displayVal}</span>
                        {!compact && <span className="text-slate-500 ml-1 uppercase text-[9px]">{conf.label}</span>}
                    </div>
                );
            })}
        </div>
    );
};
const getStatCost = (val) => {
    if (val < 50) return 1;
    if (val < 100) return 2;
    return 3;
};
const formatChronoLong = (ms) => { 
    if (!ms || ms <= 0) return "PRÊT !";
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s.toString().padStart(2, '0')}s`; 
};

const EquipSlot = ({ type, item, onUnequip, theme }) => (
    <div 
        className={`relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center group/item transition-all duration-300 cursor-pointer border-2 shadow-md
        ${item ? `bg-slate-800 ${theme?.border || 'border-yellow-500'} shadow-lg` : 'bg-slate-100/5 border-white/10 hover:border-white/30'}`}
    >
        {item ? (
            <>
               {/* IMAGE */}
               {item.image_url ? (
                   <img 
                       src={item.image_url} 
                       alt={item.nom} 
                       className="w-14 h-14 object-contain drop-shadow-lg mb-2 transform group-hover/item:scale-110 transition rounded-lg" 
                   />
               ) : (
                   <div className="text-3xl drop-shadow-lg mb-2 transform group-hover/item:scale-110 transition">
                       {type === 'Arme' ? '⚔️' : type === 'Tête' ? '👑' : type === 'Corps' ? '👕' : type === 'Bottes' ? '👢' : type === 'Bague' ? '💍' : type === 'Collier' ? '📿' : '⛵'}
                   </div> 
               )}

               {/* NOM OBJET (CORRIGÉ : Multi-lignes) */}
               <div className={`absolute bottom-0 inset-x-0 text-[10px] font-bold text-center px-1 py-0.5 leading-tight ${theme?.textMain || 'text-yellow-100'} bg-black/60 rounded-b-xl min-h-[18px] flex items-center justify-center`}>
                   {item.nom}
               </div>
               
               {/* TOOLTIP */}
               <div className="absolute bottom-full mb-2 bg-slate-900/95 text-white text-xs p-3 rounded-lg border border-slate-500 w-40 hidden group-hover/item:block z-50 pointer-events-none shadow-2xl backdrop-blur-md">
                   <p className={`font-bold text-base mb-1 ${theme?.highlight || 'text-yellow-400'}`}>{item.nom}</p>
                   <div className="mb-2"><StatsDisplay stats={item.stats_bonus} /></div>
                   <p className="italic opacity-70 text-[10px] z-1000 leading-tight border-t border-slate-700 pt-2">{item.description}</p>
               </div>

               <button 
                   onClick={(e) => { e.stopPropagation(); onUnequip(type); }} 
                   className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs border-2 border-slate-900 shadow-lg z-20 transition-transform hover:scale-110 font-bold"
                   title="Déséquiper"
               >✕</button>
            </>
        ) : (
            <>
                <span className="text-slate-600 text-3xl font-bold select-none opacity-30 group-hover/item:text-white transition group-hover/item:opacity-50">
                    {type === 'Arme' ? '⚔️' : type === 'Tête' ? '🧢' : type === 'Corps' ? '👕' : type === 'Bottes' ? '👢' : type === 'Bague' ? '💍' : type === 'Collier' ? '📿' : '⛵'}
                </span>
                <div className="absolute bottom-0 inset-x-0 bg-black/20 text-[7px] text-slate-500 text-center uppercase font-bold py-0.5 pointer-events-none rounded-b-xl">
                    {type}
                </div>
            </>
        )}
    </div>
);

// Ligne de stat (Avec Bonus Equipement + Description visible)
const StatRow = ({ label, base, total, statCode, icon, desc, pointsDispo, onInvest, theme }) => {
    const cost = getStatCost(base); // Le coût dépend de la stat de BASE (pas du total)
    const canAfford = pointsDispo >= cost;
    const bonus = (total || base) - base; // Calcul du bonus d'équipement

    return (
        <div className={`flex justify-between items-start border-b ${theme.borderLow} py-3 hover:bg-white/5 transition px-3`}>
            {/* GAUCHE : Icone, Nom, Description */}
            <div className="flex flex-col max-w-[60%]">
                <div className={`flex items-center gap-2 text-lg font-bold ${theme.textMain} font-[Pirata One]`}>
                    <span>{icon}</span> {label}
                </div>
                <p className={`text-[10px] ${theme.textDim} italic leading-tight mt-0.5`}>{desc}</p>
                <p className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${canAfford ? 'text-green-500' : 'text-red-500/60'}`}>
                    Coût amélioration : {cost} pts
                </p>
            </div>

            {/* DROITE : Valeur, Bonus, Bouton */}
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-baseline gap-1">
                    <span className={`font-black text-2xl font-[Pirata One] text-white`}>{total || base}</span>
                    {bonus > 0 && (
                        <span className="text-xs font-bold text-green-400 animate-pulse">(+{bonus})</span>
                    )}
                </div>
                
                <button 
                    onClick={() => canAfford && onInvest(statCode)} 
                    disabled={!canAfford}
                    className={`h-7 px-3 rounded-lg text-[10px] font-black shadow-lg transition border border-white/10 flex items-center justify-center
                    ${canAfford ? theme.btnSmall : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                >
                    UP +1
                </button>
            </div>
        </div>
    );
};
export default function Home() {
  // --- ÉTATS (LOGIQUE CONSERVÉE) ---
  const [session, setSession] = useState(null);
  const [joueur, setJoueur] = useState(null);
  const [statsTotales, setStatsTotales] = useState(null); 
  const [equipement, setEquipement] = useState({ arme: null, tete: null, corps: null });
  const [loading, setLoading] = useState(false);
  const [explorationLoading, setExplorationLoading] = useState(false);

  const [quetes, setQuetes] = useState([]);
  const [showQuetes, setShowQuetes] = useState(false); // Pour ouvrir/fermer le journal

  const [mesTitres, setMesTitres] = useState([]);
  const [showTitresModal, setShowTitresModal] = useState(false); // Pour la pop-up de sélection

  const [meteoData, setMeteoData] = useState({}); // { "East Blue": "SOLEIL", ... }

  const [chatScope, setChatScope] = useState('GENERAL'); // GENERAL, FACTION, EQUIPAGE
  const [messages, setMessages] = useState([]);
  const [inputChat, setInputChat] = useState("");
  const messagesEndRef = useRef(null);

  const [infosNavire, setInfosNavire] = useState(null); // Infos du navire actuel (vitesse, type)
  const [nextNavire, setNextNavire] = useState(null);   // Coûts du prochain niveau

  const [activeTab, setActiveTab] = useState(null); 
  const [notification, setNotification] = useState(null); 
  const [invFilter, setInvFilter] = useState('TOUT');
  const [shopFilter, setShopFilter] = useState('TOUT');
  const [leaderboardType, setLeaderboardType] = useState('NIVEAU');
  const [viewShopCategory, setViewShopCategory] = useState(null);
  const [craftCategory, setCraftCategory] = useState(null); // 'Forge', 'Cuisine', etc.
  const [inventaire, setInventaire] = useState([]);
  const [boutiqueItems, setBoutiqueItems] = useState([]);
  const [recettes, setRecettes] = useState([]);
  const [topJoueurs, setTopJoueurs] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [marcheItems, setMarcheItems] = useState([]);
  const [areneJoueurs, setAreneJoueurs] = useState([]); 
  const [competences, setCompetences] = useState([]);
  const [mesCompetences, setMesCompetences] = useState([]);

  const [transaction, setTransaction] = useState(null);
  const [qteTransaction, setQteTransaction] = useState(1);
  const [prixVente, setPrixVente] = useState(100); 
  const [confirmVente, setConfirmVente] = useState(null);
  
  const [combatSession, setCombatSession] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [combatRewards, setCombatRewards] = useState(null);
  const [areneFilter, setAreneFilter] = useState('PVE'); // 'PVP' (Humains) ou 'PVE' (Bots)

  const [selectedDest, setSelectedDest] = useState(null); // Pour la pop-up d'île
  // Pour l'instant, on commence sur East Blue par défaut. 
  // Plus tard, on pourra sauvegarder ça dans la table 'joueurs'.
  const [currentMapRegion, setCurrentMapRegion] = useState('East Blue');

  // Configuration des images de cartes (adapte les chemins si besoin)
  const mapImages = {
      'East Blue': '/maps/east_blue.jpg',
      'West Blue': '/maps/west_blue.jpg',
      'North Blue': '/maps/north_blue.jpg',
      'South Blue': '/maps/south_blue.jpg',
      'Paradise': '/maps/paradise.jpg',
      'New World': '/maps/new_world.jpg',
  };

  const [chronoEnergie, setChronoEnergie] = useState(null); // Texte "MM:SS"
  const [dateProchainGain, setDateProchainGain] = useState(null); // Date brute

  const [monEquipage, setMonEquipage] = useState(null);
  const [membresEquipage, setMembresEquipage] = useState([]);
  const [listeEquipages, setListeEquipages] = useState([]); // Pour la recherche
  const [nomEquipageCrea, setNomEquipageCrea] = useState("");

  const [crewTab, setCrewTab] = useState('GENERAL'); // GENERAL, MEMBERS, BANK, EXPE
  const [banqueMontant, setBanqueMontant] = useState(100);
  const [banqueLogs, setBanqueLogs] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [topEquipages, setTopEquipages] = useState([]);

  const [casinoGame, setCasinoGame] = useState('QUITTE');
  const [miseCasino, setMiseCasino] = useState(100);
  const [expeditionResult, setExpeditionResult] = useState(null); // Stocke le résultat (XP, Or, Message)
  const [tempsRestant, setTempsRestant] = useState(0);
  const [expeditionChrono, setExpeditionChrono] = useState(null);
  const [rangJoueur, setRangJoueur] = useState(0);
  const [xpMax, setXpMax] = useState(100);
  const DELAI_COOLDOWN = 60 * 1000;
  
  const getRareteConfig = (rarete) => {
      if (rarete === 'Mythique') return { border: 'border-l-4 border-red-600', bg: 'bg-red-900/20', text: 'text-red-500 animate-pulse' };
      if (rarete === 'Légendaire') return { border: 'border-l-4 border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
      if (rarete === 'Épique') return { border: 'border-l-4 border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' };
      if (rarete === 'Rare') return { border: 'border-l-4 border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' };
      // Commun (Défaut)
      return { border: 'border-l-4 border-slate-500', bg: 'bg-slate-800', text: 'text-slate-400' };
  };

  const notify = (msg, type = "info", duration = 5000) => {
    setNotification({ message: msg, type: type });
    setTimeout(() => setNotification(null), duration);
  };
// Scroll automatique vers le bas
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // --- INITIALISATION ---
  useEffect(() => {
    const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) await fetchGlobalData(session.user.id);
    chargerTitres();
    verifierQuetes();
    const { data: allComp } = await supabase.from('competences').select('*').eq('exclusif_pnj', false).order('puissance');
    setCompetences(allComp || []);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); if (session) fetchGlobalData(session.user.id); });
    return () => subscription.unsubscribe();
    }, []);
   useEffect(() => {
      scrollToBottom();
    }, [messages]);

  useEffect(() => { 
      // ... (début inchangé)
      if (activeTab === 'arene') chargerArene();
  }, [activeTab, leaderboardType, areneFilter]);
  useEffect(() => { if (joueur && joueur.derniere_activite) { const interval = setInterval(() => { const diff = new Date().getTime() - new Date(joueur.derniere_activite).getTime(); if (diff < DELAI_COOLDOWN) setTempsRestant(DELAI_COOLDOWN - diff); else setTempsRestant(0); }, 1000); return () => clearInterval(interval); } }, [joueur]);
  useEffect(() => { if (joueur && joueur.expedition_fin) { const interval = setInterval(() => { const diff = new Date(joueur.expedition_fin).getTime() - new Date().getTime(); if (diff > 0) setExpeditionChrono(diff); else setExpeditionChrono(0); }, 1000); return () => clearInterval(interval); } else setExpeditionChrono(null); }, [joueur]);
  
  useEffect(() => {
      if (activeTab === 'equipage') {
          chargerEquipage();
          chargerDestinations(); // <--- AJOUT IMPORTANT : Charger les cartes
          if (crewTab === 'BANK') chargerBanque();
          if (crewTab === 'MEMBERS') chargerCandidatures();
      }
  }, [activeTab, crewTab, joueur]);

  useEffect(() => {
      // ...
      if (activeTab === 'chantier') chargerChantier();
      // ...
  }, [activeTab, joueur]);
// --- CHRONO ÉNERGIE ---
  useEffect(() => {
      if (!dateProchainGain) return;

      const interval = setInterval(() => {
          const now = new Date();
          const diff = dateProchainGain - now;

          if (diff <= 0) {
              // Temps écoulé ! On rafraîchit pour gagner le point
              clearInterval(interval);
              fetchJoueur(session.user.id);
          } else {
              // Formatage MM:SS
              const m = Math.floor(diff / 60000);
              const s = Math.floor((diff % 60000) / 1000);
              setChronoEnergie(`${m}:${s.toString().padStart(2, '0')}`);
          }
      }, 1000);

      return () => clearInterval(interval);
  }, [dateProchainGain, session]);
  const verifierQuetes = async () => {
      // 1. Générer si pas encore fait aujourd'hui
      await supabase.rpc('generer_quetes_journalieres');
      // 2. Charger
      const { data } = await supabase.from('joueur_quetes').select('*, quetes_ref(*)').eq('joueur_id', session.user.id);
      setQuetes(data || []);
  };

  const recolterRecompense = async (id) => {
      const { data } = await supabase.rpc('recolter_quete', { _quete_id: id });
      if (data.success) { 
          notify(data.message, "success"); 
          fetchJoueur(session.user.id); 
          verifierQuetes(); 
      } else { notify(data.message, "error"); }
  };
  // --- CREATION AUTOMATIQUE COTE CLIENT ---
  // --- CREATION AUTOMATIQUE COTE CLIENT (CORRIGÉE) ---
  const creerNouveauJoueur = async (user) => {
      console.log("Tentative création profil...");
      
      const { data, error } = await supabase.from('joueurs').insert([
          {
              id: user.id,
              pseudo: user.user_metadata.full_name || "Nouveau Pirate",
              avatar_url: user.user_metadata.avatar_url || "",
              niveau: 1, xp: 0, berrys: 100, points_carac: 5,
              force_brute: 1, agilite: 1, intelligence: 1, vitalite: 1, chance: 1, sagesse: 1,
              pv_max_base: 100, pv_actuel: 105,
              faction: null, // Force le choix
              combats_journaliers: 0, victoires: 0, defaites: 0,
              victoires_pve: 0, defaites_pve: 0, victoires_pvp: 0, defaites_pvp: 0,
              elo_pvp: 0,
              deck_combat: [], 
              is_bot: false
          }
      ]).select().single();

      if (error) {
          // SI C'EST UNE ERREUR DE DOUBLON (Code 23505), C'EST BON SIGNE !
          // Ça veut dire que le joueur a été créé juste avant par une autre requête.
          if (error.code === '23505' || error.message.includes('duplicate key')) {
              console.log("Joueur déjà existant, connexion normale.");
              fetchJoueur(user.id); // On charge le joueur existant
          } else {
              console.error("Vraie erreur création:", error);
              notify("Erreur création : " + error.message, "error");
          }
      } else {
          notify("Bienvenue dans Grand Line !", "success");
          setJoueur(data);
          // Don de compétence de base
          await supabase.from('joueur_competences').insert({ joueur_id: user.id, competence_id: 1 }).catch(() => {}); 
      }
  };
  const fetchGlobalData = async (userId) => { await fetchJoueur(userId); await fetchRang(userId); };
  const fetchJoueur = async (userId) => {
    // 1. APPEL RÉGÉNÉRATION & RESET
    await supabase.rpc('verifier_reset_journalier'); 
    const { data: regen } = await supabase.rpc('regenerer_combats'); 

    if (regen && regen.next_regen) {
        setDateProchainGain(new Date(regen.next_regen));
    } else {
        setDateProchainGain(null);
        setChronoEnergie(null);
    }

    // 2. CHARGEMENT DONNÉES JOUEUR
    let { data: j, error } = await supabase.from('joueurs').select('*').eq('id', userId).single();
    
    if (error && error.code === 'PGRST116') {
        console.log("Joueur introuvable, création en cours...");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await creerNouveauJoueur(user);
        return;
    }

    if (j) { 
        setJoueur(j); 
        setXpMax(Math.floor(100 * Math.pow(j.niveau, 1.5)));
        
        // Stats Totales
        const { data: stats } = await supabase.rpc('get_stats_totales', { target_id: userId });
        if (stats) setStatsTotales(stats);
        
        // --- CHARGEMENT ÉQUIPEMENT (NOUVELLE LOGIQUE) ---
        // On récupère tous les IDs d'inventaire équipés (y compris le Navire maintenant)
        const invIds = [
            j.equip_arme_id, j.equip_tete_id, j.equip_corps_id, 
            j.equip_bottes_id, j.equip_bague_id, j.equip_collier_id, j.equip_navire_id
        ].filter(Boolean); // Enlève les null
        
        let newEquip = { arme: null, tete: null, corps: null, bottes: null, bague: null, collier: null, navire: null };
        
        if (invIds.length > 0) {
            // On charge les lignes d'INVENTAIRE complètes + les infos de l'OBJET lié
            const { data: items } = await supabase
                .from('inventaire')
                .select('*, objets(*)') // On veut tout l'inventaire ET l'objet associé
                .in('id', invIds);
            
            if (items) {
                // Fonction pour formater l'objet (fusionner les infos de base + stats uniques)
                const formatItem = (invItem) => {
                    if(!invItem || !invItem.objets) return null;
                    return {
                        ...invItem.objets, // Nom, Desc, Rareté...
                        id: invItem.id,    // IMPORTANT : L'ID pour déséquiper est celui de l'inventaire
                        // Les stats bonus sont celles de l'instance (random), sinon celles de base
                        stats_bonus: invItem.stats_perso || invItem.objets.stats_bonus 
                    };
                };

                // On mappe chaque slot avec l'objet trouvé correspondant à l'ID sauvegardé sur le joueur
                newEquip.arme = formatItem(items.find(i => i.id === j.equip_arme_id));
                newEquip.tete = formatItem(items.find(i => i.id === j.equip_tete_id));
                newEquip.corps = formatItem(items.find(i => i.id === j.equip_corps_id));
                newEquip.bottes = formatItem(items.find(i => i.id === j.equip_bottes_id));
                newEquip.bague = formatItem(items.find(i => i.id === j.equip_bague_id));
                newEquip.collier = formatItem(items.find(i => i.id === j.equip_collier_id));
                newEquip.navire = formatItem(items.find(i => i.id === j.equip_navire_id));
            }
        }
        setEquipement(newEquip);
    }
  };
  
  const fetchRang = async (userId) => { const { data } = await supabase.rpc('get_rang_joueur', { target_id: userId }); if (data) setRangJoueur(data); };

  useEffect(() => { if (!session) return; if (activeTab === 'inventaire') chargerInventaire(); if (activeTab === 'deck') chargerCompetences(); if (activeTab === 'boutique') chargerBoutique(); if (activeTab === 'atelier') chargerAtelier(); if (activeTab === 'classement') chargerClassement(); if (activeTab === 'expeditions') chargerDestinations(); chargerMeteo(); if (activeTab === 'marche') chargerMarche(); if (activeTab === 'arene') chargerArene(); }, [activeTab, leaderboardType]);
 
const chargerInventaire = async () => { 
      const { data } = await supabase
          .from('inventaire')
          // CORRECTION ICI : Ajout de 'image_url' dans la parenthèse objets(...)
          .select('id, quantite, objet_id, stats_perso, objets(nom, rarete, description, type_equipement, stats_bonus, prix_achat, image_url)')
          .eq('joueur_id', session.user.id); 
      
      if (data) setInventaire(data); 
  };
  const chargerBoutique = async () => { 
      // On récupère tout (*), donc le stock est inclus
      const { data } = await supabase.from('objets').select('*').eq('en_boutique', true).order('prix_achat'); 
      if (data) setBoutiqueItems(data); 
  };  const chargerAtelier = async () => { await chargerInventaire(); const { data } = await supabase.from('recettes').select('*, objets:objet_resultat_id(nom, rarete)'); if (data) setRecettes(data); };
  const chargerCompetences = async () => { const { data: allComp } = await supabase.from('competences').select('*').eq('exclusif_pnj', false).order('puissance'); setCompetences(allComp || []); const { data: mesComp } = await supabase.from('joueur_competences').select('competence_id').eq('joueur_id', session.user.id); setMesCompetences(mesComp ? mesComp.map(c => c.competence_id) : []); };
  const chargerClassement = async () => { 
      if (leaderboardType === 'EQUIPAGE') {
          const { data } = await supabase.rpc('get_classement_equipages');
          setTopEquipages(data || []);
      } else {
          // AJOUT DE 'titre_actuel' DANS LE SELECT
          let query = supabase.from('joueurs').select('pseudo, avatar_url, niveau, xp, berrys, faction, elo_pvp, titre_actuel').eq('is_bot', false); 
          
          if (leaderboardType === 'NIVEAU') query = query.order('niveau', { ascending: false }).order('xp', { ascending: false });
          else if (leaderboardType === 'RICHESSE') query = query.order('berrys', { ascending: false });
          else if (leaderboardType === 'PVP') query = query.order('elo_pvp', { ascending: false });
          
          const { data } = await query.limit(20); 
          if (data) setTopJoueurs(data); 
      }
  };
  const chargerChantier = async () => {
      if (!joueur) return;
      
      // Navire Actuel
      const { data: actuel } = await supabase.from('navires_ref').select('*').eq('niveau', joueur.niveau_navire).single();
      setInfosNavire(actuel);

      // Prochain Niveau
      if (joueur.niveau_navire < 10) {
          const { data: prochain } = await supabase.from('navires_ref').select('*').eq('niveau', joueur.niveau_navire + 1).single();
          
          // Récupérer les noms des matériaux requis
          // 'prochain.materiaux' est { "12": 5, "4": 10 }
          const matIds = Object.keys(prochain.materiaux);
          const { data: matsDetails } = await supabase.from('objets').select('id, nom').in('id', matIds);
          
          // On construit une liste propre pour l'affichage
          const materiauxRequis = matIds.map(id => {
              const detail = matsDetails.find(d => d.id == id);
              return {
                  id: id,
                  nom: detail ? detail.nom : "Objet Inconnu",
                  qte: prochain.materiaux[id]
              };
          });

          setNextNavire({ ...prochain, listeMateriaux: materiauxRequis });
      } else {
          setNextNavire(null);
      }
      
      chargerInventaire(); 
  };

  const lancerAmeliorationNavire = async () => {
      const { data } = await supabase.rpc('ameliorer_navire');
      if (data.success) { 
          notify(data.message, "success"); 
          fetchJoueur(session.user.id); // Met à jour le niveau_navire dans le state joueur
          setTimeout(chargerChantier, 500); // Rafraîchit les coûts
      } else { 
          notify(data.message, "error"); 
      }
  };
  const chargerDestinations = async () => { const { data } = await supabase.from('destinations').select('*').order('niveau_requis'); if (data) setDestinations(data); }
const chargerMarche = async () => { 
      const { data } = await supabase
          .from('marche')
          // AJOUT de stats_perso et stats_bonus
          .select('*, objets(nom, rarete, description, type_equipement, stats_bonus), joueurs(pseudo)')
          .order('created_at', { ascending: false }); 
      if (data) setMarcheItems(data); 
  };  const chargerArene = async () => { 
      const isBot = areneFilter === 'PVE'; 
      // AJOUT DE 'titre_actuel' DANS LE SELECT
      const { data } = await supabase
          .from('joueurs')
          .select('id, pseudo, avatar_url, niveau, faction, victoires, defaites, elo_pvp, titre_actuel') 
          .eq('is_bot', isBot)
          .neq('id', session.user.id)
          .order('niveau', { ascending: false })
          .limit(20); 
      setAreneJoueurs(data || []); 
  };
  const chargerEquipage = async () => {
      if (!joueur.equipage_id) {
          setMonEquipage(null);
          const { data } = await supabase.from('equipages').select('*').eq('faction', joueur.faction).limit(10);
          setListeEquipages(data || []);
          return;
      }
      
      const { data: eq } = await supabase.from('equipages').select('*').eq('id', joueur.equipage_id).single();
      setMonEquipage(eq);
      
      // C'EST ICI : Vérifie que 'xp_donnee_equipage' est bien dans la liste !
      const { data: mb } = await supabase
          .from('joueurs')
          .select('id, pseudo, avatar_url, niveau, elo_pvp, xp_donnee_equipage') // <--- IMPORTANT
          .eq('equipage_id', joueur.equipage_id)
          .order('xp_donnee_equipage', { ascending: false }); // On trie par plus gros donneur !
          
      setMembresEquipage(mb || []);
  };
  const chargerMeteo = async () => {
      // 1. On vérifie si la météo doit changer (Lazy Update)
      await supabase.rpc('check_and_update_meteo');

      // 2. On charge la météo à jour
      const { data } = await supabase.from('vue_meteo').select('*');
      if (data) {
          const map = {};
          data.forEach(m => map[m.region] = m.climat);
          setMeteoData(map);
      }
  };
  // --- LOGIQUE TCHAT ---
  
  // Calcul du nom technique du canal pour la base de données
  const getCanalID = () => {
      if (chatScope === 'GENERAL') return 'GLOBAL';
      if (chatScope === 'FACTION') return `FACTION_${joueur.faction}`;
      if (chatScope === 'EQUIPAGE') return `EQUIPAGE_${joueur.equipage_id}`;
      return 'GLOBAL';
  };

  // Charger les anciens messages
  const chargerMessages = async () => {
      const canal = getCanalID();
      // On ne charge rien si on n'a pas accès (ex: pas d'équipage)
      if (chatScope === 'EQUIPAGE' && !joueur.equipage_id) { setMessages([]); return; }
      
      const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('canal', canal)
          .order('date_envoi', { ascending: false }) // Plus récents en premier
          .limit(50);
      
      setMessages(data ? data.reverse() : []); // On inverse pour afficher du haut vers le bas
  };

  // Envoyer un message
  const envoyerMessage = async (e) => {
      e.preventDefault();
      if (!inputChat.trim()) return;
      
      const { data } = await supabase.rpc('envoyer_chat', { _contenu: inputChat, _scope: chatScope });
      
      if (data.success) {
          setInputChat(""); // Vider le champ
          // Le message apparaîtra grâce au Realtime, pas besoin de recharger manuellement
      } else {
          notify(data.message, "error");
      }
  };

  // Abonnement Temps Réel (Dès qu'on change d'onglet de tchat)
  useEffect(() => {
      if (activeTab !== 'tchat') return;

      chargerMessages(); // Charger l'historique

      const canal = getCanalID();
      console.log("Abonnement au canal :", canal);

      const channel = supabase
          .channel('tchat_room')
          .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'messages', filter: `canal=eq.${canal}` },
              (payload) => {
                  // Nouveau message reçu en direct !
                  setMessages((current) => [...current, payload.new]);
              }
          )
          .subscribe();

      return () => { supabase.removeChannel(channel); };
  }, [activeTab, chatScope, joueur]); // Se relance si on change de canal ou de joueur
  const chargerBanque = async () => {
      const { data } = await supabase.from('banque_logs').select('*').eq('equipage_id', joueur.equipage_id).order('date_log', { ascending: false }).limit(20);
      setBanqueLogs(data || []);
  };
  
  const chargerCandidatures = async () => {
      if (!monEquipage || monEquipage.chef_id !== session.user.id) return;
      const { data } = await supabase.from('demandes_adhesion').select('*').eq('equipage_id', joueur.equipage_id);
      setCandidatures(data || []);
  };

  const actionBanque = async (action) => {
      const { data } = await supabase.rpc('gestion_banque', { _montant: parseInt(banqueMontant), _action: action });
      if (data.success) { notify(data.message, "success"); fetchJoueur(session.user.id); chargerEquipage(); chargerBanque(); }
      else { notify(data.message, "error"); }
  };
  
  const gererCandidat = async (idDemande, accept) => {
      const { data } = await supabase.rpc('gerer_candidature', { _demande_id: idDemande, _accepter: accept });
      if (data.success) { notify(data.message, accept ? "success" : "info"); chargerCandidatures(); chargerEquipage(); }
  };
  
  const changerXpPart = async (val) => {
      await supabase.from('joueurs').update({ part_xp_equipage: val }).eq('id', session.user.id);
      setJoueur(prev => ({...prev, part_xp_equipage: val}));
  };
  
  const kickMembre = async (idMembre) => {
      if (!confirm("Exclure ce membre ?")) return;
      const { data } = await supabase.rpc('exclure_membre', { _membre_id: idMembre });
      if (data.success) { notify(data.message, "success"); chargerEquipage(); } else { notify(data.message, "error"); }
  };
  // --- LOGIQUE RAIDS DE GUILDE ---
  const preparerRaid = async (destId) => {
      const { data } = await supabase.rpc('preparer_expedition_equipage', { _dest_id: destId });
      if(data.success) { notify(data.message, "success"); chargerEquipage(); }
      else { notify(data.message, "error"); }
  };

  const rejoindreRaid = async () => {
      const { data } = await supabase.rpc('rejoindre_expedition_equipage');
      if(data.success) { notify(data.message, "success"); chargerEquipage(); }
      else { notify(data.message, "error"); }
  };

  const lancerRaid = async () => {
      const { data } = await supabase.rpc('lancer_expedition_equipage');
      if(data.success) { notify(data.message, "success"); chargerEquipage(); }
      else { notify(data.message, "error"); }
  };
  
  const recolterRaid = async () => {
      const { data } = await supabase.rpc('resoudre_expedition_equipage');
      // Que ce soit une victoire ou une défaite, l'action a "réussi" (le raid est fini)
      if(data) { 
          notify(data.message, data.success ? "success" : "warning"); 
          chargerEquipage(); 
      }
  };
  const creerEquipage = async () => {
      if (!nomEquipageCrea) return;
      const { data } = await supabase.rpc('creer_equipage', { _nom: nomEquipageCrea, _desc: "En route vers le sommet !" });
      if (data.success) { notify(data.message, "success"); fetchJoueur(session.user.id); }
      else { notify(data.message, "error"); }
  };
  
  const rejoindreEquipage = async (id) => {
      const { data } = await supabase.rpc('rejoindre_equipage', { _target_id: id });
      if (data.success) { notify(data.message, "success"); fetchJoueur(session.user.id); }
      else { notify(data.message, "error"); }
  };

  const quitterEquipage = async () => {
      if(!confirm("Voulez-vous vraiment quitter ?")) return;
      const { data } = await supabase.rpc('quitter_equipage');
      if (data.success) { notify(data.message, "info"); fetchJoueur(session.user.id); setMonEquipage(null); }
  };
  // Actions
  const clickActivite = async () => { if (!session || !joueur || tempsRestant > 0 || explorationLoading) return; setExplorationLoading(true); const oldLevel = joueur.niveau; const { data, error } = await supabase.rpc('faire_activite'); if (error) { notify("Erreur: " + error.message, "error"); setExplorationLoading(false); return; } if (data.success) { if (data.new_level > oldLevel) { notify(`🎉 NIVEAU UP ! Lvl ${data.new_level} !`, "success", 8000); } else { notify(`+${data.gain_xp} XP | +${data.gain_berrys} ฿`, "success"); } setTempsRestant(60 * 1000); await fetchJoueur(session.user.id); setExplorationLoading(false); } else { notify(data.message, "error"); setExplorationLoading(false); } };
  const investirStat = async (statNom) => { const { data, error } = await supabase.rpc('investir_stat', { stat_nom: statNom, points_investis: 1 }); if (!error && data.success) { notify("Stat +1 !", "success"); fetchJoueur(session.user.id); } else notify("Erreur stat", "error"); }
  const gererObjet = async (item, action) => {
      if (action === 'UTILISER') {
          
          // 1. CAS SPÉCIAL : FRUIT DU DÉMON
          if (item.objets.nom.endsWith("no Mi")) {
              const { data, error } = await supabase.rpc('manger_fruit_demon', { _objet_id_inventaire: item.objet_id });
              if (data?.success) { 
                  notify(data.message, "success"); 
                  chargerInventaire(); 
                  fetchJoueur(session.user.id); 
                  const { data: mesComp } = await supabase.from('joueur_competences').select('competence_id').eq('joueur_id', session.user.id);
                  setMesCompetences(mesComp ? mesComp.map(c => c.competence_id) : []);
              } else {
                  notify(data?.message || error?.message, "error");
              }
              return;
          }

          // 2. CAS CLASSIQUE : POTIONS
          if (item.objets.type_equipement === 'Consommable') { 
              const result = await supabase.rpc('utiliser_consommable', { _objet_id_input: item.objet_id }); 
              if (result?.data?.success) { 
                  notify(result.data.message, "success"); 
                  await chargerInventaire(); 
                  await fetchJoueur(session.user.id); 
              } else notify(result?.data?.message || "Erreur", "error"); 
          
          // 3. CAS CLASSIQUE : COFFRES (TOUS TYPES)
          } else if (item.objets.type_equipement === "Coffre") { 
              const { data } = await supabase.rpc('ouvrir_coffre', { nom_coffre: item.objets.nom }); 
              
              if(data && data.success) { 
                  // Notification détaillée - Durée augmentée à 15000ms (15 secondes)
                  notify(`🎁 BUTIN !\nObjet : ${data.loot} (${data.rarete})\nBonus : +${data.xp} XP | +${data.berrys} ฿`, "success", 15000); 
                  chargerInventaire(); 
                  fetchJoueur(session.user.id);
              } 
              else notify(data?.message || "Erreur coffre", "error"); 
          }
      }
      else if (action === 'EQUIPER') { 
          // CORRECTION : On envoie item.id (l'ID unique dans ton sac), PAS item.objet_id (l'ID du catalogue)
          const { data } = await supabase.rpc('equiper_objet', { objet_id_input: item.id }); 
          
          if (data && data.success) { 
              notify(data.message, "success"); 
              chargerInventaire(); 
              fetchJoueur(session.user.id); 
          } else { 
              notify(data?.message || "Impossible d'équiper", "error"); 
          }
      }
      else if (action === 'VENDRE_INSTANT') setConfirmVente(item);
  }
  const desequiperSlot = async (slot) => { const { data } = await supabase.rpc('desequiper_objet', { slot_nom: slot }); if (data && data.success) { notify("Déséquipé.", "info"); fetchJoueur(session.user.id); chargerInventaire(); } }
  const partirExpeditionV2 = async (dest) => { const { data, error } = await supabase.rpc('partir_expedition_v2', { dest_id: dest.id }); if (!error && data.success) { notify(data.message, "success"); fetchJoueur(session.user.id); } else notify(data?.message || "Erreur", "error"); }
  const recolterExpedition = async () => { 
      const { data, error } = await supabase.rpc('revenir_expedition'); 
      
      if (!error && data.success !== undefined) { // On accepte success true ou false
          setExpeditionResult({ 
              message: data.message, 
              success: data.success, // true = win, false = loose
              xp: data.xp, 
              berrys: data.berrys 
          });
          
          // On force le rafraîchissement pour dire au site "C'est fini, affiche la carte"
          await fetchJoueur(session.user.id); 
          setExpeditionChrono(null); 
      } else { 
          notify(error?.message || data?.message || "Erreur inconnue", "error"); 
      }
  };
  const ouvrirTransaction = (type, item, maxVal = 99) => { setTransaction({ type, item, max: maxVal }); setQteTransaction(1); setPrixVente(item.objets?.prix_vente || 100); };
const validerTransaction = async () => { 
      if (!transaction) return; 
      
      let rpc = '', p = {}; 
      
      if (transaction.type === 'ACHAT_BOUTIQUE') { 
          rpc = 'acheter_objet'; 
          p = { 
              objet_id_achat: transaction.item.id, 
              qte_achat: qteTransaction 
          }; 
      } 
      else if (transaction.type === 'VENTE') { 
          rpc = 'vendre_au_marche'; 
          p = { 
              objet_id_vente: transaction.item.id, // <--- ICI LA CORRECTION
              qte_vente: qteTransaction, 
              prix_unitaire_vente: prixVente 
          }; 
      } 
      else if (transaction.type === 'ACHAT_MARCHE') { 
          rpc = 'acheter_du_marche'; 
          p = { annonce_id: transaction.item.id, qte_achat: qteTransaction }; 
      } 
      
      const { data, error } = await supabase.rpc(rpc, p); 
      
      if (data && data.success) { 
          notify(data.message, "success"); 
          fetchJoueur(session.user.id); 
          
          if (activeTab === 'inventaire') chargerInventaire();
          if (activeTab === 'marche') chargerMarche();
          if (activeTab === 'boutique') chargerBoutique();
          
          setTransaction(null); 
      } else {
          notify(data?.message || error?.message || "Erreur transaction", "error");
      }
  };
  
const confirmerVenteDirecte = async () => { 
      if (!confirmVente) return; 
      
      // CORRECTION : On envoie '_inv_id' (l'ID unique de la ligne), et non plus l'ID de l'objet
      const { data } = await supabase.rpc('vendre_objet_instantane', { 
          _inv_id: confirmVente.id, // C'est ici la clé du succès ! (item.id)
          _qte: 1 
      }); 
      
      if (data && data.success) { 
          notify(data.message, "success"); 
          chargerInventaire(); 
          fetchJoueur(session.user.id); 
      } else { 
          notify("Erreur vente", "error"); 
      } 
      setConfirmVente(null); 
  };  const crafterItem = async (recette) => { const { data } = await supabase.rpc('crafter_objet', { recette_id_input: recette.id }); if (data && data.success) { notify(`Fabriqué : ${data.nom} !`, "success"); chargerInventaire(); } else notify(data?.message || "Erreur", "error"); };
  const choisirFaction = async (f) => { const { data } = await supabase.rpc('choisir_faction', { nouvelle_faction: f }); if (data && data.success) { setJoueur(prev => ({ ...prev, faction: f })); notify(`Bienvenue chez les ${f}s !`, "success"); } };
  const acheterCompetence = async (cid) => { const { data, error } = await supabase.rpc('acheter_competence', { _comp_id: cid }); if (data && data.success) { notify(data.message, "success"); chargerCompetences(); fetchJoueur(session.user.id); } else notify(data?.message || error?.message, "error"); };
  const equiperCompetence = async (cid) => { let nd = [...(joueur.deck_combat || [])]; if (nd.includes(cid)) nd = nd.filter(id => id !== cid); else { if (nd.length >= 5) return notify("Deck plein !", "error"); nd.push(cid); } const { data, error } = await supabase.rpc('modifier_deck', { _nouveaux_ids: nd }); if (data && data.success) { notify("Deck mis à jour", "success"); fetchJoueur(session.user.id); } else notify(data?.message || error?.message, "error"); };
  const eveillerHaki = async (type) => {
      const { data } = await supabase.rpc('apprendre_haki', { _type: type });
      if (data.success) { notify(data.message, "success"); fetchJoueur(session.user.id); }
      else { notify(data.message, "error"); }
  };
  const lancerCombat = async (adversaireObj) => { 
      let adversaireId; let adversaireInfo = {};
      if (typeof adversaireObj === 'string') { adversaireId = adversaireObj; adversaireInfo = { avatar_url: null, pseudo: "Adversaire", niveau: "?" }; } 
      else if (typeof adversaireObj === 'object' && adversaireObj.id) { adversaireId = adversaireObj.id; adversaireInfo = adversaireObj; }
      else return notify("Erreur cible", "error");

      notify("Combat imminent...", "info"); 
      const { data, error } = await supabase.rpc('lancer_combat', { id_cible: adversaireId }); 
      if (error || !data.success) return notify(data?.message || "Erreur", "error"); 

      setCombatSession({ 
          id: data.combat_id, 
          pv_moi: data.pv_moi, 
          pv_moi_max: data.pv_moi_max, 
          pv_adv: data.pv_adv, 
          pv_adv_max: data.pv_adv, 
          tour: 1, 
          termine: false, 
          adv_avatar: adversaireInfo.avatar_url, 
          adv_pseudo: adversaireInfo.pseudo, 
          adv_niveau: adversaireInfo.niveau,
          cooldowns: {} // <--- AJOUT IMPORTANT ICI
      }); 
      setCombatRewards(null); 
      setCombatLog(["Le combat commence !"]); 
      setActiveTab('combat_actif'); 
  };

  
  const fuirCombat = async () => {
      if (!combatSession || combatSession.termine) return;
      
      if (!confirm("Fuir le combat ? Cela coûtera 200 Berrys et comptera comme une défaite.")) return;

      const { data, error } = await supabase.rpc('fuir_combat', { _combat_id: combatSession.id });
      
      if (error || !data.success) return notify(data?.message || "Erreur fuite", "error");

      notify(data.message, "info");
      
      // On termine la session localement
      setCombatSession({ ...combatSession, termine: true });
      fetchJoueur(session.user.id);
  };
  const jouerTour = async (aid) => { 
      if (!combatSession || combatSession.termine) return; 
      
      const { data, error } = await supabase.rpc('jouer_tour_combat', { _combat_id: combatSession.id, _attaque_id: aid }); 
      
      // CORRECTION : Affiche le message précis du serveur (ex: "En recharge !")
      if (error || !data.success) return notify(data?.message || error?.message || "Action impossible", "error"); 
      
      setCombatLog(prev => [{ source: 'IA', text: data.log_ia }, { source: 'JOUEUR', text: data.log_joueur }, ...prev]); 
      
      if (data.etat === 'VICTOIRE') { 
          const msgElo = data.gain_elo ? ` (+${data.gain_elo} LP)` : '';
          notify(`VICTOIRE !${msgElo}`, "success");
          setCombatSession({ ...combatSession, termine: true, pv_adv: 0 }); 
          setCombatRewards({ xp: data.gain_xp, berrys: data.gain_berrys }); 
          fetchJoueur(session.user.id); 
      } 
      else if (data.etat === 'DEFAITE') { 
          const msgElo = data.perte_elo ? ` (-${data.perte_elo} LP)` : '';
          notify(`DÉFAITE...${msgElo}`, "error");
          setCombatSession({ ...combatSession, termine: true, pv_moi: 0 }); 
      } 
      else { 
          setCombatSession({ 
              ...combatSession, 
              pv_moi: data.pv_moi, 
              pv_adv: data.pv_adv, 
              tour: combatSession.tour + 1,
              cooldowns: data.cooldowns // <--- AJOUT CRUCIAL ICI
          }); 
      } 
  };
  
  const jouerQuitteOuDouble = async (action) => { if (!miseCasino || miseCasino <= 0) return notify("Mise invalide", "error"); const { data } = await supabase.rpc('casino_quitte_double', { action, mise_input: parseInt(miseCasino) }); if (data.success) { fetchJoueur(session.user.id); if (data.etat === 'GAGNE') notify(`GAGNÉ ! Gain: ${data.gain_en_cours}`, "success"); else if (data.etat === 'PERDU') notify("Perdu...", "error"); else notify(`Encaissé : ${data.gain_final}`, "success"); } else notify("Erreur", "error"); };
  const jouerPFC = async (choix) => { if (!miseCasino || miseCasino <= 0) return; const { data } = await supabase.rpc('jouer_pfc', { mise: parseInt(miseCasino), choix_joueur: choix }); if(data.success) { fetchJoueur(session.user.id); notify(data.resultat + " (IA: " + data.choix_ia + ")", data.resultat === 'VICTOIRE' ? "success" : data.resultat === 'DEFAITE' ? "error" : "info"); } };
  const jouerDes = async () => { if (!miseCasino || miseCasino <= 0) return; const { data } = await supabase.rpc('jouer_des', { mise: parseInt(miseCasino) }); if(data.success) { fetchJoueur(session.user.id); notify(data.resultat, data.resultat.includes('VICTOIRE') ? "success" : data.resultat === 'DEFAITE' ? "error" : "info"); } };
const chargerTitres = async () => {
      // Récupère les titres débloqués par le joueur
      const { data } = await supabase
          .from('joueur_titres')
          .select('*, titres_ref(*)')
          .eq('joueur_id', session.user.id);
      setMesTitres(data || []);
  };

  const changerTitre = async (nomTitre) => {
      const { data } = await supabase.rpc('equiper_titre', { _nouveau_titre: nomTitre });
      if (data.success) { 
          notify(data.message, "success"); 
          fetchJoueur(session.user.id); 
          setShowTitresModal(false); 
      } else { 
          notify(data.message, "error"); 
      }
  };
const handleLogin = async () => { 
      setLoading(true); 
      await supabase.auth.signInWithOAuth({ 
          provider: 'discord', 
          options: { 
              redirectTo: window.location.origin,
              // C'est ici que ça se joue : on précise les scopes
              // 'identify' = Pseudo + Avatar + ID (Suffisant pour le jeu)
              // On retire 'email' qui est souvent mis par défaut
              scopes: 'identify', 
          } 
      }); 
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setJoueur(null); };
  const formatTemps = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };
  const getQtePossedee = (id) => { const i = inventaire.find(x => x.objet_id === parseInt(id)); return i ? i.quantite : 0; };
  const getNomIngredient = (id) => { 
      // On cherche dans l'inventaire chargé
      const i = inventaire.find(x => x.objet_id === parseInt(id)); 
      
      // SÉCURITÉ : on vérifie si i existe ET si i.objets existe avant de prendre le nom
      if (i && i.objets) return i.objets.nom; 
      
      // Fallbacks manuels si on n'a pas l'item sur nous
      if(id == 1) return "Bois Flotté"; 
      if(id == 2) return "Lingot de Fer"; 
      
      return "Ingrédient inconnu"; 
    }
// --- LOGIQUE DRAG & SCROLL (FLUIDE) ---
  const mapRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, x: 0, y: 0 });

  const onMouseDown = (e) => {
      if (!mapRef.current) return;
      setIsDragging(true);
      setPos({
          // Position actuelle du scroll
          left: mapRef.current.scrollLeft,
          top: mapRef.current.scrollTop,
          // Position de la souris au départ
          x: e.clientX,
          y: e.clientY,
      });
      e.preventDefault(); // Empêche la sélection de texte
  };

  const onMouseMove = (e) => {
      if (!isDragging || !mapRef.current) return;
      e.preventDefault();
      
      // Calcul de la distance parcourue par la souris
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;

      // On déplace le scroll dans le sens inverse (Drag naturel)
      mapRef.current.scrollTop = pos.top - dy;
      mapRef.current.scrollLeft = pos.left - dx;
  };

  const onMouseUp = () => {
      setIsDragging(false);
  };

  
    // --- CONFIGURATION THEMES (DÉGRADÉS VIBRANTS) ---
  const getFactionTheme = (factionName) => {
      // Normalisation pour éviter les bugs d'accents
      const f = factionName ? factionName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

      if (f.includes('pirate')) {
          return {
              // PIRATE : Rouge Sang & Or (Agressif)
              appBg: "bg-gradient-to-br from-red-900 via-red-950 to-black",
              panel: "bg-black/40 border-red-500/30 backdrop-blur-xl", // Fond des cartes semi-transparent
              textMain: "text-red-50",
              textDim: "text-red-200/60",
              highlight: "text-yellow-500 drop-shadow-sm",
              border: "border-red-600/50",
              borderLow: "border-red-900/30",
              // Dégradé bouton : Orange feu vers Rouge sang
              btnPrimary: "bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white shadow-lg shadow-red-900/50 border border-red-400/20",
              btnSecondary: "bg-red-950/40 text-red-200 border border-red-800 hover:bg-red-900/60",
              btnSmall: "bg-red-600 text-white hover:bg-red-500 shadow-md",
              barFill: "bg-gradient-to-r from-yellow-600 to-red-600",
              textGradient: "from-yellow-400 via-orange-500 to-red-600"
          };
      } 
      else if (f.includes('revo') || f.includes('revolutionnaire')) {
          return {
              // RÉVOLUTIONNAIRE : Vert Néon & Émeraude (Mystérieux)
              appBg: "bg-gradient-to-br from-emerald-900 via-green-950 to-black",
              panel: "bg-black/40 border-emerald-500/30 backdrop-blur-xl",
              textMain: "text-emerald-50",
              textDim: "text-emerald-200/60",
              highlight: "text-teal-300 drop-shadow-sm",
              border: "border-emerald-500/50",
              borderLow: "border-emerald-900/30",
              // Dégradé bouton : Vert clair vers Émeraude profond
              btnPrimary: "bg-gradient-to-r from-emerald-500 to-teal-700 hover:from-emerald-400 hover:to-teal-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/20",
              btnSecondary: "bg-emerald-950/40 text-emerald-200 border border-emerald-800 hover:bg-emerald-900/60",
              btnSmall: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md",
              barFill: "bg-gradient-to-r from-lime-500 to-emerald-600",
              textGradient: "from-lime-300 via-emerald-400 to-teal-600"
          };
      } 
      else {
          // MARINE : Cyan & Bleu Abyssal (Tech/Moderne) - Celui que tu aimais !
          return {
              appBg: "bg-gradient-to-br from-blue-900 via-slate-950 to-black",
              panel: "bg-slate-900/60 border-cyan-500/30 backdrop-blur-xl",
              textMain: "text-cyan-50",
              textDim: "text-cyan-200/60",
              highlight: "text-cyan-400 drop-shadow-sm",
              border: "border-cyan-500/50",
              borderLow: "border-blue-900/30",
              // Dégradé bouton : Cyan électrique vers Bleu roi
              btnPrimary: "bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-cyan-400 hover:to-blue-600 text-white shadow-lg shadow-blue-900/50 border border-cyan-400/20",
              btnSecondary: "bg-slate-800/60 text-cyan-200 border border-cyan-900 hover:bg-slate-700/80",
              btnSmall: "bg-cyan-600 text-white hover:bg-cyan-500 shadow-md",
              barFill: "bg-gradient-to-r from-cyan-400 to-blue-600",
              textGradient: "from-cyan-300 via-blue-400 to-indigo-500"
          };
      }
  };
// --- LOGIQUE RANGS PVP ---
  const getRankLabel = (points) => {
      const tiers = ["Fer", "Bronze", "Argent", "Or", "Platine", "Diamant", "Élite"];
      if (points >= 1800) return { label: `Élite (${points} LP)`, color: "text-red-500 drop-shadow-md" }; // Elite sans limite
      
      const tierIndex = Math.floor(points / 300); // 300 points par rang
      const division = Math.floor((points % 300) / 100) + 1; // 100 points par division
      const lp = points % 100;
      
      // Sécurité si hors limites (ex: < 0)
      const tierName = tiers[Math.max(0, Math.min(tierIndex, 6))];
      
      // Couleurs
      let color = "text-slate-400";
      if(tierIndex === 1) color = "text-orange-400"; // Bronze
      if(tierIndex === 2) color = "text-slate-200"; // Argent
      if(tierIndex === 3) color = "text-yellow-400"; // Or
      if(tierIndex === 4) color = "text-cyan-400"; // Platine
      if(tierIndex === 5) color = "text-purple-400"; // Diamant
      
      return { 
          label: `${tierName} ${'I'.repeat(division)} - ${lp} LP`, 
          color: color 
      };
  };

  // --- HELPER RANG (Icones & Couleurs) ---
  const getRankInfo = (points) => {
      const p = points || 0;
      if (p >= 1800) return { label: `Élite`, icon: "👑", color: "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]", fullLabel: `Élite (${p} LP)` };
      
      const tiers = ["Fer", "Bronze", "Argent", "Or", "Platine", "Diamant", "Élite"];
      const tierIndex = Math.floor(p / 300);
      const division = Math.floor((p % 300) / 100) + 1;
      const lp = p % 100;
      
      // Sécurité
      const tierName = tiers[Math.max(0, Math.min(tierIndex, 6))];
      const urls = {
          fer:      "https://i.postimg.cc/nhdhCngL/fer.png",      // ex: https://i.postimg.cc/xyz/fer.png
          bronze:   "https://i.postimg.cc/wjWj79Zv/bronze.png",
          argent:   "https://i.postimg.cc/jSqjxDgJ/argent.png",
          or:       "https://i.postimg.cc/fRHRJMpy/or.png",
          platine:  "https://i.postimg.cc/vZPZcGk4/platine.png",
          diamant:  "https://i.postimg.cc/wjWj79ZT/diamant.png",
      };
      // Config Visuelle
      let conf = { img: urls.fer, color: "text-stone-400" };
      if(tierIndex === 1) conf = { img:urls.bronze, color: "text-orange-400" };
      if(tierIndex === 2) conf = { img:urls.argent, color: "text-slate-300" };
      if(tierIndex === 3) conf = { img:urls.or, color: "text-yellow-400 drop-shadow-sm" };
      if(tierIndex === 4) conf = { img:urls.platine, color: "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" };
      if(tierIndex === 5) conf = { img:urls.diamant, color: "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" };
      if(tierIndex === 6) conf = { img:urls.diamant, color: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" }; // Elite reprend Diamant avec une lueur rouge

      return { 
          label: `${tierName} ${'I'.repeat(division)}`, 
          lp: lp,
          img: conf.img,
          icon: conf.icon,
          color: conf.color,
          fullLabel: `${tierName} ${'I'.repeat(division)} - ${lp} LP`
      };
  };
  const theme = getFactionTheme(joueur?.faction);
  // On garde isMarine pour la compatibilité avec certains affichages (ex: avatar)
  const isMarine = joueur?.faction === 'Marine';
  // --- RENDU (Design Océan & Cartes Propres) ---
  return (
<main className={`flex h-screen flex-col items-center justify-center ${theme.appBg} font-sans relative overflow-hidden selection:bg-white/30`}>      
      {/* Fond décoratif abstrait */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      
      {/* Style global injecté pour la scrollbar et les animations */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .safe-area-bottom { padding-bottom: 80px; } /* Espace pour la barre du bas */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* NOTIFICATIONS FLOTTANTES */}
      {notification && (
        <div className={`fixed top-4 md:top-8 z-[9999] px-4 md:px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-md font-bold animate-bounce-in flex items-center gap-3 max-w-[90%] mx-auto left-0 right-0 w-fit ${notification.type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-emerald-900/90 border-emerald-500 text-emerald-100'}`}>
            <span className="text-xl md:text-2xl">{notification.type === 'error' ? '⚠️' : '✅'}</span>
            <span className="text-sm md:text-base">{notification.message}</span>
        </div>
      )}
            {/* BOUTON NEWS COO (QUOTIDIENNES) */}
            {session && (
                <button 
                    onClick={() => { setShowQuetes(!showQuetes); verifierQuetes(); }}
                    className={`fixed top-4 right-4 z-[90] p-2 rounded-full shadow-xl border-2 transition flex items-center justify-center w-12 h-12 group
                    ${theme.panel} ${theme.border} hover:scale-110`}
                    title="Journal de Quêtes"
                >
                    <span className="text-2xl filter drop-shadow-md group-hover:-translate-y-1 transition-transform">🐦</span>
                    {/* Badge si récompense dispo */}
                    {quetes.some(q => q.est_terminee && !q.est_recoltee) && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce border border-slate-900 shadow-lg"></span>
                    )}
                </button>
            )}

            {/* MODALE JOURNAL DE QUÊTES (THEME FACTION) */}
            {showQuetes && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border-2 relative overflow-hidden ${theme.panel} ${theme.border}`}>
                        
                        {/* Fond décoratif */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

                        <button onClick={() => setShowQuetes(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-xl transition z-10">✕</button>
                        
                        <div className="text-center mb-6 relative z-10">
                            <h2 className={`text-3xl font-black uppercase tracking-widest drop-shadow-lg ${theme.textMain}`}>
                                News Coo
                            </h2>
                            <p className={`text-xs italic mt-1 ${theme.textDim}`}>L'actualité du jour !</p>
                        </div>

                        <div className="space-y-3 relative z-10 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {quetes.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p className="mb-4">Aucune mission pour le moment...</p>
                                    <button onClick={verifierQuetes} className={`px-4 py-2 rounded-lg text-xs font-bold ${theme.btnSecondary}`}>
                                        🔄 Forcer l'arrivée du Journal
                                    </button>
                                </div>
                            ) : (
                                quetes.map(q => {
                                    const progress = Math.min(100, (q.avancement / q.quetes_ref.objectif_qte) * 100);
                                    const isFinished = q.avancement >= q.quetes_ref.objectif_qte;

                                    return (
                                        <div key={q.id} className={`p-4 border rounded-xl relative transition group hover:bg-white/5 ${q.est_recoltee ? 'border-slate-700 bg-black/20 opacity-50' : `${theme.borderLow} bg-black/40`}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`font-bold text-sm ${q.est_recoltee ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                    {q.quetes_ref.description}
                                                </span>
                                                <span className={`text-xs font-mono font-bold ${isFinished ? 'text-green-400' : theme.textDim}`}>
                                                    {q.avancement} / {q.quetes_ref.objectif_qte}
                                                </span>
                                            </div>
                                            
                                            {/* Barre de progression */}
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3 border border-white/5">
                                                <div 
                                                    className={`h-full transition-all duration-500 ${isFinished ? 'bg-green-500' : theme.barFill}`} 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>

                                            {/* Récompenses & Action */}
                                            <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-2">
                                                <div className="text-[10px] font-bold flex gap-3">
                                                    <span className="text-emerald-400">✨ {q.quetes_ref.gain_xp} XP</span>
                                                    <span className="text-yellow-400">💰 {q.quetes_ref.gain_berrys} B</span>
                                                </div>
                                                
                                                {q.est_terminee && !q.est_recoltee ? (
                                                    <button 
                                                        onClick={() => recolterRecompense(q.id)} 
                                                        className="bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-black px-3 py-1.5 rounded shadow-lg animate-pulse uppercase tracking-wider"
                                                    >
                                                        RÉCOLTER
                                                    </button>
                                                ) : q.est_recoltee ? (
                                                    <span className="text-slate-500 text-[10px] font-bold border border-slate-700 px-2 py-1 rounded bg-black/20">TERMINÉ</span>
                                                ) : (
                                                    <span className={`text-[10px] italic ${theme.textDim}`}>En cours...</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
      {/* ECRAN DE CONNEXION */}
      {!session ? (
        <div className="z-10 text-center bg-slate-800/80 p-6 md:p-10 rounded-3xl border border-slate-700 backdrop-blur-xl shadow-2xl max-w-md w-[90%] mx-4">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4 tracking-tighter">GRAND LINE</h1>
            <p className="text-slate-400 text-xs md:text-sm mb-8 uppercase tracking-widest">MMORPG Next-Gen</p>
            <button onClick={handleLogin} disabled={loading} className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-3 md:py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95">
                {loading ? "Chargement..." : "Connexion Discord"}
            </button>
        </div>
      ) : !joueur ? (
        <div className="m-auto text-xl md:text-2xl text-cyan-400 font-black animate-pulse">Initialisation...</div>
      ) : (!joueur.faction || joueur.faction === "Neutre") ? (
          
          // --- ECRAN DE CHOIX DE FACTION (Mobile Stack) ---
          <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
              <div className="max-w-4xl w-full text-center relative z-10 py-10">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-lg">Choisis ton Destin</h2>
                  <p className="text-slate-400 mb-8 md:mb-12 text-sm md:text-lg">La mer est vaste. Quelle justice défendras-tu ?</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-10">
                      {/* PIRATE */}
                      <button onClick={() => choisirFaction('Pirate')} className="group relative h-48 md:h-80 bg-slate-900 border-4 border-red-900 hover:border-red-500 rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <div className="text-5xl md:text-8xl filter drop-shadow-2xl group-hover:scale-110 transition duration-300">☠️</div>
                          <div className="relative z-10">
                              <h3 className="text-xl md:text-3xl font-black text-red-500 uppercase mb-1 md:mb-2">Pirate</h3>
                              <p className="text-slate-400 text-[10px] md:text-xs px-4 leading-tight">Liberté totale. Chassez les trésors.</p>
                          </div>
                      </button>

                      {/* MARINE */}
                      <button onClick={() => choisirFaction('Marine')} className="group relative h-48 md:h-80 bg-slate-900 border-4 border-blue-900 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <div className="text-5xl md:text-8xl filter drop-shadow-2xl group-hover:scale-110 transition duration-300">⚓</div>
                          <div className="relative z-10">
                              <h3 className="text-xl md:text-3xl font-black text-blue-500 uppercase mb-1 md:mb-2">Marine</h3>
                              <p className="text-slate-400 text-[10px] md:text-xs px-4 leading-tight">L'ordre et la justice.</p>
                          </div>
                      </button>

                      {/* RÉVOLUTIONNAIRE */}
                      <button onClick={() => choisirFaction('Révolutionnaire')} className="group relative h-48 md:h-80 bg-slate-900 border-4 border-amber-900 hover:border-amber-500 rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(245,158,11,0.4)] overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <div className="text-5xl md:text-8xl filter drop-shadow-2xl group-hover:scale-110 transition duration-300">🐉</div>
                          <div className="relative z-10">
                              <h3 className="text-xl md:text-3xl font-black text-amber-500 uppercase mb-1 md:mb-2">Révo.</h3>
                              <p className="text-slate-400 text-[10px] md:text-xs px-4 leading-tight">Renverser le monde.</p>
                          </div>
                      </button>
                  </div>
              </div>
          </div>

      ) : (
        <div className="flex flex-col lg:flex-row w-full h-full max-w-7xl mx-auto p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
        

            {/* === GAUCHE : SIDEBAR PROFIL === */}
            {/* Sur mobile : Visible seulement si aucun onglet n'est actif */}
            {/* MODIFICATION ICI : 'pb-32' ajoute une grosse marge en bas sur mobile pour dépasser le menu */}
            <div className={`w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-2 md:gap-4 transition-all duration-300 ease-in-out h-full overflow-y-auto custom-scrollbar pb-40 lg:pb-0
                ${activeTab ? 'hidden lg:flex' : 'flex'} 
                ${activeTab === 'combat_actif' ? 'lg:-translate-x-[120%] lg:opacity-0 lg:hidden' : ''}`}>
                
                {/* CARTE D'IDENTITÉ */}
                <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-slate-700 shadow-xl relative overflow-hidden group shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.appBg}"></div>
                    
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                         <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] border-2 ${theme.border} shadow-lg relative shrink-0`}>
                             <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                                {joueur.avatar_url ? <img src={joueur.avatar_url} className="w-full h-full object-cover transition group-hover:scale-110"/> : <div className="flex items-center justify-center h-full text-3xl">👤</div>}
                             </div>
                             <div className={`absolute -bottom-2 -right-2 bg-black ${theme.textMain} text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20`}>#{rangJoueur}</div>                         
                         </div>
                        <div className="flex-1 min-w-0">
                            <h2 className={`text-xl md:text-2xl font-black truncate ${theme.textMain}`}>{joueur.pseudo}</h2>
                            <button 
                                    onClick={() => { chargerTitres(); setShowTitresModal(true); }}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border border-dashed border-slate-600 hover:border-white hover:bg-white/10 transition mt-1 ${joueur.titre_actuel ? 'text-yellow-400 border-yellow-600/50' : 'text-slate-500'}`}
                                >
                                    {joueur.titre_actuel ? `« ${joueur.titre_actuel} »` : "+ Choisir un titre"}
                                </button>
                            <div className={`flex items-center gap-2 text-xs font-bold ${theme.textDim} tracking-widest`}>
                                <span className={theme.textMain}>{joueur.faction}</span>
                                <span className="opacity-50">•</span>
                                <span>Lvl {joueur.niveau}</span>
                            </div>

                            {(() => {
                                const rank = getRankInfo(joueur.elo_pvp);
                                return (
                                    <div className="flex items-center gap-2 md:gap-3 bg-black/40 px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-white/10 w-fit mt-2 backdrop-blur-sm">
                                        <img src={rank.img} className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-md" />
                                        <div className="flex flex-col leading-none">
                                            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider ${rank.color}`}>{rank.label}</span>
                                            <span className="text-[8px] md:text-[9px] text-slate-400 font-mono mt-0.5">{rank.lp} Points</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* BARRES DE PROGRESSION */}
                    <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                        <div>
                            <div className={`flex justify-between text-[10px] font-bold ${theme.textDim} mb-1`}>
                                <span>SANTÉ</span>
                                {/* CORRECTION ICI : On utilise statsTotales.pv_max au lieu du calcul manuel */}
                                <span>{joueur.pv_actuel} / {statsTotales?.pv_max || 100}</span>
                            </div>
                            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-slate-700/50">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (joueur.pv_actuel / (statsTotales?.pv_max || 100)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className={`flex justify-between text-[10px] font-bold ${theme.textDim} mb-1`}>
                                    <span>EXPÉRIENCE</span><span>{Math.floor((joueur.xp/xpMax)*100)}%</span></div>
                            <div className="w-full h-1.5 ${theme.textMain} rounded-full overflow-hidden border border-slate-700/50">
                            <div className={`h-full ${theme.barFill} transition-all duration-500`} style={{ width: `${Math.min(100, (joueur.xp / xpMax) * 100)}%` }}></div>    
                        </div>
                        </div>
                    </div>

                    {/* STATS PVE/PVP */}
                    <div className="flex gap-2 mb-4 md:mb-6">
                        <div className="flex-1 bg-black/20 p-2 rounded border border-white/5 text-center">
                            <p className={`text-[9px] font-bold uppercase ${theme.textDim}`}>PvE</p>
                            <div className="flex justify-center gap-2 text-xs font-bold">
                                <span className="text-green-400">{joueur.victoires_pve || 0}V</span>
                                <span className="text-red-400">{joueur.defaites_pve || 0}D</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-black/20 p-2 rounded border border-white/5 text-center">
                            <p className={`text-[9px] font-bold uppercase ${theme.textDim}`}>PvP</p>
                            <div className="flex justify-center gap-2 text-xs font-bold">
                                <span className="text-green-400">{joueur.victoires_pvp || 0}V</span>
                                <span className="text-red-400">{joueur.defaites_pvp || 0}D</span>
                            </div>
                        </div>
                    </div>

                    {/* GRILLE STATS */}
                    <div className="grid grid-cols-3 gap-1 mb-4 bg-[#3e2723]/10 p-2 rounded border border-[#3e2723]/30">
                          {[{i:'❤️',v:statsTotales?.vitalite},{i:'⚔️',v:statsTotales?.force},{i:'🧠',v:statsTotales?.intelligence},{i:'🐈',v:statsTotales?.agilite},{i:'🍀',v:statsTotales?.chance},{i:'📜',v:statsTotales?.sagesse}].map((s,i) => (
                              <div key={i} className="p-1 text-center rounded hover:bg-[#3e2723]/20 cursor-help transition">
                                <span className="text-xs block">{s.i}</span><span className="text-xs text-white font-bold">{s.v||0}</span>
                              </div>
                          ))}
                    </div>
                    
                    {/* EQUIPEMENT (Grille 3x2 propre) */}
                    <div className="grid grid-cols-3 gap-2 mb-4 md:mb-6 px-1 justify-items-center">
                        <EquipSlot type="Tête" item={equipement.tete} onUnequip={desequiperSlot} theme={theme} />
                        <EquipSlot type="Corps" item={equipement.corps} onUnequip={desequiperSlot} theme={theme} />
                        <EquipSlot type="Arme" item={equipement.arme} onUnequip={desequiperSlot} theme={theme} />
                        
                        <EquipSlot type="Bottes" item={equipement.bottes} onUnequip={desequiperSlot} theme={theme} />
                        <EquipSlot type="Bague" item={equipement.bague} onUnequip={desequiperSlot} theme={theme} />
                        <EquipSlot type="Collier" item={equipement.collier} onUnequip={desequiperSlot} theme={theme} />
                    </div>

                    <div className="text-center py-3 border-t border-slate-700/50">
                        <span className="text-2xl md:text-3xl font-black text-yellow-400 tracking-tighter">{joueur.berrys.toLocaleString()}</span>
                        <span className="text-xs font-bold text-yellow-600 ml-1">BERRYS</span>
                    </div>
                </div>

                {/* ACTION PRINCIPALE (EXPLORER) */}
                <button 
                    onClick={clickActivite} 
                    disabled={tempsRestant > 0 || explorationLoading} 
                    className={`w-full py-4 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group border border-white/10 shrink-0
                    ${(tempsRestant > 0 || explorationLoading) 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : theme.btnPrimary }`} 
                >
                    {tempsRestant > 0 ? (
                        <span className="font-mono text-lg md:text-xl">{formatTemps(tempsRestant)}</span>
                    ) : explorationLoading ? (
                        <span className="animate-pulse text-xs md:text-sm tracking-widest">ACTION...</span>
                    ) : (
                        <><span>⚡</span> EXPLORER</>
                    )}
                </button>
                
                <button onClick={handleLogout} className="mt-4 lg:mt-auto text-xs text-slate-600 hover:text-slate-400 transition text-center uppercase tracking-widest py-2">Se déconnecter</button>
            </div>

            {/* === DROITE : DASHBOARD (Contenu) === */}
            {/* Sur mobile, caché si pas d'onglet actif (car on affiche le profil), sinon affiche l'onglet */}
            <div className={`flex-1 flex flex-col h-full relative z-0 min-w-0 transition-all duration-300 ${!activeTab ? 'hidden lg:flex' : 'flex'}`}>
                

                {/* NAVIGATION (PC UNIQUEMENT - Caché sur mobile car on a la Bottom Bar) */}
                <div className={`hidden md:flex md:flex-wrap gap-3 mb-4 transition-all duration-500 ${activeTab === 'combat_actif' ? '-translate-y-[200px] opacity-0 hidden' : 'translate-y-0 opacity-100'}`}>
                    {[
                        { id: 'inventaire', icon: '🎒', label: 'Sac', color: 'hover:bg-amber-600/20 hover:text-amber-400 hover:border-amber-600' },
                        { id: 'stats', icon: '📊', label: 'Stats', color: 'hover:bg-cyan-600/20 hover:text-cyan-400 hover:border-cyan-600', alert: joueur.points_carac > 0 },
                        { id: 'haki', icon: '👁️', label: 'Haki', color: 'hover:bg-purple-600/20 hover:text-purple-400 hover:border-purple-600' },
                        { id: 'deck', icon: '📘', label: 'Skills', color: 'hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-600' },
                        { id: 'arene', icon: '⚔️', label: 'Arène', color: 'hover:bg-red-600/20 hover:text-red-400 hover:border-red-600' },
                        { id: 'equipage', icon: '🏴‍☠️', label: 'Team', color: 'hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-600' }, // <-- AJOUT ICI
                        { id: 'boutique', icon: '🏪', label: 'Shop', color: 'hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-600' },
                        { id: 'marche', icon: '⚖️', label: 'HDV', color: 'hover:bg-purple-600/20 hover:text-purple-400 hover:border-purple-600' },
                        { id: 'expeditions', icon: '🧭', label: 'Voyage', color: 'hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-600' },
                        { id: 'chantier', icon: '⛵', label: 'Navire', color: 'hover:bg-orange-600/20 hover:text-orange-400 hover:border-orange-600' },
                        { id: 'atelier', icon: '🔨', label: 'Craft', color: 'hover:bg-slate-600/20 hover:text-slate-400 hover:border-slate-600' },
                        { id: 'casino', icon: '🎰', label: 'Jeux', color: 'hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-600' },
                        { id: 'classement', icon: '🏆', label: 'Top', color: 'hover:bg-yellow-600/20 hover:text-yellow-400 hover:border-yellow-600' },
                        { id: 'tchat', icon: '💬', label: 'Tchat', color: 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500' },
                    ].map(btn => (
                        <button key={btn.id} onClick={() => setActiveTab(btn.id)} className={`h-20 w-20 rounded-xl border bg-slate-800/50 backdrop-blur flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group relative ${activeTab === btn.id ? `${theme.btnPrimary} border-white/50 shadow-lg` : `border-slate-700 ${theme.textDim} ${btn.color}`}`}>
                            <span className="text-2xl lg:group-hover:scale-110 transition-transform">{btn.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight">{btn.label}</span>
                            {btn.alert && <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>}
                        </button>
                        
                    ))}
                </div>
                {/* CONTENU PRINCIPAL */}
                <div className="flex-1 relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-md border border-slate-700 shadow-2xl h-full">
                    
                    {!activeTab ? (
                        // --- DASHBOARD ACCUEIL (Visible sur PC par défaut) ---
                        <div className="flex flex-col items-center justify-center w-full h-full animate-fadeIn p-4 overflow-y-auto">
                            
                            <div className="text-center mb-6 md:mb-10">
                                <h2 className={`text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient} tracking-tighter drop-shadow-2xl pr-4 py-2 break-all`}>
                                    {joueur.pseudo.toUpperCase()}
                                </h2>
                                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-slate-500 to-transparent mx-auto mt-2"></div>
                                <p className={`text-xs font-bold uppercase tracking-[0.5em] mt-2 opacity-60 ${theme.textMain}`}>Tableau de Bord</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-3xl">
                                
                                <div onClick={() => setActiveTab('inventaire')} className="bg-slate-800/50 border border-slate-700 p-4 md:p-6 rounded-2xl flex items-center gap-4 md:gap-6 hover:bg-slate-800 hover:border-cyan-500/50 transition cursor-pointer group">
                                    <div className={`text-3xl md:text-4xl p-3 md:p-4 rounded-2xl shadow-lg ${joueur.pv_actuel < statsTotales?.pv_max * 0.3 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {joueur.pv_actuel < statsTotales?.pv_max * 0.3 ? '❤️‍🩹' : '💚'}
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">État Physique</p>
                                        <p className="text-white font-black text-lg md:text-xl">{joueur.pv_actuel === statsTotales?.pv_max ? "En pleine forme" : joueur.pv_actuel > 0 ? "Blessé" : "K.O."}</p>
                                        <p className="text-xs text-cyan-500 group-hover:underline mt-1">Gérer l'inventaire →</p>
                                    </div>
                                </div>

                                <div onClick={() => setActiveTab('expeditions')} className={`bg-slate-800/50 border border-slate-700 p-4 md:p-6 rounded-2xl flex items-center gap-4 md:gap-6 hover:bg-slate-800 hover:border-indigo-500/50 transition cursor-pointer group ${joueur.expedition_fin && expeditionChrono === 0 ? 'border-yellow-500/50 bg-yellow-900/10' : ''}`}>
                                    <div className="text-3xl md:text-4xl p-3 md:p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-lg">🧭</div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Expéditions</p>
                                        {joueur.expedition_fin ? ((expeditionChrono === 0 || expeditionChrono === "PRÊT !") ? (<p className="text-yellow-400 font-black animate-pulse text-lg md:text-xl">BUTIN PRÊT !</p>) : (<p className="text-white font-mono text-lg md:text-xl">{formatChronoLong(expeditionChrono)}</p>)) : (<p className="text-white font-bold text-lg md:text-xl group-hover:text-indigo-300">Prêt au départ</p>)}
                                        <p className="text-xs text-indigo-400 group-hover:underline mt-1">Ouvrir la carte →</p>
                                    </div>
                                </div>

                                <div onClick={() => setActiveTab('arene')} className="bg-slate-800/50 border border-slate-700 p-4 md:p-6 rounded-2xl flex items-center gap-4 md:gap-6 hover:bg-slate-800 hover:border-red-500/50 transition cursor-pointer group">
                                    <div className="text-3xl md:text-4xl p-3 md:p-4 rounded-2xl bg-red-500/20 text-red-500 shadow-lg">⚔️</div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Arène PvP</p>
                                        <p className="text-white font-black text-lg md:text-xl">{10 - (joueur.combats_journaliers || 0)} combats dispos</p>
                                        <p className="text-xs text-red-400 group-hover:underline mt-1">Voir le classement →</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 border border-slate-700 p-4 md:p-6 rounded-2xl flex items-center gap-4 md:gap-6 hover:bg-slate-800 transition cursor-default">
                                    <div className="text-3xl md:text-4xl p-3 md:p-4 rounded-2xl bg-yellow-500/20 text-yellow-500 shadow-lg">💰</div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Trésorerie</p>
                                        <p className="text-white font-black text-xl md:text-2xl">{joueur.berrys.toLocaleString()} ฿</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- ONGLETS (Full height on mobile with scroll + padding bottom) ---
                        <div className="absolute inset-0 p-3 md:p-8 overflow-y-auto custom-scrollbar animate-fadeIn safe-area-bottom lg:pb-8">
                            
                            {/* HEADER TAB MOBILE OPTIMISÉ */}
                            {/* === BARRE DE NAVIGATION MOBILE (FIXE EN BAS) === */}
            {/* === BARRE DE NAVIGATION MOBILE (FIXE EN BAS) === */}
            {activeTab !== 'combat_actif' && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 px-2 py-2 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-center overflow-x-auto gap-1 no-scrollbar">
                         {[
                            { id: null, icon: '🏠', label: 'Moi' },
                            { id: 'equipage', icon: '🏴‍☠️', label: 'Team' },
                            { id: 'inventaire', icon: '🎒', label: 'Sac' },
                            { id: 'stats', icon: '📊', label: 'Stats', alert: joueur.points_carac > 0 },
                            { id: 'haki', icon: '👁️', label: 'Haki', color: 'hover:bg-purple-600/20 hover:text-purple-400 hover:border-purple-600' },
                            { id: 'deck', icon: '📘', label: 'Skills' },
                            { id: 'arene', icon: '⚔️', label: 'PvP' },
                            { id: 'expeditions', icon: '🧭', label: 'Voyage' },
                            { id: 'chantier', icon: '⛵', label: 'Navire', color: 'hover:bg-orange-600/20 hover:text-orange-400 hover:border-orange-600' },
                            { id: 'boutique', icon: '🏪', label: 'Shop' },
                            { id: 'marche', icon: '⚖️', label: 'HDV' },
                            { id: 'casino', icon: '🎰', label: 'Jeux' },
                            { id: 'atelier', icon: '🔨', label: 'Craft' },
                            { id: 'classement', icon: '🏆', label: 'Top' },
                            { id: 'tchat', icon: '💬', label: 'Tchat', color: 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500' },
                        ].map((btn, index) => (
                            <button 
                                key={index}
                                onClick={() => setActiveTab(btn.id)}
                                className={`flex flex-col items-center justify-center min-w-[50px] h-[50px] rounded-xl transition-all active:scale-90 shrink-0
                                ${(activeTab === btn.id) || (btn.id === null && !activeTab) 
                                    ? `${theme.btnPrimary} shadow-lg -translate-y-2` 
                                    : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <span className="text-xl leading-none mb-1">{btn.icon}</span>
                                <span className="text-[9px] font-bold uppercase leading-none">{btn.label}</span>
                                {btn.alert && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
                            {/* CONTENU SPECIFIQUE */}
                            <div className="max-w-5xl mx-auto">
                                
                                {/* STATS */}
                                {/* STATS (AVEC BONUS VISIBLES) */}
                                {activeTab === 'stats' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                                        {/* Compteur */}
                                        <div className="bg-black/20 p-4 md:p-8 rounded-2xl border border-white/10 text-center flex flex-col justify-center items-center">
                                            <p className={`text-xs md:text-sm font-bold uppercase mb-2 tracking-widest ${theme.textDim}`}>Points à distribuer</p>
                                            <p className={`text-6xl md:text-8xl font-black drop-shadow-lg ${theme.highlight}`}>{joueur.points_carac}</p>
                                            <p className="text-[10px] text-slate-500 mt-2 italic">Gagnez des niveaux pour en obtenir plus !</p>
                                        </div>

                                        {/* Liste */}
                                        <div className="space-y-1">
                                            <StatRow 
                                                label="Vitalité" 
                                                base={joueur.vitalite} 
                                                total={statsTotales?.vitalite} 
                                                statCode="vitalite" 
                                                icon="❤️" 
                                                desc="Augmente vos PV Max (+5 par point). Indispensable pour survivre." 
                                                pointsDispo={joueur.points_carac} onInvest={investirStat} theme={theme} 
                                            />
                                            <StatRow 
                                                label="Force" 
                                                base={joueur.force_brute} 
                                                total={statsTotales?.force} 
                                                statCode="force_brute" 
                                                icon="⚔️" 
                                                desc="Augmente les dégâts de vos attaques physiques (Sabres, Poings)." 
                                                pointsDispo={joueur.points_carac} onInvest={investirStat} theme={theme} 
                                            />
                                            <StatRow 
                                                label="Intelligence" 
                                                base={joueur.intelligence} 
                                                total={statsTotales?.intelligence} 
                                                statCode="intelligence" 
                                                icon="🧠" 
                                                desc="Réduit les dégâts reçus (Défense) et améliore l'efficacité des soins." 
                                                pointsDispo={joueur.points_carac} onInvest={investirStat} theme={theme} 
                                            />
                                            <StatRow 
                                                label="Agilité" 
                                                base={joueur.agilite} 
                                                total={statsTotales?.agilite} 
                                                statCode="agilite" 
                                                icon="🐈" 
                                                desc="Augmente les dégâts des armes à feu et vos chances d'esquive." 
                                                pointsDispo={joueur.points_carac} onInvest={investirStat} theme={theme} 
                                            />
                                            <StatRow 
                                                label="Chance" 
                                                base={joueur.chance} 
                                                total={statsTotales?.chance} 
                                                statCode="chance" 
                                                icon="🍀" 
                                                desc="Augmente les chances de Coup Critique et la réussite des Expéditions." 
                                                pointsDispo={joueur.points_carac} onInvest={investirStat} theme={theme} 
                                            />
                                            <StatRow 
                                                label="Sagesse" 
                                                base={joueur.sagesse} 
                                                total={statsTotales?.sagesse} 
                                                statCode="sagesse" 
                                                icon="📜" 
                                                desc="Augmente le gain d'expérience gagné à chaque combat ou activité." 
                                                pointsDispo={joueur.points_carac} onInvest={investirStat} theme={theme} 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* INVENTAIRE (AVEC STATS DYNAMIQUES ET CORRECTION EQUIPEMENT) */}
                                {activeTab === 'inventaire' && (
                                    <div className="space-y-4 md:space-y-6 animate-fadeIn">
                                        
                                        {/* FILTRES */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                            {['TOUT', 'EQUIPEMENT', 'CONSOMMABLE', 'RESSOURCE', 'AUTRE'].map(f => (
                                                <button 
                                                    key={f} 
                                                    onClick={() => setInvFilter(f)} 
                                                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition uppercase tracking-wider 
                                                    ${invFilter === f ? theme.btnPrimary : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>

                                        {/* LISTE */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                             {inventaire.filter(item => {
                                                 // 1. EXCLURE LES OBJETS DÉJÀ ÉQUIPÉS
                                                 // On vérifie si l'ID unique de cet item (item.id) correspond à un des slots du joueur
                                                 const estEquipe = [
                                                     joueur.equip_arme_id, 
                                                     joueur.equip_tete_id, 
                                                     joueur.equip_corps_id, 
                                                     joueur.equip_bottes_id, 
                                                     joueur.equip_bague_id, 
                                                     joueur.equip_collier_id, 
                                                     joueur.equip_navire_id
                                                 ].includes(item.id);

                                                 if (estEquipe) return false; // On le cache s'il est porté

                                                 // 2. FILTRES DE CATÉGORIE (Votre code existant)
                                                 const type = item.objets.type_equipement;
                                                 if (invFilter === 'TOUT') return true;
                                                 if (invFilter === 'EQUIPEMENT') return ['Arme', 'Tête', 'Corps', 'Bottes', 'Bague', 'Collier', 'Navire'].includes(type);
                                                 if (invFilter === 'CONSOMMABLE') return ['Consommable', 'Fruit'].includes(type);
                                                 if (invFilter === 'RESSOURCE') return type === 'Ressource';
                                                 if (invFilter === 'AUTRE') return !['Arme', 'Tête', 'Corps', 'Bottes', 'Bague', 'Collier', 'Navire', 'Consommable', 'Fruit', 'Ressource'].includes(type);
                                                 return true;
                                             }).map((item, i) => {
                                                 const cfg = getRareteConfig(item.objets.rarete);
                                                 const isCoffre = item.objets.type_equipement === "Coffre";
                                                 const isFruit = item.objets.type_equipement === 'Fruit';
                                                 const isEquipable = ['Arme', 'Tête', 'Corps', 'Bottes', 'Bague', 'Collier', 'Navire'].includes(item.objets.type_equipement);

                                                 return (
                                                     <div key={i} className={`flex items-start justify-between bg-black/20 p-4 rounded-xl border ${theme.borderLow} border-l-4 ${cfg.border} hover:bg-black/30 transition group min-h-[140px]`}>
                                                         
                                                         {/* GAUCHE : IMAGE + INFOS */}
                                                         <div className="flex-1 min-w-0 pr-4 flex gap-4">
                                                             
                                                             {/* IMAGE (Carré) */}
                                                             <div className="w-20 h-20 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 p-1 shadow-inner self-start">
                                                                 {item.objets.image_url ? (
                                                                     <img src={item.objets.image_url} alt={item.objets.nom} className="w-full h-full object-contain" />
                                                                 ) : (
                                                                     <span className="text-3xl opacity-50">📦</span>
                                                                 )}
                                                             </div>

                                                             {/* INFOS */}
                                                             <div className="flex-1 min-w-0">
                                                                 <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                     <p className={`font-bold text-sm md:text-lg leading-tight ${theme.textMain}`}>
                                                                         {item.objets.nom}
                                                                     </p>
                                                                     {isFruit && <span className="text-[8px] bg-purple-900 text-purple-200 px-1.5 rounded border border-purple-500 animate-pulse shrink-0">UNIQUE</span>}
                                                                 </div>
                                                                 <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${theme.textDim}`}>{item.objets.rarete} • {item.objets.type_equipement}</p>
                                                                 
                                                                 {/* STATS (VERTICALES) */}
                                                                 <div className="text-[10px]">
                                                                     <StatsDisplay 
                                                                         stats={item.stats_perso || item.objets.stats_bonus} 
                                                                         compact={false} 
                                                                     />
                                                                 </div>
                                                             </div>
                                                         </div>
                                                         
                                                         {/* DROITE : QUANTITÉ & ACTIONS */}
                                                         <div className="flex flex-col items-end gap-2 shrink-0 self-start">
                                                             <span className="bg-black/40 text-slate-400 px-3 py-1 rounded text-xs font-mono font-bold border border-white/5">x{item.quantite}</span>
                                                             
                                                             <div className="flex flex-col gap-2 mt-2">
                                                                 {(item.objets.type_equipement === 'Consommable' || isFruit) && (
                                                                     <button onClick={() => gererObjet(item, 'UTILISER')} className={`text-xs px-3 py-1.5 rounded font-bold shadow-lg active:scale-95 transition w-full ${theme.btnSecondary}`}>
                                                                         {isFruit ? 'MANGER 🍎' : item.objets.nom.includes('Parchemin') ? 'LIRE 📜' : 'BOIRE 🧪'}
                                                                     </button>
                                                                 )}
                                                                 
                                                                 {isEquipable && (
                                                                     <button onClick={() => gererObjet(item, 'EQUIPER')} className={`text-xs px-3 py-1.5 rounded font-bold shadow-lg active:scale-95 transition w-full ${theme.btnSecondary}`}>
                                                                         Équiper
                                                                     </button>
                                                                 )}
                                                                 
                                                                 {isCoffre && (
                                                                     <button onClick={() => gererObjet(item, 'UTILISER')} className={`text-xs px-3 py-1.5 rounded font-bold border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 animate-pulse w-full`}>Ouvrir</button>
                                                                 )}
                                                                 
                                                                 <button onClick={() => ouvrirTransaction('VENTE', item, item.quantite)} className={`text-xs px-3 py-1.5 rounded font-bold w-full ${theme.btnSecondary}`}>HDV</button>
                                                                 <button onClick={() => gererObjet(item, 'VENDRE_INSTANT')} className="text-xs text-red-400 hover:text-red-200 px-2 underline font-bold transition w-full text-right" title="Vente Rapide">Vendre</button>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 )
                                             })}
                                             
                                             {/* Message vide (Copie de la logique de filtre) */}
                                             {inventaire.filter(item => {
                                                 if (!item.objets) return false;
                                                 const estEquipe = [joueur.equip_arme_id, joueur.equip_tete_id, joueur.equip_corps_id, joueur.equip_bottes_id, joueur.equip_bague_id, joueur.equip_collier_id, joueur.equip_navire_id].includes(item.id);
                                                 if (estEquipe) return false;
                                                 const type = item.objets.type_equipement;
                                                 if (invFilter === 'TOUT') return true;
                                                 if (invFilter === 'EQUIPEMENT') return ['Arme', 'Tête', 'Corps', 'Bottes', 'Bague', 'Collier', 'Navire'].includes(type);
                                                 if (invFilter === 'CONSOMMABLE') return ['Consommable', 'Fruit'].includes(type);
                                                 if (invFilter === 'RESSOURCE') return type === 'Ressource';
                                                 if (invFilter === 'AUTRE') return !['Arme', 'Tête', 'Corps', 'Bottes', 'Bague', 'Collier', 'Navire', 'Consommable', 'Fruit', 'Ressource'].includes(type);
                                                 return true;
                                             }).length === 0 && (
                                                 <div className="col-span-1 md:col-span-2 text-center py-10 text-slate-500 italic">Sac vide...</div>
                                             )}
                                        </div>
                                    </div>
                                )}

                                {/* BOUTIQUE (AVEC FRUITS UNIQUES) */}
                            {/* BOUTIQUE (CATÉGORIES DÉTAILLÉES) */}
                            {activeTab === 'boutique' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fadeIn">
                                    
                                    {/* MENU CATÉGORIES */}
                                    {!viewShopCategory ? (
                                        // On liste toutes les catégories explicites
                                        ['Arme', 'Tête', 'Corps', 'Bottes', 'Bijoux', 'Consommable', 'Fruit', 'Navire', 'Autre'].map(cat => (
                                            <button 
                                                key={cat} 
                                                onClick={() => setViewShopCategory(cat)} 
                                                className={`h-28 md:h-40 border-2 ${theme.border} ${theme.panel} hover:bg-black/40 rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 transition group shadow-lg relative overflow-hidden`}
                                            >
                                                {/* Effet spécial pour les Fruits */}
                                                {cat === 'Fruit' && <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>}
                                                
                                                <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform drop-shadow-md">
                                                    {cat === 'Arme' ? '⚔️' : 
                                                     cat === 'Tête' ? '🧢' : 
                                                     cat === 'Corps' ? '👕' : 
                                                     cat === 'Bottes' ? '👢' : 
                                                     cat === 'Bijoux' ? '💍' : 
                                                     cat === 'Consommable' ? '🧪' : 
                                                     cat === 'Fruit' ? '🍎' : 
                                                     cat === 'Navire' ? '⛵' : 
                                                     '📦'}
                                                </span>
                                                <span className={`font-black uppercase text-sm md:text-lg tracking-widest ${theme.textMain}`}>
                                                    {cat === 'Fruit' ? 'Fruits du Démon' : cat}
                                                </span>
                                                {cat === 'Fruit' && <span className="text-[8px] text-purple-300 font-bold uppercase tracking-widest border border-purple-500/50 px-2 rounded">Unique</span>}
                                            </button>
                                        ))
                                    ) : (
                                        /* LISTE DES OBJETS FILTRÉE */
                                        <div className="col-span-1 md:col-span-2">
                                            <button 
                                                onClick={() => setViewShopCategory(null)} 
                                                className={`mb-4 md:mb-6 flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${theme.textDim} hover:text-white transition`}
                                            >
                                                ⬅ Retour aux catégories
                                            </button>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {boutiqueItems.filter(i => 
                                                    // 1. Correspondance directe (Arme, Tête, Corps, Bottes, Fruit, Navire...)
                                                    i.type_equipement === viewShopCategory || 
                                                    
                                                    // 2. Cas spécial Bijoux (Regroupe Bague et Collier)
                                                    (viewShopCategory === 'Bijoux' && ['Bague','Collier'].includes(i.type_equipement)) || 
                                                    
                                                    // 3. Cas spécial Autre (Tout le reste)
                                                    (viewShopCategory === 'Autre' && !['Arme','Tête','Corps','Bottes','Bague','Collier','Consommable','Fruit','Navire'].includes(i.type_equipement))
                                                ).map((item, i) => {
                                                    // Gestion du Stock
                                                    const isSoldOut = item.stock !== null && item.stock <= 0;
                                                    const isUnique = item.stock !== null;

                                                    return (
                                                        <div key={i} className={`relative border ${theme.borderLow} bg-black/20 p-3 md:p-4 rounded-xl flex flex-col justify-between transition group ${isSoldOut ? 'opacity-60 grayscale' : 'hover:bg-black/30'}`}>
                                                        <div className="flex-grow min-w-0 pr-2"> {/* flex-grow pour pousser le bouton vers le bas */}
                                                          <div className="flex items-center gap-2 mb-1">
                                                             <p className={`font-bold text-sm md:text-lg ${isSoldOut ? 'text-slate-500 line-through' : theme.textMain}`}>{item.nom}</p>
                                                              {isUnique && !isSoldOut && <span className="text-[8px] bg-purple-900 text-purple-200 px-1.5 rounded border border-purple-500 animate-pulse">UNIQUE</span>}
                                                           </div>

                                                           {/* NOUVEL EMPLACEMENT DE L'IMAGE */}
                                                           <div className="flex items-start gap-3 mb-2">
                                                           {item.image_url && (
                                                           <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center p-1 md:p-1.5 shadow-inner">
                                                              <img src={item.image_url} alt={item.nom} className="w-full h-full object-contain" />
                                                             </div>
                                                                  )}
                                                               <div>
                                                               <p className={`text-xs italic mb-1 ${theme.textDim}`}>{item.description}</p>
                                                            {/* Affichage Stats (Sécurisé) */}
                                                              <div className="text-[9px] md:text-[10px]">
                                                           <StatsDisplay stats={item.stats_bonus || {}} compact={false} /> {/* compact={false} pour la verticale */}
                                                         </div>
                                                        </div>
                                                      </div>
                                                     </div>
                                                            
                                                            {isSoldOut ? (
                                                             <div className="self-end px-4 py-2 rounded-lg border border-red-900/50 bg-red-950/30 text-red-500 font-black text-xs uppercase -rotate-12 border-2 mt-auto"> {/* mt-auto pour pousser en bas */}
                                                                ÉPUISÉ
                                                           </div>
                                                              ) : (
                                                                <button 
                                                                    onClick={() => {
                                                                        // Calcul limite achat (99 pour consommables, 1 pour équipement/fruit/navire)
                                                                        const maxAchat = ['Consommable', 'Ressource', 'Autre'].includes(item.type_equipement) ? 99 : 1;
                                                                        ouvrirTransaction('ACHAT_BOUTIQUE', item, maxAchat);
                                                                    }} 
                                                                    className={`ml-2 font-bold py-2 px-3 md:px-5 rounded-lg shadow-lg active:scale-95 transition text-xs md:text-sm whitespace-nowrap ${theme.btnPrimary}`}
                                                                >
                                                                    {item.prix_achat.toLocaleString()} ฿
                                                                </button>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            
                                            {boutiqueItems.filter(i => 
                                                i.type_equipement === viewShopCategory || 
                                                (viewShopCategory === 'Bijoux' && ['Bague','Collier'].includes(i.type_equipement)) ||
                                                (viewShopCategory === 'Autre' && !['Arme','Tête','Corps','Bottes','Bague','Collier','Consommable','Fruit','Navire'].includes(i.type_equipement))
                                            ).length === 0 && (
                                                <div className="text-center py-10 text-slate-500 italic">Rien à vendre ici pour le moment...</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                                
                                {/* DECK */}
                                {activeTab === 'deck' && (
                                <div className="space-y-6 md:space-y-8">
                                    <div className={`p-4 md:p-6 rounded-2xl border ${theme.borderLow} bg-black/20`}>
                                        <h3 className={`font-bold text-base md:text-xl mb-4 md:mb-6 text-center uppercase tracking-widest ${theme.textMain}`}>
                                            Deck Actif ({joueur.deck_combat?.length || 0}/5)
                                        </h3>
                                        <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
                                            {joueur.deck_combat?.map(id => {
                                                const s = competences.find(c => c.id === id);
                                                return s ? (
                                                    <div key={id} onClick={() => equiperCompetence(id)} className={`w-16 h-24 md:w-24 md:h-32 border-2 ${theme.border} bg-black/40 rounded-xl flex flex-col items-center justify-center p-1 md:p-2 text-center cursor-pointer hover:bg-red-900/80 hover:border-red-500 transition relative group shadow-lg`}>
                                                        <span className="text-xl md:text-3xl mb-1 md:mb-2">⚡</span>
                                                        <span className="text-[8px] md:text-[10px] font-bold leading-tight text-white uppercase">{s.nom}</span>
                                                        <span className={`text-[8px] md:text-[9px] mt-1 font-mono ${theme.textDim}`}>{s.puissance} Pui</span>
                                                        <div className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] md:text-xs font-black text-white uppercase tracking-widest transition rounded-lg">RETIRER</div>
                                                    </div>
                                                ) : null;
                                            })}
                                            {[...Array(5 - (joueur.deck_combat?.length || 0))].map((_, i) => (
                                                <div key={i} className="w-16 h-24 md:w-24 md:h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center opacity-30 text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Vide</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {competences.map(skill => {
                                            const possede = mesCompetences.includes(skill.id);
                                            const equipe = joueur.deck_combat?.includes(skill.id);
                                            if (skill.exclusif_pnj && !possede) return null;
                                            return (
                                                <div key={skill.id} className={`p-3 md:p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${possede ? `${theme.borderLow} bg-black/20` : 'bg-black/40 border-white/5 opacity-80'}`}>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-bold text-sm ${theme.textMain}`}>{skill.nom}</span>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${skill.type_degats === 'Physique' ? 'bg-red-900/50 text-red-200' : 'bg-blue-900/50 text-blue-200'}`}>{skill.type_degats}</span>
                                                        </div>
                                                        <div className={`text-xs mt-1 ${theme.textDim}`}>{skill.description}</div>
                                                        <div className="flex gap-3 mt-2 text-[10px] font-mono font-bold opacity-80">
                                                            <span className="text-slate-300">💥 {skill.puissance} Pui</span>
                                                            <span className="text-emerald-400">🎯 {skill.precision}% Préc.</span>
                                                        </div>
                                                    </div>
                                                    {possede ? (
                                                        <button onClick={() => equiperCompetence(skill.id)} className={`text-xs font-bold px-4 py-2 rounded-lg w-full sm:w-auto ${equipe ? 'bg-white/5 text-slate-500 cursor-not-allowed' : theme.btnPrimary}`} disabled={equipe}>{equipe ? 'ÉQUIPÉ' : 'ÉQUIPER'}</button>
                                                    ) : (
                                                        skill.est_achetable ? (
                                                            <button onClick={() => acheterCompetence(skill.id)} className={`text-xs font-bold px-4 py-2 rounded-lg shadow-lg border w-full sm:w-auto ${theme.btnSecondary}`}>ACHETER {skill.cout_achat} ฿</button>
                                                        ) : (
                                                            <button disabled className="text-[10px] font-bold px-3 py-2 rounded-lg border border-purple-500/30 text-purple-400 bg-purple-900/20 cursor-not-allowed opacity-70 w-full sm:w-auto">🔮 FRUIT REQUIS</button>
                                                        )
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* TCHAT MULTI-CANAUX */}
                            {activeTab === 'tchat' && (
                                <div className="space-y-4 h-full flex flex-col">
                                    
                                    {/* Onglets Canaux */}
                                    <div className="flex p-1 bg-black/30 rounded-lg shrink-0">
                                        <button onClick={() => setChatScope('GENERAL')} className={`flex-1 py-2 rounded-md text-xs font-bold transition ${chatScope === 'GENERAL' ? theme.btnPrimary : 'text-slate-400 hover:text-white'}`}>🌍 Général</button>
                                        <button onClick={() => setChatScope('FACTION')} className={`flex-1 py-2 rounded-md text-xs font-bold transition ${chatScope === 'FACTION' ? theme.btnPrimary : 'text-slate-400 hover:text-white'}`}>🏴 Faction</button>
                                        <button onClick={() => setChatScope('EQUIPAGE')} className={`flex-1 py-2 rounded-md text-xs font-bold transition ${chatScope === 'EQUIPAGE' ? theme.btnPrimary : 'text-slate-400 hover:text-white'}`}>⚓ Équipage</button>
                                    </div>

                                    {/* Zone des Messages */}
                                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-[300px]">
                                        {/* Message de bienvenue ou d'erreur si pas accès */}
                                        {chatScope === 'EQUIPAGE' && !joueur.equipage_id ? (
                                            <div className="text-center text-slate-500 my-auto italic">Rejoignez un équipage pour accéder à ce canal.</div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center text-slate-600 my-auto text-xs">Aucun message... Soyez le premier !</div>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMe = msg.joueur_id === session.user.id;
                                                // Couleur pseudo selon faction
                                                let nameColor = "text-slate-400";
                                                if(msg.faction === 'Pirate') nameColor = "text-red-400";
                                                if(msg.faction === 'Marine') nameColor = "text-cyan-400";
                                                if(msg.faction === 'Révolutionnaire') nameColor = "text-emerald-400";

                                                return (
                                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        
                                                        <div className="flex items-baseline gap-2 mb-0.5">
                                                            <span className={`text-[10px] font-bold ${nameColor}`}>{msg.pseudo}</span>
                                                            <span className="text-[8px] text-slate-600">{new Date(msg.date_envoi).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                        <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] break-words ${isMe ? 'bg-slate-700 text-white rounded-tr-none' : 'bg-black/60 text-slate-200 rounded-tl-none border border-white/10'}`}>
                                                            {msg.contenu}
                                                        </div>
                                                        <div ref={messagesEndRef} />
                                                    </div>
                                                )
                                            })
                                        )}
                                        {/* Ancre pour scroll automatique en bas (optionnel) */}
                                        <div id="chat-bottom"></div>
                                    </div>

                                    {/* Zone de Saisie */}
                                    <form onSubmit={envoyerMessage} className="flex gap-2 shrink-0">
                                        <input 
                                            type="text" 
                                            value={inputChat}
                                            onChange={(e) => setInputChat(e.target.value)}
                                            placeholder={`Message ${chatScope === 'GENERAL' ? 'au monde' : chatScope === 'FACTION' ? 'à la faction' : 'à l\'équipage'}...`}
                                            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-white outline-none"
                                            disabled={chatScope === 'EQUIPAGE' && !joueur.equipage_id}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!inputChat.trim() || (chatScope === 'EQUIPAGE' && !joueur.equipage_id)}
                                            className={`px-4 rounded-lg font-bold text-xl ${theme.btnPrimary}`}
                                        >
                                            ➤
                                        </button>
                                    </form>
                                </div>
                            )}
                            {/* ENTRAINEMENT HAKI (DANS LE DASHBOARD) */}
                            {activeTab === 'haki' && (
                                <div className="space-y-6 animate-fadeIn">
                                    
                                    {/* HEADER */}
                                    <div className={`p-6 rounded-xl text-center border-b-4 shadow-lg ${theme.btnPrimary}`}>
                                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase drop-shadow-md">Maîtrise du Haki</h2>
                                        <p className="text-xs md:text-sm opacity-90 mt-1 font-medium">Éveillez votre potentiel latent.</p>
                                    </div>

                                    {/* LISTE DES HAKI */}
                                    <div className="grid grid-cols-1 gap-4">
                                        
                                        {/* OBSERVATION */}
                                        <div className={`p-4 rounded-xl border-2 relative overflow-hidden transition-all hover:scale-[1.01] ${joueur.haki_observation ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-700 bg-black/40'}`}>
                                            <div className="flex justify-between items-center relative z-10">
                                                <div>
                                                    <h3 className={`text-xl font-black uppercase ${joueur.haki_observation ? 'text-cyan-400' : 'text-slate-400'}`}>Kenbunshoku</h3>
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Haki de l'Observation</p>
                                                    <p className="text-xs mt-2 text-slate-300">
                                                        <span className="text-cyan-400 font-bold">Effet :</span> Voir les PV exacts + Bonus Esquive (Agilité x1.5)
                                                    </p>
                                                </div>
                                                {joueur.haki_observation ? (
                                                    <span className="text-4xl filter drop-shadow-lg">👁️</span>
                                                ) : (
                                                    <button onClick={() => eveillerHaki('OBSERVATION')} className="bg-slate-800 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-600 shadow-lg active:scale-95 transition">
                                                        ÉVEILLER<br/><span className="text-yellow-500">20k ฿</span> • Niv 20
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* ARMEMENT */}
                                        <div className={`p-4 rounded-xl border-2 relative overflow-hidden transition-all hover:scale-[1.01] ${joueur.haki_armement ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700 bg-black/40'}`}>
                                            <div className="flex justify-between items-center relative z-10">
                                                <div>
                                                    <h3 className={`text-xl font-black uppercase ${joueur.haki_armement ? 'text-purple-400' : 'text-slate-400'}`}>Busoshoku</h3>
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Haki de l'Armement</p>
                                                    <p className="text-xs mt-2 text-slate-300">
                                                        <span className="text-purple-400 font-bold">Effet :</span> Bonus Dégâts & Défense + Touche les Logias
                                                    </p>
                                                </div>
                                                {joueur.haki_armement ? (
                                                    <span className="text-4xl filter drop-shadow-lg">🛡️</span>
                                                ) : (
                                                    <button onClick={() => eveillerHaki('ARMEMENT')} className="bg-slate-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-600 shadow-lg active:scale-95 transition">
                                                        ÉVEILLER<br/><span className="text-yellow-500">50k ฿</span> • Niv 40
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* ROIS */}
                                        <div className={`p-4 rounded-xl border-2 relative overflow-hidden transition-all hover:scale-[1.01] ${joueur.haki_rois ? 'border-red-500 bg-red-900/20' : 'border-slate-700 bg-black/40'}`}>
                                            <div className="flex justify-between items-center relative z-10">
                                                <div>
                                                    <h3 className={`text-xl font-black uppercase ${joueur.haki_rois ? 'text-red-500' : 'text-slate-400'}`}>Haoshoku</h3>
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Haki des Rois</p>
                                                    <p className="text-xs mt-2 text-slate-300">
                                                        <span className="text-red-400 font-bold">Effet :</span> Chance d'étourdir l'ennemi à chaque tour.
                                                    </p>
                                                </div>
                                                {joueur.haki_rois ? (
                                                    <span className="text-4xl filter drop-shadow-lg">👑</span>
                                                ) : (
                                                    <button onClick={() => eveillerHaki('ROIS')} className="bg-slate-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-600 shadow-lg active:scale-95 transition">
                                                        ÉVEILLER<br/><span className="text-yellow-500">1M ฿</span> • Niv 80
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
{/* EQUIPAGE (GUILDE) */}
                            {/* ONGLET EQUIPAGE V2 */}
                            {activeTab === 'equipage' && (
                                <div className="space-y-6 animate-fadeIn">
                                    {!monEquipage ? (
                                        // --- SANS EQUIPAGE (Liste + Création) ---
                                        <div className="text-center space-y-8">
                                            <div className={`p-6 rounded-2xl border-2 border-dashed ${theme.border} bg-black/20`}>
                                                <h3 className={`text-xl font-black uppercase mb-4 ${theme.textMain}`}>Créer ton organisation</h3>
                                                <div className="flex gap-2 justify-center">
                                                    <input type="text" placeholder="Nom de l'équipage" className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-white outline-none focus:border-white" value={nomEquipageCrea} onChange={(e) => setNomEquipageCrea(e.target.value)} />
                                                    <button onClick={creerEquipage} className={`px-4 py-2 rounded-lg font-bold ${theme.btnPrimary}`}>Créer (1000 ฿)</button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-slate-400 text-xs uppercase font-bold tracking-widest">Recrutement {joueur.faction}</h4>
                                                {listeEquipages.map(eq => (
                                                    <div key={eq.id} className={`flex justify-between items-center p-4 rounded-xl border ${theme.borderLow} bg-black/20 hover:bg-black/40 transition`}>
                                                        <div className="text-left"><p className={`font-black text-lg ${theme.textMain}`}>{eq.nom}</p><p className="text-xs text-slate-500 italic">{eq.description || "Pas de description"}</p></div>
                                                        <button onClick={() => { supabase.rpc('postuler_equipage', { _equipage_id: eq.id }).then(({data}) => notify(data.message, data.success?'success':'error')) }} className={`text-xs px-4 py-2 rounded-lg font-bold border ${theme.btnSecondary}`}>POSTULER</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        // --- AVEC EQUIPAGE (Dashboard) ---
                                        <div className="space-y-6">
                                            {/* Header Guilde */}
                                            <div className={`p-6 rounded-2xl border-b-4 shadow-lg text-center ${theme.btnPrimary}`}>
                                                <h2 className="text-3xl font-black uppercase drop-shadow-md">{monEquipage.nom}</h2>
                                                <div className="flex justify-center gap-4 mt-2 text-xs font-bold">
                                                    <span>Niveau {monEquipage.niveau}</span>
                                                    <span>•</span>
                                                    <span>{membresEquipage.length} Membres</span>
                                                    <span>•</span>
                                                    <span>{monEquipage.berrys_banque.toLocaleString()} ฿ en Banque</span>
                                                </div>
                                            </div>

                                            {/* Sous-Navigation */}
                                            <div className="flex justify-center gap-2 bg-black/30 p-1 rounded-xl">
                                                {['GENERAL', 'MEMBERS', 'BANK', 'EXPE'].map(tab => (
                                                    <button key={tab} onClick={() => setCrewTab(tab)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition ${crewTab === tab ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>
                                                        {tab === 'GENERAL' ? 'QG' : tab === 'MEMBERS' ? 'MEMBRES' : tab === 'BANK' ? 'BANQUE' : 'RAIDS'}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* 1. GENERAL */}
                                            {crewTab === 'GENERAL' && (
                                                <div className="text-center space-y-4">
                                                    <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                                                        <p className="text-xs uppercase font-bold text-slate-500 mb-2">Progression Guilde</p>
                                                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-600"><div className={`h-full ${theme.barFill}`} style={{ width: `${Math.min(100, (monEquipage.xp / (monEquipage.niveau * 1000)) * 100)}%` }}></div></div>
                                                        <p className="text-xs mt-1">{monEquipage.xp} / {monEquipage.niveau * 1000} XP</p>
                                                    </div>
                                                    <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                                                        <p className="text-xs uppercase font-bold text-slate-500 mb-2">Ma Contribution XP</p>
                                                        <input type="range" min="0" max="100" value={joueur.part_xp_equipage || 0} onChange={(e) => changerXpPart(e.target.value)} className="w-full accent-white cursor-pointer" />
                                                        <p className="font-bold text-white text-xl">{joueur.part_xp_equipage}%</p>
                                                        <p className="text-[10px] italic text-slate-500">Dédouané sur vos gains personnels</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. MEMBRES */}
                                            {crewTab === 'MEMBERS' && (
                                                <div className="space-y-4">
                                                    {/* Candidatures (Chef) */}
                                                    {candidatures.length > 0 && (
                                                        <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-700/50">
                                                            <h4 className="text-yellow-500 text-xs font-bold uppercase mb-2">En attente ({candidatures.length})</h4>
                                                            {candidatures.map(c => (
                                                                <div key={c.id} className="flex justify-between text-white items-center bg-black/30 p-2 rounded mb-1">
                                                                    <span>{c.pseudo_joueur}</span>
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => gererCandidat(c.id, true)} className="text-green-400 text-xs font-bold border border-green-400 px-2 rounded">ACCEPTER</button>
                                                                        <button onClick={() => gererCandidat(c.id, false)} className="text-red-400 text-xs font-bold border border-red-400 px-2 rounded">REFUSER</button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Liste Membres */}
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {membresEquipage.map(m => {
                                                            const isChef = m.id === monEquipage.chef_id;
                                                            const isMe = m.id === session.user.id;
                                                            const amIChef = monEquipage.chef_id === session.user.id;
                                                            return (
                                                                <div key={m.id} className={`flex items-center gap-4 p-3 rounded-xl border ${isChef ? 'border-yellow-500/50 bg-yellow-900/10' : `${theme.borderLow} bg-black/20`}`}>
                                                                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-600">
                                                                        {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full">👤</div>}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className={`font-bold ${isChef ? 'text-yellow-400' : 'text-white'}`}>{m.pseudo}</p>
                                                                            {isChef && <span className="text-[9px] bg-yellow-500 text-black px-1.5 rounded font-black">CHEF</span>}
                                                                        </div>
                                                                        <div className="flex gap-3 text-xs mt-0.5">
                                                                            <span className="text-slate-500">Niveau {m.niveau}</span>
                                                                            {/* AFFICHAGE DE LA CONTRIBUTION */}
                                                                            <span className="text-indigo-400 font-bold flex items-center gap-1">
                                                                                ✨ {m.xp_donnee_equipage?.toLocaleString() || 0} XP donnés
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {amIChef && !isChef && <button onClick={() => kickMembre(m.id)} className="text-xs text-red-500 hover:text-red-400 underline">Exclure</button>}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 3. BANQUE */}
                                            {crewTab === 'BANK' && (
                                                <div className="space-y-4">
                                                    <div className="bg-black/20 p-4 rounded-xl text-center border border-white/10">
                                                        <p className="text-xs uppercase font-bold text-slate-500">Solde Commun</p>
                                                        <p className="text-4xl font-black text-yellow-400">{monEquipage.berrys_banque.toLocaleString()} ฿</p>
                                                    </div>
                                                    <div className="flex gap-2 justify-center">
                                                        <input type="number" value={banqueMontant} onChange={(e) => setBanqueMontant(e.target.value)} className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-white w-32 text-center" />
                                                        <button onClick={() => actionBanque('DEPOT')} className="bg-green-600 text-white px-4 rounded font-bold text-xs">DÉPOSER</button>
                                                        {monEquipage.chef_id === session.user.id && <button onClick={() => actionBanque('RETRAIT')} className="bg-red-600 text-white px-4 rounded font-bold text-xs">RETIRER</button>}
                                                    </div>
                                                    <div className="bg-black/30 p-4 rounded-xl h-40 overflow-y-auto custom-scrollbar text-xs space-y-1">
                                                        {banqueLogs.map(log => (
                                                            <div key={log.id} className="flex justify-between text-slate-400 border-b border-white/5 pb-1">
                                                                <span>{log.pseudo_joueur}</span>
                                                                <span className={log.action === 'DEPOT' ? 'text-green-400' : 'text-red-400'}>{log.action === 'DEPOT' ? '+' : '-'}{log.montant} ฿</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* 4. EXPEDITIONS DE GROUPE */}
                                            {crewTab === 'EXPE' && (
                                                <div className="space-y-4 animate-fadeIn">
                                                    
                                                    {/* ETAT 1 : AUCUNE EXPÉDITION EN COURS */}
                                                    {monEquipage.expedition_etat === 'AUCUNE' && (
                                                        <>
                                                            {monEquipage.chef_id === session.user.id ? (
                                                                <div className="space-y-3">
                                                                    <p className={`text-center text-xs uppercase font-bold mb-4 ${theme.textMain}`}>Choisissez une cible pour le Raid</p>
                                                                    {destinations.map((dest, i) => {
                                                                        // Difficulté = Niveau Requis * 20 * Nombre de membres total
                                                                        const difficulte = dest.niveau_requis * 20 * membresEquipage.length;
                                                                        
                                                                        return (
                                                                            <div key={i} className={`bg-black/20 border ${theme.borderLow} p-3 rounded-xl flex justify-between items-center`}>
                                                                                <div>
                                                                                    <p className={`font-bold text-sm ${theme.textMain}`}>{dest.nom}</p>
                                                                                    <p className="text-[10px] text-slate-400">Difficulté: <span className="text-red-400 font-mono">{difficulte}</span> (Basée sur {membresEquipage.length} membres)</p>
                                                                                   
                                                                                </div>
                                                                                <button onClick={() => preparerRaid(dest.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${theme.btnPrimary}`}>PRÉPARER</button>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-10 opacity-50 italic">
                                                                    <p>Le Capitaine n'a pas encore planifié de raid.</p>
                                                                    <p className="text-xs mt-2">Préparez-vous !</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* ETAT 2 : EN PRÉPARATION (Lobby) */}
                                                    {monEquipage.expedition_etat === 'PREPARATION' && (
                                                        <div className={`bg-black/30 border-2 border-dashed ${theme.border} p-6 rounded-xl text-center`}>
                                                            <h3 className={`text-xl font-black uppercase mb-2 ${theme.textMain}`}>Raid en Préparation !</h3>
                                                            
                                                            {(() => {
                                                                const cible = destinations.find(d => d.id === monEquipage.expedition_cible_id);
                                                                return cible ? <p className="text-lg text-white font-bold mb-4">Cible : {cible.nom}</p> : null;
                                                            })()}

                                                            <div className="bg-black/40 p-4 rounded-lg mb-6 border border-white/10">
                                                                <p className="text-xs text-slate-400 uppercase font-bold mb-3">
                                                                    Participants ({monEquipage.expedition_participants?.length || 0})
                                                                </p>
                                                                
                                                                {/* NOUVEAU BLOC D'AFFICHAGE DES AVATARS */}
                                                                <div className="flex flex-wrap justify-center gap-2">
                                                                    {monEquipage.expedition_participants?.map((uid, idx) => {
                                                                        // On cherche les infos complètes du membre grâce à son ID
                                                                        const participant = membresEquipage.find(m => m.id === uid);
                                                                        
                                                                        // Si le membre n'est plus dans la guilde (cas rare), on n'affiche rien
                                                                        if (!participant) return null;

                                                                        const isChefDuRaid = participant.id === monEquipage.chef_id;

                                                                        return (
                                                                            <div 
                                                                                key={idx} 
                                                                                className={`w-10 h-10 rounded-full bg-slate-800 border-2 flex items-center justify-center overflow-hidden relative group shadow-md transition hover:scale-110 hover:z-10 cursor-help
                                                                                ${isChefDuRaid ? 'border-yellow-500 shadow-yellow-500/30' : 'border-slate-500'}`}
                                                                                title={`${participant.pseudo} (Niv.${participant.niveau})`} // Tooltip au survol
                                                                            >
                                                                                {participant.avatar_url ? (
                                                                                    <img src={participant.avatar_url} alt={participant.pseudo} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="text-lg">👤</span>
                                                                                )}
                                                                                
                                                                                {/* Petite couronne pour le chef */}
                                                                                {isChefDuRaid && (
                                                                                    <div className="absolute -top-1 -right-1 text-[10px]">👑</div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {/* FIN DU NOUVEAU BLOC */}

                                                            </div>

                                                            {!monEquipage.expedition_participants?.includes(session.user.id) ? (
                                                                <button onClick={rejoindreRaid} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3 rounded-xl shadow-lg animate-pulse uppercase tracking-wider">
                                                                    REJOINDRE L'EXPÉDITION
                                                                </button>
                                                            ) : (
                                                                <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">✅ Vous êtes inscrit</p>
                                                            )}

                                                            {monEquipage.chef_id === session.user.id && (
                                                                <button onClick={lancerRaid} className={`w-full mt-4 py-3 rounded-xl font-bold shadow-lg border ${theme.border} ${theme.btnPrimary}`}>
                                                                    LANCER LE RAID
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* ETAT 3 : EN COURS */}
                                                    {monEquipage.expedition_etat === 'EN_COURS' && (
                                                        <div className={`bg-black/40 border ${theme.border} p-8 rounded-xl text-center relative overflow-hidden`}>
                                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 animate-pulse"></div>
                                                            
                                                            <h3 className={`text-2xl font-black uppercase mb-2 ${theme.textMain}`}>Raid en Cours</h3>
                                                            
                                                            {/* Timer calculé à la volée car le state timer est pour le perso solo */}
                                                            {(() => {
                                                                const now = new Date().getTime();
                                                                const fin = new Date(monEquipage.expedition_fin).getTime();
                                                                const diff = fin - now;
                                                                
                                                                if (diff <= 0) {
                                                                    return (
                                                                        <div className="animate-bounce mt-4">
                                                                            <button onClick={recolterRaid} className="bg-yellow-500 text-black font-black text-xl py-4 px-8 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 transition">
                                                                                RÉCUPÉRER LE BUTIN
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                } else {
                                                                    // Calcul H:M:S
                                                                    const h = Math.floor(diff / (1000 * 60 * 60));
                                                                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                                    const s = Math.floor((diff % (1000 * 60)) / 1000);

                                                                    return (
                                                                        <div className="my-6">
                                                                            <div className="text-5xl font-mono font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                                                                {h > 0 ? `${h}:` : ''}{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
                                                                            </div>
                                                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-[0.5em] mt-2">Temps Restant</p>
                                                                        </div>
                                                                    );
                                                                }
                                                            })()}
                                                            
                                                            <p className="text-xs text-slate-500 italic mt-4">L'équipage combat pour la gloire...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                               
                            {/* CARTE DU MONDE (NAVIGATION RÉGIONS + DEZOOM) */}
                            {/* CARTE MONDE (CORRIGÉE : BORDS VISIBLES) */}
                            {activeTab === 'expeditions' && (
                                <div className="space-y-4 h-full flex flex-col">
                                    
                                    {joueur?.expedition_fin ? (
                                        // MODE : EN VOYAGE
                                        <div className="bg-indigo-900/80 text-white p-8 rounded-xl text-center border-2 border-indigo-500 shadow-2xl my-auto animate-fadeIn">
                                            <div className="text-6xl mb-4 animate-bounce">⛵</div>
                                            <h3 className="text-2xl font-bold mb-2 text-white">En voyage...</h3>
                                            <div className="text-4xl font-mono font-black text-white mb-6 bg-black/30 py-2 rounded-lg">{formatChronoLong(expeditionChrono)}</div>
                                            {(expeditionChrono === 0 || expeditionChrono === "PRÊT !") && 
                                                <button onClick={recolterExpedition} className={`w-full font-black py-4 rounded-lg shadow-lg animate-pulse uppercase tracking-wider transform active:scale-95 transition ${theme.btnPrimary}`}>
                                                    RÉCOLTER LE BUTIN
                                                </button>
                                            }
                                        </div>
                                    ) : (
                                        // MODE : CARTE INTERACTIVE
                                        <div className="relative w-full h-[60vh] min-h-[400px] bg-[#1a4c6e] rounded-xl border-4 border-[#3e2723] shadow-2xl overflow-hidden">
                                            
                                            {/* TITRE FLOTTANT */}
                                            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-xs font-bold backdrop-blur-sm border border-white/10 z-20 pointer-events-none shadow-lg">
                                                🗺️ GRAND LINE
                                            </div>
                                            {/* WIDGET MÉTÉO (Haut Droite) */}
                                            {meteoData[currentMapRegion] && (
                                                <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-xl text-white backdrop-blur-md border border-white/10 z-20 shadow-xl flex items-center gap-3 animate-slideInRight">
                                                    <div className="text-4xl filter drop-shadow-lg animate-pulse">
                                                        {meteoData[currentMapRegion] === 'SOLEIL' && '☀️'}
                                                        {meteoData[currentMapRegion] === 'TEMPETE' && '⛈️'}
                                                        {meteoData[currentMapRegion] === 'BRUME' && '🌫️'}
                                                        {meteoData[currentMapRegion] === 'VENT' && '🍃'}
                                                        {meteoData[currentMapRegion] === 'AQUA_LAGUNA' && '🌊'}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Météo Actuelle</p>
                                                        <p className={`text-sm font-black uppercase ${
                                                            meteoData[currentMapRegion] === 'SOLEIL' ? 'text-yellow-400' :
                                                            meteoData[currentMapRegion] === 'TEMPETE' ? 'text-purple-400' :
                                                            meteoData[currentMapRegion] === 'BRUME' ? 'text-slate-300' :
                                                            meteoData[currentMapRegion] === 'VENT' ? 'text-green-400' :
                                                            'text-blue-400'
                                                        }`}>
                                                            {meteoData[currentMapRegion].replace('_', ' ')}
                                                        </p>
                                                        
                                                        {/* EFFET TEXTE */}
                                                        <p className="text-[9px] italic opacity-80 text-white w-32 whitespace-normal leading-tight mt-1">
                                                            {meteoData[currentMapRegion] === 'SOLEIL' && "Conditions idéales."}
                                                            {meteoData[currentMapRegion] === 'TEMPETE' && "Gains augmentés, mais dangereux !"}
                                                            {meteoData[currentMapRegion] === 'BRUME' && "Navigation difficile."}
                                                            {meteoData[currentMapRegion] === 'VENT' && "Vitesse x2 !"}
                                                            {meteoData[currentMapRegion] === 'AQUA_LAGUNA' && "XP x3 ! Risque mortel."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* CONTENEUR SCROLLABLE (LA FENÊTRE) */}
                                            <div 
                                                ref={mapRef}
                                                className={`w-full h-full overflow-auto no-scrollbar relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                onMouseDown={onMouseDown}
                                                onMouseMove={onMouseMove}
                                                onMouseUp={onMouseUp}
                                                onMouseLeave={onMouseUp}
                                            >
                                                {/* CONTENU GÉANT (LA CARTE) */}
                                                {/* Ratio 2:1 forcé (2000x1000) pour voir les bords */}
                                                <div className="relative min-w-[2000px] min-h-[1000px]">
                                                    
                                                    {/* IMAGE (object-fill pour tout afficher sans rogner) */}
                                                    <img 
                                                        src="/world_map.jpg" 
                                                        alt="Carte du Monde"
                                                        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
                                                        draggable="false"
                                                    />
                                                    
                                                    {/* PINS (POINTS) */}
                                                    {destinations.map((dest, i) => {
                                                        const isLocked = joueur.niveau < dest.niveau_requis;
                                                        const typeIcon = dest.type_lieu === 'VILLAGE' ? '🏠' : dest.type_lieu === 'DONJON' ? '💀' : '🏝️';
                                                        
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedDest(dest); }}
                                                                onMouseDown={(e) => e.stopPropagation()} 
                                                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 hover:scale-125 hover:z-20 z-10
                                                                ${isLocked ? 'grayscale opacity-70 scale-75' : 'cursor-pointer'}`}
                                                                style={{ left: `${dest.pos_x}%`, top: `${dest.pos_y}%` }}
                                                            >
                                                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg shadow-lg border-2 
                                                                    ${isLocked ? 'bg-slate-700 border-slate-500' : selectedDest?.id === dest.id ? 'bg-yellow-400 border-white animate-bounce scale-125' : 'bg-white border-blue-500'}`}>
                                                                    {isLocked ? '🔒' : typeIcon}
                                                                </div>
                                                                
                                                                <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-md whitespace-nowrap
                                                                    ${selectedDest?.id === dest.id ? 'bg-yellow-400 text-black z-30' : 'bg-black/70 text-white backdrop-blur-sm'}`}>
                                                                    {dest.nom}
                                                                </span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* POP-UP DÉTAILS */}
                                            {selectedDest && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t-4 border-yellow-500 p-4 animate-slideUp z-40 flex flex-col md:flex-row gap-4 items-center md:items-start shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                                                    <div className="flex-1 text-center md:text-left">
                                                        <h3 className="text-xl font-black text-white uppercase leading-none mb-1">{selectedDest.nom}</h3>
                                                        <p className="text-xs text-slate-400 mb-2 font-bold tracking-wider">{selectedDest.region}</p>
                                                        <div className="flex justify-center md:justify-start gap-3 text-[10px] font-bold uppercase">
                                                            <span className="bg-slate-800 px-2 py-1 rounded border border-slate-600 text-slate-300">⏱️ {selectedDest.duree_minutes}m</span>
                                                            <span className="bg-slate-800 px-2 py-1 rounded border border-slate-600 text-yellow-400">💰 ~{selectedDest.gain_estime}</span>
                                                            <span className={joueur.niveau >= selectedDest.niveau_requis ? "text-green-400" : "text-red-400"}>Niv {selectedDest.niveau_requis}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 w-full md:w-auto text-center">
                                                        {(() => {
                                                             const force = (joueur.force_brute || 0) + (equipement.arme?.stats_bonus?.force || 0);
                                                             const intel = (joueur.intelligence || 0) + (equipement.tete?.stats_bonus?.intelligence || 0);
                                                             const agi = (joueur.agilite || 0) + (equipement.corps?.stats_bonus?.agilite || 0); 
                                                             const puissance = (force * 1.5) + (agi * 1.2) + (intel * 1.0);
                                                             const diff = selectedDest.niveau_requis * 25;
                                                             let chance = 50 + (puissance - diff) + ((joueur.chance || 0)/2);
                                                             chance = Math.max(5, Math.min(100, Math.floor(chance)));
                                                             let color = chance > 80 ? 'text-green-400' : chance > 50 ? 'text-yellow-400' : 'text-red-500';
                                                             return (<div><p className="text-[10px] text-slate-500 mb-1 font-bold">SUCCÈS</p><p className={`text-3xl font-black ${color}`}>{chance}%</p></div>)
                                                        })()}
                                                    </div>
                                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                                        {joueur.niveau >= selectedDest.niveau_requis ? (<button onClick={() => partirExpeditionV2(selectedDest)} className={`w-full md:w-32 py-3 rounded-lg font-bold shadow-lg text-sm ${theme.btnPrimary}`}>PARTIR</button>) : (<button disabled className="w-full md:w-32 py-3 rounded-lg font-bold bg-slate-700 text-slate-500 cursor-not-allowed text-sm">BLOQUÉ</button>)}
                                                        <button onClick={() => setSelectedDest(null)} className="text-xs text-slate-500 underline hover:text-white">Fermer</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                    
                    {/* MARCHÉ */}
                    {activeTab === 'marche' && (
                         <div className="space-y-3">
                            <div className="text-center text-white text-xs opacity-50 mb-2">Les meilleures affaires des pirates</div>
                            {marcheItems.length === 0 ? (
                                <div className="text-center py-10"><p className="text-2xl mb-2">🤷‍♂️</p><p className="text-white font-bold opacity-60">Le marché est vide.</p></div>
                            ) : marcheItems.map((annonce, i) => {
                                const isMine = annonce.vendeur_id === session.user.id;
                                const cfg = getRareteConfig(annonce.objets.rarete);
                                return (
                                            <div key={i} className={`flex flex-col md:flex-row justify-between items-center bg-black/20 p-3 md:p-4 rounded-xl shadow-sm border-l-4 transition hover:bg-black/30 ${cfg.border} mb-2`}>
                                                
                                                {/* GAUCHE : INFOS ITEM */}
                                                <div className="flex-1 w-full md:w-auto">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-bold text-sm md:text-lg truncate ${theme.textMain}`}>{annonce.objets.nom}</p>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-opacity-20 ${cfg.bg} ${cfg.text}`}>
                                                            {annonce.objets.rarete}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* STATS (C'est ici qu'on affiche les stats uniques si elles existent) */}
                                                    <div className="my-1">
                                                        <StatsDisplay stats={annonce.stats_perso || annonce.objets.stats_bonus} compact={false} />
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs mt-1">
                                                        <span className="bg-black/40 px-2 py-0.5 rounded text-slate-300 font-mono border border-white/10">x{annonce.quantite}</span>
                                                        <span className="text-slate-500">vendu par</span>
                                                        <span className={`font-bold ${isMine ? "text-purple-400" : "text-white"}`}>
                                                            {isMine ? "VOUS" : annonce.joueurs?.pseudo}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* DROITE : PRIX & ACTION */}
                                                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-start">
                                                    <span className="font-mono font-black text-lg text-yellow-400">{annonce.prix_unitaire.toLocaleString()} ฿</span>
                                                    
                                                    {isMine ? (
                                                        <span className="text-[10px] font-bold text-purple-300 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/30">
                                                            EN VENTE
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => ouvrirTransaction('ACHAT_MARCHE', annonce, annonce.quantite)} 
                                                            className={`font-bold py-1.5 px-4 rounded-lg shadow-lg text-xs ${theme.btnPrimary}`}
                                                        >
                                                            ACHETER
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                        </div>
                    )}

                    {/* ATELIER DE CRAFT (CATÉGORISÉ) */}
                            {activeTab === 'atelier' && (
                                <div className="space-y-6 animate-fadeIn">
                                    
                                    {/* Header Atelier */}
                                    <div className={`p-4 rounded-xl shadow-lg border-b-4 text-center ${theme.btnPrimary}`}>
                                        <h2 className="text-xl font-black uppercase tracking-widest text-white">Atelier d'Artisanat</h2>
                                        <p className="text-xs opacity-90">Fabriquez vos équipements et consommables.</p>
                                    </div>

                                    {!craftCategory ? (
                                        // --- VUE 1 : CHOIX DU MÉTIER ---
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'Forge', icon: '🔨', label: 'Forge', desc: 'Métaux & Armes' },
                                                { id: 'Menuiserie', icon: '🪚', label: 'Menuiserie', desc: 'Bois & Coffres' },
                                                { id: 'Alchimie', icon: '⚗️', label: 'Alchimie', desc: 'Potions & Magie' },
                                                { id: 'Cuisine', icon: '🍳', label: 'Cuisine', desc: 'Plats & Bonus' },
                                                { id: 'Tissage', icon: '🧵', label: 'Tissage', desc: 'Tissus & Voiles' },
                                            ].map((metier) => (
                                                <button 
                                                    key={metier.id}
                                                    onClick={() => setCraftCategory(metier.id)}
                                                    className={`p-6 rounded-xl border-2 bg-slate-800/50 hover:bg-slate-800 transition group flex flex-col items-center gap-2 shadow-lg
                                                    ${theme.border} hover:border-white`}
                                                >
                                                    <span className="text-4xl group-hover:scale-110 transition-transform">{metier.icon}</span>
                                                    <span className={`font-black uppercase text-sm md:text-lg ${theme.textMain}`}>{metier.label}</span>
                                                    <span className="text-[10px] text-slate-400">{metier.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        // --- VUE 2 : LISTE DES RECETTES ---
                                        <div className="space-y-4">
                                            <button 
                                                onClick={() => setCraftCategory(null)} 
                                                className={`mb-2 flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${theme.textDim} hover:text-white transition`}
                                            >
                                                ⬅ Retour aux métiers
                                            </button>

                                            {recettes.filter(r => r.categorie === craftCategory).length === 0 ? (
                                                <div className="text-center py-10 italic opacity-50">Aucune recette connue dans ce métier...</div>
                                            ) : (
                                                recettes.filter(r => r.categorie === craftCategory).map((recette, i) => (
                                                    <div key={i} className="bg-slate-900/80 p-4 rounded-xl shadow-sm border border-slate-700 relative overflow-hidden">
                                                        {/* Titre Recette */}
                                                        <div className="flex justify-between items-start mb-4 z-10 relative">
                                                            <div>
                                                                <p className={`font-black text-lg ${theme.textMain}`}>{recette.nom}</p>
                                                            </div>
                                                        </div>

                                                        {/* Ingrédients */}
                                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                                            {Object.entries(recette.ingredients).map(([idItem, qteReq]) => {
                                                                const possede = getQtePossedee(idItem);
                                                                const nomIngredient = getNomIngredient(idItem);
                                                                const aAssez = possede >= qteReq;
                                                                
                                                                return (
                                                                    <div key={idItem} className={`flex justify-between items-center text-xs p-2 rounded border ${aAssez ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                                                        <span className="truncate pr-2">{nomIngredient}</span>
                                                                        <span className="font-mono font-bold whitespace-nowrap">{possede}/{qteReq}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>

                                                        {/* Bouton Action */}
                                                        <button 
                                                            onClick={() => crafterItem(recette)} 
                                                            className={`w-full py-3 rounded-lg font-black uppercase shadow-lg transition transform active:scale-95 ${theme.btnPrimary}`}
                                                        >
                                                            Fabriquer
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                    {/* CASINO */}
                    {activeTab === 'casino' && (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-xl text-center text-white border-4 shadow-inner ${theme.btnPrimary}`}>
                                        <h3 className="text-2xl font-bold uppercase mb-2 tracking-widest text-white drop-shadow-md">Casino</h3>
                                        <div className="flex justify-center gap-2 mb-4">
                                            <button onClick={() => setCasinoGame('QUITTE')} className={`px-3 py-1.5 rounded text-xs font-bold transition ${casinoGame === 'QUITTE' ? 'bg-white text-black shadow-lg' : 'bg-black/30 text-white/70 hover:text-white'}`}>Quitte ou Double</button>
                                            <button onClick={() => setCasinoGame('PFC')} className={`px-3 py-1.5 rounded text-xs font-bold transition ${casinoGame === 'PFC' ? 'bg-white text-black shadow-lg' : 'bg-black/30 text-white/70 hover:text-white'}`}>Chifoumi</button>
                                            <button onClick={() => setCasinoGame('DES')} className={`px-3 py-1.5 rounded text-xs font-bold transition ${casinoGame === 'DES' ? 'bg-white text-black shadow-lg' : 'bg-black/30 text-white/70 hover:text-white'}`}>Dés</button>
                                        </div>
                                        <div className="bg-black/40 p-4 rounded-lg mb-6 backdrop-blur-sm border border-white/10">
                                            <p className="text-xs uppercase font-bold opacity-70 mb-2 text-white">Votre Mise</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <input type="number" value={miseCasino} onChange={(e) => setMiseCasino(parseInt(e.target.value))} className="bg-transparent text-center text-3xl font-black text-white w-32 md:w-40 border-b-2 border-white/50 focus:border-white outline-none transition" />
                                                <span className="text-xl font-bold">฿</span>
                                            </div>
                                        </div>
                                        {casinoGame === 'QUITTE' && (
                                            <div className="flex flex-col gap-4">
                                                <div className="bg-black/30 p-3 rounded border border-white/20">
                                                    <p className="text-[10px] uppercase opacity-80">Gain en cours</p>
                                                    <p className="text-4xl font-black text-yellow-400 drop-shadow-md">{joueur.casino_streak || 0} ฿</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button onClick={() => jouerQuitteOuDouble('JOUER')} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all uppercase">{joueur.casino_streak > 0 ? "Doubler !" : "Lancer"}</button>
                                                    <button onClick={() => jouerQuitteOuDouble('STOP')} disabled={!joueur.casino_streak} className={`font-black py-4 rounded-xl shadow-lg border-b-4 transition-all uppercase ${!joueur.casino_streak ? 'bg-slate-700 text-slate-500 border-slate-900' : 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700 active:translate-y-1'}`}>Stop</button>
                                                </div>
                                            </div>
                                        )}
                                        {casinoGame === 'PFC' && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <button onClick={() => jouerPFC('Pierre')} className="bg-slate-500 hover:bg-slate-400 text-white text-4xl font-bold py-6 rounded-xl border-b-4 border-slate-700 active:translate-y-1 transition" title="Pierre">🪨</button>
                                                <button onClick={() => jouerPFC('Feuille')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-4xl font-bold py-6 rounded-xl border-b-4 border-emerald-800 active:translate-y-1 transition" title="Feuille">📜</button>
                                                <button onClick={() => jouerPFC('Ciseaux')} className="bg-red-600 hover:bg-red-500 text-white text-4xl font-bold py-6 rounded-xl border-b-4 border-red-800 active:translate-y-1 transition" title="Ciseaux">✂️</button>
                                            </div>
                                        )}
                                        {casinoGame === 'DES' && (
                                            <div className="space-y-4">
                                                <div className="text-xs italic opacity-80 bg-black/20 p-2 rounded">Battez le score de la maison.<br/>Un <span className="font-bold text-yellow-300">Double</span> gagnant rapporte <span className="font-bold text-yellow-300">x2</span> !</div>
                                                <button onClick={jouerDes} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all uppercase flex items-center justify-center gap-2"><span className="text-2xl">🎲</span> Lancer les dés</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                    {/* CLASSEMENT */}
                            {activeTab === 'classement' && (
                                <div className="space-y-4">
                                    
                                    {/* Filtres */}
                                    <div className="flex justify-center gap-2 md:gap-4 mb-4 p-2 bg-black/20 rounded-xl overflow-x-auto no-scrollbar">
                                        <button 
                                            onClick={() => setLeaderboardType('NIVEAU')} 
                                            className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition whitespace-nowrap ${leaderboardType === 'NIVEAU' ? theme.btnPrimary : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Joueurs (Niv)
                                        </button>
                                        
                                        <button 
                                            onClick={() => setLeaderboardType('RICHESSE')} 
                                            className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition whitespace-nowrap ${leaderboardType === 'RICHESSE' ? theme.btnPrimary : 'text-slate-400 hover:text-white'}`}
                                        >
                                            💰 Richesse
                                        </button>

                                        <button 
                                            onClick={() => setLeaderboardType('PVP')} 
                                            className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition whitespace-nowrap ${leaderboardType === 'PVP' ? theme.btnPrimary : 'text-slate-400 hover:text-white'}`}
                                        >
                                            ⚔️ PvP
                                        </button>
                                        
                                        <button 
                                            onClick={() => setLeaderboardType('EQUIPAGE')} 
                                            className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition whitespace-nowrap ${leaderboardType === 'EQUIPAGE' ? theme.btnPrimary : 'text-slate-400 hover:text-white'}`}
                                        >
                                            🏴‍☠️ Équipages
                                        </button>
                                    </div>
                                    
                                    {/* LISTE DES EQUIPAGES */}
                                    {leaderboardType === 'EQUIPAGE' ? (
                                        <div className="space-y-3">
                                            {topEquipages.map((eq, index) => {
                                                // Couleur faction
                                                let color = "text-slate-400";
                                                let border = "border-slate-700";
                                                if(eq.faction === 'Pirate') { color = "text-red-500"; border = "border-red-900/50"; }
                                                if(eq.faction === 'Marine') { color = "text-cyan-400"; border = "border-blue-900/50"; }
                                                if(eq.faction === 'Révolutionnaire') { color = "text-emerald-500"; border = "border-emerald-900/50"; }
                                                
                                                const isMyCrew = eq.id === joueur.equipage_id;

                                                return (
                                                    <div key={index} className={`relative p-4 rounded-xl border bg-black/20 transition hover:bg-black/30 ${border} ${isMyCrew ? 'ring-1 ring-white/20' : ''}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded flex items-center justify-center font-black text-lg bg-slate-800 ${index < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>#{index + 1}</div>
                                                                <div>
                                                                    <h3 className="font-black text-white text-lg uppercase leading-none">{eq.nom}</h3>
                                                                    <p className={`text-[12px] font-bold uppercase tracking-widest ${color}`}>{eq.faction} • Niv {eq.niveau}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-yellow-500 font-black text-sm">{eq.berrys_banque.toLocaleString()} ฿</p>
                                                                <p className="text-[9px] text-slate-500 uppercase font-bold">Banque</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Stats Détaillées */}
                                                        <div className="grid grid-cols-3 gap-2 mt-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                                            <div className="text-center">
                                                                <p className="text-white font-bold text-xs">{Math.floor(eq.elo_moyen)}</p>
                                                                <p className="text-[8px] text-slate-500 uppercase">Elo Moyen</p>
                                                            </div>
                                                            <div className="text-center border-l border-white/5">
                                                                <p className="text-indigo-400 font-bold text-xs">{parseInt(eq.xp).toLocaleString()}</p>
                                                                <p className="text-[8px] text-slate-500 uppercase">XP Totale</p>
                                                            </div>
                                                            <div className="text-center border-l border-white/5">
                                                                <p className="text-green-400 font-bold text-xs">{eq.expeditions_reussies}</p>
                                                                <p className="text-[8px] text-slate-500 uppercase">Raids Réussis</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {topEquipages.length === 0 && <div className="text-center py-10 italic opacity-50">Aucun équipage formé pour le moment.</div>}
                                        </div>
                                    ) : (
                                        /* LISTE DES JOUEURS */
                                        <div className="space-y-2">
                                            <div className="flex justify-between px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                                <span>Joueur</span>
                                                <span>{leaderboardType === 'PVP' ? 'Rang & LP' : leaderboardType === 'RICHESSE' ? 'Fortune' : 'Niveau'}</span>
                                            </div>
                                            {topJoueurs.map((j, index) => {
                                                const isMe = j.pseudo === joueur?.pseudo;
                                                const rankData = getRankInfo(j.elo_pvp || 0);

                                                return (
                                                    <div key={index} className={`flex items-center p-3 rounded-xl border transition-all ${isMe ? `${theme.border} bg-white/10 shadow-lg scale-[1.02]` : "border-white/5 bg-black/20"}`}>
                                                        <div className={`w-8 font-black text-base md:text-lg text-center ${index < 3 ? "text-yellow-400 drop-shadow-md" : "text-slate-500"}`}>{index + 1}</div>
                                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 mx-3 shrink-0">
                                                            {j.avatar_url ? <img src={j.avatar_url} className="w-full h-full object-cover"/> : <div className="bg-slate-800 w-full h-full"></div>}
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2">
                                                                <p className={`font-bold text-xs md:text-sm truncate ${isMe ? "text-white" : "text-slate-300"}`}>{j.pseudo}</p>
                                                                {j.titre_actuel && (
                                                                    <span className="text-[9px] md:text-[10px] text-yellow-500/90 italic truncate max-w-[120px]">
                                                                        « {j.titre_actuel} »
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] md:text-[10px] text-slate-500 mt-0.5">{j.faction || "Neutre"}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {leaderboardType === 'PVP' ? (
                                                                <div className="flex flex-col items-end">
                                                                    <span className={`font-black text-xs md:text-sm ${rankData.color}`}>{rankData.label}</span>
                                                                    <span className="text-[9px] text-slate-500 font-bold">Total: {j.elo_pvp} pts</span>
                                                                </div>
                                                            ) : leaderboardType === 'RICHESSE' ? (
                                                                <span className="text-yellow-400 font-mono font-bold text-xs md:text-base">{j.berrys.toLocaleString()} ฿</span>
                                                            ) : (
                                                                <span className="text-cyan-400 font-bold text-[12px] md:text-sm">Niv {j.niveau}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* CHANTIER NAVAL V2 (MULTI-MATÉRIAUX) */}
                            {activeTab === 'chantier' && (
                                <div className="space-y-6 animate-fadeIn">
                                    
                                    {/* VISUEL NAVIRE */}
                                    <div className="bg-[#1a4c6e] border-4 border-[#3e2723] rounded-xl p-6 text-center relative overflow-hidden shadow-2xl">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-3xl font-[Pirata One] text-white uppercase drop-shadow-md mb-1">{joueur.nom_navire}</h2>
                                            <p className="text-yellow-400 text-sm font-bold uppercase tracking-widest mb-4">Niveau {joueur.niveau_navire} • {infosNavire?.nom_type || 'Radeau'}</p>
                                            <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-black/30 rounded-full border-4 border-white/20 flex items-center justify-center mb-4 backdrop-blur-sm animate-bounce-slow">
                                                <span className="text-6xl md:text-7xl">⛵</span>
                                            </div>
                                            <div className="flex justify-center gap-4 md:gap-6 text-xs font-bold">
                                                <div className="bg-black/40 px-3 py-1.5 rounded border border-white/10"><span className="text-cyan-300 block uppercase text-[9px]">Vitesse</span><span className="text-white text-lg">x{infosNavire?.vitesse}</span></div>
                                                <div className="bg-black/40 px-3 py-1.5 rounded border border-white/10"><span className="text-purple-300 block uppercase text-[9px]">Chance Loot</span><span className="text-white text-lg">+{infosNavire?.bonus_chance}%</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AMÉLIORATION */}
                                    {joueur.niveau_navire < 10 ? (
                                        <div className={`bg-black/20 border ${theme.borderLow} p-4 md:p-6 rounded-xl`}>
                                            <h3 className={`text-center font-bold uppercase text-sm tracking-widest mb-6 ${theme.textMain}`}>Projet : {nextNavire?.nom_type}</h3>
                                            
                                            {/* GRILLE DES COÛTS */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                                {/* Coût Berrys */}
                                                <div className={`flex flex-col items-center p-3 rounded-xl border ${joueur.berrys >= nextNavire?.cout_berrys ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                                    <span className="text-xl mb-1">💰</span>
                                                    <span className={`text-xs font-black ${joueur.berrys >= nextNavire?.cout_berrys ? 'text-green-400' : 'text-red-400'}`}>{nextNavire?.cout_berrys.toLocaleString()}</span>
                                                </div>

                                                {/* Coût Matériaux Dynamiques */}
                                                {nextNavire?.listeMateriaux.map((mat, idx) => {
                                                    const possede = getQtePossedee(mat.id);
                                                    const aAssez = possede >= mat.qte;
                                                    return (
                                                        <div key={idx} className={`flex flex-col items-center p-3 rounded-xl border text-center ${aAssez ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                                            {/* On affiche une icone générique ou le nom */}
                                                            <span className="text-[10px] text-slate-300 mb-1 h-8 flex items-center justify-center leading-tight">{mat.nom}</span>
                                                            <span className={`text-xs font-black ${aAssez ? 'text-green-400' : 'text-red-400'}`}>
                                                                {possede} / {mat.qte}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            
                                            <button onClick={lancerAmeliorationNavire} className={`w-full py-4 rounded-xl font-black uppercase shadow-lg transition transform active:scale-95 ${theme.btnPrimary}`}>
                                                CONSTRUIRE LE {nextNavire?.nom_type} 🔨
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-black/20 rounded-xl border border-yellow-500/30">
                                            <p className="text-4xl mb-2">👑</p>
                                            <p className="text-yellow-400 font-bold">Niveau Maximum Atteint !</p>
                                            <div className="mt-4 flex gap-2 justify-center p-4">
                                                <input type="text" placeholder="Nouveau nom..." className="bg-slate-900 px-3 py-2 rounded border border-slate-700 text-white outline-none" id="inputRename" />
                                                <button onClick={() => {
                                                    const val = document.getElementById('inputRename').value;
                                                    supabase.rpc('renommer_navire', { _nouveau_nom: val }).then(({data}) => { if(data.success) { notify(data.message, "success"); fetchJoueur(session.user.id); } else notify(data.message, "error"); });
                                                }} className="bg-blue-600 text-white px-4 rounded font-bold hover:bg-blue-500">Baptiser</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                    {/* ARENE */}
                    {/* ARENE */}
                            {activeTab === 'arene' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className={`p-4 rounded-xl shadow-lg mb-4 border-b-4 ${theme.btnPrimary}`}>
                                        <h2 className="text-lg md:text-xl font-black italic uppercase">Bienvenue au Colisée !</h2>
                                        <p className="opacity-90 text-xs">Choisissez vos adversaires !</p>
                                    </div>

                                    <div className="flex p-1 bg-black/30 rounded-lg mb-4">
                                        <button onClick={() => setAreneFilter('PVE')} className={`flex-1 py-2 rounded-md text-xs font-bold transition ${areneFilter === 'PVE' ? theme.btnPrimary : `${theme.textDim} hover:text-white`}`}>🤖 PNJs (PvE)</button>
                                        <button onClick={() => setAreneFilter('PVP')} className={`flex-1 py-2 rounded-md text-xs font-bold transition ${areneFilter === 'PVP' ? theme.btnPrimary : `${theme.textDim} hover:text-white`}`}>⚔️ JOUEURS (PvP)</button>
                                    </div>

                                    <div className={`border ${theme.border} p-4 rounded-xl text-center mb-4 bg-black/20 relative overflow-hidden`}>
                                        <p className={`font-black text-lg uppercase ${theme.textMain}`}>
                                            Combats Disponibles : {Math.max(0, 10 - (joueur.combats_journaliers || 0))} / 10 ⚡
                                        </p>
                                        
                                        {/* CHRONO REGEN */}
                                        {chronoEnergie && (joueur.combats_journaliers > 0) ? (
                                            <p className="text-xs text-yellow-400 font-mono mt-1 animate-pulse">
                                                +1 ⚡ dans {chronoEnergie}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-green-400 font-bold mt-1">Énergie Max !</p>
                                        )}

                                        <div className="w-full h-1 bg-slate-700 mt-3 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${theme.barFill}`} 
                                                style={{ width: `${Math.max(0, (10 - joueur.combats_journaliers) * 10)}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-center gap-4 text-[10px] mt-3 font-mono opacity-80">
                                            <span className="text-green-400">V: {joueur.victoires_pve + joueur.victoires_pvp}</span>
                                            <span className="text-red-400">D: {joueur.defaites_pve + joueur.defaites_pvp}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {areneJoueurs.length === 0 ? (
                                            <div className={`text-center py-10 opacity-50 ${theme.textDim}`}>
                                                {areneFilter === 'PVE' ? "Aucun monstre en vue..." : "Aucun pirate à l'horizon..."}
                                            </div>
                                        ) : (
                                            areneJoueurs.map((adv, i) => {
                                                const rank = getRankInfo(adv.elo_pvp);
                                                let factionColor = "text-slate-500";
                                                if (adv.faction === 'Pirate') factionColor = "text-red-500";
                                                if (adv.faction === 'Marine') factionColor = "text-cyan-400";
                                                if (adv.faction === 'Révolutionnaire') factionColor = "text-emerald-500";

                                                return (
                                                    <div key={i} className={`flex flex-col sm:flex-row justify-between sm:items-center bg-black/20 p-3 rounded-xl shadow-sm border-l-4 transition hover:bg-black/30 ${theme.border} gap-3 sm:gap-0`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-600 bg-slate-800 shrink-0">
                                                                {adv.avatar_url ? <img src={adv.avatar_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-2xl">👤</div>}
                                                            </div>
                                                            
                                                            <div>
                                                                {/* BLOC PSEUDO + TITRE (AJOUTÉ ICI) */}
                                                                <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2">
                                                                    <p className={`font-bold text-sm ${theme.textMain}`}>{adv.pseudo}</p>
                                                                    {adv.titre_actuel && (
                                                                        <span className="text-[9px] text-yellow-500/90 italic truncate max-w-[150px]">
                                                                            « {adv.titre_actuel} »
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap items-center gap-2 text-[10px] mt-0.5">
                                                                    <span className={`font-black uppercase ${factionColor}`}>{adv.faction || 'Neutre'}</span>
                                                                    <span className="text-slate-600">•</span>
                                                                    <span className={`font-mono font-bold ${theme.textDim}`}>Niv {adv.niveau}</span>
                                                                    {(areneFilter === 'PVP' || adv.elo_pvp > 0) && (
                                                                        <>
                                                                            <span className="text-slate-600">•</span>
                                                                            <span className={`${rank.color} font-bold flex items-center gap-1 bg-black/40 px-1.5 rounded`}>
                                                                                <span>{rank.icon}</span> {rank.label}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => lancerCombat(adv)} 
                                                            className={`text-white font-bold py-2 px-4 rounded-lg shadow-lg text-xs flex items-center justify-center gap-1 active:scale-95 transition transform hover:scale-105 w-full sm:w-auto ${theme.btnPrimary}`}
                                                        >
                                                            ⚔️ COMBATTRE
                                                        </button>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* === BARRE DE NAVIGATION MOBILE (GRILLE FIXE EN BAS) === */}
            {activeTab !== 'combat_actif' && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 px-1 py-1 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    {/* GRILLE 6 COLONNES (2 Lignes) : Tout est visible sans scroll */}
                    <div className="grid grid-cols-6 gap-1">
                         {[
                            { id: null, icon: '🏠', label: 'Moi' },
                            { id: 'equipage', icon: '🏴‍☠️', label: 'Team' },
                            { id: 'inventaire', icon: '🎒', label: 'Sac' },
                            { id: 'stats', icon: '📊', label: 'Stats', alert: joueur.points_carac > 0 },
                            { id: 'haki', icon: '👁️', label: 'Haki', color: 'hover:bg-purple-600/20 hover:text-purple-400 hover:border-purple-600' },
                            { id: 'deck', icon: '📘', label: 'Skills' },
                            { id: 'arene', icon: '⚔️', label: 'PvP' },
                            { id: 'expeditions', icon: '🧭', label: 'Voy.' }, // Label raccourci
                            { id: 'chantier', icon: '⛵', label: 'Navire', color: 'hover:bg-orange-600/20 hover:text-orange-400 hover:border-orange-600' },
                            { id: 'boutique', icon: '🏪', label: 'Shop' },
                            { id: 'marche', icon: '⚖️', label: 'HDV' },
                            { id: 'casino', icon: '🎰', label: 'Jeux' },
                            { id: 'atelier', icon: '🔨', label: 'Craft' },
                            { id: 'classement', icon: '🏆', label: 'Top' },
                            { id: 'tchat', icon: '💬', label: 'Tchat', color: 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500' },
                        ].map((btn, index) => (
                            <button 
                                key={index}
                                onClick={() => setActiveTab(btn.id)}
                                className={`flex flex-col items-center justify-center w-full h-[42px] rounded-lg transition-all active:scale-90
                                ${(activeTab === btn.id) || (btn.id === null && !activeTab) 
                                    ? `${theme.btnPrimary} shadow-sm` 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                                <span className="text-lg leading-none mb-0.5">{btn.icon}</span>
                                <span className="text-[8px] font-bold uppercase leading-none tracking-tight">{btn.label}</span>
                                {btn.alert && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* MODALE TRANSACTION (AVEC CHOIX DU PRIX) */}
            {transaction && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-sm p-6 rounded-2xl border border-slate-700 shadow-2xl text-center relative animate-zoomIn">
                        <h3 className="text-xl font-black text-white mb-1 uppercase tracking-widest">
                            {transaction.type === 'VENTE' ? 'Mise en Vente' : 'Confirmation'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 font-medium">
                            {transaction.item.nom || transaction.item.objets.nom}
                        </p>
                        
                        {/* SÉLECTEUR QUANTITÉ */}
                        <div className="bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-2">Quantité</p>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setQteTransaction(Math.max(1, qteTransaction - 1))} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-xl transition">-</button>
                                <span className="text-3xl font-black text-white w-16">{qteTransaction}</span>
                                <button onClick={() => setQteTransaction(Math.min(transaction.max, qteTransaction + 1))} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-xl transition">+</button>
                            </div>
                        </div>

                        {/* SÉLECTEUR PRIX (UNIQUEMENT POUR LA VENTE) */}
                        {transaction.type === 'VENTE' && (
                            <div className="bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700">
                                <p className="text-xs text-yellow-500/80 uppercase font-bold mb-2">Prix Unitaire (Berrys)</p>
                                <div className="flex items-center justify-center gap-2">
                                    <input 
                                        type="number" 
                                        value={prixVente} 
                                        onChange={(e) => setPrixVente(Math.max(1, parseInt(e.target.value) || 0))} 
                                        className="bg-slate-900 border border-yellow-500/30 text-yellow-400 text-center font-black text-2xl py-2 rounded-lg w-32 focus:border-yellow-500 outline-none transition"
                                    />
                                    <span className="text-xl font-bold text-yellow-600">฿</span>
                                </div>
                            </div>
                        )}

                        {/* TOTAL */}
                        <div className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total de la transaction</p>
                            <p className="text-3xl font-black text-white">
                                {transaction.type === 'VENTE' 
                                    ? (qteTransaction * prixVente).toLocaleString() 
                                    : (qteTransaction * (transaction.item.prix_achat || transaction.item.prix_unitaire)).toLocaleString()
                                } 
                                <span className="text-yellow-500 ml-1">฿</span>
                            </p>
                        </div>

                        {/* BOUTONS */}
                        <div className="flex gap-3">
                            <button onClick={() => setTransaction(null)} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-600">
                                Annuler
                            </button>
                            <button onClick={validerTransaction} className={`flex-1 py-3 font-bold text-white rounded-xl shadow-lg transition transform active:scale-95 ${theme.btnPrimary}`}>
                                VALIDER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE CONFIRMATION VENTE */}
            {confirmVente && (
                  <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                      <div className="bg-white p-6 rounded-xl text-center max-w-xs w-full shadow-2xl">
                          <h3 className="font-bold text-lg mb-4 text-slate-900">Vendre {confirmVente.objets.nom} ?</h3>
                          <p className="text-2xl font-mono mb-6 text-green-600">+{Math.floor(confirmVente.objets.prix_achat / 2)} ฿</p>
                          <div className="flex gap-2">
                              <button onClick={() => setConfirmVente(null)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold">Annuler</button>
                              <button onClick={confirmerVenteDirecte} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold shadow-lg">VENDRE</button>
                          </div>
                      </div>
                  </div>
            )}
{/* MODALE TITRES */}
            {showTitresModal && (
                <div className="fixed inset-0 bg-black/90 z-[150] flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border relative overflow-hidden ${theme.panel} ${theme.border}`}>
                        <button onClick={() => setShowTitresModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-xl">✕</button>
                        
                        <h2 className={`text-2xl font-black text-center mb-6 uppercase ${theme.textMain}`}>Mes Titres</h2>
                        
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <button 
                                onClick={() => changerTitre(null)} 
                                className={`w-full text-left p-3 rounded-lg border border-slate-700 hover:bg-white/5 transition flex justify-between items-center ${!joueur.titre_actuel ? 'bg-white/10 border-white/30' : 'text-slate-500'}`}
                            >
                                <span>(Aucun titre)</span>
                            </button>

                            {mesTitres.length === 0 ? (
                                <p className="text-center text-slate-500 text-xs italic py-4">Aucun titre débloqué pour le moment.<br/>Jouez pour en gagner !</p>
                            ) : (
                                mesTitres.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => changerTitre(t.titres_ref.nom)} 
                                        className={`w-full text-left p-3 rounded-lg border transition flex justify-between items-center group
                                        ${joueur.titre_actuel === t.titres_ref.nom 
                                            ? `bg-yellow-900/20 border-yellow-500/50` 
                                            : `border-slate-700 hover:bg-white/5`}`}
                                    >
                                        <div>
                                            <p className={`font-bold text-sm ${joueur.titre_actuel === t.titres_ref.nom ? 'text-yellow-400' : 'text-white'}`}>
                                                « {t.titres_ref.nom} »
                                            </p>
                                            <p className="text-[10px] text-slate-500">{t.titres_ref.description}</p>
                                        </div>
                                        {joueur.titre_actuel === t.titres_ref.nom && <span className="text-yellow-400 text-xs">✔</span>}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
      {/* --- INTERFACE DE COMBAT (RESPONSIVE: Stacked on mobile) --- */}
      {activeTab === 'combat_actif' && combatSession && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-fadeIn h-full w-full">
            
            {/* ZONE VISUELLE */}
            <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-950 p-4 md:p-8 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

                {/* HUD ENNEMI (Haut Droite ou Centre Haut Mobile) */}
                <div className="flex justify-end items-center gap-2 md:gap-4 animate-slideInRight z-10 self-end w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-none">
                        <div className="text-sm md:text-2xl font-bold text-white drop-shadow-md truncate">{combatSession.adv_pseudo}</div>
<div className={`text-xs font-mono mb-1 ${joueur.haki_observation ? 'text-cyan-400 font-bold' : 'text-red-400'}`}>
                                {joueur.haki_observation ? (
                                    <>👁️ {combatSession.pv_adv} / {combatSession.pv_adv_max} PV</>
                                ) : (
                                    <>{Math.ceil((combatSession.pv_adv / combatSession.pv_adv_max) * 100)}% PV</>
                                )}
                            </div>                        <div className="w-full md:w-64 h-2 md:h-4 bg-slate-900/50 rounded-full border border-slate-600 overflow-hidden shadow-inner ml-auto">
                            <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, (combatSession.pv_adv / combatSession.pv_adv_max) * 100))}%` }}></div>
                        </div>
                    </div>
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border-4 border-red-500 bg-slate-900 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.4)] relative shrink-0">
                        {combatSession.adv_avatar ? <img src={combatSession.adv_avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl md:text-4xl">👾</div>}
                    </div>
                </div>

                {/* LOGS FLOTTANTS (Au centre) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl flex flex-col gap-1 md:gap-3 pointer-events-none px-4 z-0">
                    {combatLog.slice(0, 4).map((log, i) => {
                        if (typeof log === 'string') {
                            return <div key={i} className="text-center py-1 md:py-2 px-4 md:px-6 rounded-full bg-yellow-500/90 text-black font-bold shadow-lg animate-fadeIn scale-105 border-2 border-yellow-300 text-xs md:text-base">{log}</div>;
                        }
                        if (log && typeof log === 'object' && log.text) {
                             return (
                                <div key={i} className={`py-1.5 md:py-3 px-3 md:px-6 rounded-xl text-[10px] md:text-sm font-bold shadow-lg animate-fadeIn border backdrop-blur-sm flex items-center gap-2 md:gap-3
                                    ${log.source === 'JOUEUR' 
                                    ? 'bg-blue-900/80 border-blue-500 text-blue-100 self-end flex-row-reverse text-right' 
                                    : 'bg-red-900/80 border-red-500 text-red-100 self-start text-left'}`}>
                                    <span className="text-base md:text-xl">{log.source === 'JOUEUR' ? '⚔️' : '🛡️'}</span>
                                    {log.text}
                                </div>
                             );
                        }
                        return null;
                    })}
                </div>

                {/* HUD JOUEUR (Bas Gauche) */}
                <div className="flex justify-start items-center gap-2 md:gap-4 animate-slideInLeft z-10 w-full md:w-auto mt-4 md:mt-0">
                    <div className="w-14 h-14 md:w-24 md:h-24 rounded-full border-4 border-blue-500 bg-slate-900 overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.4)] transform scale-x-[-1] relative shrink-0">
                        {joueur.avatar_url ? <img src={joueur.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl md:text-5xl">🦸</div>}
                    </div>
                    <div className="text-left flex-1 md:flex-none">
                        <div className="text-sm md:text-2xl font-bold text-white drop-shadow-md truncate">{joueur.pseudo}</div>
                        <div className="text-[10px] md:text-xs text-blue-400 font-mono mb-1">{combatSession.pv_moi} / {combatSession.pv_moi_max} PV</div>
                        <div className="w-full md:w-64 h-2 md:h-4 bg-slate-900/50 rounded-full border border-slate-600 overflow-hidden shadow-inner">
                            <div className={`h-full transition-all duration-300 ${combatSession.pv_moi < (combatSession.pv_moi_max * 0.3) ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`} style={{ width: `${Math.max(0, (combatSession.pv_moi / combatSession.pv_moi_max) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ZONE DE CONTRÔLE (BAS) */}
            <div className="h-auto min-h-[25%] bg-slate-900 border-t border-slate-700 p-3 md:p-6 flex flex-col justify-center relative z-20 pb-6 md:pb-6 safe-area-bottom">
                {combatSession.termine ? (
                    <div className="flex flex-col items-center justify-center gap-4 md:gap-6 w-full animate-zoomIn">
                        <div className="text-center">
                            <div className="text-4xl md:text-6xl mb-2 filter drop-shadow-lg">{combatSession.pv_adv <= 0 ? '🏆' : '💀'}</div>
                            <h2 className={`text-2xl md:text-4xl font-black uppercase tracking-widest ${combatSession.pv_adv <= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500' : 'text-red-600'}`}>
                                {combatSession.pv_adv <= 0 ? 'VICTOIRE' : 'DÉFAITE'}
                            </h2>
                        </div>
                        
                        {combatRewards && (
                            <div className="flex gap-2 md:gap-6 w-full justify-center max-w-md">
                                <div className="flex-1 bg-slate-800 border border-emerald-500/50 p-2 md:p-4 rounded-xl flex flex-col items-center shadow-lg">
                                    <span className="text-xl md:text-2xl mb-1">✨</span>
                                    <span className="text-lg md:text-3xl font-black text-emerald-400">+{combatRewards.xp}</span>
                                    <span className="text-[8px] md:text-[10px] text-slate-400 uppercase font-bold tracking-widest">Expérience</span>
                                </div>
                                <div className="flex-1 bg-slate-800 border border-yellow-500/50 p-2 md:p-4 rounded-xl flex flex-col items-center shadow-lg">
                                    <span className="text-xl md:text-2xl mb-1">💰</span>
                                    <span className="text-lg md:text-3xl font-black text-yellow-400">+{combatRewards.berrys}</span>
                                    <span className="text-[8px] md:text-[10px] text-slate-400 uppercase font-bold tracking-widest">Berrys</span>
                                </div>
                            </div>
                        )}
                        {combatLog.some(l => l.toString().includes("gain_elo")) && (
                            <div className="mt-2 md:mt-4 bg-slate-900/50 border border-white/10 px-4 py-1 md:px-6 md:py-2 rounded-full animate-pulse">
                                <span className="text-slate-400 text-[10px] md:text-xs uppercase font-bold mr-2">Classement</span>
                                <span className="text-cyan-400 font-black text-sm md:text-lg">+?? LP</span>
                            </div>
                        )}
                        <button 
                            onClick={() => { setActiveTab('arene'); setCombatSession(null); setCombatLog([]); fetchJoueur(session.user.id); }} 
                            className="bg-white text-slate-900 hover:bg-slate-200 font-black text-sm md:text-lg py-3 px-8 md:px-12 rounded-full shadow-xl hover:scale-105 transition uppercase tracking-widest w-full md:w-auto"
                        >
                            Quitter l'arène
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-5xl mx-auto h-full flex flex-col justify-end">
                        <p className="text-slate-500 text-[10px] md:text-xs uppercase font-bold mb-2 md:mb-3 tracking-widest text-center">Choisissez votre technique</p>
                        <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-4 h-full">
                            {(!joueur.deck_combat || joueur.deck_combat.length === 0) ? (
                                 <div className="col-span-4 text-center text-slate-400 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-4">
                                     <p className="text-xs">Votre deck est vide !</p>
                                     <button onClick={() => setActiveTab('deck')} className="text-cyan-400 underline mt-2 hover:text-white transition text-xs">Configurer</button>
                                 </div>
                            ) : (
                                joueur.deck_combat.map((id) => {
                                     const skill = competences.find(c => c.id === id);
                                     if (!skill) return null;
                                     let armeOk = true;
                                     let armeManquante = "";
                                     if (skill.arme_requise) {
                                         const monArme = equipement?.arme; 
                                         const nomArme = monArme ? monArme.nom.toLowerCase() : "";
                                         if (!monArme) { armeOk = false; armeManquante = skill.arme_requise; } 
                                         else {
                                             if (skill.arme_requise === 'Sabre' && !nomArme.includes('sabre') && !nomArme.includes('katana') && !nomArme.includes('lame') && !nomArme.includes('hache')) { armeOk = false; armeManquante = "Sabre"; }
                                             if (skill.arme_requise === 'Pistolet' && !nomArme.includes('pistolet') && !nomArme.includes('mousquet') && !nomArme.includes('fusil')) { armeOk = false; armeManquante = "Pistolet"; }
                                         }
                                     }
                                     const targetTurn = combatSession.cooldowns?.[skill.id] || 0;
                                     const isCooldown = targetTurn >= combatSession.tour;
                                     const toursRestants = (targetTurn - combatSession.tour) + 1;

                                     return (
                                         <button 
                                             key={id} 
                                             onClick={() => jouerTour(id)} 
                                             disabled={!armeOk || isCooldown} 
                                             className={`relative h-20 md:h-32 border-2 md:border-4 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 overflow-hidden group shadow-lg
                                                 ${(!armeOk || isCooldown) 
                                                     ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-80' 
                                                     : 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-cyan-500 text-white cursor-pointer hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                                                 }`}
                                         >
                                             <span className="font-black text-[9px] md:text-sm uppercase z-10 tracking-wider mb-0.5 md:mb-1 leading-none text-center px-1">{skill.nom}</span>
                                             
                                             <div className="z-10 flex flex-col items-center gap-0.5 md:gap-1">
                                                 <span className="text-[8px] md:text-[10px] opacity-80 font-mono bg-black/30 px-1 md:px-2 rounded text-cyan-100">
                                                     {skill.puissance} DMG
                                                 </span>
                                                 {skill.precision < 100 && (
                                                     <span className="text-[7px] md:text-[9px] font-bold text-red-300 bg-red-900/40 px-1 py-0.5 rounded border border-red-500/30">
                                                         ⚠️ {100 - skill.precision}%
                                                     </span>
                                                 )}
                                             </div>
                                             
                                             {!armeOk && (
                                                 <div className="absolute inset-0 bg-black/90 flex items-center justify-center font-bold text-red-500 z-20 uppercase text-[8px] md:text-xs tracking-widest border-2 border-red-900/50 text-center p-1">
                                                     REQ: {armeManquante}
                                                 </div>
                                             )}

                                             {isCooldown && armeOk && (
                                                 <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20 border-2 border-cyan-900/50 backdrop-blur-sm">
                                                     <span className="text-xl md:text-3xl font-black text-cyan-400 animate-pulse">{toursRestants}</span>
                                                 </div>
                                             )}
                                         </button>
                                      )
                                 })
                            )}
                        </div>
                        <button 
                            onClick={fuirCombat} 
                            className="w-full mt-2 md:mt-3 bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white font-bold py-2 md:py-3 rounded text-[10px] md:text-xs uppercase tracking-widest border border-slate-600 transition"
                        >
                            🏳️ Fuir (200 ฿)
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
        </div>
      )}
      {/* --- MODALE RÉSULTAT EXPÉDITION --- */}
      {expeditionResult && (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 animate-in zoom-in duration-300">
        <div className="bg-slate-900 w-full max-w-md p-6 md:p-8 rounded-2xl border border-slate-700 shadow-2xl text-center relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl md:text-7xl drop-shadow-md animate-bounce">
                {expeditionResult.success ? '🎁' : '🩹'}
            </div>
            
            <h2 className={`text-2xl md:text-3xl font-black mb-2 mt-6 uppercase tracking-wide ${expeditionResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {expeditionResult.success ? 'Succès !' : 'Échec...'}
            </h2>
            
            <p className="text-slate-300 mb-6 md:mb-8 text-xs md:text-sm font-medium">
                "{expeditionResult.message}"
            </p>
            
            {expeditionResult.success && (
                <div className="flex justify-center gap-4 mb-6 md:mb-8">
                    <div className="flex flex-col items-center bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-600 shadow-lg min-w-[80px] md:min-w-[100px]">
                        <span className="text-xl md:text-2xl mb-1">✨</span>
                        <span className="font-black text-emerald-400 text-lg md:text-xl">+{expeditionResult.xp}</span>
                        <span className="text-[8px] md:text-[10px] uppercase font-bold text-slate-400 tracking-widest">XP</span>
                    </div>
                    <div className="flex flex-col items-center bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-600 shadow-lg min-w-[80px] md:min-w-[100px]">
                        <span className="text-xl md:text-2xl mb-1">💰</span>
                        <span className="font-black text-yellow-400 text-lg md:text-xl">+{expeditionResult.berrys}</span>
                        <span className="text-[8px] md:text-[10px] uppercase font-bold text-slate-400 tracking-widest">Berrys</span>
                    </div>
                </div>
            )}

            <button 
                onClick={() => {
                    setExpeditionResult(null); // Ferme la modale
                    fetchJoueur(session.user.id); // Re-vérifie que le joueur est bien "libre"
                }} 
                className={`font-black text-lg py-3 px-10 rounded-xl shadow-lg hover:scale-105 transition uppercase w-full ${theme.btnPrimary}`}
            >
                Empocher
            </button>
        </div>
    </div>
)}
    </main>
  );
}
