// ═══════════════════════════════════════════════════════════════════════════
// HUNTECH FLY FISHING MODULE — COMPREHENSIVE MISSOURI TROUT DATABASE
// ═══════════════════════════════════════════════════════════════════════════
// Every publicly fishable trout water in Missouri: state trout parks,
// blue/white/red ribbon wild streams, tailwaters, and winter urban trout
// lakes.  Coordinates verified against MDC/USGS/Google Earth references.
// ═══════════════════════════════════════════════════════════════════════════

// ─── TROUT STREAM EDUCATION DATA ─────────────────────────────────────────
// Mirrors SHED_EDUCATION from the shed module — habitat-aware coaching.
window.TROUT_EDUCATION = {
  riffle: {
    priority: 1,
    title: 'Riffle (HIGHEST PRIORITY)',
    description: 'Riffles are broken, shallow water where the current tumbles over gravel and rocks. They are oxygen factories — trout stack up at the head and tail of riffles to feed on drifting nymphs. In Missouri streams, riffles are where 60-70% of your fish will come from.',
    tips: [
      'Position yourself downstream and cast up into the riffle. Let your nymph dead-drift through the seam where fast water meets slow.',
      'In morning hours, trout sit at the tail of the riffle where it transitions to the pool below. Move up to the head as the day warms.',
      'Use a short leader (7.5ft) with a weighted nymph and strike indicator set at 1.5x the water depth.',
      'Watch for subtle rises — trout sipping emergers in riffles look like tiny dimples, not splashy rises.',
      'Riffles are forgiving water for new fly fishers — the broken surface hides your leader and mistakes.'
    ]
  },
  pool: {
    priority: 2,
    title: 'Deep Pool (HIGH PRIORITY)',
    description: 'Pools are the deeper, slower stretches where trout rest and ambush. The biggest fish in a stream section almost always hold in the deepest pools, especially near submerged structure like boulders, root wads, or undercut banks.',
    tips: [
      'Approach pools from downstream and stay low. Big trout in clear Missouri streams spook easily.',
      'The head of the pool where the riffle pours in is the feeding lane — drift nymphs right along the seam.',
      'In summer heat, deep pools are thermal refuges. Fish congregate here when water temps exceed 65°F.',
      'Streamers stripped through pools at dawn and dusk trigger aggressive strikes from territorial fish.',
      'If you see a large fish holding, do NOT cast directly over it. Present your fly upstream and let it drift naturally to the fish.'
    ]
  },
  run: {
    priority: 3,
    title: 'Run / Glide (MEDIUM PRIORITY)',
    description: 'Runs are the smooth, medium-depth water between riffles and pools. They have consistent current and are prime feeding lanes. Trout cruise runs picking off nymphs and emergers — this is where you dial in your dead drift.',
    tips: [
      'Runs reward precise presentations. Mend your line upstream to get a drag-free drift through the entire run.',
      'Look for subtle current seams — where faster water meets slower water. Trout line up along these seams.',
      'Dry-dropper rigs excel in runs: a visible dry fly on top with a nymph 18" below catches fish at both levels.',
      'Wade slowly and watch the water before casting. You will often see fish feeding in runs if you take your time.',
      'In fall, runs are where you find spawning activity — look for cleaned gravel patches (redds) and give them wide berth.'
    ]
  },
  boulder: {
    priority: 4,
    title: 'Boulder / Structure (MEDIUM PRIORITY)',
    description: 'Any large rock, fallen tree, or undercut bank creates a current break where trout hold with minimal effort while food funnels past. These are ambush points — trout sit in the slow water behind or beside the structure and dart into the current to grab food.',
    tips: [
      'Cast upstream of the boulder and let your fly drift along both sides. The cushion of slow water in front and the eddy behind both hold fish.',
      'Streamers are deadly here — swing them past boulders and let them hang in the eddy. Trout will chase.',
      'Undercut banks are prime lies for big browns. Roll cast a nymph tight to the bank and let it drift under.',
      'Log jams and root wads are trout magnets. Fish every angle — upstream, beside, and below the structure.',
      'In high water, boulders and structure become even more valuable as trout seek current breaks.'
    ]
  },
  tailout: {
    priority: 5,
    title: 'Tailout / Transition (LOWER PRIORITY)',
    description: 'The tailout is where a pool shallows and accelerates back into the next riffle. Trout move into tailouts to feed, especially during hatches. Transitions between habitat types are always worth checking.',
    tips: [
      'Evening dry fly fishing is often best in tailouts — trout move up from pools to sip emergers in the thin water.',
      'Approach very carefully — tailouts are shallow and trout here are exposed and nervous.',
      'Swing soft hackles through tailouts at the end of a drift — this imitates emerging insects perfectly.',
      'Tailouts are often underrated by anglers who walk right through them to fish the pool. Fish them first.',
      'In spring, tailouts warm faster than deep pools — trout feed actively here on sunny afternoons.'
    ]
  },
  undercut: {
    priority: 3,
    title: 'Undercut Bank (HIGH PRIORITY)',
    description: 'Undercut banks form where current erodes soil beneath overhanging banks, roots, and vegetation. These dark cavities are prime lies for large trout — especially browns — who tuck under the bank and ambush food carried past by the current. Missouri\'s limestone and clay banks create deep undercuts.',
    tips: [
      'Roll cast tight to the bank edge — your fly should land within 6 inches of the bank and drift under the overhang.',
      'Undercuts hold the biggest fish in the stream. Approach from downstream and stay as far away as your casting allows.',
      'Use a sidearm cast to get your fly under overhanging branches. Accuracy matters more than distance here.',
      'Dead-drift a nymph along the bank edge, then give it a twitch as it passes the undercut. Trout strike on the movement.',
      'In low light (dawn, dusk, overcast), big browns leave undercuts to patrol. This is prime streamer time.'
    ]
  },
  log: {
    priority: 3,
    title: 'Fallen Log / Woody Debris (HIGH PRIORITY)',
    description: 'Fallen trees, log jams, and submerged woody debris create complex current breaks that trout love. The wood provides overhead cover, creates eddies where food collects, and harbors aquatic insects in the bark. Multiple trout can hold around a single large log.',
    tips: [
      'Fish every angle around a log — the upstream cushion, both sides, the downstream eddy, and the gap beneath.',
      'Streamers stripped past logs trigger reaction strikes from territorial fish hiding in the cover.',
      'Dead-drift a nymph right along the wood — trout hold within inches of the structure and won\'t move far for food.',
      'Log jams are crayfish hideouts. A #8 olive woolly bugger imitating a crayfish can pull out trophy brown trout.',
      'Be ready for an immediate hookset — log fish grab fast and dive back into the wood. Keep your rod tip up.'
    ]
  },
  seam: {
    priority: 2,
    title: 'Current Seam (HIGH PRIORITY)',
    description: 'Current seams form where fast water meets slow water — at the edges of channels, beside boulders, along bank contours, and where currents merge. Trout sit in the slow side and pluck food tumbling down the fast side. Seams are the #1 place to find feeding trout.',
    tips: [
      'Cast your fly into the fast side and let it drift across the seam into the slow water. The moment it crosses is when strikes happen.',
      'Look for foam lines on the surface — foam follows the same path as food, showing you where the seam delivers insects.',
      'Position yourself so you can drift your fly parallel to the seam for maximum time in the strike zone.',
      'Seams are where you should start on any new piece of water. If there\'s a visible seam, fish it first.',
      'Multiple trout often line up along a long seam, staggered in position. Fish each one methodically from downstream up.'
    ]
  },
  pocket: {
    priority: 3,
    title: 'Pocket Water (MEDIUM-HIGH PRIORITY)',
    description: 'Pocket water is the turbulent, broken water among clusters of boulders and rocks. Each rock creates a small calm pocket behind it where trout hold. Pocket water is often overlooked by anglers but holds surprising numbers of fish — often one fish per pocket.',
    tips: [
      'Short casts and short drifts are the key to pocket water. Drop your fly into each pocket and let it drift 2-3 feet.',
      'High-stick nymphing excels here — keep your rod tip up and maintain direct contact with your fly.',
      'Trout in pockets are opportunistic and not as selective. Larger, more visible fly patterns work well.',
      'Work through pocket water systematically — there\'s a fish behind almost every rock that breaks the current.',
      'Pocket water fish fight hard because they\'re muscular from holding in fast current. Use slightly heavier tippet.'
    ]
  }
};

