// ===================================================================
//   HUNTECH Turkey Module — Data Engine
//   Missouri-focused turkey biology, behavior, regulations, and
//   AI coaching knowledge base.
//   Education-First: teach the hunter, then guide the hunt.
// ===================================================================

// ===================================================================
//   Module Detection
// ===================================================================
function isTurkeyModule() {
  return Boolean(document.body && document.body.classList.contains('module-turkey'));
}
function isShedModule() {
  return !document.body || (!document.body.classList.contains('module-turkey') &&
    !document.body.classList.contains('module-fly') &&
    !document.body.classList.contains('module-mushroom'));
}
window.isTurkeyModule = isTurkeyModule;
window.isShedModule = isShedModule;

// ===================================================================
//   Missouri Turkey Seasons & Regulations (2026)
//   Source: Missouri Department of Conservation (mdc.mo.gov)
// ===================================================================
window.TURKEY_REGULATIONS_MO = {
  state: 'Missouri',
  source: 'Missouri Department of Conservation (MDC): https://mdc.mo.gov/hunting-trapping/species/turkey',
  lastUpdated: '2026-02-18',

  seasons: {
    springYouth: {
      name: 'Spring Youth Turkey Season',
      dates: { open: '2026-04-11', close: '2026-04-12' },
      hours: 'One-half hour before sunrise to sunset',
      publicHoursCutoff: null, // no 1pm cutoff for youth
      eligibility: 'Youth hunters ages 6-15 on opening day',
      limits: 'One male turkey or turkey with visible beard',
      notes: 'Resident youth who harvest during youth season may harvest a second bird during the first week of the regular spring season. Nonresident youth may harvest one bearded turkey during either the youth or regular season, not both.'
    },
    spring: {
      name: 'Spring Turkey Season',
      dates: { open: '2026-04-20', close: '2026-05-10' },
      hours: 'One-half hour before sunrise to 1:00 PM CDT on public land; one-half hour before sunrise to sunset on private land',
      publicHoursCutoff: '13:00',
      limits: {
        resident: 'Two male turkeys or turkeys with visible beard. Only one during first week (Apr 20-26). If none taken first week, two may be taken during weeks 2-3 but not on the same day.',
        nonresident: 'One bearded turkey.',
        nonresidentLandowner: 'Two bearded turkeys, only one during first seven days.'
      },
      notes: 'Anyone using a turkey call to assist another hunter must have a filled or unfilled spring turkey hunting permit.',
      weekOneEnd: '2026-04-26'
    },
    fallArchery: {
      name: 'Fall Archery Turkey Season',
      dates: { open: '2026-09-15', close: '2026-11-13' },
      hours: 'One-half hour before sunrise to one-half hour after sunset',
      limits: 'Two turkeys of either sex (archery and firearms combined). Both may be taken on the same day.',
      notes: 'Statewide — no county restrictions.'
    },
    fallFirearms: {
      name: 'Fall Firearms Turkey Season',
      dates: { open: '2026-10-01', close: '2026-10-31' },
      hours: 'One-half hour before sunrise to sunset',
      limits: 'Two turkeys of either sex (archery and firearms combined). Both may be taken on the same day.',
      closedCounties: ['Dunklin', 'McDonald', 'Mississippi', 'New Madrid', 'Newton', 'Pemiscot', 'Scott'],
      notes: 'Fall firearms turkey hunting is NOT permitted in Dunklin, McDonald, Mississippi, New Madrid, Newton, Pemiscot, and Scott counties.'
    }
  },

  permits: {
    spring: {
      name: 'Spring Turkey Hunting Permit',
      costs: {
        resident: 19.50,
        residentLandowner: 0,
        youth: 9.75,
        nonresident: 304.50,
        nonresidentLandowner: 190.50
      }
    },
    fall: {
      name: 'Fall Turkey Hunting Permit',
      costs: {
        resident: 15.00,
        residentLandowner: 0,
        nonresident: 176.50,
        nonresidentLandowner: 111.00,
        youth: 7.50
      }
    }
  },

  methods: {
    shotgun: {
      name: 'Shotgun',
      legal: true,
      springLegal: true,
      fallLegal: true,
      notes: 'Shotgun with shot size no larger than No. 2 and no smaller than No. 8. No lead shot required (nontoxic shot optional). No rifles or handguns during spring season.',
      effectiveRange: 40, // yards
      setupDistance: 30,  // ideal yards from expected travel
      concealmentNeed: 'moderate',
      shootingLanes: 'wide 90-degree arc preferred'
    },
    bow: {
      name: 'Bow (Compound/Recurve/Longbow)',
      legal: true,
      springLegal: true,
      fallLegal: true,
      notes: 'Longbow, recurve, or compound bow. Broadheads required for fall archery. Spring allows small-game points.',
      effectiveRange: 25,
      setupDistance: 18,
      concealmentNeed: 'high',
      shootingLanes: 'narrow clear lanes, must draw undetected'
    },
    crossbow: {
      name: 'Crossbow',
      legal: true,
      springLegal: true,
      fallLegal: true,
      notes: 'Legal for all turkey seasons. Same broadhead rules as bow for fall.',
      effectiveRange: 35,
      setupDistance: 25,
      concealmentNeed: 'moderate-high',
      shootingLanes: 'moderate arc, pre-aimed rest position important'
    }
  },

  // Counties mapped to MDC turkey harvest regions for pressure estimates
  regions: {
    ozarkBorder: { density: 'high', label: 'Ozark Border', description: 'Highest turkey density in Missouri. Mature hardwood ridges, deep hollows.' },
    glaciatedPlains: { density: 'high', label: 'Glaciated Plains', description: 'High density with creek bottom timber and CRP grassland.' },
    ozark: { density: 'high', label: 'Ozark', description: 'Steep terrain, large timber tracts, heavy roost timber.' },
    osagePlains: { density: 'moderate', label: 'Osage Plains', description: 'Mix of grassland and timbered draws. Birds concentrate in wooded corridors.' },
    mississippiLowlands: { density: 'low', label: 'Mississippi Lowlands', description: 'Flat agricultural land. Few turkeys, limited timber.' },
    bigRivers: { density: 'moderate', label: 'Big Rivers', description: 'Bottomland hardwoods along Missouri and Mississippi rivers. Good roost timber.' }
  }
};

