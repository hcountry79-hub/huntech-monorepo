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
    region: 'central-ozarks', lat: 37.7166, lng: -92.8568, acres: null, streamMiles: 1.5,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Bennett Spring (100M gal/day)',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'March 1', close: 'October 31', catchRelease: 'Nov 1 - Feb 28' },
    regulations: { method: 'Three regulated zones. Zone 1 fly only, Zone 2 flies & artificial lures, Zone 3 bait only.', dailyLimit: 4, minSize: null, gearRestrictions: 'Zone 1: fly only. Zone 2: flies & artificial lures. Zone 3: bait ONLY — no flies or lures.', specialRules: 'Daily tag required ($3). Hours 6:30am–30min after sunset. No fishing from bridge. Winter C&R: flies/artificial lures only, entire stream.' },
    access: [
      { name: 'Zone 1 — Fly Only', lat: 37.7189, lng: -92.8585, type: 'zone', methods: ['fly'], notes: 'Spring pool to hatchery dam. Fly fishing ONLY. Crystal clear sight fishing — long leaders, small flies. Shortest zone, most technical.' },
      { name: 'Zone 2 — Flies & Lures', lat: 37.7260, lng: -92.8550, type: 'zone', methods: ['fly', 'spin'], notes: 'Hatchery dam to Whistle Bridge. Flies and artificial lures allowed. Most popular section — arrive early on weekends.' },
      { name: 'Zone 3 — Bait Only', lat: 37.7310, lng: -92.8574, type: 'zone', methods: ['bait'], notes: 'Whistle Bridge to Niangua River. BAIT ONLY — no flies or artificial lures permitted. Family friendly, least crowded.' }
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
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Scuds #14-16'], summer: ['Caddis #14-16', 'Sulphurs #16-18', 'Terrestrials'], fall: ['BWO #16-20', 'Midges #18-22', 'October Caddis #10-12'], winter: ['Midges #20-24', 'BWO #18-22'] },
    topFlies: ['#16 Pheasant Tail Nymph', '#14 Hares Ear', '#18 Zebra Midge', '#16 Elk Hair Caddis', '#14 Woolly Bugger (olive)'],
    topLures: ['1/8oz Rooster Tail (white)', '1/8oz Panther Martin (gold)', 'Small Kastmaster (gold)', 'Trout Magnet (white/chartreuse)'],
    topBait: ['Whole kernel corn (where legal)', 'PowerBait (chartreuse/rainbow)', 'Nightcrawler on small hook', 'Salmon eggs'],
    coachTips: ['Bennett Spring is Missouris most popular trout park. Arrive before 6:30am on weekends or fish midweek.', 'Zone 1 is fly only and the most technical water. If learning, start in Zone 3 with bait.', 'Zone 3 is BAIT ONLY — no flies or lures. Do not bring fly gear into Zone 3.', 'The spring pool produces year-round. Scud and sowbug patterns are deadly in Zone 1.', 'During winter C&R, crowds thin dramatically and the fishing is excellent.'],
    description: 'Missouris most popular trout park. Bennett Spring produces over 100M gallons daily, creating 1.5 miles of crystal-clear trout stream. Three strictly enforced zones: fly only, flies & lures, bait only.'
  },

  // ── MONTAUK STATE PARK ─────────────────────────────────────────────────
  //  Stream: Current River flows S past spring (~1 mi of trout water)
  //  OSM spring: node 12542787262  (37.4605, -91.6834)
  //  Zone 1 (C&R): Near spring on Current River — catch-and-release only, flies only
  //  Zone 2 (Fly): Middle Current River section — fly fishing only
  //  Zone 3 (All): Lower Current River section — all legal methods incl bait
  {
    id: 'montauk', name: 'Montauk State Park', category: 'trout-park', ribbon: 'Trout Park',
    region: 'eastern-ozarks', lat: 37.4605, lng: -91.6834, acres: null, streamMiles: 1.0,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Montauk Spring (53M gal/day)',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'March 1', close: 'October 31', catchRelease: 'Nov 1 - Feb 28' },
    regulations: { method: 'Zone 1 C&R flies only, Zone 2 fly only, Zone 3 all methods.', dailyLimit: 4, minSize: null, gearRestrictions: 'Zone 1: C&R flies only. Zone 2: fly fishing only. Zone 3: all legal methods.', specialRules: 'Daily tag required ($3). Winter C&R: flies/artificial lures only, entire stream.' },
    access: [
      { name: 'Zone 1 — C&R Fly Only', lat: 37.4590, lng: -91.6816, type: 'zone', methods: ['fly'], notes: 'Catch-and-release only, flies only. Near spring pool on Current River — big resident trout. Most technical water.' },
      { name: 'Zone 2 — Fly Only', lat: 37.4557, lng: -91.6821, type: 'zone', methods: ['fly'], notes: 'Fly fishing only. Middle Current River section. Good hatches in riffles and runs.' },
      { name: 'Zone 3 — All Methods', lat: 37.4536, lng: -91.6848, type: 'zone', methods: ['fly', 'spin', 'bait'], notes: 'All legal methods including bait. Lower Current River section. Best for families.' },
      { name: 'Store / Tag Office', lat: 37.4522, lng: -91.6811, type: 'parking', verified: true, notes: 'Park store inside Dorman L. Steelman Lodge. Daily tags, tackle, supplies. (OSM node verified)' }
      // Lodge Parking and Hatchery/Mill removed — no OSM-verified coordinates
    ],
    // OSM Way 162645228 — Current River (waterway=river), verified 2026-02-20
    streamPath: [
      [37.4600,-91.6820],[37.4597,-91.6817],[37.4590,-91.6816],[37.4585,-91.6816],
      [37.4579,-91.6816],[37.4575,-91.6814],[37.4568,-91.6812],[37.4564,-91.6815],
      [37.4557,-91.6821],[37.4553,-91.6821],[37.4549,-91.6821],[37.4546,-91.6824],
      [37.4543,-91.6831],[37.4540,-91.6839],[37.4536,-91.6848],[37.4533,-91.6855],
      [37.4526,-91.6862],[37.4522,-91.6863],[37.4518,-91.6864],[37.4515,-91.6864]
    ],
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Early Caddis #16'], summer: ['Caddis #14-16', 'Sulphurs #16-18', 'Terrestrials'], fall: ['BWO #16-20', 'Midges #18-22', 'Crane flies #10'], winter: ['Midges #20-24', 'BWO #18-22'] },
    topFlies: ['#16 Pheasant Tail', '#14 Hares Ear', '#18 Zebra Midge', '#16 Parachute Adams', '#12 Woolly Bugger'],
    topLures: ['1/8oz Rooster Tail', '1/8oz Panther Martin', 'Small inline spinner', 'Micro crankbait'],
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
    region: 'southwest-ozarks', lat: 36.5915, lng: -93.8324, acres: null, streamMiles: 1.0,
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
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midges #18-24', 'Scuds #14-16'], summer: ['Caddis #14-16', 'Terrestrials', 'Cream variants #16'], fall: ['BWO #18-22', 'Midges #18-22'], winter: ['Midges #20-26', 'BWO #20-24'] },
    topFlies: ['#16 Scud (tan/orange)', '#18 Zebra Midge', '#16 Pheasant Tail', '#14 Elk Hair Caddis', '#10 Woolly Bugger'],
    topLures: ['1/8oz Rooster Tail', 'Small jig (white/pink)', 'Micro spoon', 'Berkley Gulp minnow'],
    topBait: ['PowerBait', 'Corn', 'Nightcrawlers', 'Wax worms'],
    coachTips: ['Roaring River is in the far SW corner of Missouri — beautiful hill country.', 'Zone 2 is flies only — the best zone for skilled anglers. C&R section holds big fish.', 'Fish near the hatchery outflow in Zone 1 for active feeders.', 'Cardiac Hill trail is steep but gives access to less-pressured water.'],
    description: 'In the rugged SW Ozarks. Roaring River Spring emerges from a cave and feeds a mile of stocked rainbow water through a narrow valley. Three zones with strictly enforced methods.'
  },

  // ── MARAMEC SPRING PARK ────────────────────────────────────────────────
  //  Stream: Spring Branch flows N to Meramec River (~1 mi)
  //  OSM spring: node 289828682  (37.9534, -91.5328)
  //  Privately owned (James Foundation). Separate entrance fee ($5/vehicle).
  //  Zone 1: Near spring pool — fly area
  //  Zone 2: Middle section
  //  Zone 3: Lower section near Meramec River confluence — all methods
  {
    id: 'maramec-spring', name: 'Maramec Spring Park', category: 'trout-park', ribbon: 'Trout Park',
    region: 'eastern-ozarks', lat: 37.9534, lng: -91.5328, acres: null, streamMiles: 1.0,
    species: ['rainbow'], waterType: 'spring-creek', flowSource: 'Maramec Spring (96M gal/day, 5th largest in MO)',
    usgsSiteId: null, generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'March 15', close: 'October 31', catchRelease: 'Nov 1 - Feb 28' },
    regulations: { method: 'Zone 1 fly area near spring. General methods in lower zones.', dailyLimit: 4, minSize: null, gearRestrictions: 'Zone 1: fly area. Zone 2: flies & lures. Zone 3: all methods.', specialRules: 'Privately owned (James Foundation). Separate entrance fee ($5/vehicle). Not MDC-managed.' },
    access: [
      { name: 'Zone 1 — Fly Area', lat: 37.9553, lng: -91.5329, type: 'zone', methods: ['fly'], notes: 'Near spring pool. Sight fishing for large trout in crystal-clear water. Fly area — most technical.' },
      { name: 'Zone 2 — Flies & Lures', lat: 37.9579, lng: -91.5368, type: 'zone', methods: ['fly', 'spin'], notes: 'Middle Spring Branch. Good riffle water for nymphing. Flies and artificial lures.' },
      { name: 'Zone 3 — All Methods', lat: 37.9603, lng: -91.5365, type: 'zone', methods: ['fly', 'spin', 'bait'], notes: 'Northern section near Meramec River confluence. All methods including bait. Family friendly.' },
      { name: 'Main Parking / Gate', lat: 37.9551, lng: -91.5318, type: 'parking', verified: true, notes: 'Entrance gate — pay $5/vehicle. Parking near spring, museum, and stream. (OSM node 37.9551/-91.5318 verified)' },
      { name: 'Restrooms', lat: 37.9595, lng: -91.5315, type: 'parking', verified: true, notes: 'Restroom facility. (OSM node 37.9595/-91.5315 verified)' }
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
    solitude: 'low', difficulty: 'easy', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall'],
    hatches: { spring: ['BWO #16-20', 'Midge #18-24', 'Caddis #14-16'], summer: ['Caddis #14-16', 'Sulphurs #16', 'Terrestrials'], fall: ['BWO #16-22', 'October Caddis #10-12'], winter: ['Midges #20-24'] },
    topFlies: ['#16 Pheasant Tail', '#14 Hares Ear', '#18 Midge Larva', '#16 Elk Hair Caddis', '#12 Woolly Bugger'],
    topLures: ['Small Rooster Tail', 'Panther Martin', 'Kastmaster', 'Trout Magnet'],
    topBait: ['PowerBait', 'Corn', 'Nightcrawlers'],
    coachTips: ['Maramec is privately owned (James Foundation) — not MDC. Separate rules and fees.', 'The 5th largest spring in MO. Massive deep blue pool holds trophy-sized trout.', 'Less crowded than Bennett and Roaring River on weekdays.', 'Beautiful museum and nature center on-site.'],
    description: 'Privately operated trout park fed by Missouris 5th largest spring. Beautiful grounds with nature museum. Less crowded than state-run parks on weekdays.'
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
    topLures: ['1/16oz inline spinner (gold)', 'Micro Rapala', 'Small spoon (silver)'], topBait: null,
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
    topLures: ['1/32oz micro spinner', 'Micro jig (white)'], topBait: null,
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
    topLures: ['1/16oz spinner (gold)', 'Small Rapala (rainbow trout color)'], topBait: null,
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
    topLures: ['Micro inline spinner', 'Ultra-light spoon'], topBait: null,
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
    topLures: ['Micro spinner', 'Small spoon'], topBait: null,
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
    topLures: ['1/8oz Rooster Tail', 'Mepps spinner (gold)', 'Small Rapala'], topBait: null,
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
    topLures: ['1/8oz Rooster Tail', 'Mepps spinner', 'Small Rapala (brown trout)'], topBait: null,
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
    topLures: ['1/8oz Rooster Tail', 'Panther Martin', 'Trout Magnet (white)', 'Small crankbait'],
    topBait: ['PowerBait (chartreuse/rainbow)', 'Whole kernel corn', 'Nightcrawlers', 'Salmon eggs'],
    coachTips: ['Great family destination. Stocked trout less picky — PowerBait and corn work well.', 'Kids? Set them up at Hwy 63 bridge. Easy access, bankside fishing.', 'Great intro to trout before graduating to Blue Ribbon downstream.', 'Stocking schedule varies — check MDC for dates.'],
    description: 'Stocked White Ribbon near Lane Spring. All methods, 4 fish daily. Perfect intro to trout fishing. Family friendly with easy access.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  MAJOR TROUT RIVERS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'current-river', name: 'Current River', category: 'river', ribbon: 'White/Blue Mix',
    region: 'eastern-ozarks', lat: 37.3059, lng: -91.4094, acres: null, streamMiles: 50,
    species: ['rainbow', 'brown'], waterType: 'river', flowSource: 'Welch Spring, Cave Spring, Blue Spring, Pulltite + many',
    usgsSiteId: '07066000', generationWarning: false, troutStampRequired: true,
    seasonDates: { open: 'Year-round', close: null, catchRelease: null },
    regulations: { method: 'Varies by section. Check MDC for specific reach.', dailyLimit: 4, minSize: 'Varies', gearRestrictions: 'Some sections fly/artificial only. Others all methods.', specialRules: 'National Scenic Riverway. Federal + state regulations.' },
    access: [
      { name: 'Montauk State Park', lat: 37.4549, lng: -91.6712, type: 'parking', notes: 'Upper Current begins here. Float downstream. Trout park — see Montauk listing.' },
      { name: 'Tan Vat Access', lat: 37.4370, lng: -91.6500, type: 'entry', notes: 'Downstream of Montauk via CR 119. Named for old tanning vat. Gravel road. Wild trout in spring branches.' },
      { name: 'Baptist Camp', lat: 37.4260, lng: -91.6380, type: 'entry', notes: 'Walk-in access downstream. Deeper pools, quieter water. Some private land — check signs.' },
      { name: 'Cedar Grove', lat: 37.4130, lng: -91.6270, type: 'entry', notes: 'Remote downstream access. Excellent solitude and wild trout. Gravel bar camping.' },
      { name: 'Welch Spring', lat: 37.3700, lng: -91.5580, type: 'entry', notes: 'Major spring branch (121 cfs average). Wild trout. Walk-in 0.5mi from Hwy KK. Remote.' },
      { name: 'Akers Ferry', lat: 37.3440, lng: -91.4960, type: 'parking', notes: 'NPS campground and historic ferry crossing. Major float put-in/take-out. Canoe rental. Ranger station.' },
      { name: 'Pulltite Spring', lat: 37.3180, lng: -91.4180, type: 'parking', notes: 'NPS launch and campground. Good wade fishing near spring mouth. Float access.' },
      { name: 'Round Spring', lat: 37.2780, lng: -91.3810, type: 'parking', notes: 'NPS campground. Ranger-led cave tours in summer. Good base for multi-day floats.' },
      { name: 'Two Rivers (Current + Jacks Fork)', lat: 37.2540, lng: -91.3640, type: 'parking', notes: 'NPS campground at confluence of Current and Jacks Fork rivers. Float junction point.' },
      { name: 'Blue Spring (Current)', lat: 37.2450, lng: -91.3570, type: 'entry', notes: 'Missouris deepest spring (310ft). Spring branch holds trout. Hiking trail access.' },
      { name: 'Big Spring', lat: 36.9620, lng: -90.9880, type: 'parking', notes: 'One of Americas largest springs (277M gal/day). NPS campground, CCC structures. Lower Current River. Major access.' },
      { name: 'Van Buren Access', lat: 36.9910, lng: -91.0150, type: 'parking', notes: 'NPS headquarters town. Hwy 60 bridge. Float take-out. Canoe liveries. Services.' }
    ],
    solitude: 'medium', difficulty: 'moderate', wadingRequired: false, familyFriendly: true,
    bestSeasons: ['spring', 'fall', 'winter'],
    hatches: { spring: ['BWO', 'Caddis', 'Stoneflies', 'March Browns'], summer: ['Caddis', 'Terrestrials', 'Sulphurs'], fall: ['BWO', 'October Caddis', 'Midges'], winter: ['Midges', 'BWO'] },
    topFlies: ['#14 Woolly Bugger', '#16 Pheasant Tail', '#14 Elk Hair Caddis', '#12 Clouser Minnow', '#10 Muddler Minnow'],
    topLures: ['1/4oz Rooster Tail', 'Rapala countdown', 'Mepps spinner'],
    topBait: ['Nightcrawlers', 'Crawfish tails', 'Corn (where legal)'],
    coachTips: ['The Current River is a national treasure. Float trips are classic.', 'Spring branches along the Current hold wild trout — the real gems.', 'Canoe traffic heavy in summer. Fish early morning or late evening.', 'Upper Current near Montauk has best trout water. Below Round Spring transitions to smallmouth.'],
    description: 'Ozark National Scenic Riverway. One of Americas great spring-fed rivers. Wild trout in spring branches, stocked in main river. World-class float fishing.'
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
    topLures: ['Rooster Tail', 'Mepps spinner', 'Small Rapala'],
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
    topLures: ['Micro jig (white/pink)', 'Marabou jig 1/32oz', 'Small inline spinner'], topBait: null,
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
    topLures: ['1/8oz Rooster Tail', 'Small crankbait', 'Marabou jig', 'Trout Magnet'],
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