// Flavor text for hotspot variety (mirrors HOTSPOT_FLAVOR from shed module)
window.TROUT_HOTSPOT_FLAVOR = {
  riffle: {
    titles: ['Prime Feeding Riffle', 'Nymph Factory', 'Trophy Riffle', 'Oxygen-Rich Riffle', 'Productive Riffle Zone'],
    reasons: [
      'This riffle has ideal depth and gravel composition for aquatic insects — trout stack here to feed.',
      'Current speed and substrate indicate high invertebrate density. Trout hold at head and tail positions.',
      'Broken surface water provides cover for feeding trout. They feel safe here and feed confidently.',
      'This riffle transitions into a deep pool — trout move up from the pool to feed in the oxygenated shallows.',
      'Gravel bars and cobble create perfect nymph habitat. This is a high-production feeding zone.'
    ],
    approach: [
      'Wade in from below. Position 30ft downstream and cast quartering upstream with a dead drift.',
      'Stay low, approach from the tailout side. Lead with short casts and work your way up through the riffle.',
      'Use the deeper water beside the riffle as your wading lane. Cast across and mend to get the drift right.',
      'Approach from the bank if possible. Keep your shadow off the water — these fish are in 12-18 inches of water.',
      'Enter the stream well below this spot and work upstream slowly. Stop and observe before your first cast.'
    ],
    flies: [
      'Start with a #16 Pheasant Tail nymph under an indicator. Switch to a #14 Hares Ear if no takes in 10 minutes.',
      'Tie on a #12 Pat Dorsey zebra midge dropper below a #14 Elk Hair Caddis. Cover both the surface and the drift.',
      'Begin with a #18 RS2 emerger. If you see surface activity, switch to a #16 Parachute Adams.',
      'Try a tungsten-bead #16 copper john bounced along the bottom. Add a #20 midge larva dropper for doubles.',
      'Match the hatch — flip a rock first. If you see caddis larva, tie on a #14 green rockworm or LaFontaine sparkle pupa.'
    ]
  },
  pool: {
    titles: ['Deep Holding Pool', 'Trophy Pool', 'Thermal Refuge Pool', 'Structure Pool', 'Cedar Hole'],
    reasons: [
      'Depth and current breaks make this pool a rest area for large trout. The biggest fish in this section lives here.',
      'Submerged structure and depth create ideal ambush points. Trout hold with minimal energy expenditure.',
      'This deep pool provides thermal refuge in summer and stable temperatures year-round from spring influence.',
      'Undercut banks and root structure give trout overhead cover — they feed confidently near concealment.',
      'The combination of depth, current, and food delivery makes this a core holding point for the stream.'
    ],
    approach: [
      'Approach from well downstream. Stay behind cover and make your first cast count — pool fish spook hard.',
      'Use a long leader (12ft+) and keep low. Drift your fly along the deepest seam near the far bank.',
      'Position on the inside bend if possible. The current seam edges along the outside — that is where the fish are.',
      'Wait and watch for 2-3 minutes before casting. Look for subtle fin flashes or the shadow of a holding fish.',
      'High-stick nymph through the head of the pool where current delivers food. Let it swing at the tailout.'
    ],
    flies: [
      'Big streamer — a #8 Woolly Bugger stripped through the pool at dawn. Trophy fish eat big meals.',
      'Double nymph rig: #14 Stonefly top, #18 Pheasant Tail dropper. Cover the whole water column.',
      'San Juan Worm in red or pink fished deep and slow. Effective year-round in Missouri pool water.',
      '#14 Glo-bug drifted through the head of the pool. Especially effective below stocked water or after rain.',
      'Sculpin pattern — a #6 Muddler Minnow or Sculpzilla dead-drifted or stripped along the bottom structure.'
    ]
  },
  run: {
    titles: ['Feeding Lane Run', 'Glide Run', 'Prime Current Seam', 'Mid-Stream Run', 'Emerger Alley'],
    reasons: [
      'Consistent current and moderate depth create a food conveyor belt — trout move into runs to actively feed.',
      'The smooth surface makes this an ideal emerger zone. Watch for heads breaking the film during hatches.',
      'Current seams at the edges of this run concentrate drifting insects — trout patrol these seams systematically.',
      'This run connects productive riffle and pool habitats. Fish transitioning between the two pass through here.',
      'Depth and flow rate indicate comfortable holding water. Multiple trout likely occupy staggered positions here.'
    ],
    approach: [
      'Wade to mid-thigh and cast quartering across. Mend immediately to get a long, drag-free drift.',
      'Fish this from the bank if you can reach it. Less water disturbance means the fish stay in feeding mode.',
      'Work upstream in a grid pattern — cast, take two steps, cast again. Cover every lane systematically.',
      'Use a reach cast to extend your drag-free drift. The longer your fly drifts naturally, the more fish you hook.',
      'Start at the tail end and work up. Fish the near seam first, then the middle, then the far seam. Dont line fish.'
    ],
    flies: [
      'Dry-dropper: #14 Stimulator on top with a #18 Pheasant Tail 20 inches below. Best of both worlds.',
      '#16 Parachute Adams dead-drifted — the best all-around searching pattern for Missouri runs.',
      'Euro-nymph this run: #16 Perdigon point fly with a #20 midge tag. Keep contact and feel for the take.',
      'Soft hackle wet fly — a #14 partridge and orange swung through the run at the end of each drift.',
      '#16 CDC Blue Winged Olive during the hatch. When they are eating dries in a run, it is magic.'
    ]
  },
  boulder: {
    titles: ['Boulder Pocket Water', 'Log Jam Structure', 'Undercut Bank', 'Root Wad Hideout', 'Rock Garden'],
    reasons: [
      'Current break behind this boulder creates a rest zone with food delivered by the main current.',
      'Log jam concentrates food and provides overhead cover — this is a trout condo complex.',
      'The undercut bank provides overhead concealment. Trout hold right under the bank eating what drifts past.',
      'Exposed root structure creates multiple micro-eddies. Several trout can hold in a small area around roots.',
      'Rocky substrate with multiple current deflections creates a maze of holding lies. Fish every pocket.'
    ],
    approach: [
      'Cast tight to the upstream face of the boulder. Let your fly drift around both sides and hang in the back eddy.',
      'Roll cast parallel to the log jam — get your fly drifting right along the wood. Trout hold within inches.',
      'Stay back and roll cast under the bank. A sidearm cast keeps your line below overhanging vegetation.',
      'Short, accurate casts to each pocket around the roots. Work methodically — there may be a fish in each pocket.',
      'Hop-scotch your fly from pocket to pocket. Short drifts are fine — structure fish grab quickly.'
    ],
    flies: [
      '#10 Woolly Bugger — black or olive — stripped past the structure. Aggressive fish will chase.',
      'High-stick a #14 Pat BH Prince nymph right along the structure. Keep it deep and close to the wood.',
      '#8 Sculpin pattern bounced along the bottom near the boulder. Big fish eat big baitfish imitations.',
      '#14 Glo-bug or egg pattern dead-drifted through the eddy. Opportunistic fish rarely pass up an easy meal.',
      '#16 Copper John tight-lined through every pocket. Structure fish want food that comes to them — deliver it.'
    ]
  },
  tailout: {
    titles: ['Evening Rise Tailout', 'Transition Flat', 'Emerger Zone', 'Feeding Station Tailout', 'Shallow Flat'],
    reasons: [
      'Trout move into this shallow tailout during hatches to sip emergers. Prime evening dry fly water.',
      'The transition from pool to riffle concentrates food in narrowing current — a natural feeding station.',
      'Shallow warming water here triggers early insect activity — trout respond by moving up from the pool.',
      'This tailout funnels all the food from the pool above into a concentrated feeding lane.',
      'Exposed gravel and moderate current attract trout looking for easy meals in comfortable water.'
    ],
    approach: [
      'Approach from well below and stay very low — tailout fish are in thin water and hyper-alert.',
      'Cast upstream from a kneeling position. A 12ft leader is not too long here — go light and long.',
      'Fish the edges first. Trout in tailouts often hug the banks where they feel safer.',
      'Let your dry fly drift all the way through the tailout into the riffle below. Fish follow food downstream.',
      'If fish are rising, identify a single fish and cast only to that one. Dont spray casts everywhere.'
    ],
    flies: [
      '#16 Parachute Adams or #18 BWO — match what you see on the water. Tailout fish are selective.',
      'Soft hackle swing — cast across and let it swing through the tailout. Imitates emergers perfectly.',
      '#18 CDC emerger — deadly in tailouts when trout are sipping just under the surface film.',
      'Unweighted #16 Pheasant Tail fished just subsurface. Tailout trout eat emergers more than fully hatched dries.',
      '#14 Elk Hair Caddis skated across the tailout at dusk. The commotion triggers explosive strikes.'
    ]
  },
  undercut: {
    titles: ['Trophy Undercut Bank', 'Eroded Bank Lie', 'Hidden Bank Cavern', 'Root-Laced Undercut', 'Dark Bank Ambush'],
    reasons: [
      'Deep undercut beneath the bank provides concealment for trophy browns. Current delivers food right to the lie.',
      'Eroded bank cavity with root structure creates a dark, safe holding lie — priority target for big fish.',
      'Overhanging vegetation and undercut combine to create a shaded ambush point trout feel safe using all day.',
      'Root system stabilizes the undercut and creates complex micro-eddies that trap food inside the cavity.',
      'This bank contour forces the main current tight against the undercut — a natural food delivery system.'
    ],
    approach: [
      'Stay well back and roll cast tight to the bank edge. Your fly should tick the bank on the way down.',
      'Sidearm cast from downstream to slide your fly under overhanging brush. Accuracy over distance.',
      'Approach from the opposite bank if wading depth allows. Minimize your profile against the skyline.',
      'Kneel and use a bow-and-arrow cast for pinpoint delivery under overhanging structure.',
      'Dead-drift first, then twitch as the fly passes the undercut opening. The movement triggers strikes.'
    ],
    flies: [
      '#10 Woolly Bugger — black — stripped along the bank edge. Big browns in undercuts eat baitfish.',
      '#14 BH Hares Ear dead-drifted tight to the bank. Let it swing under the overhang at the end.',
      '#8 Sculpin pattern bounced along the bottom right against the bank. Match the resident forage.',
      '#6 Muddler Minnow stripped past the undercut at dawn. The disturbance pulls fish out to investigate.',
      'San Juan Worm drifted right along the bank seam. After rain, undercut fish gorge on washed-in worms.'
    ]
  },
  log: {
    titles: ['Submerged Log Lie', 'Woody Debris Complex', 'Fallen Timber Refuge', 'Log Jam Stronghold', 'Tangled Root Structure'],
    reasons: [
      'Submerged log creates a current break and overhead cover — trout hold in the shadow within inches of wood.',
      'Woody debris complex harbors aquatic insects in the bark and creates multiple holding positions.',
      'This fallen tree spans the current creating a long eddy line — multiple fish hold staggered along its length.',
      'Log jam backs up flow and concentrates food. The jumble of wood provides escape cover from predators.',
      'Tangled root ball creates a labyrinth of micro-eddies where trout can hold with almost zero energy.'
    ],
    approach: [
      'Cast upstream of the log and drift your fly along both sides. Fish the gap under the log if there is one.',
      'Roll cast parallel to the wood — your fly should drift within 3 inches of the bark. Closer is better.',
      'Approach from downstream and target the eddy behind the log first. Work forward to the upstream cushion.',
      'Keep tension on your line — log fish grab and immediately dive into the wood. You need a fast hookset.',
      'Use heavier tippet (4X) near wood structure. You will lose fewer flies and land more fish.'
    ],
    flies: [
      '#10 Olive Woolly Bugger — log structure harbors crayfish and sculpins. Match the resident forage.',
      '#14 Prince Nymph high-sticked along the wood edge. The flashy peacock herl draws attention.',
      '#8 black Zonker stripped past the downstream eddy. Aggressive fish will chase out of the wood.',
      '#14 Copper John drifted through the gaps in the structure. Get it deep and right against the wood.',
      '#16 BH Pheasant Tail on a short tight-line drift. Work every pocket and eddy around the wood.'
    ]
  },
  seam: {
    titles: ['Primary Current Seam', 'Foam Line Feeder', 'Converging Current Seam', 'Channel Edge Seam', 'Merging Flows'],
    reasons: [
      'This current seam concentrates drifting insects along a visible foam line — trout queue up to feed here.',
      'Fast water meets slow water creating a defined feeding lane. Multiple trout hold staggered along this seam.',
      'Two currents merge here creating a conveyor belt of food. Trout sit in the slow side and pick off the fast lane.',
      'Channel edge creates a long, fishable seam line. This is where the most actively feeding trout in the section hold.',
      'Foam line indicates the exact food delivery path. Put your fly in the foam and let it ride the seam.'
    ],
    approach: [
      'Position downstream and cast into the fast side. Let your fly cross the seam into the slow water naturally.',
      'Follow the foam line with your eyes — cast above the first fish you see rising and drift through the line.',
      'Wade the slow side and cast into the fast. Mend upstream to prevent drag as your fly crosses the seam.',
      'Stand at the tail of the seam and work upstream. Each cast covers 3-4 feet of the seam line.',
      'Reach cast across the seam to extend your drag-free drift. The longer it rides the seam, the better.'
    ],
    flies: [
      '#16 Parachute Adams drifted right in the foam line. Seam-feeding trout eat confidently — match their rhythm.',
      'Dry-dropper: #14 Stimulator with a #18 PT dropper. Cover surface and subsurface in the seam simultaneously.',
      '#16 CDC Emerger — let it drift awash in the film along the seam line. Trout key on emergers here.',
      'Euro-nymph the seam with a #16 Perdigon. Keep contact and feel for the take as it crosses slow to fast.',
      '#14 Soft Hackle swung across the seam at the end of the drift. The swing imitates an emerging insect perfectly.'
    ]
  },
  pocket: {
    titles: ['Boulder Pocket Zone', 'Rocky Pocket Run', 'Cascading Pocket Water', 'Scattered Rock Pockets', 'Turbulent Pocket Field'],
    reasons: [
      'Cluster of boulders creates dozens of small holding pockets — one fish per pocket, high density water.',
      'Turbulent surface hides the angler and broken current delivers food into each calm pocket.',
      'Cascading drops between rocks create oxygenated pockets trout love. High energy, high feeding activity.',
      'Scattered rocks form a maze of current breaks. Fish are less pressured here because most anglers walk past.',
      'Each pocket behind a rock is a miniature pool. Systematic fishing here can produce a fish on every other cast.'
    ],
    approach: [
      'Short casts — 10 to 15 feet max. Drop your fly into each pocket and let it drift 2-3 feet. Move to the next.',
      'High-stick nymph with your rod tip up. Maintain direct contact — pocket strikes are fast and subtle.',
      'Work upstream through the pockets systematically. Hit every one — you will be surprised how many hold fish.',
      'Dont false cast over pocket water — the spray and shadow will spook fish. One pickup, one cast, one drift.',
      'Step on rocks, not into the pockets. Wading through pocket water puts fish down for 20 minutes.'
    ],
    flies: [
      '#12 BH Pat Dorsey top secret — heavy enough to get down fast in short drifts. Perfect for pockets.',
      '#14 BH Hares Ear — the workhorse. Gets down fast, imitates everything, visible to fish in turbulent water.',
      '#10 Stonefly nymph — pocket water trout eat big food. Dont be afraid to go heavy.',
      '#12 Rubber Legs — the movement in turbulent water triggers strikes from aggressive pocket fish.',
      '#14 Copper John — sinks fast and flashes in the broken light. Ideal for quick-drop pocket fishing.'
    ]
  }
};