// ===================================================================
//   Helper: Get current/next season info
// ===================================================================
window.getTurkeySeasonStatus = function() {
  const now = new Date();
  const regs = window.TURKEY_REGULATIONS_MO;
  const results = [];

  for (const [key, season] of Object.entries(regs.seasons)) {
    const open = new Date(season.dates.open + 'T00:00:00');
    const close = new Date(season.dates.close + 'T23:59:59');
    const daysUntilOpen = Math.ceil((open - now) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((close - now) / (1000 * 60 * 60 * 24));
    const isOpen = now >= open && now <= close;

    results.push({
      key, name: season.name, isOpen, daysUntilOpen, daysRemaining,
      openDate: season.dates.open, closeDate: season.dates.close,
      hours: season.hours
    });
  }

  const active = results.find(s => s.isOpen);
  const upcoming = results.filter(s => s.daysUntilOpen > 0).sort((a, b) => a.daysUntilOpen - b.daysUntilOpen);
  return { active, upcoming, all: results };
};

// ===================================================================
//   Turkey Biology & Behavior Knowledge Base
//   Built from MDC field guide, NWTF research, published wildlife
//   biology studies, and traditional hunting knowledge.
// ===================================================================
window.TURKEY_BIOLOGY = {

  // ------ Species Overview ------
  species: {
    name: 'Eastern Wild Turkey',
    scientific: 'Meleagris gallopavo silvestris',
    weight: { gobbler: '16-24 lbs', hen: '8-12 lbs' },
    length: '48 inches (tip to tip)',
    range: 'Statewide Missouri — most abundant in Ozark Border, Glaciated Plains, and Ozark natural divisions',
    lifespan: '3-5 years average, up to 10+ in low-pressure areas',
    senses: {
      vision: 'Exceptional — 270-degree field of view, 3x human visual acuity, sees UV spectrum. Can detect movement at 100+ yards. Primary defense.',
      hearing: 'Excellent — pinpoints sound direction accurately to within a few degrees. Responds to calls at 200+ yards in calm conditions.',
      smell: 'Poor — negligible factor in hunting strategy, but avoid silhouetting and sudden movement.'
    }
  },

  // ------ Roosting Behavior ------
  roosting: {
    treePreference: [
      { species: 'White Oak', priority: 1, reason: 'Large horizontal limbs, open crown, preferred statewide' },
      { species: 'Post Oak', priority: 1, reason: 'Twisted heavy limbs, Ozark ridgetop staple' },
      { species: 'Sycamore', priority: 2, reason: 'Massive limbs over creek bottoms, bottomland favorite' },
      { species: 'Cottonwood', priority: 2, reason: 'Tallest tree in river bottoms, visibility advantage' },
      { species: 'Large Pine', priority: 3, reason: 'Thermal cover in cold weather, secondary choice' },
      { species: 'Black Walnut', priority: 3, reason: 'Open branching, often isolated in field edges' },
      { species: 'Bur Oak', priority: 1, reason: 'Massive limbs, often the largest tree on north-facing slopes' }
    ],
    minDiameter: 16, // inches DBH for primary roost
    branchHeight: { min: 25, max: 60, unit: 'feet', note: 'Turkeys prefer limbs 30-50ft up with clear flydown path' },
    terrainPreference: [
      'North and east facing slopes (wind-sheltered from prevailing SW/NW wind)',
      'Ridge points extending into hollows (flydown advantage, thermal lift)',
      'Saddles above drainages (sheltered landing zone)',
      'Near water within 200 yards (first stop after flydown)',
      'Timber edges with open understory below (clear landing zone)',
      'Elevated benches on hillsides (combines shelter with visibility)'
    ],
    slopePreference: { min: 15, max: 45, ideal: '25-35% grade', reason: 'Launch/landing physics — turkeys can glide downhill 100+ yards from elevated roost' },
    returnFidelity: 'HIGH — gobblers use the same roost trees for weeks to months. Hens less consistent but use the same roost ridge.',
    duskBehavior: {
      timing: '15-30 minutes before dark',
      pattern: 'Turkeys walk to staging area 50-150 yards from roost tree, mill around, then fly up to limbs. Gobblers often gobble once or twice on the limb.',
      signToWatch: 'Listen for fly-up wingbeats (heavy, distinct whooshing), clucks, and a single gobble as they settle.'
    },
    dawnBehavior: {
      timing: '20-45 minutes before flydown (first light to sunrise)',
      pattern: 'Gobblers gobble on the roost to attract hens. Intensity peaks 10-20 minutes before flydown. They pitch into an opening or glide downhill.',
      signToWatch: 'First gobble is often 30 minutes before sunrise. Hens tree-yelp before flying down. Flydown is a burst of wingbeats.',
      flydownDirection: 'Almost always downhill or into an opening. Rarely uphill. They need a clear flight path.'
    },
    detectionFromTerrain: {
      canopySize: 'Look for trees with crown spread > 40ft — visible on satellite imagery as distinct large canopy dots',
      isolatedTrees: 'A single large tree standing above surrounding canopy near a ridge point is a high-probability roost',
      ridgeFingers: 'Where a ridge finger extends into a hollow, the tallest tree at the point is the classic roost position',
      creekBend: 'Large sycamores/cottonwoods at creek bends are bottomland roost magnets'
    }
  },

  // ------ Daily Movement Patterns ------
  dailyMovement: {
    preDawn: {
      time: '30-45 min before sunrise',
      behavior: 'On roost. Gobbling. Waiting for hens to fly down first.',
      hunterAction: 'Be in position 200+ yards from roost before first gobble. Do NOT set up under roost tree.',
      education: 'A gobbler on the roost is telling hens where he is. He expects THEM to come to HIM. Your job is to sound like a hen who won\'t come — make him break pattern and come to you.'
    },
    earlyMorning: {
      time: 'Sunrise to sunrise +90 min',
      behavior: 'Fly down into opening or downhill. Strut in open area within 200 yards of roost. Hens gather. Gobbler follows hens.',
      hunterAction: 'Set up between roost and strut zone. Call sparingly — you are competing with real hens.',
      education: 'The first 90 minutes are the most exciting but often the HARDEST to kill a gobbler. He has real hens. Patience beats aggression early.'
    },
    midMorning: {
      time: 'Sunrise +90 min to 10:30 AM',
      behavior: 'Travel, feeding. Gobbler following hens 200-800 yards along terrain features — ridgelines, logging roads, field edges.',
      hunterAction: 'Set up on travel corridors if you know the pattern. Cutting and aggressive yelping can pull a lonely gobbler.',
      education: 'As hens peel off to nest, gobblers get increasingly responsive. A gobbler that was henned up at 6:30 may be alone and screaming by 9:30.'
    },
    midday: {
      time: '10:30 AM to 2:00 PM',
      behavior: 'Loafing in shaded timber, field edges, benches. Dusting. Light feeding. MOST VULNERABLE TO CALLING.',
      hunterAction: 'Soft calling — clucks, purrs, scratching in leaves. Sit longer. The midday gobbler is often a mature bird that survived the morning pressure.',
      education: 'Many championship gobblers are killed between 10 AM and 1 PM. Other hunters have left. The woods are quiet. A lonely old tom is looking for company. This is YOUR window.'
    },
    afternoon: {
      time: '2:00 PM to 2 hours before dark',
      behavior: 'Feeding movement increasing. Working toward roost staging area. Hens rejoining flock.',
      hunterAction: 'On public land spring season, you must be done by 1:00 PM CDT. On private land or fall, afternoon setups near feeding areas and travel routes to roost.',
      education: 'Afternoon is scouting time on public land spring. Use it to locate roosts for tomorrow morning.'
    },
    lateAfternoon: {
      time: '2 hours before dark to dark',
      behavior: 'Staging 50-200 yards from roost. Feeding, socializing. Fly-up.',
      hunterAction: 'SCOUTING ONLY during spring public land. Listen for fly-up gobbles to pinpoint tomorrow\'s roost.',
      education: 'The evening roost gobble is the single most valuable scouting data point. One confirmed roost gobble tells you exactly where to be tomorrow morning.'
    }
  },

  // ------ Breeding Season Phases ------
  breedingSeason: {
    early: {
      label: 'Early Season (Week 1)',
      behavior: 'Gobblers are henned up. They gobble hard on the roost but go quiet after flydown because real hens are with them.',
      strategy: 'Target the travel corridor between roost and strut zone. Set up ON the travel route, not at the strut zone. Be there before flydown.',
      calling: 'Minimal calling. Soft tree yelps before flydown. Then shut up. Let curiosity work. A hen that won\'t come to him drives a gobbler crazy.',
      decoys: 'Hen decoy + jake decoy — the jake triggers territorial aggression even when henned up.',
      difficulty: 'HARD — requires patience and precise positioning. Most hunters call too much this week.',
      tip: 'If you can\'t pull a henned-up gobbler, locate him and return when hens leave him (usually by 9-10 AM).'
    },
    peak: {
      label: 'Peak Breeding (Weeks 2-3)',
      behavior: 'Hens are nesting. Gobblers are suddenly alone and desperately responsive. Vocal all day.',
      strategy: 'Aggressive calling works. Set up in open areas gobblers can see from distance. Multiple setups per morning.',
      calling: 'Loud yelps, cutting, fighting purrs, gobble calls. He is looking for ANY hen. Match his energy.',
      decoys: 'Full strut gobbler decoy + breeding hen — triggers instant charge from dominant gobbler.',
      difficulty: 'MEDIUM — birds are responsive but pressured. The best days are Tuesday-Thursday when other hunters are at work.',
      tip: 'If he gobbles but won\'t commit, move toward him 50-75 yards and call again. Close the distance he won\'t.'
    },
    late: {
      label: 'Late Season (Final Week)',
      behavior: 'Pressured, call-shy, henned back up with re-nesting hens. Scattered. Midday gobbling increases.',
      strategy: 'Patience is KING. Sit longer per setup. Move less. Target midday when the woods empty out.',
      calling: 'Soft clucks and purrs ONLY. Scratch in leaves with your hand. Simulate a feeding hen. Less is more.',
      decoys: 'Single hen decoy in a relaxed feeding position. Nothing aggressive.',
      difficulty: 'HARD — these are the survivors. They\'ve been called to, shot at, and pressured for 2 weeks.',
      tip: 'The last 3 days of season can be magic. Hunters quit. Turkeys relax. A patient midday sit near a known travel route produces the biggest birds of the season.'
    }
  },

  // ------ Weather Impact on Behavior ------
  weatherImpact: {
    rain: {
      effect: 'Birds move to open fields and pastures for visibility. More vocal AFTER rain breaks.',
      huntStrategy: 'Set up on field edges. Turkeys hate wet brush. They strut in short grass and open ground.',
      callingAdjustment: 'Louder calling — rain dampens sound. Use a box call that cuts through moisture.'
    },
    wind: {
      threshold: 15, // mph — above this, hunting is tough
      effect: 'Birds move to leeward slopes and sheltered hollows. Gobbling is muffled and hard to locate.',
      huntStrategy: 'Hunt leeward ridges and protected hollows. Move closer to likely roost areas. Birds hold tighter to cover.',
      callingAdjustment: 'Use a loud box call or pot call. Mouth calls get lost in wind. Call more frequently.'
    },
    coldFront: {
      effect: 'Suppresses movement and gobbling. Birds may not leave roost until late. Feed hard when they do.',
      huntStrategy: 'Stay put longer. Birds will move eventually. Target south-facing slopes where sun warms first.',
      callingAdjustment: 'Patience. Wait for the front to pass. The day after a cold front often produces a gobbling eruption.'
    },
    warmFront: {
      effect: 'Peak activity. Early gobbling. Extended strut periods. Best hunting weather.',
      huntStrategy: 'Get out EARLY. First warm morning after cold snap = the best day of the season.',
      callingAdjustment: 'Match their energy. If birds are hot, call aggressively. If they respond, push the envelope.'
    },
    fog: {
      effect: 'Delayed flydown. Birds gobble on roost LONGER waiting for visibility. Sound carries unpredictably.',
      huntStrategy: 'Be patient. Do NOT move in fog — you cannot judge distance or direction of gobbles. Wait for it to lift.',
      callingAdjustment: 'Soft calling only until visibility clears. When fog lifts, there is often a burst of activity.'
    },
    barometer: {
      rising: { label: 'Rising', effect: 'Increasing activity. Birds feed and move more.' },
      falling: { label: 'Falling', effect: 'Decreasing activity. Birds hunker down.' },
      steadyHigh: { label: 'Steady High', effect: 'Best overall conditions. Consistent gobbling and movement.' }
    }
  },

  // ------ Terrain Feature Scoring for Turkey ------
  terrainScoring: {
    roostSite: {
      ridgePoint: { score: 95, label: 'Ridge Point', reason: 'Classic roost position — elevated, clear flydown, thermal advantage' },
      saddleAboveHollow: { score: 90, label: 'Saddle Above Hollow', reason: 'Sheltered from wind, clear glide path into hollow' },
      creekBendLargeTree: { score: 85, label: 'Creek Bend Timber', reason: 'Bottomland sycamores and cottonwoods, water proximity' },
      northEastSlope: { score: 80, label: 'NE Facing Slope', reason: 'Wind-sheltered, early morning sun, mature timber' },
      benchOnHillside: { score: 75, label: 'Hillside Bench', reason: 'Flat resting area on slope with large roost timber above' },
      fieldEdgeLargeTree: { score: 70, label: 'Field Edge Timber', reason: 'Isolated large tree near open area, easy flydown into field' }
    },
    strutZone: {
      fieldPointIntoTimber: { score: 95, label: 'Field Point', reason: 'Finger of open ground extending into timber — classic strut zone' },
      ridgetopOpening: { score: 90, label: 'Ridgetop Opening', reason: 'Open area on ridge above roost timber. Gobbler displays here at dawn.' },
      loggingRoadJunction: { score: 85, label: 'Road Junction', reason: 'Road intersections create open strut lanes. Gobblers patrol these.' },
      powerLineClearing: { score: 80, label: 'Powerline/Clearing', reason: 'Long open lane with cover on both sides. Gobblers strut the edges.' },
      creekBottomFlat: { score: 75, label: 'Creek Bottom Flat', reason: 'Open bottomland near roost timber. Morning staging area.' }
    },
    ambushSetup: {
      terrainFunnel: { score: 95, label: 'Terrain Funnel', reason: 'Saddle, creek narrows, or ridge pinch that forces travel through a tight area' },
      insideCorner: { score: 90, label: 'Inside Corner', reason: 'Concave field edge or timber edge that turkeys naturally cut through' },
      beneathRoost: { score: 30, label: 'Below Roost', reason: 'WARNING: Too close to roost. Bird will see you before flydown. Set up 100-200 yds away.' },
      travelCorridor: { score: 85, label: 'Travel Corridor', reason: 'Ridge spine, logging road, or fence line turkeys follow between roost and feed' },
      dustingArea: { score: 80, label: 'Dusting Area', reason: 'Bare ground where turkeys dust. Used for generations. Midday kill zone.' },
      waterCrossing: { score: 85, label: 'Water Crossing', reason: 'Creek crossing used daily. Turkeys are creatures of habit — same crossing every day.' }
    }
  },

  // ------ Native American & Traditional Hunting Wisdom ------
  nativeWisdom: {
    osage: {
      tribe: 'Osage Nation',
      region: 'Missouri Ozarks, Osage River Valley',
      methods: [
        'Hunted turkeys at water crossings at dawn — turkeys are creatures of habit and return to the same creek crossing daily.',
        'Used terrain funnels (saddles, creek narrows, field points) where turkeys naturally concentrate during travel.',
        'Mimicked turkey calls with hollowed river cane and wing bone from harvested turkeys — the original mouth call.',
        'Hunted from elevated positions above roost timber, using the terrain to get above the bird\'s line of sight.'
      ],
      philosophy: 'The Osage understood that you do not chase the turkey — you learn where the turkey goes, and you wait there. The turkey is a creature of the land. Read the land, and you read the turkey.'
    },
    general: {
      patternRecognition: 'Old-growth hunters knew: find the dusting bowl, find the bird. Turkeys dust in the same bare-ground spots for generations.',
      terrainReading: 'Before satellite imagery, master hunters read topographic maps to find saddles, benches, and ridge points — the same terrain features this app analyzes.',
      wingBoneCall: 'The wing bone call is the oldest turkey call in existence. Made from the radius and ulna of a turkey wing. It produces a high-pitched yelp that carries in heavy timber.',
      patience: 'Native hunters would sit for hours in absolute stillness. Modern hunters move too often. The old way: be the stump.',
      moonPhase: 'Full moon = earlier gobbling because birds can see to feed/breed at night, reducing dawn urgency. New moon = peak dawn gobbling because breeding activity is concentrated at first light.'
    }
  },

  // ------ Turkey Vocalizations Reference ------
  vocalizations: {
    gobble: {
      name: 'Gobble',
      sound: 'Loud, distinctive "gobble-gobble-gobble"',
      meaning: 'Male advertising call. "I am here, come to me." Can be heard up to 1 mile.',
      whenHeard: 'Dawn roost, mid-morning when lonely, triggered by loud sounds (owl hoot, crow call, car door).',
      hunterUse: 'Gobble call is RISKY on public land (other hunters may approach). Use only when confident of your surroundings.'
    },
    yelp: {
      name: 'Hen Yelp',
      sound: 'Series of notes "kyawk-kyawk-kyawk" — 3 to 8 notes',
      meaning: 'Basic hen communication. "I am here." The most versatile turkey call.',
      whenHeard: 'All day, especially morning. Hens yelp to assemble, to contact gobblers, and in response to gobbles.',
      hunterUse: 'Your bread and butter call. 3-note yelps for curiosity, 6-8 note string for excitement. Master this first.'
    },
    cluck: {
      name: 'Cluck',
      sound: 'Short, single sharp notes — "putt" or "cluck"',
      meaning: 'Content sound. "I\'m over here, everything is fine."',
      whenHeard: 'Throughout the day, especially during feeding.',
      hunterUse: 'Soft clucks when a gobbler is close. Reassurance call. Never loud.'
    },
    purr: {
      name: 'Purr',
      sound: 'Soft, rolling, vibrating note',
      meaning: 'Contentment during feeding. Also fighting purr (loud) during dominance disputes.',
      whenHeard: 'Feeding turkeys purr constantly. Aggressive purrs during gobbler fights.',
      hunterUse: 'Soft purrs with clucks = content feeding hen. Fighting purrs = challenging a gobbler\'s dominance. Deadly in late season.'
    },
    cutt: {
      name: 'Cutting',
      sound: 'Fast, loud, erratic series of clucks — "cut-cut-cut-cut-cut"',
      meaning: 'Excited hen. "Where are you?! Come here NOW!" Aggressive and demanding.',
      whenHeard: 'When hens are excited, looking for the gobbler, or responding to another hen.',
      hunterUse: 'Use when a gobbler is responding but won\'t commit. Cutting says "I\'m fired up and coming your way" — he may break and run to you.'
    },
    flyDown: {
      name: 'Fly-Down Cackle',
      sound: 'Erratic series of clucks as the bird leaves the roost limb',
      meaning: '"I\'m flying down now."',
      whenHeard: 'Only at flydown from roost, around sunrise.',
      hunterUse: 'One fly-down cackle at the right moment (as you hear real birds flying down) signals to the gobbler that a hen just hit the ground near him. Combine with wing slap against your leg.'
    },
    alarm: {
      name: 'Alarm Putt',
      sound: 'Sharp, loud, single or double "PUTT! PUTT!"',
      meaning: '"DANGER! Something is wrong!" All turkeys freeze or flush.',
      whenHeard: 'When a turkey sees or hears something suspicious.',
      hunterUse: 'NEVER mimic this. If you hear it, you\'ve been spotted. Freeze and hope. Game is likely over for that bird.'
    }
  },

  // ------ Hunting Pressure Model ------
  pressureModel: {
    factors: [
      { key: 'parkingProximity', weight: 0.25, description: 'Distance from nearest parking lot or trailhead. >1 mile = low pressure.' },
      { key: 'trailDistance', weight: 0.15, description: 'Distance from maintained trail. >0.5 miles = less pressure.' },
      { key: 'roadDensity', weight: 0.10, description: 'Number of roads within 0.5 miles. More roads = more access = more pressure.' },
      { key: 'seasonWeek', weight: 0.20, description: 'Week 1 = highest pressure (4x). Week 2 = 2x. Week 3 = lowest.' },
      { key: 'dayOfWeek', weight: 0.15, description: 'Saturday = 3x. Sunday = 2.5x. Friday = 1.5x. Weekday = 1x.' },
      { key: 'areaSize', weight: 0.10, description: 'Larger areas distribute pressure. >5000 acres = advantage.' },
      { key: 'terrain', weight: 0.05, description: 'Steep, rugged terrain deters lazy hunters. Ozark hollows = lower pressure.' }
    ],
    dayMultipliers: { monday: 1.0, tuesday: 1.0, wednesday: 1.0, thursday: 1.0, friday: 1.5, saturday: 3.0, sunday: 2.5 },
    weekMultipliers: { 1: 4.0, 2: 2.0, 3: 1.0 }
  }
};

// ===================================================================
//   Turkey Education Content (mirrors SHED_EDUCATION pattern)
// ===================================================================
window.TURKEY_EDUCATION = {
  roostZone: {
    priority: 1,
    title: 'Roost Zone (HIGHEST PRIORITY)',
    description: 'Mature hardwood timber on elevated terrain where gobblers spend the night. The roost is the anchor of every turkey hunt — find the roost, and you know where the hunt starts.',
    tips: 'Look for large white oaks and sycamores on ridge points and creek bends. Scan for droppings, breast feathers, and J-shaped droppings (gobbler) below large trees. An evening visit to hear fly-up gobbles is the gold standard.',
    icon: 'RT',
    color: '#b8860b'
  },
  strutZone: {
    priority: 2,
    title: 'Strut Zone (HIGH PRIORITY)',
    description: 'Open or semi-open areas near the roost where gobblers display at dawn. This is where the show happens — gobblers fan, drum, and gobble to attract hens.',
    tips: 'Look for field points extending into timber, ridgetop openings, and logging road junctions within 200 yards of roost timber. Strut marks in soft ground and scattered feathers confirm the spot.',
    icon: 'SZ',
    color: '#d4a017'
  },
  travelCorridor: {
    priority: 3,
    title: 'Travel Corridor (HIGH PRIORITY)',
    description: 'Ridge spines, logging roads, creek bottoms, and fence lines that turkeys follow between roost, strut zone, feeding area, and loafing cover.',
    tips: 'Turkeys prefer the path of least resistance — they walk logging roads, ridge tops, and creek banks. Look for tracks, scratchings, and droppings along these features. A setup on a travel corridor intercepts birds in transit.',
    icon: 'TC',
    color: '#c89b3c'
  },
  feedingArea: {
    priority: 4,
    title: 'Feeding Area (MEDIUM PRIORITY)',
    description: 'Open timber with abundant leaf litter (insects), field edges, food plots, and areas with fresh scratchings where turkeys spend mid-morning feeding.',
    tips: 'Fresh scratchings are the # 1 sign — overturned leaves in a V-shape pointing in the direction of travel. Concentrate on south-facing slopes in early season (warms first, insects emerge first).',
    icon: 'FD',
    color: '#8b7355'
  },
  loafingArea: {
    priority: 5,
    title: 'Loafing/Dusting Area (MEDIUM PRIORITY)',
    description: 'Shaded areas with bare ground where turkeys rest and dust-bathe during midday. Often the key to killing a midday gobbler when other hunters have left.',
    tips: 'Look for bowl-shaped depressions in bare ground (dusting bowls), often on south-facing slopes, logging road edges, or under spreading oaks. Feathers and droppings confirm active use.',
    icon: 'LA',
    color: '#7a6e5a'
  },
  waterSource: {
    priority: 6,
    title: 'Water Source (MEDIUM-LOW PRIORITY)',
    description: 'Creek crossings, ponds, and seeps that turkeys visit daily, especially after flydown and during warm weather.',
    tips: 'Focus on crossings — turkeys use the same creek crossing every day. Look for tracks in mud and sand bars. The Osage people hunted turkeys at these exact spots.',
    icon: 'WS',
    color: '#5a8a7a'
  }
};

// ===================================================================
//   Turkey Hotspot Flavor Text (mirrors HOTSPOT_FLAVOR pattern)
// ===================================================================
window.TURKEY_HOTSPOT_FLAVOR = {
  roostZone: {
    titles: ['Ridge Point Roost Timber', 'Creek Bottom Roost Stand', 'Saddle Roost Complex', 'Hillside Bench Roost', 'Field Edge Roost Tree'],
    reasons: [
      'This ridge point has the elevation and large-canopy timber that gobblers select for overnight roost. Flydown path leads into the opening below.',
      'Large bottomland hardwoods at this creek bend provide classic roost structure. Water is steps away after flydown.',
      'This sheltered saddle between two ridge fingers concentrates roost activity. Wind protection from three sides.',
      'Mature timber on this bench has the horizontal limb structure turkeys need. Slope below provides a natural glide path.',
      'Isolated large tree at the timber edge near open ground. Quick flydown into the field at first light.'
    ],
    search: [
      'Look below large oaks for whitewash (droppings) and breast feathers. J-shaped droppings = gobbler.',
      'Scan mud banks for tracks. Roost droppings accumulate in piles — a big pile means repeated use.',
      'Walk the saddle at midday and look up — large horizontal limbs 30-50 feet up are the roost limbs.',
      'Check the bench flat for dusting bowls and scratchings — turkeys stage here before fly-up.',
      'Evening visit: arrive 45 min before dark and listen. One fly-up gobble confirms this roost.'
    ],
    approach: [
      'Approach from downhill in darkness. Set up 150-200 yards from roost on the flydown side. Never under the roost tree.',
      'Use the creek as a sound cover for your approach. Set up on the far bank where you can see the flydown zone.',
      'Come in from the backside of the ridge. The saddle funnels sound — stay quiet on approach.',
      'Climb to the bench from the downhill side. Set up against a tree wider than your shoulders.',
      'Approach from the field side in darkness. The bird will fly down toward the field — you need to be waiting.'
    ]
  },
  strutZone: {
    titles: ['Ridgetop Strut Lane', 'Field Point Display Ground', 'Logging Road Strut Zone', 'Powerline Clearing Strut', 'Creek Bottom Flat Strut'],
    reasons: [
      'Open ridgetop within 200 yards of roost timber. Gobblers drum and strut here to be seen by hens on both sides of the ridge.',
      'This field point extending into timber creates a natural stage. Gobblers strut at the point where open ground meets cover.',
      'Logging road junction creates open ground that gobblers patrol. Multiple approach angles for hens means the gobbler stays here longer.',
      'Powerline clearings are linear strut zones. Gobblers walk the edges, strutting from one end to the other.',
      'Open bottom flat near roost timber. Morning fog holds here, and turkeys wait for visibility before moving.'
    ],
    search: [
      'Look for strut marks — parallel drag lines in soft ground from the gobbler\'s lowered wing tips.',
      'Scan for feathers, especially breast feathers and wing tip feathers broken from dragging.',
      'Track intersections on logging roads are gold — multiple turkey tracks converging = strut zone.',
      'Walk the clearing edge and look for droppings clusters. Gobblers loaf and strut here repeatedly.',
      'Check for J-shaped droppings and large tracks. Gobbler tracks are 4.5 inches+ from toe to heel.'
    ],
    approach: [
      'Set up on the downwind edge of the opening with your back to a wide tree. Face the roost direction.',
      'Position where you can see the field point from 30-40 yards. Use the timber corner for concealment.',
      'Set up in the brush at a road junction. Place decoys in the open road 20-25 yards in front of you.',
      'Use the timber edge as cover. Set up where the clearing narrows — the gobbler must pass close.',
      'Approach in darkness from downstream. The bottom flat will flood with sound at first gobble.'
    ]
  },
  travelCorridor: {
    titles: ['Ridge Spine Travel Route', 'Logging Road Corridor', 'Creek Bottom Trail', 'Fence Line Funnel', 'Saddle Crossing'],
    reasons: [
      'Turkeys walk ridge tops because they can see danger coming. This spine connects roost timber to feeding areas.',
      'Old logging roads are turkey highways. Easy walking, open sightlines, and dust baths along the edges.',
      'Creek bottoms funnel travel. Turkeys follow water and the flat terrain it creates, especially in steep country.',
      'Fence lines concentrate travel where turkeys must cross. The opening at the fence gap is a natural shoot zone.',
      'This saddle is the low point between two ridges. Every turkey in the area crosses here. Classic ambush point.'
    ],
    search: [
      'Walk the ridge and look for tracks and droppings every 50 yards. Heavy sign = heavy traffic.',
      'Scratchings along road edges confirm daily feeding travel. V-pattern of scratched leaves = direction of travel.',
      'Check sand bars and mud for tracks. Measure tracks — 4.5 inch+ toe-to-heel = gobbler.',
      'Focus on the 20-yard zone on each side of the fence gap. Tracks, feathers, and droppings concentrate here.',
      'The saddle narrows travel. Fresh sign here means turkeys crossed recently. Set up on the downwind side.'
    ],
    approach: [
      'Set up just off the ridge spine where you have cover but can see 40-60 yards along the ridge.',
      'Position at a bend in the road where the gobbler must round the corner into your shooting lane.',
      'Set up on a small rise above the creek — you need to see down into the bottom without skylining.',
      'The fence gap dictates where the bird crosses. Set up 30 yards from the gap facing it.',
      'Settle into cover on the downwind lip of the saddle. Turkeys crossing will be within 30 yards.'
    ]
  },
  feedingArea: {
    titles: ['South-Facing Oak Flat', 'Field Edge Bug Zone', 'Open Hardwood Feeding Floor', 'Food Plot Edge', 'Burn Area Recovery Zone'],
    reasons: [
      'South-facing slopes warm first in spring, bringing insects to the surface. Turkeys congregate here in early season.',
      'Field edges produce the highest insect density. Turkeys fan out along edges scratching for bugs and seeds.',
      'Open hardwood forest with clear leaf litter floor — turkeys scratch here for acorns, insects, and plant shoots.',
      'Food plots planted with clover or chicory attract turkeys for green browse and the insects drawn to the plants.',
      'Prescribed burn areas produce a flush of new growth and insects. Turkeys flock to these areas.'
    ],
    search: [
      'Fresh scratchings are overturned leaves in a V-shape pointing in the direction the turkey was walking. Fresh = dark, moist soil exposed.',
      'Droppings in feeding areas are scattered (unlike roost piles). Look for a mix of hen (bulb-shaped) and gobbler (J-shaped) droppings.',
      'Feeding sign covers a wide area. Walk a zigzag through the timber and note density of scratchings.',
      'Track the field edge for 200 yards. Concentrated scratchings = regular feeding stop.',
      'Burned areas show turkey traffic within days of the burn. Look for tracks in ash and bare soil.'
    ],
    approach: [
      'Approach from the uphill (north) side. Set up facing south where you can see the open slope.',
      'Use the field edge timber for cover. Set up 15-20 yards inside the wood line facing the field.',
      'Pick a tree near a cluster of fresh scratchings and set up. Birds will return to the same feeding area.',
      'Set up in the timber edge overlooking the food plot. Morning and late afternoon are peak feeding times.',
      'After a burn, the entire area is open. Use the unburned timber edge for concealment.'
    ]
  },
  loafingArea: {
    titles: ['Shaded Bench Loafing Spot', 'Dusting Bowl Complex', 'Ridgetop Shade Lounge', 'Road Edge Dust Zone', 'Sheltered Timber Loaf'],
    reasons: [
      'This shaded bench has bare ground and dappled sunlight. Turkeys loaf here during midday heat, dusting and resting.',
      'Multiple dusting bowls in bare ground indicate a regular midday stop. Turkeys use these sites for generations.',
      'The ridgetop has mature canopy shade and open ground. Gobblers loaf here from 10 AM to 2 PM.',
      'Logging road edges develop natural dust baths. Turkeys dust here and patrol the road between bouts.',
      'Dense canopy with open understory — turkeys can see approaching danger while resting in shade.'
    ],
    search: [
      'Dusting bowls: oval depressions 12-18 inches across in bare soil. Feathers around the rim confirm active use.',
      'Droppings clusters near dusting bowls. If you find 3+ bowls together, this is a regular stop.',
      'Midday scratchings are lighter than morning feeding scratches. Look for casual scratching near shade.',
      'Walk logging roads at midday looking for fresh dust bowl activity. Turkeys may still be there.',
      'Breast feathers and body contour feathers on the ground indicate preening/loafing activity.'
    ],
    approach: [
      'This is a patience setup. Arrive by 9 AM, set up in shade, and wait. Soft clucks and purrs.',
      'Approach from downwind. Dusting turkeys are relaxed and less alert, but still have incredible vision.',
      'Set up on the ridgetop edge where you can see the flat loafing ground. Call softly every 20 minutes.',
      'Position at a road bend near dusting bowls. A midday gobble on a logging road is a KILLABLE bird.',
      'Enter from a different ridge and descend quietly. Midday woods are SILENT — any noise carries.'
    ]
  },
  waterSource: {
    titles: ['Creek Crossing', 'Spring Seep Travel Stop', 'Pond Edge Trail', 'River Bottom Watering Hole', 'Drainage Crossing'],
    reasons: [
      'Turkeys cross this creek daily at the same spot — the Osage hunted turkeys at creek crossings for this exact reason.',
      'Natural spring seeps create green zones that attract insects and turkeys. Regular watering stop.',
      'Pond edges provide water, mud for preening, and open ground for predator detection. Daily visit.',
      'River bottom hardwoods near water combine roost timber with immediate water access. High-value zone.',
      'Drainage crossings funnel turkey travel. The low point is the path of least resistance.'
    ],
    search: [
      'Check both banks for tracks in mud. Measure toe-to-heel: 4.5"+ = gobbler. 3.5" = hen.',
      'Look for scratching activity near the seep. Turkeys feed on insects attracted to moisture.',
      'Walk the pond perimeter looking for tracks in soft mud and droppings on the bank.',
      'Scan sand bars for track trails showing daily crossing patterns and direction of travel.',
      'The drainage narrows force turkeys through a small area. Concentrated sign = daily use.'
    ],
    approach: [
      'Set up 30-50 yards from the crossing on the side the turkey approaches from (based on roost direction).',
      'Position uphill from the seep. Turkeys approach from above and walk down to water.',
      'Use pond dam or bank vegetation for cover. Set up where you can see the approach trail.',
      'Cross the river at a different point and set up on the opposite bank from the roost.',
      'Settle in at the narrow point. Whatever crosses this drainage passes within 20 yards of you.'
    ]
  }
};

// ===================================================================
//   Turkey Pin Types for scouting/field logging
// ===================================================================
window.TURKEY_PIN_TYPES = {
  roost:        { label: 'Roost Tree/Zone',   icon: 'RT', color: '#b8860b', description: 'Confirmed or suspected roost tree. Best confirmed by evening fly-up or dawn gobble.' },
  gobble:       { label: 'Gobble Heard',       icon: 'GB', color: '#ff6b35', description: 'Location where a gobble was heard. Note direction bearing and time.' },
  strut:        { label: 'Strut Zone',         icon: 'SZ', color: '#d4a017', description: 'Observed strutting area. Look for strut marks and wing drag lines in soft ground.' },
  feeding:      { label: 'Feeding Area',       icon: 'FD', color: '#8b7355', description: 'Active feeding sign — fresh scratchings in leaf litter, overturned soil.' },
  scratchings:  { label: 'Scratchings',        icon: 'SC', color: '#9e8c6c', description: 'Turkey scratchings in V-pattern. Dark exposed soil = fresh. Direction of V = direction of travel.' },
  tracks:       { label: 'Tracks',             icon: 'TK', color: '#7a6e5a', description: 'Turkey tracks. Measure toe-to-heel: 4.5"+ = gobbler, 3.5" = hen.' },
  dustingBowl:  { label: 'Dusting Bowl',       icon: 'DB', color: '#a0937d', description: 'Bare ground dusting site. Bowl-shaped depression with feathers. Used for generations.' },
  droppings:    { label: 'Droppings',          icon: 'DR', color: '#6b5b4a', description: 'Turkey droppings. J-shaped = gobbler. Bulb/spiral = hen. Pile = roost site.' },
  feather:      { label: 'Feather Found',      icon: 'FT', color: '#c8a96e', description: 'Found feather. Breast feather with iridescent tips = gobbler. Brown-tipped = hen.' },
  sighting:     { label: 'Turkey Sighting',    icon: 'SI', color: '#4a6741', description: 'Live turkey observation. Note count, sex, behavior, and time of day.' },
  callSetup:    { label: 'Call Setup',         icon: 'CS', color: '#d4a017', description: 'Spot where calling was effective. Note call type, response, and outcome.' },
  pressure:     { label: 'Hunter Pressure',    icon: 'HP', color: '#a13a2a', description: 'Other hunters or vehicles observed. Helps build pressure map for strategy.' },
  access:       { label: 'Hidden Access',      icon: 'AC', color: '#5a7a5a', description: 'Hidden parking or walk-in access away from main lots. Lower pressure entry.' },
  decoy:        { label: 'Decoy Setup',        icon: 'DY', color: '#b8860b', description: 'Effective decoy placement location. Note decoy type, distance, and angle.' },
  flydown:      { label: 'Fly-Down Zone',      icon: 'FZ', color: '#e6a820', description: 'Observed or predicted fly-down area. Usually open ground below roost timber.' }
};

// ===================================================================
//   Turkey Pin SVG Icon Generator — unique icon per pin type
// ===================================================================
window.TURKEY_PIN_SVGS = {
  // Roost Tree — tree silhouette with bird on branch
  roost: '<svg viewBox="0 0 32 32"><path d="M16 4c-1.5 0-5 3-5 8 0 3 1.5 5 3 6v8h4v-8c1.5-1 3-3 3-6 0-5-3.5-8-5-8z" fill="#{c}" opacity=".85"/><circle cx="19" cy="9" r="2.5" fill="#{c}"/><path d="M19.5 8.5l2-1" stroke="#{c}" stroke-width=".7" fill="none"/><line x1="16" y1="26" x2="16" y2="29" stroke="#{c}" stroke-width="1.5"/></svg>',
  // Gobble Heard — sound wave burst
  gobble: '<svg viewBox="0 0 32 32"><circle cx="12" cy="16" r="4" fill="#{c}" opacity=".9"/><path d="M18 10c2.5 2 4 4 4 6s-1.5 4-4 6" stroke="#{c}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M21 7c3.5 3 5.5 6 5.5 9s-2 6-5.5 9" stroke="#{c}" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/></svg>',
  // Strut Zone — fanned tail display
  strut: '<svg viewBox="0 0 32 32"><path d="M16 28c0 0-2-3-2-5s1-3 2-3 2 1 2 3-2 5-2 5z" fill="#{c}"/><path d="M16 20 L6 6 L10 10 L8 4 L13 10 L13 3 L16 10 L19 3 L19 10 L24 4 L22 10 L26 6 Z" fill="#{c}" opacity=".85"/><circle cx="16" cy="22" r="1.5" fill="#{c}"/></svg>',
  // Feeding Area — scratched ground with seed
  feeding: '<svg viewBox="0 0 32 32"><path d="M8 22l5-3 3 2 4-2 4 3" stroke="#{c}" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M6 26l20 0" stroke="#{c}" stroke-width="1.2" opacity=".5"/><circle cx="12" cy="18" r="1.2" fill="#{c}"/><circle cx="18" cy="16" r="1" fill="#{c}" opacity=".7"/><circle cx="21" cy="18" r="1.2" fill="#{c}"/><path d="M14 10l2 6M16 10l0 6M18 10l-2 6" stroke="#{c}" stroke-width=".8" opacity=".5"/></svg>',
  // Scratchings — V-pattern in leaves
  scratchings: '<svg viewBox="0 0 32 32"><path d="M16 8 L8 24" stroke="#{c}" stroke-width="2" stroke-linecap="round"/><path d="M16 8 L24 24" stroke="#{c}" stroke-width="2" stroke-linecap="round"/><path d="M10 18l4-1M22 18l-4-1" stroke="#{c}" stroke-width="1" opacity=".5" stroke-linecap="round"/><circle cx="16" cy="7" r="1.5" fill="#{c}" opacity=".7"/></svg>',
  // Tracks — turkey footprints
  tracks: '<svg viewBox="0 0 32 32"><path d="M12 10l0-5M12 10l-3-4M12 10l3-4" stroke="#{c}" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="11" r="1" fill="#{c}"/><path d="M20 20l0-5M20 20l-3-4M20 20l3-4" stroke="#{c}" stroke-width="1.5" stroke-linecap="round"/><circle cx="20" cy="21" r="1" fill="#{c}"/></svg>',
  // Dusting Bowl — bowl depression
  dustingBowl: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="20" rx="10" ry="5" fill="none" stroke="#{c}" stroke-width="1.5"/><path d="M8 20c0-3 3.5-6 8-6s8 3 8 6" fill="#{c}" opacity=".2"/><circle cx="13" cy="18" r=".8" fill="#{c}" opacity=".5"/><circle cx="19" cy="19" r=".8" fill="#{c}" opacity=".5"/><path d="M11 16c1-1 2.5-1.5 5-1.5s4 .5 5 1.5" stroke="#{c}" stroke-width=".7" fill="none" opacity=".4"/></svg>',
  // Droppings — J-shape for gobbler
  droppings: '<svg viewBox="0 0 32 32"><path d="M16 8c0 0 0 10 0 14-0 3-4 4-6 2" stroke="#{c}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="16" cy="7" r="2" fill="#{c}" opacity=".7"/></svg>',
  // Feather Found — single feather
  feather: '<svg viewBox="0 0 32 32"><path d="M16 4c-1 4-5 8-5 14 0 4 2 7 5 10 3-3 5-6 5-10 0-6-4-10-5-14z" fill="#{c}" opacity=".8"/><line x1="16" y1="6" x2="16" y2="28" stroke="#1a1612" stroke-width="1" opacity=".4"/></svg>',
  // Turkey Sighting — binoculars / eye
  sighting: '<svg viewBox="0 0 32 32"><circle cx="11" cy="16" r="5" fill="none" stroke="#{c}" stroke-width="1.8"/><circle cx="21" cy="16" r="5" fill="none" stroke="#{c}" stroke-width="1.8"/><path d="M16 16h0" stroke="#{c}" stroke-width="2" stroke-linecap="round"/><circle cx="11" cy="16" r="2" fill="#{c}" opacity=".5"/><circle cx="21" cy="16" r="2" fill="#{c}" opacity=".5"/></svg>',
  // Call Setup — speaker / horn
  callSetup: '<svg viewBox="0 0 32 32"><rect x="6" y="13" width="6" height="6" rx="1" fill="#{c}" opacity=".8"/><path d="M12 11l8-4v18l-8-4z" fill="#{c}" opacity=".85"/><path d="M22 12c2 1.5 3 3 3 4s-1 2.5-3 4" stroke="#{c}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".6"/></svg>',
  // Hunter Pressure — warning triangle
  pressure: '<svg viewBox="0 0 32 32"><path d="M16 6L4 26h24L16 6z" fill="none" stroke="#{c}" stroke-width="2" stroke-linejoin="round"/><line x1="16" y1="13" x2="16" y2="20" stroke="#{c}" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="23" r="1.2" fill="#{c}"/></svg>',
  // Hidden Access — trail marker / gate
  access: '<svg viewBox="0 0 32 32"><path d="M8 28V12l8-6 8 6v16" fill="none" stroke="#{c}" stroke-width="1.8" stroke-linejoin="round"/><rect x="13" y="18" width="6" height="10" rx="1" fill="#{c}" opacity=".7"/><circle cx="17.5" cy="23" r=".8" fill="#1a1612"/></svg>',
  // Decoy Setup — decoy silhouette
  decoy: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="22" rx="8" ry="4" fill="#{c}" opacity=".6"/><path d="M14 22c0-4 1-7 3-9 1 0 2 1 2 3 0 1-1 2-2 2l3 1v3" fill="#{c}" opacity=".85"/><circle cx="18.5" cy="14.5" r="1" fill="#{c}"/></svg>',
  // Fly-Down Zone — bird descending
  flydown: '<svg viewBox="0 0 32 32"><circle cx="16" cy="10" r="2.5" fill="#{c}"/><path d="M10 14l6 8 6-8" fill="#{c}" opacity=".8"/><path d="M8 12l4 2M24 12l-4 2" stroke="#{c}" stroke-width="1.5" stroke-linecap="round"/><path d="M16 22v4M13 26l3-4 3 4" stroke="#{c}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/></svg>'
};

// Educational tip shown under each pin type on the map
window.TURKEY_PIN_EDUCATION_TAGS = {
  roost:       'Listen at dusk for fly-up cackles. Setup 100-150 yds from roost.',
  gobble:      'Mark bearing & time. Multiple gobbles = territorial gobbler.',
  strut:       'Wing drag marks confirm regular use. Setup downhill with wind in your face.',
  feeding:     'Fresh scratchings = dark soil. Turkeys return to productive feeding areas daily.',
  scratchings: 'V-shape points direction of travel. Fresh = dark & moist underneath.',
  tracks:      '4.5"+ toe-to-heel = gobbler. Center toe straighter on gobblers.',
  dustingBowl: 'Turkeys use the same bowls for generations. Great midday ambush point.',
  droppings:   'J-shaped = gobbler. Pile of droppings under a tree = roost confirmed.',
  feather:     'Iridescent tip = gobbler breast feather. Brown tip = hen.',
  sighting:    'Note flock size, direction of travel, and time. Pattern over multiple days.',
  callSetup:   'Mark what worked. Call type, volume, and cadence that drew a response.',
  pressure:    'Avoid this area opening weekend. Pressured birds go silent and relocate.',
  access:      'Low-pressure entry. Arrive before first light. Avoid slamming truck doors.',
  decoy:       'Face hen decoy toward your position. Place 15-20 yds at 10 o\'clock.',
  flydown:     'Open ground below roost timber. Setup before first light in full camo.'
};

window.getTurkeyPinIcon = function(pinType) {
  var info = window.TURKEY_PIN_TYPES[pinType] || { icon: 'TP', color: '#c8a96e', label: 'Turkey Pin' };
  var svgTemplate = window.TURKEY_PIN_SVGS[pinType] || window.TURKEY_PIN_SVGS.sighting;
  var svg = svgTemplate.replace(/#{c}/g, info.color);
  return L.divIcon({
    className: 'ht-turkey-pin-wrapper ht-turkey-pin-type-' + pinType,
    html: '<div class="ht-turkey-pin-custom" style="border-color:' + info.color + ';box-shadow:0 2px 8px rgba(0,0,0,0.6),0 0 12px ' + info.color + '40;">' +
          '<div class="ht-turkey-pin-svg">' + svg + '</div>' +
          '</div>' +
          '<div class="ht-turkey-pin-tag" style="background:' + info.color + ';">' + info.icon + '</div>',
    iconSize: [36, 46],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38]
  });
};

// ===================================================================
//   Turkey Pin Marker Registration (parallel to registerDeerPinMarker)
// ===================================================================
window.turkeyPinMarkers = new Map();

window.buildTurkeyPinPopup = function(entry) {
  var info = window.TURKEY_PIN_TYPES[entry.signType] || { label: entry.signType, description: '', color: '#c8a96e' };
  var when = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '';
  var coords = entry.coords ? entry.coords[0].toFixed(5) + ', ' + entry.coords[1].toFixed(5) : '';
  var educTag = (window.TURKEY_PIN_EDUCATION_TAGS && window.TURKEY_PIN_EDUCATION_TAGS[entry.signType]) || '';
  var confClass = entry.confidence === 'high' ? 'ht-conf-high' : (entry.confidence === 'low' ? 'ht-conf-low' : 'ht-conf-med');
  var confLabel = entry.confidence === 'high' ? '● Confirmed' : (entry.confidence === 'low' ? '○ Guessing' : '◑ Likely');
  var weight = (window.TURKEY_SIGNAL_WEIGHTS && window.TURKEY_SIGNAL_WEIGHTS[entry.signType]) || 1;
  var weightStars = weight >= 4.5 ? '★★★★★' : (weight >= 3.5 ? '★★★★☆' : (weight >= 2.5 ? '★★★☆☆' : (weight >= 1.5 ? '★★☆☆☆' : '★☆☆☆☆')));
  return '<div class="ht-pin-popup ht-turkey-pin-popup">' +
    '<div class="ht-pin-popup-header">' +
      '<span class="ht-pin-popup-type" style="color:' + info.color + ';">' + info.label + '</span>' +
      '<span class="ht-pin-popup-conf ' + confClass + '">' + confLabel + '</span>' +
    '</div>' +
    '<div class="ht-pin-popup-body">' +
      '<div class="ht-pin-popup-signal-row">' +
        '<span class="ht-pin-popup-signal-label">Signal Strength</span>' +
        '<span class="ht-pin-popup-signal-stars" style="color:' + info.color + ';">' + weightStars + '</span>' +
      '</div>' +
      (entry.notes ? '<div class="ht-pin-popup-notes">' + String(entry.notes).replace(/</g, '&lt;') + '</div>' : '') +
      '<div class="ht-pin-popup-education">' + info.description + '</div>' +
      (educTag ? '<div class="ht-pin-popup-edu-tag"><span class="ht-pin-edu-tag-icon">🎯</span> ' + educTag + '</div>' : '') +
      '<div class="ht-pin-popup-meta">' + when + (coords ? ' &bull; ' + coords : '') + '</div>' +
    '</div>' +
    '<div class="ht-pin-popup-actions">' +
      '<button class="ht-pin-popup-btn ht-pin-popup-btn--checkin" type="button" onclick="turkeyPinCheckIn(\'' + entry.id + '\')" style="background:' + info.color + ';color:#1a1612;">Check In</button>' +
      '<button class="ht-pin-popup-btn" type="button" onclick="copyTurkeyPinCoords(\'' + entry.id + '\')">Copy</button>' +
      '<button class="ht-pin-popup-btn" type="button" onclick="editTurkeyPin(\'' + entry.id + '\')">Edit</button>' +
      '<button class="ht-pin-popup-btn ht-pin-popup-btn--danger" type="button" onclick="deleteTurkeyPin(\'' + entry.id + '\')">Delete</button>' +
    '</div>' +
  '</div>';
};

window.registerTurkeyPinMarker = function(entry) {
  if (!map || !entry) return null;
  var latlng = L.latLng(entry.coords[0], entry.coords[1]);
  var marker = L.marker(latlng, { icon: window.getTurkeyPinIcon(entry.signType) }).addTo(map);
  marker.__turkeyPinData = entry;
  marker.bindPopup(window.buildTurkeyPinPopup(entry), { closeButton: true, autoClose: true, maxWidth: 310 });
  marker.on('click', function() { marker.openPopup(); });
  window.turkeyPinMarkers.set(entry.id, marker);
  return marker;
};

window.updateTurkeyPinMarker = function(entry) {
  if (!entry) return;
  var marker = window.turkeyPinMarkers.get(entry.id);
  if (!marker) return;
  marker.__turkeyPinData = entry;
  marker.setIcon(window.getTurkeyPinIcon(entry.signType));
  marker.setPopupContent(window.buildTurkeyPinPopup(entry));
};

window.copyTurkeyPinCoords = function(id) {
  var entry = null;
  if (typeof huntJournalEntries !== 'undefined') {
    entry = huntJournalEntries.find(function(e) { return e.id === id; });
  }
  var coordsText = entry && entry.coords ? entry.coords[0].toFixed(5) + ', ' + entry.coords[1].toFixed(5) : '';
  if (!coordsText) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(coordsText)
      .then(function() { showNotice('Coordinates copied.', 'success', 2200); })
      .catch(function() { showNotice('Copy failed.', 'warning', 2200); });
  }
};