// ─── COMPREHENSIVE MISSOURI TROUT WATER DATABASE ─────────────────────────
window.TROUT_WATERS = [

  // ═══════════════════════════════════════════════════════════════════════
  //  STATE TROUT PARKS — Missouri's crown jewels
  //  Zone coordinates verified against OSM spring nodes + MDC zone regs.
  //  Pins placed at stream-center midpoints of each regulation zone.
  // ═══════════════════════════════════════════════════════════════════════

  // ── BENNETT SPRING STATE PARK ──────────────────────────────────────────
  //  Stream: Spring Branch flows N → NE to Niangua River (~1.5 mi)
  //  OSM spring: node 12793275568  (37.7166, -92.8569)
  //  Zone 1: Spring pool → hatchery dam — FLY ONLY
  //  Zone 2: Hatchery dam → Whistle Bridge — Flies & artificial lures
  //  Zone 3: Whistle Bridge → Niangua River — BAIT ONLY (no flies/lures)
  {
    id: 'bennett-spring', name: 'Bennett Spring State Park', category: 'trout-park', ribbon: 'Trout Park',
    region: 'central-ozarks', lat: 37.7166, lng: -92.8568, acres: null, streamMiles: 1.5, avgStreamWidth: 12,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Bennett Spring (100M gal/day)',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'March 1', close: 'October 31', catchRelease: 'Nov 1 - Feb 28' },
    regulations: { method: 'Three regulated zones. Zone 1 fly only, Zone 2 flies & artificial lures, Zone 3 bait only.', dailyLimit: 4, minSize: null, gearRestrictions: 'Zone 1: fly only. Zone 2: flies & artificial lures. Zone 3: bait ONLY — no flies or lures.', specialRules: 'Daily tag required ($3). Hours 6:30am–30min after sunset. No fishing from bridge. Winter C&R: flies/artificial lures only, entire stream.' },
    access: [
      // Zone pins placed at center of each zone; zoneBounds define exact boundaries
      // Boundary 1 (fly/lure line): 37.7233, -92.8561  (user-verified 37°43'23.88"N 92°51'21.86"W)
      // Boundary 2 (Whistle Bridge): 37.7279, -92.8555  (user-verified 37°43'40.39"N 92°51'19.74"W)
      { name: 'Zone 1 — Fly Only', lat: 37.7199, lng: -92.8565, type: 'zone', methods: ['fly'], zoneBounds: [[37.7164, -92.8568], [37.7233, -92.8561]], notes: 'Spring pool to fly/lure boundary. Fly fishing ONLY. Crystal clear sight fishing — long leaders, small flies. Most technical zone.' },
      { name: 'Zone 2 — Flies & Lures', lat: 37.7256, lng: -92.8558, type: 'zone', methods: ['fly', 'spin'], zoneBounds: [[37.7233, -92.8561], [37.7279, -92.8555]], notes: 'Fly/lure boundary to Whistle Bridge. Flies and artificial lures allowed. Most popular section — arrive early on weekends.' },
      { name: 'Zone 3 — Bait Only', lat: 37.7316, lng: -92.8585, type: 'zone', methods: ['bait'], zoneBounds: [[37.7279, -92.8555], [37.7353, -92.8623]], notes: 'Whistle Bridge to Niangua River. BAIT ONLY — no flies or artificial lures permitted. Family friendly, least crowded.' }
      // Amenity pins (parking, store, restrooms) removed — no OSM-verified coordinates available
    ],
    // OSM Way 198626029 — Bennett Spring Branch (waterway=river), verified 2026-02-20
    streamPath: [
      [37.7165,-92.8569],[37.7178,-92.8578],[37.7182,-92.8581],[37.7189,-92.8585],
      [37.7195,-92.8587],[37.7202,-92.8584],[37.7212,-92.8579],[37.7226,-92.8568],
      [37.7233,-92.8561],[37.7244,-92.8549],[37.7248,-92.8544],[37.7251,-92.8540],
      [37.7255,-92.8538],[37.7259,-92.8538],[37.7265,-92.8541],[37.7271,-92.8545],
      [37.7274,-92.8548],[37.7278,-92.8554],[37.7279,-92.8557],[37.7282,-92.8565],
      [37.7284,-92.8570],[37.7286,-92.8572],[37.7290,-92.8574],[37.7296,-92.8575],
      [37.7300,-92.8575],[37.7304,-92.8575],[37.7309,-92.8573],[37.7311,-92.8574],
      [37.7329,-92.8595],[37.7341,-92.8614],
      [37.7347,-92.8619],[37.7353,-92.8623]
    ],
    // bankWidths: [leftMeters, rightMeters] at each streamPath point
    // Measured from satellite/LiDAR: left=west/south bank, right=east/north bank
    // Bennett Spring is narrow (6-9m) — prior avgStreamWidth:12 was too wide
    bankWidths: [
      [4.0,4.5],[3.8,4.0],[3.5,3.8],[3.5,4.0],
      [3.5,4.0],[3.8,3.8],[4.0,3.5],[4.2,3.5],
      [4.0,3.5],[3.8,3.5],[3.5,3.5],[3.2,3.5],
      [3.0,3.5],[3.0,3.8],[3.2,4.0],[3.5,4.0],
      [3.5,3.8],[3.5,3.5],[3.5,3.5],[3.8,3.5],
      [3.8,3.2],[3.8,3.2],[4.0,3.0],[4.0,3.0],
      [3.8,3.2],[3.5,3.5],[3.5,3.5],[3.5,3.8],
      [4.0,4.0],[4.2,4.2],
      [4.5,4.5],[5.0,5.0]
    ],
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Scuds #14-16'], summer: ['Caddis #14-16', 'Sulphurs #16-18', 'Terrestrials'], fall: ['BWO #16-20', 'Midges #18-22', 'October Caddis #10-12'], winter: ['Midges #20-24', 'BWO #18-22'] },
    topFlies: ['#16 Pheasant Tail Nymph', '#14 Hares Ear', '#18 Zebra Midge', '#16 Elk Hair Caddis', '#14 Woolly Bugger (olive)'],
    topLures: ['1/8oz Rooster Tail (white)', '1/8oz Panther Martin (gold)', 'Small Kastmaster (gold)', 'Trout Magnet (white/chartreuse)', 'Rapala Original F3 (rainbow trout)', 'Rebel Wee Craw (crawdad)', 'Rapala Countdown CD-3 (gold)'],
    topBait: ['Whole kernel corn (where legal)', 'PowerBait (chartreuse/rainbow)', 'Nightcrawler on small hook', 'Salmon eggs'],
    coachTips: ['Bennett Spring is Missouris most popular trout park. Arrive before 6:30am on weekends or fish midweek.', 'Zone 1 is fly only and the most technical water. If learning, start in Zone 3 with bait.', 'Zone 3 is BAIT ONLY — no flies or lures. Do not bring fly gear into Zone 3.', 'The spring pool produces year-round. Scud and sowbug patterns are deadly in Zone 1.', 'During winter C&R, crowds thin dramatically and the fishing is excellent.'],
    description: 'Missouris most popular trout park. Bennett Spring produces over 100M gallons daily, creating 1.5 miles of crystal-clear trout stream. Three strictly enforced zones: fly only, flies & lures, bait only.'
  },

  // ── MONTAUK STATE PARK ─────────────────────────────────────────────────
  //  Stream: Current River flows S past spring (~1 mi of trout water)
  //  OSM spring: node 12542787262  (37.4605, -91.6834)
  //  Fly Only zone: 37.4600,-91.6832 → 37.4517,-91.6864  (user-verified 2026-02-24)
  //  Catch & Release zone: 37.4594,-91.6841 → 37.4558,-91.6846  (user-verified 2026-02-24)
  //  All Methods zone: between 37.4517,-91.6864 and 37.4556,-91.6845  (user-verified 2026-02-24)
  {
    id: 'montauk', name: 'Montauk State Park', category: 'trout-park', ribbon: 'Trout Park',
    region: 'eastern-ozarks', lat: 37.4605, lng: -91.6834, acres: null, streamMiles: 1.0, avgStreamWidth: 15,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Montauk Spring (53M gal/day)',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'March 1', close: 'October 31', catchRelease: 'Nov 1 - Feb 28' },
    regulations: { method: 'Fly Only zone, Catch & Release zone, All Methods zone.', dailyLimit: 4, minSize: null, gearRestrictions: 'Fly Only: flies only. C&R: catch-and-release, flies/artificial. All Methods: all legal methods.', specialRules: 'Daily tag required ($3). Winter C&R: flies/artificial lures only, entire stream.' },
    access: [
      // Zone boundaries user-verified 2026-02-24 from field GPS coordinates
      // Fly Only: 37°27'36.07"N 91°40'59.50"W → 37°27'05.96"N 91°41'10.96"W
      // C&R:     37°27'33.97"N 91°41'02.86"W → 37°27'20.74"N 91°41'04.61"W
      // All Methods: between 37°27'05.96"N 91°41'10.96"W and 37°27'20.14"N 91°41'04.07"W
      { name: 'Fly Only Zone', lat: 37.4559, lng: -91.6848, type: 'zone', methods: ['fly'], zoneBounds: [[37.4600, -91.6832], [37.4517, -91.6864]], habitat: 'pool-run', clarity: 'gin-clear', depth: 'deep', pressure: 'moderate', notes: 'Fly fishing ONLY. From 37°27\'36"N near spring pool downstream to 37°27\'06"N. Longest zone — covers most of the park stream. Crystal-clear spring-fed water, big resident trout. Dead-drift scuds and small nymphs.' },
      { name: 'Catch & Release Zone', lat: 37.4576, lng: -91.6844, type: 'zone', methods: ['fly', 'spin'], zoneBounds: [[37.4594, -91.6841], [37.4558, -91.6846]], habitat: 'riffle-run', clarity: 'gin-clear', depth: 'medium-deep', pressure: 'moderate', notes: 'Catch-and-release only — flies and artificial lures. From 37°27\'34"N to 37°27\'21"N. Upper park section near spring. All fish must be released. Most technical water with biggest resident trout.' },
      { name: 'All Methods Zone', lat: 37.4537, lng: -91.6855, type: 'zone', methods: ['fly', 'spin', 'bait'], zoneBounds: [[37.4517, -91.6864], [37.4556, -91.6845]], habitat: 'run-pool', clarity: 'clear', depth: 'medium-deep', pressure: 'low', notes: 'All legal methods including bait. Between 37°27\'06"N and 37°27\'20"N. Convergence zone of fly-only and C&R sections. Best for families and spin anglers.' },
      { name: 'Store / Tag Office', lat: 37.4522, lng: -91.6811, type: 'parking', verified: true, notes: 'Park store inside Dorman L. Steelman Lodge. Daily tags, tackle, supplies. (OSM node verified)' }
      // Lodge Parking and Hatchery/Mill removed — no OSM-verified coordinates
    ],
    // ── 7 General Hotspot Holding Areas (spread start-to-end) ──
    // These appear on check-in. Micro fishing spots deploy when user taps a hotspot.
    hotspots: [
      { name: 'Spring Run Pool', lat: 37.4597, lng: -91.6817, habitat: 'pool', notes: 'Deep spring-fed pool at the headwaters. Cold, clear water year-round. Big resident trout stack up here.' },
      { name: 'Upper Riffle', lat: 37.4579, lng: -91.6816, habitat: 'riffle', notes: 'Fast shallow water with gravel bottom. Active feeders during hatches. Best dry-fly water in the park.' },
      { name: 'Bend Pool', lat: 37.4564, lng: -91.6815, habitat: 'pool', notes: 'Deep outside bend pool with undercut bank. Larger trout hold tight to the far bank structure.' },
      { name: 'Mid-Run Seam', lat: 37.4553, lng: -91.6821, habitat: 'seam', notes: 'Current seam where fast water meets slow. Prime feeding lane — dead-drift nymphs along the seam edge.' },
      { name: 'Deep Run', lat: 37.4543, lng: -91.6831, habitat: 'run', notes: 'Steady mid-depth run with mixed substrate. Good all-around water for nymphing and streamers.' },
      { name: 'Lower Pool', lat: 37.4533, lng: -91.6855, habitat: 'pool', notes: 'Wide deep pool in the lower section. Less pressure than upper water. Scuds and sowbugs are deadly here.' },
      { name: 'Tail-Out', lat: 37.4518, lng: -91.6864, habitat: 'tailout', notes: 'Shallow tail-out at the downstream end. Trout feed aggressively on emergers in the thin water.' }
    ],
    // OSM Way 162645228 — Current River (waterway=river), verified 2026-02-20
    streamPath: [
      [37.4600,-91.6820],[37.4597,-91.6817],[37.4590,-91.6816],[37.4585,-91.6816],
      [37.4579,-91.6816],[37.4575,-91.6814],[37.4568,-91.6812],[37.4564,-91.6815],
      [37.4557,-91.6821],[37.4553,-91.6821],[37.4549,-91.6821],[37.4546,-91.6824],
      [37.4543,-91.6831],[37.4540,-91.6839],[37.4536,-91.6848],[37.4533,-91.6855],
      [37.4526,-91.6862],[37.4522,-91.6863],[37.4518,-91.6864],[37.4515,-91.6864]
    ],
    // bankWidths: [leftMeters, rightMeters] — Montauk/Current River wider channel
    bankWidths: [
      [6.0,6.5],[5.5,6.0],[5.5,5.5],[5.5,5.5],
      [5.5,5.5],[5.0,5.5],[5.0,5.0],[5.5,5.0],
      [6.0,5.5],[5.5,5.5],[5.5,5.5],[5.5,6.0],
      [6.0,6.0],[6.5,6.0],[6.5,6.5],[6.5,6.5],
      [6.0,6.5],[5.5,6.0],[5.5,5.5],[5.5,5.5]
    ],
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Early Caddis #16'], summer: ['Caddis #14-16', 'Sulphurs #16-18', 'Terrestrials'], fall: ['BWO #16-20', 'Midges #18-22', 'Crane flies #10'], winter: ['Midges #20-24', 'BWO #18-22'] },
    topFlies: ['#16 Pheasant Tail', '#14 Hares Ear', '#18 Zebra Midge', '#16 Parachute Adams', '#12 Woolly Bugger'],
    topLures: ['1/8oz Rooster Tail', '1/8oz Panther Martin', 'Small inline spinner', 'Micro crankbait', 'Rapala Countdown CD-3 (brook trout)', 'Rapala Original F3 (rainbow trout)'],
    topBait: ['PowerBait', 'Corn', 'Nightcrawlers', 'Salmon eggs'],
    coachTips: ['Montauk has a remote wilderness feel. The Current River flows right past.', 'Zone 1 C&R near the spring holds the biggest fish. Dead drift a #16 scud.', 'After your trout limit, explore the Current River for smallmouth.', 'The lodge dining room serves a great breakfast. Fuel up before your session.'],
    description: 'Deep in the Ozarks on the headwaters of the Current River. Montauk Spring pumps 53M gallons daily into a mile of stocked rainbow trout water. Three zones from C&R fly only to all methods.'
  },

  // ── ROARING RIVER STATE PARK ───────────────────────────────────────────
  //  Stream: Roaring River flows S through narrow valley (~1 mi)
  //  OSM spring: node 12042337741  (36.5915, -93.8324)
  //  Zone 1: Hatchery → Dry Hollow Creek — artificial lures, soft plastic, flies
  //  Zone 2: Dry Hollow → old dam (Campground 3) — FLIES ONLY, incl C&R section
  //  Zone 3: Old dam → park boundary — all methods incl natural bait
  {
    id: 'roaring-river', name: 'Roaring River State Park', category: 'trout-park', ribbon: 'Trout Park',
    region: 'southwest-ozarks', lat: 36.5915, lng: -93.8324, acres: null, streamMiles: 1.0, avgStreamWidth: 10,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Roaring River Spring (20M gal/day)',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'March 1', close: 'October 31', catchRelease: 'Nov 1 - Feb 28' },
    regulations: { method: 'Zone 1 artificial lures/flies, Zone 2 flies only (C&R section), Zone 3 all methods.', dailyLimit: 4, minSize: null, gearRestrictions: 'Zone 1: artificial lures, soft plastic, flies. Zone 2: FLIES ONLY. Zone 3: all methods.', specialRules: 'Daily tag required ($3). Zone 2 has C&R section above Hwy F bridge. Winter C&R: flies/artificial lures only.' },
    access: [
      { name: 'Zone 1 — Lures & Flies', lat: 36.5901, lng: -93.8351, type: 'zone', methods: ['fly', 'spin'], notes: 'Hatchery to Dry Hollow Creek. Artificial lures, soft plastic and flies. Near spring — cold clear water.' },
      { name: 'Zone 2 — Flies Only', lat: 36.5865, lng: -93.8363, type: 'zone', methods: ['fly'], notes: 'Dry Hollow to old dam (Campground 3). FLIES ONLY. C&R sub-section above Hwy F bridge. Best zone for skilled fly anglers.' },
      { name: 'Zone 3 — All Methods', lat: 36.5821, lng: -93.8344, type: 'zone', methods: ['fly', 'spin', 'bait'], notes: 'Old dam to park boundary. All methods including natural bait. Near campground — family friendly.' }
      // Amenity pins (parking, store, restrooms) removed — no OSM-verified coordinates available
    ],
    streamPath: [
      [36.5926,-93.8335],[36.5916,-93.8338],[36.5906,-93.8347],[36.5901,-93.8351],
      [36.5888,-93.8357],[36.5878,-93.8356],[36.5868,-93.8362],[36.5865,-93.8363],
      [36.5858,-93.8361],[36.5853,-93.8356],[36.5847,-93.8351],[36.5834,-93.8346],
      [36.5827,-93.8345],[36.5821,-93.8344],[36.5814,-93.8340],[36.5807,-93.8337]
    ],
    // bankWidths: [leftMeters, rightMeters] — Roaring River is narrow valley stream
    bankWidths: [
      [4.0,4.0],[3.8,3.5],[3.5,3.5],[3.5,3.5],
      [3.5,3.5],[3.5,3.2],[3.2,3.2],[3.2,3.5],
      [3.5,3.5],[3.5,3.5],[3.5,3.5],[3.5,3.5],
      [3.5,3.5],[3.5,3.5],[3.5,3.5],[3.5,3.8]
    ],
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Scuds #14-16'], summer: ['Caddis #14-16', 'Terrestrials', 'Cream variants #16'], fall: ['BWO #18-22', 'Midges #18-22'], winter: ['Midges #20-26', 'BWO #20-24'] },
    topFlies: ['#16 Scud (tan/orange)', '#18 Zebra Midge', '#16 Pheasant Tail', '#14 Elk Hair Caddis', '#10 Woolly Bugger'],
    topLures: ['1/8oz Rooster Tail', 'Small jig (white/pink)', 'Micro spoon', 'Berkley Gulp minnow', 'Rapala Original F3 (brown trout)', 'Small crankbait (crawdad)'],
    topBait: ['PowerBait', 'Corn', 'Nightcrawlers', 'Wax worms'],
    coachTips: ['Roaring River is in the far SW corner of Missouri — beautiful hill country.', 'Zone 2 is flies only — the best zone for skilled anglers. C&R section holds big fish.', 'Fish near the hatchery outflow in Zone 1 for active feeders.', 'Cardiac Hill trail is steep but gives access to less-pressured water.'],
    description: 'In the rugged SW Ozarks. Roaring River Spring emerges from a cave and feeds a mile of stocked rainbow water through a narrow valley. Three zones with strictly enforced methods.'
  },

  // ── MARAMEC SPRING PARK ────────────────────────────────────────────────
  //  Stream: Spring Branch flows N to Meramec River (~1 mi)
  //  OSM spring: node 289828682  (37.9534, -91.5328)
  //  Privately owned (James Foundation). Separate entrance fee ($5/vehicle).
  //  NO METHOD RESTRICTIONS — entire stream open to fly, lures, and bait
  //  Zones are organizational only (manageable sections, not method-restricted)
  //  Boundary 1 (Zone 1/2): ~37.9566, -91.5331  (stream path index 9, first bend)
  //  Boundary 2 (Zone 2/3): ~37.9591, -91.5368  (stream path index 21, upper straight)
  {
    id: 'maramec-spring', name: 'Maramec Spring Park', category: 'trout-park', ribbon: 'Trout Park',
    region: 'eastern-ozarks', lat: 37.9534, lng: -91.5328, acres: null, streamMiles: 1.0, avgStreamWidth: 14,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Maramec Spring (96M gal/day, 5th largest in MO)',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'March 1', close: 'October 31', catchRelease: 'Nov 1 - Feb 28' },
    regulations: { method: 'All methods allowed on entire stream — fly, lures, and bait.', dailyLimit: 4, minSize: null, gearRestrictions: 'No gear restrictions. Fly, artificial lures, and bait allowed in all zones.', specialRules: 'Privately owned (James Foundation). $5/vehicle entrance fee. Daily trout tag required ($3). Not MDC-managed — separate rules. Winter C&R (Nov-Feb): flies & artificial lures only, entire stream.' },
    access: [
      // Zone pins placed at center of each zone; zoneBounds define exact boundary coordinates
      // NO method restrictions — zones are organizational only
      // Boundary 1 (first bend): 37.9566, -91.5331  (stream path index 9)
      // Boundary 2 (upper straightaway): 37.9591, -91.5368  (stream path index 21)
      { name: 'Zone 1 — Spring Pool', lat: 37.9556, lng: -91.5327, type: 'zone', methods: ['fly', 'spin', 'bait'], zoneBounds: [[37.9539, -91.5332], [37.9566, -91.5331]], habitat: 'pool', clarity: 'gin-clear', depth: 'deep', pressure: 'high', notes: 'Spring pool to first bend. Crystal-clear water, deepest section. Sight fishing for large trout near the spring boil. Best for fly anglers — long leaders, small flies, delicate presentations. All methods allowed.' },
      { name: 'Zone 2 — Middle Bends', lat: 37.9568, lng: -91.5350, type: 'zone', methods: ['fly', 'spin', 'bait'], zoneBounds: [[37.9566, -91.5331], [37.9591, -91.5368]], habitat: 'riffle-run', clarity: 'clear', depth: 'medium', pressure: 'moderate', notes: 'First bend to upper straightaway. Beautiful riffle-run-pool sequence. Most varied structure — great for nymphing, spinner fishing, or drifting bait. All methods allowed.' },
      { name: 'Zone 3 — Lower Run', lat: 37.9604, lng: -91.5364, type: 'zone', methods: ['fly', 'spin', 'bait'], zoneBounds: [[37.9591, -91.5368], [37.9619, -91.5343]], habitat: 'run', clarity: 'clear', depth: 'medium-deep', pressure: 'low', notes: 'Upper straightaway to Meramec River confluence. Wider water, deeper runs. Least crowded section — family friendly. All methods allowed.' },
      { name: 'Main Parking / Gate', lat: 37.9551, lng: -91.5318, type: 'parking', verified: true, notes: 'Entrance gate — pay $5/vehicle. Parking near spring, museum, and stream. (OSM node 37.9551/-91.5318 verified)' },
      { name: 'Restrooms', lat: 37.9595, lng: -91.5315, type: 'parking', verified: true, notes: 'Restroom facility near Zone 3. (OSM node 37.9595/-91.5315 verified)' }
      // Store/Museum removed — no OSM-verified coordinates
    ],
    // OSM Way 204259234 — Maramec Spring Branch (waterway=stream), verified 2026-02-20
    streamPath: [
      [37.9539,-91.5332],[37.9545,-91.5334],[37.9549,-91.5330],[37.9553,-91.5329],
      [37.9555,-91.5328],[37.9557,-91.5325],[37.9559,-91.5322],[37.9561,-91.5322],
      [37.9565,-91.5325],[37.9566,-91.5331],[37.9568,-91.5337],[37.9569,-91.5342],
      [37.9569,-91.5344],[37.9568,-91.5348],[37.9566,-91.5350],[37.9566,-91.5357],
      [37.9569,-91.5361],[37.9573,-91.5365],[37.9576,-91.5367],[37.9580,-91.5368],
      [37.9585,-91.5368],[37.9591,-91.5368],[37.9598,-91.5368],[37.9600,-91.5367],
      [37.9603,-91.5365],[37.9606,-91.5363],[37.9610,-91.5356],[37.9615,-91.5349],
      [37.9619,-91.5343]
    ],
    // bankWidths: [leftMeters, rightMeters] — Maramec Spring is medium width
    bankWidths: [
      [5.0,5.0],[4.5,4.5],[4.5,4.5],[4.5,4.0],
      [4.5,4.0],[4.5,4.0],[4.5,4.0],[4.5,4.0],
      [4.5,4.5],[5.0,5.0],[5.0,5.0],[5.0,5.0],
      [5.0,5.0],[5.0,5.0],[5.0,5.0],[5.0,5.5],
      [5.0,5.5],[5.0,5.0],[5.0,5.0],[4.5,5.0],
      [4.5,5.0],[4.5,5.0],[4.5,5.0],[4.5,5.0],
      [4.5,4.5],[4.5,4.5],[4.5,4.5],[5.0,5.0],
      [5.5,5.5]
    ],
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midge #18-24', 'Caddis #14-16', 'Scuds #14-16'], summer: ['Caddis #14-16', 'Sulphurs #16', 'Terrestrials', 'Cream Midges #20-22'], fall: ['BWO #16-22', 'October Caddis #10-12', 'Midges #18-22'], winter: ['Midges #20-26', 'BWO #18-22 (warm afternoons)', 'Scuds #14-16 (year-round)'] },
    topFlies: ['#16 Pheasant Tail Nymph', '#14 Hares Ear', '#20 Zebra Midge', '#16 Scud (tan/orange)', '#16 Elk Hair Caddis', '#12 Woolly Bugger (olive)'],
    topLures: ['1/8oz Rooster Tail (white)', '1/8oz Panther Martin (gold)', 'Small Kastmaster (gold)', 'Trout Magnet (white/chartreuse)', 'Rapala Countdown CD-3 (rainbow trout)', 'Rebel Wee Craw (crawdad)'],
    topBait: ['PowerBait (chartreuse/rainbow)', 'Whole kernel corn', 'Nightcrawlers on small hook', 'Salmon eggs'],
    coachTips: ['Maramec is privately owned (James Foundation) — NOT MDC. Different rules. $5/vehicle entrance + $3 daily trout tag + state trout stamp required.', 'The 5th largest spring in Missouri. Massive deep blue spring pool holds trophy-sized trout — sight fish with small nymphs and long leaders.', 'Winter C&R (Nov-Feb): flies and artificial lures ONLY on entire stream. No bait. Great uncrowded fishing.', 'Less crowded than Bennett Spring and Roaring River, especially on weekdays. Beautiful museum and nature center on-site.', 'Scuds and sowbugs are always productive here — dead-drift a #16 tan scud in any zone year-round.'],
    description: 'Privately operated trout park fed by Missouri\'s 5th largest spring (96M gal/day). Beautiful grounds with nature museum. No method restrictions — fly, lures, and bait allowed on entire stream. Three manageable zones for focused fishing. Less crowded than state-run parks, especially weekdays.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  BLUE RIBBON WILD TROUT — Flies & artificial only, 1 fish, 18" min
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'blue-springs-creek', name: 'Blue Springs Creek (Blue Ribbon)', category: 'wild-stream', ribbon: 'Blue Ribbon',
    region: 'central-ozarks', lat: 37.3386, lng: -92.1652, acres: null, streamMiles: 5.5,
    species: ['rainbow', 'brown'], waterType: 'spring-creek', flowSource: 'Blue Spring + multiple seeps',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Flies and artificial lures ONLY. No soft plastics.', dailyLimit: 1, minSize: '18 inches', gearRestrictions: 'Flies and artificial lures only. Soft plastics prohibited.', specialRules: 'Blue Ribbon trophy management year-round.' },
    access: [
      { name: 'Blue Springs Creek CA Parking', lat: 37.3395, lng: -92.1640, type: 'parking', notes: 'Conservation area gravel lot. 2WD OK dry weather. Walk-in access.' },
      { name: 'Upper Blue Springs Access', lat: 37.3410, lng: -92.1620, type: 'entry', notes: 'Walk downstream from parking. Less pressure in upper section.' },
      { name: 'Lower Creek Walk-In', lat: 37.3350, lng: -92.1680, type: 'entry', notes: 'Longer hike, more solitude. True backcountry.' }
    ],
    solitude: 'high', difficulty: 'moderate', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['BWO #16-20', 'Caddis #14-16', 'Midges #18-22', 'March Browns #12-14'], summer: ['Caddis #14-16', 'Terrestrials (ants #18, beetles #14, hoppers #10)', 'Sulphurs #16-18'], fall: ['BWO #16-22', 'Midges #18-22', 'October Caddis #10-12'], winter: ['Midges #20-26', 'BWO #18-24'] },
    topFlies: ['#16 Pheasant Tail', '#18 CDC BWO Emerger', '#14 Elk Hair Caddis', '#16 Parachute Adams', '#12 Woolly Bugger (black)'],
    topLures: ['1/16oz inline spinner (gold)', 'Micro Rapala (rainbow trout)', 'Small spoon (silver)', 'Rapala Countdown CD-1 (brook trout)'], topBait: null,
    coachTips: ['This is REAL wild trout fishing. Small creek, spooky fish, delicate presentations required.', 'Most trout 7-10 inches. A 14-incher is a genuine trophy.', 'Stealth is everything. Earth tones, stay low, wade slowly.', 'Start downstream and work up. Fish every riffle and pool.', 'One of the most beautiful places in Missouri. Take your time.'],
    description: 'True wild rainbow trout stream in Mark Twain National Forest. Small, intimate creek with spooky wild fish. 18" minimum, flies/artificial only. Backcountry Missouri at its finest.'
  },
  {
    id: 'mill-creek', name: 'Mill Creek (Blue Ribbon)', category: 'wild-stream', ribbon: 'Blue Ribbon',
    region: 'central-ozarks', lat: 37.3200, lng: -92.0950, acres: null, streamMiles: 4.0,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Multiple springs in Mark Twain NF',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Flies and artificial lures ONLY. No soft plastics.', dailyLimit: 1, minSize: '18 inches', gearRestrictions: 'Flies and artificial lures only. Soft plastics prohibited.', specialRules: 'Blue Ribbon trophy management.' },
    access: [
      { name: 'Mill Creek Recreation Area (CR 7550)', lat: 37.3210, lng: -92.0940, type: 'parking', notes: 'County Road 7550. Gravel parking. Walk to stream.' },
      { name: 'Bohigian CA Access', lat: 37.3180, lng: -92.0980, type: 'entry', notes: 'Conservation area entry. Longer walk, more solitude.' },
      { name: 'Hwy AA / Wilkins Spring', lat: 37.3240, lng: -92.0900, type: 'entry', notes: 'Upper access. Small wild rainbows in cold spring-fed water.' }
    ],
    solitude: 'high', difficulty: 'moderate', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Caddis #16'], summer: ['Terrestrials', 'Caddis #14-16', 'Cream midges #22'], fall: ['BWO #16-22', 'Midges #18-24'], winter: ['Midges #22-26', 'BWO #20-24'] },
    topFlies: ['#18 Pheasant Tail', '#20 Zebra Midge', '#16 Parachute Adams', '#14 Elk Hair Caddis', '#16 Soft Hackle'],
    topLures: ['1/32oz micro spinner', 'Micro jig (white)', 'Micro Rapala (rainbow trout)'], topBait: null,
    coachTips: ['Mill Creek is small — more brook than river. Delicate presentations mandatory.', 'Fish are spooky. Cast ONLY from a kneeling position in clear pools.', 'Most fish 7-10 inches. Focus on deeper pockets.', 'Mark Twain NF and Bohigian CA. Beautiful, remote.'],
    description: 'Tiny wild rainbow trout creek through Mark Twain National Forest. Extremely intimate — stealth and precision required. Pure wilderness solitude.'
  },
  {
    id: 'little-piney-blue', name: 'Little Piney Creek (Blue Ribbon)', category: 'wild-stream', ribbon: 'Blue Ribbon',
    region: 'central-ozarks', lat: 37.7080, lng: -91.9110, acres: null, streamMiles: 6.0,
    species: ['rainbow', 'brown'], waterType: 'spring-creek', flowSource: 'Lane Spring + tributary springs',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Flies and artificial lures ONLY. No soft plastics.', dailyLimit: 1, minSize: '18 inches', gearRestrictions: 'Flies and artificial lures only. Soft plastics prohibited.', specialRules: 'Blue Ribbon. Adjacent White Ribbon section has different rules.' },
    access: [
      { name: 'Lane Spring Recreation Area', lat: 37.7095, lng: -91.9100, type: 'parking', notes: '$2 parking fee. Campground. Easy walk to Lane Spring and stream.' },
      { name: 'Lane Spring Pool', lat: 37.7085, lng: -91.9115, type: 'entry', notes: 'Beautiful spring pool. Walk downstream into Blue Ribbon water.' },
      { name: 'Hwy 63 Bridge Access', lat: 37.7120, lng: -91.9060, type: 'entry', notes: 'Roadside pulloff. Quick access. Walk upstream for Blue Ribbon.' },
      { name: 'Vida Slab', lat: 37.7040, lng: -91.9180, type: 'entry', notes: 'Downstream. Watch for private property near Vida Slab.' },
      { name: 'Milldam Hollow', lat: 37.7010, lng: -91.9220, type: 'entry', notes: 'Far downstream. Least pressure. True solitude.' }
    ],
    solitude: 'medium', difficulty: 'moderate', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['BWO #16-20', 'Caddis #14-16', 'Midges #18-22', 'Stoneflies #10-14'], summer: ['Caddis #14-16', 'Terrestrials', 'Sulphurs #16-18', 'Crane flies #10'], fall: ['BWO #16-22', 'Brown Drake #10 (September!)', 'Midges #18-22', 'October Caddis #10'], winter: ['Midges #20-26', 'BWO #18-24', 'Winter stoneflies #14-16'] },
    topFlies: ['#16 Pheasant Tail', '#14 Elk Hair Caddis', '#12 Woolly Bugger', '#18 BWO CDC Emerger', '#14 Glo-Bug (peach)'],
    topLures: ['1/16oz spinner (gold)', 'Small Rapala (rainbow trout color)', 'Rapala Countdown CD-3 (gold)'], topBait: null,
    coachTips: ['Lane Spring is a gem. The spring pool holds fish year-round.', 'September Brown Drake hatch is legendary. Plan for mid-September.', 'BWO hatches reliable almost daily Oct-Apr. Fish the afternoon.', 'White Ribbon upstream is stocked — good for families wanting to keep fish.', 'Milldam Hollow is the solitude play — fish all day without seeing anyone.'],
    description: 'Outstanding wild trout water fed by Lane Spring. Home to Missouris famous September Brown Drake hatch. Adjacent White Ribbon for families. Lane Spring Rec Area has camping.'
  },
  {
    id: 'spring-creek', name: 'Spring Creek (Blue Ribbon)', category: 'wild-stream', ribbon: 'Blue Ribbon',
    region: 'central-ozarks', lat: 37.6880, lng: -92.0450, acres: null, streamMiles: 6.0,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Relfe Spring',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Flies and artificial lures ONLY. No soft plastics.', dailyLimit: 1, minSize: '18 inches', gearRestrictions: 'Flies and artificial lures only. Soft plastics prohibited.', specialRules: 'Blue Ribbon. Upper half crosses private property — watch for signs.' },
    access: [
      { name: 'Relfe Spring Access', lat: 37.6890, lng: -92.0440, type: 'parking', notes: 'Public access at Relfe Spring. Park at pulloff and walk down.' },
      { name: 'I-44 Exit 169 / CR 6410', lat: 37.6920, lng: -92.0400, type: 'parking', notes: 'Take Exit 169, follow CR 6410. Roadside access.' },
      { name: 'Lower Creek near Big Piney', lat: 37.6830, lng: -92.0520, type: 'entry', notes: 'Downstream end where Spring Creek enters Big Piney (~6mi from Relfe Spring).' }
    ],
    solitude: 'high', difficulty: 'moderate', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Early Caddis #16'], summer: ['Terrestrials', 'Caddis #14-16', 'Tiny BWO #22'], fall: ['BWO #16-22', 'Midges #18-24'], winter: ['Midges #22-26', 'BWO #20-24'] },
    topFlies: ['#18 Pheasant Tail', '#16 Parachute Adams', '#20 Midge Emerger', '#14 Elk Hair Caddis', '#16 Soft Hackle'],
    topLures: ['Micro inline spinner', 'Ultra-light spoon', 'Micro Rapala (brook trout)'], topBait: null,
    coachTips: ['Similar character to Blue Springs and Mill Creek — small, clear, demanding.', 'Fish typically 4-11 inches with occasional 14-inch specimen.', 'Long leaders, light tippet (6X-7X). Delicate presentations in low/clear flows.', 'Upper half crosses private property — respect posted signs.'],
    description: 'Spring-fed Blue Ribbon creek from Relfe Spring to Big Piney River. Six miles of wild trout. Small, clear, demanding. High solitude.'
  },
  {
    id: 'crane-creek', name: 'Crane Creek (Blue Ribbon)', category: 'wild-stream', ribbon: 'Blue Ribbon',
    region: 'southwest-ozarks', lat: 36.6954, lng: -93.3327, acres: null, streamMiles: 5.0,
    species: ['rainbow', 'brown'], waterType: 'spring-creek', flowSource: 'Multiple springs in Crane Creek CA',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Flies and artificial lures ONLY. No soft plastics.', dailyLimit: 1, minSize: '18 inches', gearRestrictions: 'Flies and artificial lures only. No soft plastics.', specialRules: 'Blue Ribbon. Conservation Area — check MDC access rules.' },
    access: [
      { name: 'Crane Creek CA Main Parking', lat: 36.6960, lng: -93.3310, type: 'parking', notes: 'Conservation area gravel parking. Walk to stream. Check MDC access rules.' },
      { name: 'Upper Crane Creek Trail', lat: 36.6980, lng: -93.3280, type: 'entry', notes: 'Upstream access via hiking trail. More solitude in upper reaches.' },
      { name: 'Lower Crane Creek Walk-In', lat: 36.6930, lng: -93.3350, type: 'entry', notes: 'Downstream section. Longer hike. Deeper pools hold bigger fish. True backcountry.' },
      { name: 'Hwy 13 Bridge Access', lat: 36.6945, lng: -93.3340, type: 'entry', notes: 'Roadside pulloff near Hwy 13. Quick access to middle section of Crane Creek.' }
    ],
    solitude: 'high', difficulty: 'moderate', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['BWO #16-20', 'Caddis #14-16', 'Midges #18-22'], summer: ['Caddis #14-16', 'Terrestrials', 'Sulphurs #16'], fall: ['BWO #16-22', 'Midges #18-22'], winter: ['Midges #22-26', 'BWO #20-24'] },
    topFlies: ['#16 Pheasant Tail', '#18 Zebra Midge', '#14 Elk Hair Caddis', '#16 Parachute Adams', '#12 Woolly Bugger'],
    topLures: ['Micro spinner', 'Small spoon', 'Small Rapala (rainbow trout)', 'Rebel Wee Craw (crawdad)'], topBait: null,
    coachTips: ['Crane Creek CA is in SW Ozarks — beautiful, remote, rarely crowded.', 'Wild rainbows and some brown trout. Fish deeper pools for browns.', 'Spring-fed, stays cool all summer. Fish year-round.', 'Access can be a hike. Good boots required.'],
    description: 'Wild trout in SW Ozarks Conservation Area. Remote, beautiful, rarely crowded. Both wild rainbow and brown trout.'
  },
  {
    id: 'north-fork-blue', name: 'North Fork White River (Blue Ribbon)', category: 'wild-stream', ribbon: 'Blue Ribbon',
    region: 'south-ozarks', lat: 36.7699, lng: -92.2295, acres: null, streamMiles: 7.0,
    species: ['rainbow', 'brown'], waterType: 'freestone-river', flowSource: 'Rainbow Springs + tributaries',
    usgsSiteId: '07057500', generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Flies and artificial lures ONLY. No soft plastics.', dailyLimit: 1, minSize: '18 inches', gearRestrictions: 'Flies and artificial lures only. Soft plastics excluded.', specialRules: 'Blue Ribbon: Rainbow Springs outlet → Patrick Bridge (~7mi). Trophy management.' },
    access: [
      { name: 'Rainbow Springs Access', lat: 36.7815, lng: -92.2105, type: 'parking', notes: 'Near Rainbow Springs outlet. Start of Blue Ribbon. Small gravel lot — arrive early. Cold spring branch enters here.' },
      { name: 'Hammond Camp', lat: 36.7745, lng: -92.2195, type: 'entry', notes: 'Walk-in access between Rainbow Springs and Kelly Ford. Primitive camping. Good wade fishing on gravel bars.' },
      { name: 'Kelly Ford', lat: 36.7680, lng: -92.2320, type: 'entry', notes: 'Popular float put-in. Low-water ford/crossing. Good wade access to prime riffles. Mid-Blue-Ribbon.' },
      { name: 'Twin Bridges Access', lat: 36.7640, lng: -92.2390, type: 'entry', notes: 'Between Kelly Ford and Patrick Bridge. Walk-in. Less pressure than Kelly Ford.' },
      { name: 'Patrick Bridge (Hwy CC)', lat: 36.7565, lng: -92.2475, type: 'parking', notes: 'End of Blue Ribbon / start of Red Ribbon. Bridge with parking both sides. Major put-in/take-out.' },
      { name: 'Blair Bridge', lat: 36.7420, lng: -92.2580, type: 'entry', notes: 'Float take-out. In Red Ribbon section. Good wade access to deep pools.' }
    ],
    solitude: 'medium', difficulty: 'moderate-hard', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['Stoneflies #8-14 (giant stones in March!)', 'Caddis #14-16', 'BWO #16-20', 'Midges #18-22'], summer: ['Yellow Sallies #14-16', 'Caddis #14-16', 'Terrestrials', 'Sulphurs #16-18'], fall: ['BWO #16-22', 'October Caddis #10-12', 'Midges #18-22'], winter: ['Midges #20-26', 'Winter stoneflies #14-16', 'BWO #18-24'] },
    topFlies: ['#8 Pat Rubber Legs (stonefly)', '#16 Pheasant Tail', '#14 Elk Hair Caddis', '#6 Sculpin (olive)', '#12 Woolly Bugger (black)'],
    topLures: ['1/8oz Rooster Tail', 'Mepps spinner (gold)', 'Small Rapala (rainbow trout)', 'Rapala Countdown CD-5 (brown trout)', 'Rebel Wee Craw (crawdad)'], topBait: null,
    coachTips: ['Arguably Missouris best wild trout water. Plan around hatches.', 'March stonefly hatch brings the biggest fish to the surface — dont miss.', 'Kelly Ford to Blair Bridge float is classic. Wade fish the spring branches for trophies.', 'Larger river — felt-sole wading boots essential. Slippery rocks.', 'Consider a float trip with a guide for first-timers.'],
    description: 'Missouris premier wild trout river. Blue Ribbon from Rainbow Springs to Patrick Bridge — 7 miles of trophy water. Famous March stonefly hatches. Wild rainbow and brown trout.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  RED RIBBON — Flies & artificial only, 2 fish, 15" min
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'north-fork-red', name: 'North Fork White River (Red Ribbon)', category: 'wild-stream', ribbon: 'Red Ribbon',
    region: 'south-ozarks', lat: 36.7550, lng: -92.2520, acres: null, streamMiles: 8.0,
    species: ['rainbow', 'brown'], waterType: 'freestone-river', flowSource: 'Althea Spring + Patrick Bridge',
    usgsSiteId: '07057500', generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Flies and artificial lures ONLY. No soft plastics.', dailyLimit: 2, minSize: '15 inches', gearRestrictions: 'Flies and artificial lures only. Soft plastics excluded.', specialRules: 'Red Ribbon: Patrick Bridge → downstream past Althea Spring. Stocked brown trout + trophy management.' },
    access: [
      { name: 'Patrick Bridge (Hwy CC)', lat: 36.7565, lng: -92.2475, type: 'parking', notes: 'Start of Red Ribbon. Bridge parking both sides. Float put-in.' },
      { name: 'Blair Bridge', lat: 36.7420, lng: -92.2580, type: 'parking', notes: 'Major access. Float take-out. Good wade access up and downstream.' },
      { name: 'Althea Spring Access', lat: 36.7380, lng: -92.2640, type: 'entry', notes: 'Spring branch — best trout concentration in Red Ribbon. Cold spring inflow. Dirt road access.' },
      { name: 'Norfork Access', lat: 36.7250, lng: -92.2780, type: 'entry', notes: 'Downstream Red Ribbon. More remote. Float access recommended.' },
      { name: 'Dawt Mill', lat: 36.7100, lng: -92.2950, type: 'parking', notes: 'Historic mill site. End of Red Ribbon area. Lodging and canoe rental available. Float take-out.' }
    ],
    solitude: 'medium', difficulty: 'moderate', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['Stoneflies #8-14', 'Caddis #14-16', 'BWO #16-20'], summer: ['Yellow Sallies #14', 'Caddis', 'Terrestrials'], fall: ['BWO #16-22', 'October Caddis #10', 'Streamers for pre-spawn browns'], winter: ['Midges #20-26', 'Winter stones #14-16'] },
    topFlies: ['#8 Rubber Legs', '#16 Pheasant Tail', '#8 Woolly Bugger', '#6 Sculpin', '#14 Glo-Bug'],
    topLures: ['1/8oz Rooster Tail', 'Mepps spinner', 'Small Rapala (brown trout)', 'Rapala Countdown CD-5 (gold)', 'Small crankbait (crawdad)'], topBait: null,
    coachTips: ['Red Ribbon has stocked browns over wild fish — trophy-class potential.', 'Oct-Nov prime for big browns. Streamers at dawn and dusk.', 'Best water: Patrick Bridge downstream past Althea Spring.', 'Less fished than Blue Ribbon. Want solitude on the North Fork? Fish Red Ribbon.'],
    description: 'Red Ribbon section of North Fork. Stocked browns over wild fish create trophy opportunities. Less crowded than Blue Ribbon. 2 fish daily, 15" minimum.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  WHITE RIBBON — General methods, 4 fish daily, stocked
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'little-piney-white', name: 'Little Piney Creek (White Ribbon)', category: 'stocked-stream', ribbon: 'White Ribbon',
    region: 'central-ozarks', lat: 37.7150, lng: -91.9050, acres: null, streamMiles: 3.0,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Lane Spring + Hwy 63 corridor',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'No bait restrictions.', dailyLimit: 4, minSize: null, gearRestrictions: 'All legal methods including bait.', specialRules: 'White Ribbon — stocked. Adjacent Blue Ribbon downstream.' },
    access: [
      { name: 'Lane Spring Recreation Area', lat: 37.7095, lng: -91.9100, type: 'parking', notes: 'Same parking as Blue Ribbon. $2 fee. Walk upstream for White Ribbon.' },
      { name: 'Hwy 63 Bridge Pull-Off', lat: 37.7120, lng: -91.9060, type: 'parking', notes: 'Roadside pulloff. Quick access, good for families.' }
    ],
    solitude: 'medium', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Caddis #14-16', 'Midges #18-22'], summer: ['Caddis', 'Terrestrials'], fall: ['BWO #16-22', 'Midges'], winter: ['Midges #22-26'] },
    topFlies: ['#14 Hares Ear', '#16 Pheasant Tail', '#12 Woolly Bugger', '#14 Elk Hair Caddis'],
    topLures: ['1/8oz Rooster Tail', 'Panther Martin', 'Trout Magnet (white)', 'Small crankbait', 'Rapala Original F3 (rainbow trout)', 'Rebel Wee Craw (crawdad)'],
    topBait: ['PowerBait (chartreuse/rainbow)', 'Whole kernel corn', 'Nightcrawlers', 'Salmon eggs'],
    coachTips: ['Great family destination. Stocked trout less picky — PowerBait and corn work well.', 'Kids? Set them up at Hwy 63 bridge. Easy access, bankside fishing.', 'Great intro to trout before graduating to Blue Ribbon downstream.', 'Stocking schedule varies — check MDC for dates.'],
    description: 'Stocked White Ribbon near Lane Spring. All methods, 4 fish daily. Perfect intro to trout fishing. Family friendly with easy access.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  MAJOR TROUT RIVERS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'current-river', name: 'Current River', category: 'river', ribbon: 'Blue Ribbon — Trophy Brown',
    region: 'eastern-ozarks', lat: 37.3059, lng: -91.4094, acres: null, streamMiles: 50, avgStreamWidth: 15,
    species: ['rainbow', 'brown'], waterType: 'river', flowSource: 'Welch Spring, Cave Spring, Blue Spring, Pulltite + many',
    usgsSiteId: '07066000', generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Varies by section. Check MDC for specific reach.', dailyLimit: 4, minSize: 'Varies', gearRestrictions: 'Some sections fly/artificial only. Others all methods.', specialRules: 'National Scenic Riverway. Federal + state regulations.' },
    access: [
      // ── BLUE RIBBON REACH DEFINITIONS ──────────────────────────────────
      // Boundaries user-verified 2026-02-24 from field GPS coordinates (DMS → decimal)
      // zoneBounds: [[upstream lat,lng], [downstream lat,lng]]
      // Park End / Blue Ribbon Start: 37°26'59.33"N 91°40'16.92"W = 37.44981, -91.67137
      // Tan Vat boundary:             37°27'02.31"N 91°39'41.87"W = 37.45064, -91.66163
      // Baptist Camp boundary:         37°26'07.42"N 91°39'25.70"W = 37.43539, -91.65714
      // Cedar Grove boundary:          37°25'20.22"N 91°36'30.53"W = 37.42228, -91.60848
      { name: 'Blue Ribbon — Park Boundary Headwaters', lat: 37.44981, lng: -91.67137, type: 'zone', zoneId: 'park-boundary', methods: ['fly', 'spin'], zoneBounds: [[37.44981, -91.67137], [37.45064, -91.66163]], habitat: 'riffle-run-pool', clarity: 'gin-clear', depth: 'medium-deep', pressure: 'moderate', notes: 'Park boundary headwaters to Tan Vat. Blue Ribbon water — flies and artificial lures only, 1 fish, 18" min. TROPHY BROWN TROUT WATER. Cold, gin-clear spring-fed flow holds both stocked rainbows drifting from Montauk Spring and wild brown trout that ambush from undercut banks and boulder shadows. Highest trout density on the Current. Dawn and dusk are prime for big browns.' },
      { name: 'Blue Ribbon — Tan Vat', lat: 37.45064, lng: -91.66163, type: 'zone', zoneId: 'tan-vat', methods: ['fly', 'spin'], zoneBounds: [[37.45064, -91.66163], [37.43539, -91.65714]], habitat: 'run-pool', clarity: 'clear', depth: 'medium', pressure: 'low', notes: 'Tan Vat to Baptist Camp. Blue Ribbon water. PREMIER TROPHY BROWN TROUT REACH. Wild browns hold in deep pools, spring seeps, and under log jams. Stocked rainbows migrate down from Montauk. Cold spring inflows create thermal refuges where big browns stack up year-round. Excellent solitude — remote gravel road access only. Best wild brown trout water on the main Current.' },
      { name: 'Blue Ribbon — Baptist Camp', lat: 37.43539, lng: -91.65714, type: 'zone', zoneId: 'baptist-camp', methods: ['fly', 'spin'], zoneBounds: [[37.43539, -91.65714], [37.42808, -91.63813]], habitat: 'riffle-run', clarity: 'clear', depth: 'medium', pressure: 'low', notes: 'Baptist Camp to Cedar Grove upper. Blue Ribbon water. Trophy brown trout country. Wild browns patrol deep runs and undercut ledges. Spring seeps along banks create cold-water sanctuaries. Sculpin and crayfish populations fuel trophy growth.' },
      { name: 'Blue Ribbon — Cedar Grove', lat: 37.42228, lng: -91.60848, type: 'zone', zoneId: 'cedar-grove', methods: ['fly', 'spin'], zoneBounds: [[37.42808, -91.63813], [37.42228, -91.60848]], habitat: 'riffle-run', clarity: 'clear', depth: 'medium', pressure: 'low', notes: 'Cedar Grove lower reach. Blue Ribbon water. REMOTE trophy brown trout country. Wild browns patrol deep runs and undercut ledges. Gravel bar camping. True backcountry solitude. Low pressure means big, educated browns.' },
      { name: 'Reach 4 — Welch Spring Corridor (Cedar Grove → Akers)', lat: 37.3785, lng: -91.5620, type: 'zone', methods: ['fly', 'spin', 'bait'], zoneBounds: [[37.42228, -91.60848], [37.3440, -91.4960]], habitat: 'riffle-run', clarity: 'clear', depth: 'medium', pressure: 'low', notes: 'Cedar Grove to Akers Ferry. Welch Spring (121 cfs) enters mid-reach — its spring branch holds wild trout. Main river has mixed trout and smallmouth. Float-fishing territory. Remote and beautiful.' },
      { name: 'Reach 5 — Middle Current (Akers → Round Spring)', lat: 37.3110, lng: -91.4385, type: 'zone', methods: ['fly', 'spin', 'bait'], zoneBounds: [[37.3440, -91.4960], [37.2780, -91.3810]], habitat: 'run-pool', clarity: 'clear', depth: 'medium-deep', pressure: 'moderate', notes: 'Akers Ferry to Round Spring. ~10 miles. Transition zone — trout near cold spring inputs, increasing smallmouth. Pulltite Spring branch holds trout. Heavy canoe traffic in summer. Fish early/late.' },
      { name: 'Reach 6 — Blue Spring Section (Round Spring → Two Rivers)', lat: 37.2660, lng: -91.3725, type: 'zone', methods: ['fly', 'spin', 'bait'], zoneBounds: [[37.2780, -91.3810], [37.2540, -91.3640]], habitat: 'pool-run', clarity: 'clear', depth: 'deep', pressure: 'moderate', notes: 'Round Spring to Two Rivers confluence. ~5 miles. Blue Spring (Missouris deepest at 310ft) — spring branch holds trout year-round. Main river primarily smallmouth with seasonal trout near spring mouths. Jacks Fork enters at Two Rivers.' },

      // ── ACCESS POINTS ─────────────────────────────────────────────────
      { name: 'Montauk State Park (Park End)', lat: 37.44981, lng: -91.67137, type: 'parking', verified: true, notes: 'Park boundary / Blue Ribbon start. Upper Current begins here. Float downstream into Blue Ribbon water.' },
      { name: 'Tan Vat Access', lat: 37.45064, lng: -91.66163, type: 'entry', verified: true, notes: 'Blue Ribbon boundary. Downstream of Montauk via CR 119. Named for old tanning vat. Gravel road. Wild trout in spring branches.' },
      { name: 'Baptist Camp', lat: 37.43539, lng: -91.65714, type: 'entry', verified: true, notes: 'Blue Ribbon boundary. Walk-in access downstream. Deeper pools, quieter water. Some private land — check signs.' },
      { name: 'Cedar Grove', lat: 37.42228, lng: -91.60848, type: 'entry', verified: true, notes: 'Blue Ribbon end / downstream boundary. Remote access. Excellent solitude and wild trout. Gravel bar camping.' },
      { name: 'Welch Spring', lat: 37.3700, lng: -91.5580, type: 'entry', notes: 'Major spring branch (121 cfs average). Wild trout. Walk-in 0.5mi from Hwy KK. Remote.' },
      { name: 'Akers Ferry', lat: 37.3440, lng: -91.4960, type: 'parking', notes: 'NPS campground and historic ferry crossing. Major float put-in/take-out. Canoe rental. Ranger station.' },
      { name: 'Pulltite Spring', lat: 37.3180, lng: -91.4180, type: 'parking', notes: 'NPS launch and campground. Good wade fishing near spring mouth. Float access.' },
      { name: 'Round Spring', lat: 37.2780, lng: -91.3810, type: 'parking', notes: 'NPS campground. Ranger-led cave tours in summer. Good base for multi-day floats.' },
      { name: 'Two Rivers (Current + Jacks Fork)', lat: 37.2540, lng: -91.3640, type: 'parking', notes: 'NPS campground at confluence of Current and Jacks Fork rivers. Float junction point.' },
      { name: 'Blue Spring (Current)', lat: 37.2450, lng: -91.3570, type: 'entry', notes: 'Missouris deepest spring (310ft). Spring branch holds trout. Hiking trail access.' },
      { name: 'Big Spring', lat: 36.9620, lng: -90.9880, type: 'parking', notes: 'One of Americas largest springs (277M gal/day). NPS campground, CCC structures. Lower Current River. Major access.' },
      { name: 'Van Buren Access', lat: 36.9910, lng: -91.0150, type: 'parking', notes: 'NPS headquarters town. Hwy 60 bridge. Float take-out. Canoe liveries. Services.' }
    ],
    // ── 7 Hotspot Holding Areas — Blue Ribbon Trophy Brown Trout Zone ──
    // OSM Way 162645228 — all coordinates from real river nodes, verified 2026-02-25
    // Each hotspot tagged with zoneId — only deploys when that zone is checked in
    hotspots: [
      { name: 'Park End Riffle', lat: 37.44594, lng: -91.67011, habitat: 'riffle', zoneId: 'park-boundary', notes: 'Fast riffle water just below the park boundary (OSM node[11], 498m). Brown trout ambush from behind boulders and ledge cuts at dawn and dusk. Rainbows feed in the faster current seams. Dead-drift nymphs or swing a sculpin pattern tight to structure.' },
      { name: 'Spring Seep Bend', lat: 37.44962, lng: -91.66291, habitat: 'pool', zoneId: 'park-boundary', notes: 'Deep bend pool at the first big oxbow (OSM node[28], 1391m). Wild browns stack year-round in the thermal break. The deepest water in Zone 1. Strip a Woolly Bugger along the far bank or dead-drift a scud in the seep current.' },
      { name: 'Tan Vat Undercut', lat: 37.44513, lng: -91.65624, habitat: 'run', zoneId: 'tan-vat', notes: 'Deep run with undercut limestone ledges below Tan Vat (OSM node[53], 2372m). Trophy browns hold tight under overhanging rock. Low-light ambush water. Swing streamers or bounce a weighted sculpin along the ledge face.' },
      { name: 'Log Jam Pool', lat: 37.43678, lng: -91.65744, habitat: 'pool', zoneId: 'tan-vat', notes: 'Large pool with downed timber near Baptist Camp boundary (OSM node[68], 3333m). Structure-oriented browns prowl the shadows. Dead-drift a sculpin pattern along the log edges. Rainbows stack in the tailout.' },
      { name: 'Baptist Camp Riffle', lat: 37.42909, lng: -91.64967, habitat: 'riffle', zoneId: 'baptist-camp', notes: 'Long productive riffle in mid reach (OSM node[149], 5836m). Both species feed aggressively during hatches. Browns hold in deeper slots between gravel bars. Match the hatch with dries or swing soft hackles.' },
      { name: 'Sculpin Ledge Run', lat: 37.42821, lng: -91.63281, habitat: 'run', zoneId: 'cedar-grove', notes: 'Deep bedrock ledge run in remote Cedar Grove water (OSM node[272], 9311m). Browns hunt sculpin and crayfish along the ledge face. Drift a weighted Muddler Minnow or Sculpin Zonker tight to the rock. Prime trophy water.' },
      { name: 'Cedar Grove Tailout', lat: 37.42689, lng: -91.61539, habitat: 'tailout', zoneId: 'cedar-grove', notes: 'Broad tailout approaching Cedar Grove access (OSM node[360], 12822m). Big browns push up from deep holding water at dusk to feed on emergers and baitfish. Evening dry fly and streamer action. Remote backcountry.' }
    ],
    // ── Stream Path — Blue Ribbon Section (Park End → Cedar Grove) ──
    // OSM Way 162645228 — Current River (waterway=river), 387 nodes clipped to Blue Ribbon
    // Distance-based subsampled to 25 points at ~530m avg spacing, total 12,200m (7.58 mi)
    // Verified 2026-02-25 — start node 7m from Park End boundary, end node 15m from Cedar Grove
    streamPath: [
      [37.4497106,-91.6714732],[37.4453721,-91.6690674],[37.4480262,-91.6643295],
      [37.4494265,-91.6594773],[37.4451319,-91.6562376],[37.4401075,-91.6561601],
      [37.4353039,-91.6574222],[37.4368198,-91.6525388],[37.4376782,-91.6480224],
      [37.4327911,-91.6479338],[37.4290878,-91.6496744],[37.4242675,-91.6493755],
      [37.4206338,-91.6454790],[37.4229811,-91.6420474],[37.4270982,-91.6437632],
      [37.4280803,-91.6381285],[37.4282088,-91.6328115],[37.4325864,-91.6299039],
      [37.4368143,-91.6298449],[37.4376083,-91.6235757],[37.4357771,-91.6184135],
      [37.4315608,-91.6142255],[37.4268901,-91.6153878],[37.4221917,-91.6142101],
      [37.4222591,-91.6083173]
    ],
    // bankWidths: [leftMeters, rightMeters] — Current River Blue Ribbon, widens downstream
    // Upper (Park End): ~14-15m total. Mid: ~15-17m. Lower (Cedar Grove): ~18-20m.
    bankWidths: [
      [7.0,7.5],[7.0,7.0],[7.0,7.5],[7.5,7.0],[7.0,7.5],
      [7.5,7.5],[7.5,8.0],[7.5,7.5],[8.0,7.5],[8.0,8.0],
      [7.5,8.0],[8.0,8.5],[8.5,8.0],[8.0,8.5],[8.5,8.5],
      [8.5,9.0],[9.0,8.5],[8.5,9.0],[9.0,9.0],[9.0,9.5],
      [9.5,9.0],[9.0,9.5],[9.5,9.5],[9.5,10.0],[10.0,9.5]
    ],
    solitude: 'medium', difficulty: 'moderate', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['BWO #16-20', 'Caddis #14-16', 'Stoneflies #8-12', 'March Browns #12-14', 'Sculpin activity (brown trout key forage)'], summer: ['Caddis #14-16', 'Terrestrials (hoppers, beetles, ants)', 'Sulphurs #16-18', 'Crayfish movement at dusk (trophy browns)'], fall: ['BWO #16-20', 'October Caddis #8-10', 'Midges #18-22', 'Brown trout spawn — handle with care, big fish on the move'], winter: ['Midges #20-24', 'BWO #18-22', 'Sculpin/streamer season — trophy browns feed aggressively in cold water'] },
    topFlies: ['#6 Sculpin Streamer (brown trout killer)', '#8 Olive Zonker (trophy browns)', '#4 Articulated Streamer (big brown hunter)', '#10 Muddler Minnow (sculpin imitation)', '#8 Black Woolly Bugger (weighted — swing deep)', '#12 Crayfish Pattern (brown trout staple)', '#14 Pheasant Tail (bread and butter)', '#14 Elk Hair Caddis (hatch matcher)', '#16 Parachute Adams (all-purpose dry)', '#18 Zebra Midge (year-round producer)'],
    topLures: ['1/4oz Rooster Tail', 'Rapala Countdown CD-5 (rainbow + brown)', 'Rapala Original F5 (trophy brown minnow)', 'Mepps Aglia #2 (brown trout gold)', 'Rebel Wee Craw (crayfish — browns love it)', 'Small crankbait (shad pattern)'],
    topBait: ['Nightcrawlers', 'Crawfish tails', 'Corn (where legal)'],
    coachTips: ['TROPHY BROWN TROUT WATER — the Blue Ribbon zones hold wild browns that rival any in the Ozarks.', 'Dawn and dusk are your windows. Big browns are low-light predators — be on the water before sunrise.', 'Dead-drift a sculpin streamer tight to undercut banks and ledges. Trophy browns ambush from shadow.', 'Spring seeps create thermal refuges — look for temperature breaks where cold water enters. Browns stack there.', 'Fall is prime time — brown trout spawn Oct-Nov. Big fish are aggressive but handle spawners with care.', 'The Current River is a national treasure. Blue Ribbon regulations protect trophy fish — 1 trout, 18" minimum.', 'Canoe traffic heavy in summer. Fish early morning or late evening for solitude and active browns.', 'Rainbows from Montauk drift into Blue Ribbon water. You will catch both species — be ready for either.'],
    description: 'Ozark National Scenic Riverway — Missouri\'s premier trophy brown trout river. Blue Ribbon zones from Park End to Cedar Grove hold wild brown trout in gin-clear, spring-fed water. Stocked rainbows from Montauk Spring add diversity. 18" minimum, 1 fish limit. Sculpin, crayfish, and classic Ozark hatches fuel trophy growth. Same check-in flow as Montauk — hotspot pins deploy across all 3 Blue Ribbon reaches.'
  },
  {
    id: 'eleven-point', name: 'Eleven Point River', category: 'river', ribbon: 'White/Blue Mix',
    region: 'south-ozarks', lat: 36.7861, lng: -91.5186, acres: null, streamMiles: 30,
    species: ['rainbow', 'brown'], waterType: 'river', flowSource: 'Greer Spring (220M gal/day — 2nd largest in MO)',
    usgsSiteId: '07071500', generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Varies by section.', dailyLimit: 4, minSize: 'Varies', gearRestrictions: 'Some sections restricted to flies/lures.', specialRules: 'Wild and Scenic River. Section-specific regulations.' },
    access: [
      { name: 'Thomasville Access', lat: 36.7830, lng: -91.5140, type: 'parking', notes: 'Upper Eleven Point near Thomasville. Float put-in. Hwy 99 bridge. Services in town.' },
      { name: 'Greer Spring Trailhead', lat: 36.7650, lng: -91.3580, type: 'entry', notes: 'Hike 1.5mi to Greer Spring — Missouris 2nd largest (220M gal/day). Wild trout in spring branch. USFS trailhead off CR 1B / Hwy 19.' },
      { name: 'Greer Crossing', lat: 36.7580, lng: -91.3520, type: 'parking', notes: 'River access near Greer Spring confluence. Float put-in/take-out. USFS campground.' },
      { name: 'Turner Mill South', lat: 36.7700, lng: -91.4500, type: 'parking', notes: 'Float launch on middle section. Good wade fishing upstream toward Greer influence.' },
      { name: 'Riverton Access', lat: 36.7750, lng: -91.4950, type: 'parking', notes: 'Popular float access upstream section. Good camping nearby.' },
      { name: 'Mary Decker Shoal', lat: 36.7400, lng: -91.3200, type: 'entry', notes: 'Downstream of Greer Crossing. Walk-in shoal access. Excellent smallmouth + trout water.' },
      { name: 'Boze Mill', lat: 36.7100, lng: -91.2800, type: 'parking', notes: 'Lower Eleven Point access. Float take-out. Near Hwy 142 bridge. Good trout fishing near remaining spring influence.' }
    ],
    solitude: 'high', difficulty: 'moderate', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['BWO', 'Caddis', 'Stoneflies', 'Midges'], summer: ['Caddis', 'Terrestrials'], fall: ['BWO', 'October Caddis'], winter: ['Midges', 'BWO'] },
    topFlies: ['#14 Woolly Bugger', '#16 Pheasant Tail', '#14 Elk Hair Caddis', '#12 Muddler Minnow'],
    topLures: ['Rooster Tail', 'Mepps spinner', 'Small Rapala (rainbow trout)', 'Rapala Countdown CD-5 (gold)', 'Rebel Wee Craw (crawdad)'],
    topBait: ['Nightcrawlers', 'PowerBait'],
    coachTips: ['Greer Spring is world-class. The spring branch is cold, clear, and holds wild trout.', 'Wild and Scenic River — one of Missouris most beautiful floats.', 'Less pressure than Current River. If you want solitude, this is it.', 'Multi-day float trips here are transcendent. Plan 2-3 days.'],
    description: 'Wild and Scenic River fed by Greer Spring — Missouris 2nd largest at 220M gal/day. Wild trout in spring branches. Less crowded than Current. Exceptional solitude.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  TAILWATERS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'lake-taneycomo-z1', name: 'Lake Taneycomo — Zone 1 (Fly/Lure Only)', category: 'tailwater', ribbon: 'Special Management',
    region: 'southwest-mo', lat: 36.6310, lng: -93.3140, acres: null, streamMiles: 3.0,
    species: ['rainbow', 'brown'], waterType: 'tailwater', flowSource: 'Table Rock Dam releases',
    usgsSiteId: '07053810', generationWarning: true, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Artificial flies and lures ONLY. No soft plastics.', dailyLimit: 4, minSize: 'RB: <12" or >20". BN: >20" to keep.', gearRestrictions: 'Flies and artificial lures only. Soft plastics prohibited.', specialRules: 'Zone 1: 760ft below dam → Fall Creek. Only 1 brown in limit. DANGER: Dam generation changes flows — EXIT WATER when sirens sound.' },
    access: [
      { name: 'Table Rock Dam Parking (Corps)', lat: 36.6295, lng: -93.3185, type: 'parking', notes: 'US Army Corps of Engineers parking below dam. Walk to wade water. Check generation schedule.' },
      { name: 'Shepherd of the Hills Hatchery', lat: 36.6310, lng: -93.3150, type: 'parking', notes: 'MDC hatchery parking. Trail to stream. Free tours. Tackle shop. Best lot for Zone 1 fishing.' },
      { name: 'Hatchery Outflow / Upper Zone 1', lat: 36.6315, lng: -93.3135, type: 'entry', notes: 'Directly below hatchery outflow. High trout concentration. Cold water year-round. Crowded weekends.' },
      { name: 'Trophy Run Area', lat: 36.6330, lng: -93.3080, type: 'entry', notes: 'Wade downstream from dam past the initial crowded stretch. Better fish past first quarter-mile.' },
      { name: 'Fall Creek Access (Zone 1/2 boundary)', lat: 36.6350, lng: -93.2980, type: 'entry', notes: 'Near Fall Creek — Zone 1/Zone 2 transition. Last fly-only water before general methods zone.' }
    ],
    solitude: 'low', difficulty: 'moderate', wadingRequired: true, familyFriendly: false,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['Midges #18-24', 'Scuds/Sowbugs', 'Caddis #16-18 (Apr-May)'], summer: ['Midges #20-26', 'Scuds #14-16'], fall: ['Midges #18-24', 'Streamers for pre-spawn browns (Oct-Nov)'], winter: ['Midges #20-26', 'Scuds #14-16', 'Sowbugs #14-16'] },
    topFlies: ['#16 Scud (tan/orange)', '#18 Sowbug (gray)', '#20 Zebra Midge', '#14 Copper John', '#8 Woolly Bugger (black)'],
    topLures: ['Micro jig (white/pink)', 'Marabou jig 1/32oz', 'Small inline spinner', 'Rapala Countdown CD-3 (rainbow trout)', 'Small crankbait (shad)'], topBait: null,
    coachTips: ['World-class tailwater. Trout fat and strong from constant scuds/sowbugs.', 'SAFETY FIRST: When sirens sound, GET OUT OF THE WATER. Flows rise in minutes.', 'Check generation schedule: swl-wc.usace.army.mil for Table Rock releases.', 'Fish scuds/sowbugs #14-16 dead-drifted near bottom — 90% of their diet.', 'Walk past the first quarter-mile for better fish and less pressure.', 'Pre-spawn brown trout Oct-Nov is world-class. Big streamers dawn/dusk.', 'Night fishing legal and productive for trophy browns.'],
    description: 'World-class tailwater below Table Rock Dam. Zone 1 fly/lure only. Fat trout on scuds/sowbugs year-round. DANGER: Dam releases change flows rapidly.'
  },
  {
    id: 'lake-taneycomo-z2', name: 'Lake Taneycomo — Zone 2 (General)', category: 'tailwater', ribbon: 'Special Management',
    region: 'southwest-mo', lat: 36.6500, lng: -93.2400, acres: null, streamMiles: 20,
    species: ['rainbow', 'brown'], waterType: 'tailwater', flowSource: 'Table Rock Dam releases',
    usgsSiteId: '07053810', generationWarning: true, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'No bait restrictions.', dailyLimit: 4, minSize: 'Browns >20" to keep. No rainbow size restriction.', gearRestrictions: 'All legal methods including bait.', specialRules: 'Zone 2: Fall Creek → Powersite Dam (~20mi). Only 1 brown in limit.' },
    access: [
      { name: 'Fall Creek Marina Area', lat: 36.6350, lng: -93.2980, type: 'parking', notes: 'Zone 1/2 transition. Marina access and docks. Boat rental available.' },
      { name: 'Lilley\'s Landing Resort & Marina', lat: 36.6370, lng: -93.2900, type: 'parking', notes: 'Premier fly fishing guide headquarters. Dock fishing. Boat rental. Fly shop on-site.' },
      { name: 'Branson Landing', lat: 36.6430, lng: -93.2200, type: 'parking', notes: 'Downtown Branson waterfront. Guide services, dock fishing, walks along the lake. Marina access.' },
      { name: 'Rockaway Beach', lat: 36.6800, lng: -93.1700, type: 'parking', notes: 'Mid-lake. Less crowded, good bank fishing. Family area with beach access.' },
      { name: 'Taneycomo Lakefront / Midway', lat: 36.6600, lng: -93.1950, type: 'entry', notes: 'Mid-section access. Various resorts with dock fishing. Boat access points.' },
      { name: 'Forsyth / Powersite Dam', lat: 36.6850, lng: -93.1200, type: 'parking', notes: 'Lower end at Powersite Dam. Dam tailwater area. Good fishing year-round.' }
    ],
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['Scud/Sowbug dominant'], summer: ['Scuds/Sowbugs', 'Midges'], fall: ['Streamers for browns', 'Scuds/Sowbugs'], winter: ['Scuds/Sowbugs', 'Midges'] },
    topFlies: ['#16 Scud (tan)', '#18 Sowbug', '#14 Glo-Bug', '#12 San Juan Worm', '#8 Woolly Bugger'],
    topLures: ['1/8oz Rooster Tail', 'Small crankbait', 'Marabou jig', 'Trout Magnet', 'Rapala Original F5 (rainbow trout)', 'Rebel Wee Craw (crawdad)'],
    topBait: ['PowerBait (variety)', 'Nightcrawlers', 'Wax worms', 'Corn'],
    coachTips: ['Zone 2 is family-friendly — bait legal, easy dock/bank access.', 'Guide boat trip is the best way to fish the lower 20 miles.', 'PowerBait under a bobber from a dock = family memories.', 'You WILL catch fish here. One of Americas most productive trout fisheries.', 'Same generation safety warning applies. Check flows.'],
    description: 'Lower 20mi of Taneycomo. All methods including bait. Best from boat or dock. Family-friendly. Guide services in Branson.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  WINTER URBAN TROUT LAKES — MDC Stocking Program
  // ═══════════════════════════════════════════════════════════════════════

  // KC Metro
  { id: 'chaumiere-lake', name: 'Chaumiere Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'kc-metro', lat: 39.1380, lng: -94.5710, acres: 5, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions. 3 poles.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: 'Check MDC stocking dates.' }, access: [{ name: 'Chaumiere Woods Park', lat: 39.1385, lng: -94.5700, type: 'parking', notes: 'North KC. Easy parking, short walk.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger (white)', '#14 San Juan Worm'], topLures: ['Rooster Tail', 'Trout Magnet', 'Small spoon'], topBait: ['PowerBait (rainbow)', 'Nightcrawlers', 'Corn', 'Wax worms'], coachTips: ['Arrive early stocking day. PowerBait under a bobber is deadly.', 'Great for kids. Easy access, guaranteed fish after stocking.'], description: '5-acre lake in North KC. MDC winter trout program.' },
  { id: 'coot-lake', name: 'Coot Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'kc-metro', lat: 38.9200, lng: -94.3750, acres: 22, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions. 3 poles.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: 'James A Reed WA hours apply.' }, access: [{ name: 'James A Reed WA', lat: 38.9205, lng: -94.3740, type: 'parking', notes: 'Lees Summit. Follow signs.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger'], topLures: ['Rooster Tail', 'Trout Magnet', 'Kastmaster'], topBait: ['PowerBait', 'Nightcrawlers', 'Corn'], coachTips: ['22 acres — largest KC metro trout lake. Fish deeper water.', 'Check James A Reed WA hours before going.'], description: '22-acre lake in James A Reed WA, Lees Summit. KC metros largest winter trout lake.' },
  { id: 'plover-lake', name: 'Plover Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'kc-metro', lat: 38.9180, lng: -94.3780, acres: 15, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions. 3 poles.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: 'James A Reed WA hours.' }, access: [{ name: 'James A Reed WA - Plover', lat: 38.9185, lng: -94.3770, type: 'parking', notes: 'Adjacent to Coot Lake.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger'], topLures: ['Rooster Tail', 'Trout Magnet'], topBait: ['PowerBait', 'Nightcrawlers'], coachTips: ['15ac next to Coot Lake. Fish both in a day.'], description: '15-acre lake in James A Reed WA. Adjacent to Coot Lake.' },
  { id: 'capfed-ponds', name: 'Capital Federal Sports Complex', category: 'winter-lake', ribbon: 'Winter Program', region: 'kc-metro', lat: 39.2460, lng: -94.4200, acres: 3, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions. 3 poles.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: null }, access: [{ name: 'Sports Complex Parking', lat: 39.2465, lng: -94.4190, type: 'parking', notes: 'Liberty, MO. Baseball park ponds.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Trout Magnet', 'Small spoon'], topBait: ['PowerBait', 'Corn', 'Nightcrawlers'], coachTips: ['Small ponds. Quick trip after school or work.'], description: 'Small ponds in Liberty, MO. Easy winter trout.' },
  { id: 'cleveland-lake', name: 'Cleveland Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'kc-metro', lat: 38.8120, lng: -94.5320, acres: 5, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions. 3 poles.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: null }, access: [{ name: 'Cleveland Lake Parking', lat: 38.8125, lng: -94.5310, type: 'parking', notes: 'Belton, south of Belton HS.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Rooster Tail', 'Trout Magnet'], topBait: ['PowerBait', 'Nightcrawlers'], coachTips: ['Neighborhood lake in Belton. Low-key spot.'], description: 'Neighborhood lake in Belton. Convenient south KC metro winter trout.' },
  { id: 'jesse-james-lake', name: 'Jesse James Park Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'kc-metro', lat: 39.3680, lng: -94.3550, acres: 4, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions. 3 poles.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: null }, access: [{ name: 'Jesse James Park', lat: 39.3685, lng: -94.3540, type: 'parking', notes: 'Hwy 33, Kearney/Liberty.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Trout Magnet'], topBait: ['PowerBait', 'Nightcrawlers', 'Corn'], coachTips: ['Named after the outlaw. History + fishing outing with kids.'], description: 'Lake in Jesse James Park, Kearney/Liberty area. Winter trout.' },
  { id: 'johnston-lake', name: 'Johnston Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'kc-metro', lat: 38.8100, lng: -94.4580, acres: 3, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions. 3 poles.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: null }, access: [{ name: 'Hawk Ridge Park', lat: 38.8105, lng: -94.4570, type: 'parking', notes: 'Raymore MO.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Trout Magnet'], topBait: ['PowerBait', 'Nightcrawlers'], coachTips: ['Small but productive. Less pressure than bigger KC lakes.'], description: 'Small lake in Hawk Ridge Park, Raymore. Quieter south KC option.' },

  // STL Metro
  { id: 'boathouse-lake', name: 'Boathouse Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'stl-metro', lat: 38.5655, lng: -90.2630, acres: 8, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: null }, access: [{ name: 'Carondelet Park Parking', lat: 38.5660, lng: -90.2620, type: 'parking', notes: 'Carondelet Park, STL. Off Loughborough from I-55 exit 202C.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger'], topLures: ['Rooster Tail', 'Trout Magnet'], topBait: ['PowerBait', 'Nightcrawlers', 'Corn'], coachTips: ['8ac right in St. Louis. Fish deeper center for stocked trout.'], description: '8-acre lake in Carondelet Park, St. Louis.' },
  { id: 'busch-ca-lakes', name: 'Busch CA (Lakes 3, 21, 22, 23, 28)', category: 'winter-lake', ribbon: 'Seasonal Mixed', region: 'stl-metro', lat: 38.7100, lng: -90.7300, acres: 550, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'Lakes 3/22/23: no restrictions, limit 4. Lakes 21/28: Nov-Jan C&R (flies/artificial/unscented soft plastics), Feb+ limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Varies by lake.', specialRules: '7000-acre CA. 28 fishable lakes. Trout in 5.' }, access: [{ name: 'Busch CA Park Office', lat: 38.7110, lng: -90.7280, type: 'parking', notes: 'Get area map at office.' }], solitude: 'medium', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger', '#14 San Juan Worm'], topLures: ['Rooster Tail', 'Kastmaster', 'Trout Magnet'], topBait: ['PowerBait', 'Nightcrawlers', 'Corn'], coachTips: ['Massive CA west of STL. Fish multiple lakes in a day.', 'Lakes 21 & 28 have C&R through January.', 'Get area map at office — lakes are spread out.'], description: '7000-acre CA west of STL with 5 trout lakes. Lakes 21/28 seasonal C&R. Excellent variety.' },
  { id: 'suson-park-lakes', name: 'Carp Lake & Island Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'stl-metro', lat: 38.4950, lng: -90.3500, acres: 8, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: 'Suson Park. Two lakes: 1.5ac + 6.5ac.' }, access: [{ name: 'Suson Park', lat: 38.4955, lng: -90.3490, type: 'parking', notes: 'South STL. I-55 exit 193 → Meramec Bottom Rd → Wells Rd.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Trout Magnet', 'Small spoon'], topBait: ['PowerBait', 'Nightcrawlers', 'Corn'], coachTips: ['Two lakes. Island Lake (6.5ac) has more room.'], description: 'Two lakes in Suson Park, south STL.' },
  { id: 'january-wabash', name: 'January-Wabash Lake', category: 'winter-lake', ribbon: 'Winter Program', region: 'stl-metro', lat: 38.7280, lng: -90.3280, acres: 5, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: null }, regulations: { method: 'No bait restrictions.', dailyLimit: 4, minSize: null, gearRestrictions: 'All methods.', specialRules: null }, access: [{ name: 'January-Wabash Park', lat: 38.7285, lng: -90.3270, type: 'parking', notes: 'Ferguson. I-270 exit 27 → S. Florissant Rd south 1.5mi → right January Ave.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Rooster Tail', 'Trout Magnet'], topBait: ['PowerBait', 'Nightcrawlers'], coachTips: ['5ac in Ferguson. Quieter north STL option.'], description: '5-acre lake in January-Wabash Park, Ferguson.' },

  // Seasonal C&R Urban
  { id: 'cosmo-bethel', name: 'Cosmo-Bethel Lake', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'central-mo', lat: 38.9250, lng: -92.3450, acres: 6, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial/unscented soft plastics only. Feb+: no restrictions, limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal C&R restrictions.', specialRules: 'Behind Rock Bridge HS, Columbia.' }, access: [{ name: 'Cosmo-Bethel Park', lat: 38.9255, lng: -92.3440, type: 'parking', notes: 'Columbia MO. Off Bethel St.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger', '#14 Glo-Bug'], topLures: ['Rooster Tail', 'Small spoon'], topBait: ['PowerBait (Feb+)', 'Corn (Feb+)'], coachTips: ['Nov-Jan C&R — great practice. Feb+ bait legal, keep 4.', 'Fish near dam during cold snaps.'], description: '6-acre lake in Columbia. Nov-Jan C&R with fly/artificial only. Feb+ bait legal, 4-fish limit.' },
  { id: 'giessing-lake', name: 'Giessing Lake', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'eastern-mo', lat: 37.7800, lng: -90.3950, acres: 2, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial/unscented soft plastics. Feb+: no restrictions, limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal C&R.', specialRules: 'Engler Ball Park, Farmington.' }, access: [{ name: 'Engler Ball Park', lat: 37.7805, lng: -90.3940, type: 'parking', notes: 'Farmington. Hwy 67 → New Perrine Rd → Air Park Rd.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger'], topLures: ['Rooster Tail', 'Small spoon'], topBait: ['PowerBait (Feb+)', 'Nightcrawlers (Feb+)'], coachTips: ['Tiny 2ac but well-stocked. Arrive early stocking day.'], description: '2-acre lake in Farmington. Seasonal C&R Nov-Jan.' },
  { id: 'spur-pond', name: 'Spur Pond', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'north-mo', lat: 40.1940, lng: -92.5750, acres: 3.6, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial/unscented soft plastics. Feb+: limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal C&R.', specialRules: 'East of Patryla Baseball Field, Kirksville.' }, access: [{ name: 'Spur Pond Parking', lat: 40.1945, lng: -92.5740, type: 'parking', notes: 'Kirksville MO.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: ['#12 Woolly Bugger'], topLures: ['Rooster Tail', 'Trout Magnet'], topBait: ['PowerBait (Feb+)'], coachTips: ['NE Missouri — few winter trout options up here.'], description: '3.6ac in Kirksville. One of few NE MO winter trout options.' },
  { id: 'kiwanis-lake', name: 'Kiwanis Lake', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'central-mo', lat: 39.1650, lng: -91.8830, acres: 1, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial. Feb+: limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal.', specialRules: 'Plunkett Park, Mexico MO.' }, access: [{ name: 'Plunkett Park', lat: 39.1655, lng: -91.8820, type: 'parking', notes: 'Mexico MO. Hwy 54 → Business Loop north → left Hendricks St.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Rooster Tail', 'Trout Magnet'], topBait: ['PowerBait (Feb+)', 'Corn (Feb+)'], coachTips: ['Tiny 1ac but well stocked. First stocking early November.'], description: '1-acre lake in Mexico MO. Seasonal C&R Nov-Jan.' },
  { id: 'legion-lake', name: 'Legion Lake', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'eastern-mo', lat: 37.7230, lng: -89.8670, acres: 10, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial. Feb+: limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal.', specialRules: 'Veterans Memorial Park, Perryville.' }, access: [{ name: 'Veterans Memorial Park', lat: 37.7235, lng: -89.8660, type: 'parking', notes: 'Perryville. South of Country Club. Hwy 51 to Alma Ave.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Rooster Tail', 'Trout Magnet'], topBait: ['PowerBait (Feb+)'], coachTips: ['10ac — one of the larger winter lakes. Fish near dam in cold weather.'], description: '10-acre lake in Perryville. Largest seasonal C&R winter trout lake in the area.' },
  { id: 'liberty-park-pond', name: 'Liberty Park Pond', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'central-mo', lat: 38.6870, lng: -93.2280, acres: 3, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial. Feb+: limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal.', specialRules: 'Liberty Park, Sedalia.' }, access: [{ name: 'Liberty Park', lat: 38.6875, lng: -93.2270, type: 'parking', notes: 'Sedalia. On Hwy 65/South Limit, 5 blocks north of Hwy 50.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Trout Magnet'], topBait: ['PowerBait (Feb+)', 'Corn (Feb+)'], coachTips: ['Right on the highway. Quick stop.'], description: '3-acre pond in Sedalia. On Hwy 65. Convenient winter trout stop.' },
  { id: 'everyday-pond', name: 'Everyday Pond', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'northwest-mo', lat: 39.7550, lng: -94.7950, acres: 2, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial. Feb+: limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal.', specialRules: 'MO Western State Univ campus, St. Joseph.' }, access: [{ name: 'Missouri Western State Univ', lat: 39.7555, lng: -94.7940, type: 'parking', notes: 'St. Joseph. On campus, open to public.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Trout Magnet'], topBait: ['PowerBait (Feb+)'], coachTips: ['On university campus. Open to public. Tricky parking — use the map.'], description: '2-acre pond on MO Western campus, St. Joseph. Open to public.' },
  { id: 'krug-park-lagoon', name: 'Krug Park Lagoon', category: 'winter-lake', ribbon: 'Seasonal C&R', region: 'northwest-mo', lat: 39.7750, lng: -94.8550, acres: 3, streamMiles: null, species: ['rainbow'], waterType: 'lake', flowSource: null, usgsSiteId: null, generationWarning: false, troutStampRequired: false, seasonDates: { open: 'Nov - Mar', close: null, catchRelease: 'Nov 1 - Jan 31' }, regulations: { method: 'Nov-Jan: C&R, flies/artificial. Feb+: limit 4.', dailyLimit: 4, minSize: null, gearRestrictions: 'Seasonal.', specialRules: 'Beautiful Krug Park, St. Joseph.' }, access: [{ name: 'Krug Park', lat: 39.7755, lng: -94.8540, type: 'parking', notes: 'St. Joseph. Off Hwy 59. Easy to find.' }], solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true, bestSeasons: ['winter'], hatches: { spring: [], summer: [], fall: [], winter: [] }, topFlies: [], topLures: ['Trout Magnet'], topBait: ['PowerBait (Feb+)'], coachTips: ['Beautiful park. Worth the trip for scenery alone.'], description: 'Lagoon in Krug Park, St. Joseph. Scenic winter trout fishing off Hwy 59.' }
];

// ─── FLOW DATA SOURCES ──────────────────────────────────────────────────
window.TROUT_FLOW_GAUGES = [
  { waterId: 'north-fork-blue', siteId: '07057500', name: 'North Fork White River near Tecumseh', url: 'https://waterdata.usgs.gov/monitoring-location/07057500/' },
  { waterId: 'north-fork-red', siteId: '07057500', name: 'North Fork White River near Tecumseh', url: 'https://waterdata.usgs.gov/monitoring-location/07057500/' },
  { waterId: 'lake-taneycomo-z1', siteId: '07053810', name: 'Lake Taneycomo at Branson', url: 'https://waterdata.usgs.gov/monitoring-location/07053810/' },
  { waterId: 'lake-taneycomo-z2', siteId: '07053810', name: 'Lake Taneycomo at Branson', url: 'https://waterdata.usgs.gov/monitoring-location/07053810/' },
  { waterId: 'current-river', siteId: '07066000', name: 'Current River at Van Buren', url: 'https://waterdata.usgs.gov/monitoring-location/07066000/' },
  { waterId: 'eleven-point', siteId: '07071500', name: 'Eleven Point River near Bardley', url: 'https://waterdata.usgs.gov/monitoring-location/07071500/' }
];

// ─── DAM SAFETY ──────────────────────────────────────────────────────────
window.TROUT_DAM_SAFETY = {
  'lake-taneycomo-z1': {
    dam: 'Table Rock Dam', operator: 'US Army Corps of Engineers',
    scheduleUrl: 'https://www.swl-wc.usace.army.mil/pages/data/tablerockgeneration.htm',
    phoneHotline: '(417) 336-5083',
    warnings: ['DANGER: Water levels rise RAPIDLY during generation.', 'Sirens sound BEFORE generation. EXIT WATER IMMEDIATELY.', 'Check schedule BEFORE your trip.', 'Only wade during minimum flow.', 'Levels change in 15-20 minutes.']
  },
  'lake-taneycomo-z2': {
    dam: 'Table Rock Dam', operator: 'US Army Corps of Engineers',
    scheduleUrl: 'https://www.swl-wc.usace.army.mil/pages/data/tablerockgeneration.htm',
    phoneHotline: '(417) 336-5083',
    warnings: ['Same generation warning. Check schedules.', 'Boat safer than wading during generation.', 'Affects entire 22-mile stretch.']
  }
};

// ─── PERMITS ─────────────────────────────────────────────────────────────
window.TROUT_PERMITS = {
  troutStamp: {
    name: 'Missouri Trout Permit', required: 'Required on ALL designated trout waters (parks, ribbon streams, tailwaters). NOT required on winter urban lakes.',
    cost: '$7 (resident/non-resident)', purchaseUrl: 'https://mdc.mo.gov/hunting-trapping/permits/buying-permits',
    notes: 'Buy online, at MDC offices, or sporting goods stores. Must have fishing license first.',
    reminder: 'You need both a fishing license AND trout permit for designated trout waters.'
  },
  fishingLicense: {
    name: 'Missouri Fishing License', purchaseUrl: 'https://mdc.mo.gov/hunting-trapping/permits/buying-permits',
    notes: 'Required for all anglers 16+. Purchase online for instant access.'
  }
};

// ─── REGULATION CLASSIFICATIONS ──────────────────────────────────────────
window.TROUT_REGULATIONS = {
  blueRibbon: { title: 'Blue Ribbon Trout Area', color: '#0066FF', icon: '🔵', summary: 'Trophy — flies/artificial only (no soft plastics). Limit 1, min 18".', waters: ['blue-springs-creek', 'mill-creek', 'little-piney-blue', 'spring-creek', 'crane-creek', 'north-fork-blue'] },
  redRibbon: { title: 'Red Ribbon Trout Area', color: '#FF0000', icon: '🔴', summary: 'Quality — flies/artificial only (no soft plastics). Limit 2, min 15".', waters: ['north-fork-red'] },
  whiteRibbon: { title: 'White Ribbon Trout Area', color: '#FFFFFF', icon: '⚪', summary: 'General — all methods. Limit 4. Stocked.', waters: ['little-piney-white'] },
  troutPark: { title: 'State Trout Park', color: '#FFD700', icon: '🏞️', summary: 'Daily tag ($3). Fly-only zones. Limit 4 in season. C&R in winter.', waters: ['bennett-spring', 'montauk', 'roaring-river', 'maramec-spring'] },
  winterLake: { title: 'Winter Urban Trout', color: '#2bd4ff', icon: '❄️', summary: 'Stocked Nov-Mar. Most all methods. Some seasonal C&R. No trout stamp needed.', waters: ['chaumiere-lake', 'coot-lake', 'plover-lake', 'capfed-ponds', 'cleveland-lake', 'jesse-james-lake', 'johnston-lake', 'boathouse-lake', 'busch-ca-lakes', 'suson-park-lakes', 'january-wabash', 'cosmo-bethel', 'giessing-lake', 'spur-pond', 'kiwanis-lake', 'legion-lake', 'liberty-park-pond', 'everyday-pond', 'krug-park-lagoon'] }
};

// ─── FLY BOX CATEGORIES ──────────────────────────────────────────────────
window.FLY_BOX_CATEGORIES = {
  dryFlies: { name: 'Dry Flies', description: 'Float on surface. Imitate adult insects.', common: ['Parachute Adams', 'Elk Hair Caddis', 'Blue Winged Olive', 'Royal Wulff', 'Stimulator', 'CDC Emerger', 'Griffiths Gnat', 'Pale Morning Dun', 'Light Cahill', 'Humpy', 'Daves Hopper', 'Ant Pattern', 'Beetle Pattern', 'Sulphur Dun', 'March Brown', 'Quill Gordon', 'Hendrickson', 'Trico Spinner', 'Cream Midge', 'Adams'] },
  nymphs: { name: 'Nymphs', description: 'Fished subsurface. 80% of a trouts diet.', common: ['Pheasant Tail', 'Hares Ear', 'Copper John', 'Zebra Midge', 'Prince Nymph', 'RS2', 'Perdigon', 'Stonefly Nymph', 'Caddis Larva', 'San Juan Worm', 'Glo-Bug/Egg', 'Midge Larva', 'Mercury', 'Rainbow Warrior', 'Frenchie', 'Sowbug', 'Scud', 'Walts Worm', 'Squirmy Wormy', 'Mop Fly'] },
  streamers: { name: 'Streamers', description: 'Bigger flies. Imitate baitfish/crayfish/leeches.', common: ['Woolly Bugger', 'Muddler Minnow', 'Clouser Minnow', 'Sculpin', 'Zonker', 'Bunny Leech', 'Sparkle Minnow', 'Circus Peanut', 'Drunk & Disorderly', 'Sex Dungeon'] },
  wetFlies: { name: 'Wet Flies / Soft Hackles', description: 'Swung subsurface. Imitate emerging insects.', common: ['Partridge & Orange', 'Partridge & Green', 'Starling & Purple', 'Blue Dun Soft Hackle', 'Leadwing Coachman', 'March Brown Wet', 'Hares Ear Wet', 'Pheasant Tail Soft Hackle'] }
};

// ─── EQUIPMENT ───────────────────────────────────────────────────────────
window.TROUT_EQUIPMENT = {
  flyRods: {
    smallCreek: { weight: '3-4wt', length: '7-8ft', action: 'Medium', notes: 'Blue Ribbon small streams. Short for tight quarters.' },
    generalStream: { weight: '4-5wt', length: '8.5-9ft', action: 'Medium-Fast', notes: 'Most MO trout water. The do-everything rod.' },
    bigRiver: { weight: '5-6wt', length: '9ft', action: 'Fast', notes: 'North Fork, Current, Eleven Point. Bigger water.' },
    tailwater: { weight: '5-6wt', length: '9-10ft', action: 'Medium-Fast', notes: 'Taneycomo. Indicators and heavy nymph rigs.' },
    streamer: { weight: '6-7wt', length: '9ft', action: 'Fast', notes: 'Big browns. Pre-spawn Taneycomo. Sink-tip helpful.' }
  },
  leaders: {
    dryFly: { length: '9-12ft', tippet: '5X-6X (4-6lb)', notes: 'Long for clear MO water. Lighter in low water.' },
    nymph: { length: '7.5-9ft', tippet: '4X-5X (5-8lb)', notes: 'Shorter than dry fly.' },
    streamer: { length: '4-7ft', tippet: '2X-3X (8-12lb)', notes: 'Short and strong for big flies.' },
    euroNymph: { length: '10-20ft', tippet: '5X-6X', notes: 'Extended leader with colored sighter.' }
  },
  spinGear: { rod: 'Ultralight 5-6ft, 2-6lb', reel: '1000-2000 size', line: '4lb mono or 4-6lb braid + fluoro leader', notes: 'Keep it light. Soft mouths — light drag.' },
  baitGear: { rod: 'Light action 5-7ft', reel: '1000-2500 size', line: '4-6lb mono', terminal: 'Size 8-12 hooks. Small split shot. Bobber optional.', notes: 'Simple for beginners/families.' }
};

console.log('HUNTECH: Fly fishing data loaded — ' + (window.TROUT_WATERS || []).length + ' trout waters, ' +
  Object.keys(window.TROUT_EDUCATION || {}).length + ' habitat types, ' +
  Object.keys(window.FLY_BOX_CATEGORIES || {}).length + ' fly categories');