window.editTurkeyPin = function(id) {
  var entry = null;
  if (typeof huntJournalEntries !== 'undefined') {
    entry = huntJournalEntries.find(function(e) { return e.id === id; });
  }
  if (!entry) return;
  openTurkeyPinModal({
    defaults: { type: entry.signType, confidence: entry.confidence, notes: entry.notes },
    onSubmit: function(data) {
      entry.signType = data.type;
      entry.confidence = data.confidence;
      entry.notes = data.notes;
      if (typeof saveHuntJournal === 'function') saveHuntJournal();
      window.updateTurkeyPinMarker(entry);
      showNotice('Turkey pin updated.', 'success', 2400);
    }
  });
};

window.deleteTurkeyPin = function(id) {
  if (typeof huntJournalEntries !== 'undefined') {
    huntJournalEntries = huntJournalEntries.filter(function(e) { return e.id !== id; });
    if (typeof saveHuntJournal === 'function') saveHuntJournal();
  }
  var marker = window.turkeyPinMarkers.get(id);
  if (marker && map) { try { map.removeLayer(marker); } catch(e) {} }
  window.turkeyPinMarkers.delete(id);
  showNotice('Turkey pin deleted.', 'info', 2400);
};

// ===================================================================
//   Turkey Pin Check-In — shows micro-pins within radius
// ===================================================================
window._turkeyCheckInLayers = [];
window.TURKEY_MICRO_PINS = {
  roost:       [{ label: 'Setup Spot', dist: 120, bearing: 'downhill', tip: 'Set up 100-150 yds downhill from roost, back to a tree wider than your shoulders' },
                { label: 'Escape Route', dist: 80, bearing: 'away from road', tip: 'Mark a quiet exit if birds go the other direction' },
                { label: 'Listening Post', dist: 200, bearing: 'ridge point', tip: 'High ground to listen at dawn before committing to setup' }],
  gobble:      [{ label: 'Ambush Point', dist: 100, bearing: 'between gobble & strut', tip: 'Set up between where he gobbles and where he wants to go' },
                { label: 'Calling Position', dist: 80, bearing: 'uphill', tip: 'Call from slightly uphill — sound carries downhill to him' }],
  strut:       [{ label: 'Blind Spot', dist: 60, bearing: 'behind terrain', tip: 'Use terrain to hide your approach. Turkeys have 270° vision.' },
                { label: 'Decoy Zone', dist: 25, bearing: 'open side', tip: 'Place decoys on the open side of the strut zone, 15-20 yds from you' },
                { label: 'Shooting Lane', dist: 15, bearing: 'clear path', tip: 'Clear shooting lanes to 40 yds. Remove branches that block your swing.' }],
  feeding:     [{ label: 'Approach Cut', dist: 80, bearing: 'downwind', tip: 'Circle downwind. Turkeys rely on eyesight but still avoid unusual scent.' },
                { label: 'Wait Point', dist: 50, bearing: 'treeline edge', tip: 'Edge of timber where you can see them coming into the feed area' }],
  scratchings: [{ label: 'Travel Direction', dist: 60, bearing: 'V points forward', tip: 'The V scratching points the direction of travel — set up ahead of it' }],
  tracks:      [{ label: 'Trail Intercept', dist: 40, bearing: 'along trail', tip: 'Set up where the trail narrows or crosses a terrain feature' }],
  dustingBowl: [{ label: 'Midday Blind', dist: 40, bearing: 'shaded side', tip: 'Dusting happens 10AM-2PM. Set up in shade with view of the bowl.' }],
  droppings:   [{ label: 'Roost Confirm', dist: 30, bearing: 'under canopy', tip: 'Pile of droppings = roost tree. Look up for large horizontal limbs at 30-50 ft.' }],
  feather:     [],
  sighting:    [{ label: 'Observation Post', dist: 100, bearing: 'elevated', tip: 'Glass from elevated ground to pattern movement over multiple days' }],
  callSetup:   [{ label: 'Response Zone', dist: 60, bearing: 'where bird came from', tip: 'Mark where the bird responded from — that\'s his preferred route' }],
  pressure:    [{ label: 'Buffer Zone', dist: 300, bearing: 'opposite side', tip: 'Move 300+ yds from pressure. Hunt the back side of the ridge.' }],
  access:      [{ label: 'Staging Area', dist: 50, bearing: 'inside treeline', tip: 'Step inside treeline to gear up. Don\'t silhouette against the road.' }],
  decoy:       [{ label: 'Kill Zone', dist: 20, bearing: 'toward decoy', tip: 'Your shot should be 15-20 yds. Decoy brings the bird to your range.' }],
  flydown:     [{ label: 'Pre-Dawn Setup', dist: 80, bearing: 'edge of opening', tip: 'Be set up 45 min before light. Turkeys fly down to open ground.' },
                { label: 'Secondary Position', dist: 150, bearing: 'alternate opening', tip: 'If primary doesn\'t work, have a backup 150 yds away' }]
};

window.turkeyPinCheckIn = function(id) {
  // Clear previous check-in layers
  window._turkeyCheckInLayers.forEach(function(layer) {
    if (map) try { map.removeLayer(layer); } catch(e) {}
  });
  window._turkeyCheckInLayers = [];

  var entry = null;
  if (typeof huntJournalEntries !== 'undefined') {
    entry = huntJournalEntries.find(function(e) { return e.id === id; });
  }
  if (!entry || !entry.coords) {
    showNotice('Pin not found.', 'warning', 2000);
    return;
  }

  var info = window.TURKEY_PIN_TYPES[entry.signType] || { label: entry.signType, color: '#c8a96e' };
  var micros = window.TURKEY_MICRO_PINS[entry.signType] || [];
  var center = L.latLng(entry.coords[0], entry.coords[1]);

  // Draw a check-in radius circle
  var radius = L.circle(center, {
    radius: micros.length ? Math.max.apply(null, micros.map(function(m) { return m.dist; })) + 50 : 200,
    color: info.color,
    fillColor: info.color,
    fillOpacity: 0.08,
    weight: 1.5,
    dashArray: '6,4',
    interactive: false
  }).addTo(map);
  window._turkeyCheckInLayers.push(radius);

  if (micros.length === 0) {
    showNotice('No micro-pins for ' + info.label + '. Scout and log more sign nearby.', 'info', 3500);
    map.setView(center, Math.max(map.getZoom(), 16));
    return;
  }

  // Place micro-pins around the center
  var angleStep = 360 / micros.length;
  micros.forEach(function(micro, i) {
    var angle = (angleStep * i - 90) * Math.PI / 180; // start north
    var offsetLat = (micro.dist / 111320) * Math.cos(angle);
    var offsetLng = (micro.dist / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
    var microLatLng = L.latLng(center.lat + offsetLat, center.lng + offsetLng);

    var microIcon = L.divIcon({
      className: 'ht-turkey-micro-pin-wrapper',
      html: '<div class="ht-turkey-micro-pin" style="border-color:' + info.color + ';">' +
            '<span class="ht-turkey-micro-label">' + micro.label + '</span>' +
            '</div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -12]
    });

    var microMarker = L.marker(microLatLng, { icon: microIcon }).addTo(map);
    microMarker.bindPopup(
      '<div class="ht-turkey-micro-popup">' +
        '<div class="ht-micro-popup-title" style="color:' + info.color + ';">' + micro.label + '</div>' +
        '<div class="ht-micro-popup-bearing">' + micro.dist + 'm ' + micro.bearing + '</div>' +
        '<div class="ht-micro-popup-tip">' + micro.tip + '</div>' +
      '</div>',
      { maxWidth: 240, closeButton: true }
    );
    window._turkeyCheckInLayers.push(microMarker);

    // Connect line from center to micro
    var line = L.polyline([center, microLatLng], {
      color: info.color,
      weight: 1.2,
      opacity: 0.5,
      dashArray: '3,5',
      interactive: false
    }).addTo(map);
    window._turkeyCheckInLayers.push(line);
  });

  // Zoom to show all micro-pins
  var group = L.featureGroup(window._turkeyCheckInLayers);
  map.fitBounds(group.getBounds().pad(0.3));
  showNotice('Check-in: ' + micros.length + ' micro-pins shown for ' + info.label, 'success', 3500);
};

// ===================================================================
//   Season-Phase Detector
// ===================================================================
window.getTurkeySeasonPhase = function() {
  var now = new Date();
  var regs = window.TURKEY_REGULATIONS_MO;
  if (!regs || !regs.seasons || !regs.seasons.spring) return null;
  var spring = regs.seasons.spring;
  var open = new Date(spring.dates.open + 'T00:00:00');
  var close = new Date(spring.dates.close + 'T23:59:59');
  var weekOneEnd = new Date(spring.weekOneEnd + 'T23:59:59');

  if (now < open || now > close) return null;

  var dayOfSeason = Math.floor((now - open) / (1000 * 60 * 60 * 24)) + 1;
  var totalDays = Math.floor((close - open) / (1000 * 60 * 60 * 24)) + 1;

  if (now <= weekOneEnd) {
    return { phase: 'early', dayOfSeason: dayOfSeason, totalDays: totalDays, label: 'Early Season (Week 1)', data: window.TURKEY_BIOLOGY.breedingSeason.early };
  } else if (dayOfSeason <= 14) {
    return { phase: 'peak', dayOfSeason: dayOfSeason, totalDays: totalDays, label: 'Peak Breeding (Week 2-3)', data: window.TURKEY_BIOLOGY.breedingSeason.peak };
  } else {
    return { phase: 'late', dayOfSeason: dayOfSeason, totalDays: totalDays, label: 'Late Season (Final Days)', data: window.TURKEY_BIOLOGY.breedingSeason.late };
  }
};

// ===================================================================
//   Weapon-Specific Setup Parameters
// ===================================================================
window.getTurkeyWeaponSetup = function(weapon) {
  var methods = window.TURKEY_REGULATIONS_MO.methods;
  var method = methods[weapon] || methods.shotgun;
  return {
    weapon: weapon,
    name: method.name,
    effectiveRange: method.effectiveRange,
    setupDistance: method.setupDistance,
    concealmentNeed: method.concealmentNeed,
    shootingLanes: method.shootingLanes,
    notes: method.notes
  };
};

// ===================================================================
//   Regulation Banner HTML Generator
// ===================================================================
window.buildTurkeyRegBanner = function() {
  var status = window.getTurkeySeasonStatus();
  if (!status) return '';

  var html = '<div class="ht-turkey-reg-banner">';

  if (status.active) {
    var s = status.active;
    html += '<div class="ht-reg-status ht-reg-open">';
    html += '<span class="ht-reg-dot ht-reg-dot--open"></span>';
    html += '<strong>' + s.name + '</strong> — OPEN';
    html += '<span class="ht-reg-days">' + s.daysRemaining + ' days remaining</span>';
    html += '</div>';
    html += '<div class="ht-reg-hours">Legal hours: ' + s.hours + '</div>';
  } else if (status.upcoming.length > 0) {
    var next = status.upcoming[0];
    html += '<div class="ht-reg-status ht-reg-closed">';
    html += '<span class="ht-reg-dot ht-reg-dot--closed"></span>';
    html += '<strong>' + next.name + '</strong> — Opens in ' + next.daysUntilOpen + ' days';
    html += '</div>';
    html += '<div class="ht-reg-date">Opens: ' + next.openDate + '</div>';
  } else {
    html += '<div class="ht-reg-status ht-reg-closed">';
    html += '<span class="ht-reg-dot ht-reg-dot--closed"></span>';
    html += '<strong>All turkey seasons closed</strong>';
    html += '</div>';
  }

  html += '</div>';
  return html;
};

console.log('HUNTECH: Turkey data engine loaded. Seasons:', Object.keys(window.TURKEY_REGULATIONS_MO.seasons).length, '| Pin types:', Object.keys(window.TURKEY_PIN_TYPES).length);

// ===================================================================
//   Turkey Habitat Overview & Look-For Maps
//   (Required by main.js getActiveHabitatOverview / getActiveHabitatLookFor)
// ===================================================================
window.TURKEY_HABITAT_OVERVIEW = {
  roostZone: 'Prime roost timber — large hardwoods on elevated terrain where gobblers spend the night',
  strutZone: 'Open or semi-open ground near roost timber where gobblers display at dawn',
  travelCorridor: 'Ridge spines, logging roads, and creek bottoms turkeys follow between daily zones',
  feedingArea: 'Open timber with fresh scratchings, field edges, and insect-rich ground',
  loafingArea: 'Shaded ground with dusting bowls where turkeys rest during midday heat',
  waterSource: 'Creek crossings, ponds, and seeps turkeys visit daily after flydown'
};

window.TURKEY_HABITAT_LOOK_FOR = {
  roostZone: 'White-Oak / Sycamore limbs 30-50 ft up, whitewash droppings below, breast feathers, J-shaped (gobbler) droppings. Evening visit to hear fly-up gobbles is the gold standard.',
  strutZone: 'Strut marks (drag lines from wing tips) in soft ground, scattered feathers, open sight lines. Best found at field points, log-road junctions, and ridgetop clearings.',
  travelCorridor: 'Tracks in mud (4.5"+ toe-to-heel = gobbler), scratchings in V-patterns pointing direction of travel, droppings and feathers along ridge spines and creek banks.',
  feedingArea: 'Fresh scratchings — overturned leaves in a V-shape. South-facing slopes warm first in early season. Insects emerge first here. Concentrate on oak flats.',
  loafingArea: 'Bowl-shaped depressions in bare ground (dusting bowls), often on south-facing logging road edges or under spreading oaks. Feathers and droppings mixed with fine dust.',
  waterSource: 'Tracks in mud and sand bars at creek crossings. Turkeys use the same crossing daily. Focus on shallow, gently sloping banks where birds can wade comfortably.'
};

// ===================================================================
//   Turkey-Specific Module Labels
// ===================================================================
window.TURKEY_EDUCATION_LABELS = {
  pinBrief: 'Setup Brief',
  reason: 'Setup briefing',
  microReason: 'Micro setup brief',
  whyTitle: 'Why this setup',
  approachTitle: 'How to set up',
  lookForTitle: 'What to look for',
  checkInLabel: 'Check In',
  checkOutLabel: 'Check Out'
};

// ===================================================================
//   Turkey Live Signal Weights
//   Used by main.js getLiveSignalWeight to score journal pins
// ===================================================================
window.TURKEY_SIGNAL_WEIGHTS = {
  roost: 5.0,
  gobble: 5.0,
  flydown: 4.8,
  strut: 4.5,
  sighting: 4.0,
  callSetup: 3.8,
  scratchings: 3.5,
  feeding: 3.2,
  dustingBowl: 3.0,
  droppings: 2.8,
  tracks: 2.5,
  feather: 2.3,
  decoy: 2.0,
  access: 1.5,
  pressure: 1.0
};
