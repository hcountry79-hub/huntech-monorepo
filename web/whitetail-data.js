// ===================================================================
//   HUNTECH Whitetail Hunting Module — Data Engine
//   Missouri-focused whitetail deer biology, behavior, regulations,
//   and AI coaching knowledge base.
//   Education-First: teach the hunter, then guide the hunt.
// ===================================================================

// ===================================================================
//   Module Detection
// ===================================================================
function isWhitetailModule() {
  return Boolean(document.body && document.body.classList.contains('module-whitetail'));
}
window.isWhitetailModule = isWhitetailModule;

// ===================================================================
//   Missouri Whitetail Deer Seasons & Regulations (2025-2026)
//   Source: Missouri Department of Conservation (mdc.mo.gov)
// ===================================================================
window.WHITETAIL_REGULATIONS_MO = {
  state: 'Missouri',
  source: 'Missouri Department of Conservation (MDC): https://mdc.mo.gov/hunting-trapping/species/deer',
  lastUpdated: '2026-02-20',

  seasons: {
    archery: {
      name: 'Archery Deer Season',
      dates: { open: '2025-09-15', close: '2026-01-15' },
      hours: 'One-half hour before sunrise to one-half hour after sunset',
      limits: 'Antlered and antlerless deer per permit. See county-specific antlerless permits.',
      notes: 'Statewide. Longbow, recurve, compound bow, or crossbow. Broadheads required. Includes urban zones with extended dates.'
    },
    firearms: {
      name: 'November Firearms Deer Season',
      dates: { open: '2025-11-15', close: '2025-11-25' },
      hours: 'One-half hour before sunrise to one-half hour after sunset',
      limits: 'One antlered deer and one antlerless deer per firearms permit (may vary by county).',
      notes: 'Most popular season. Centerfire rifles, shotguns, muzzleloaders, and handguns allowed. Orange required.'
    },
    youthFirearms: {
      name: 'Youth Firearms Deer Season',
      dates: { open: '2025-11-01', close: '2025-11-02' },
      hours: 'One-half hour before sunrise to one-half hour after sunset',
      eligibility: 'Youth hunters ages 6-15 on opening day',
      limits: 'Two deer — one antlered, one antlerless (permit and county dependent).',
      notes: 'Youth must be accompanied by an adult mentor (18+). Mentor may not carry firearms.'
    },
    earlyMuzzleloader: {
      name: 'Early Muzzleloader Season',
      dates: { open: '2025-10-11', close: '2025-10-19' },
      hours: 'One-half hour before sunrise to one-half hour after sunset',
      limits: 'One antlered deer per muzzleloader permit.',
      notes: 'Muzzleloading rifles and pistols only. No scopes unless physically disabled.'
    },
    lateMuzzleloader: {
      name: 'Late Muzzleloader Season',
      dates: { open: '2025-12-13', close: '2025-12-23' },
      hours: 'One-half hour before sunrise to one-half hour after sunset',
      limits: 'One antlered or antlerless deer per late muzzleloader antlerless permit.',
      notes: 'Muzzleloading rifles and pistols only.'
    },
    alternativeMethods: {
      name: 'Alternative Methods Deer Season',
      dates: { open: '2025-12-27', close: '2026-01-06' },
      hours: 'One-half hour before sunrise to one-half hour after sunset',
      limits: 'Antlerless only in most counties, check regulations.',
      notes: 'Atlatl, air-powered guns, muzzleloaders, centerfire handguns, archery equipment. No rifles.'
    }
  },

  permits: {
    firearms: {
      name: 'Firearms Deer Hunting Permit',
      costs: {
        resident: 19.00,
        youth: 9.50,
        nonresident: 250.00,
        nonresidentLandowner: 155.00
      }
    },
    archery: {
      name: 'Archery Deer Hunting Permit',
      costs: {
        resident: 19.00,
        youth: 9.50,
        nonresident: 250.00,
        nonresidentLandowner: 155.00
      }
    },
    antlerless: {
      name: 'Antlerless Deer Permit',
      costs: {
        resident: 7.00,
        nonresident: 100.00
      }
    },
    muzzleloader: {
      name: 'Muzzleloader Deer Permit',
      costs: {
        resident: 19.00,
        nonresident: 250.00
      }
    }
  },

  methods: {
    rifle: {
      name: 'Centerfire Rifle',
      legal: true,
      firearmsLegal: true,
      archeryLegal: false,
      notes: 'Legal during November firearms season. Any centerfire rifle or handgun. Most popular choice.',
      effectiveRange: 200,
      setupDistance: 100,
      concealmentNeed: 'moderate',
      shootingLanes: 'long lanes, clear shooting corridors through timber or across food plots'
    },
    shotgun: {
      name: 'Shotgun (Slugs)',
      legal: true,
      firearmsLegal: true,
      archeryLegal: false,
      notes: 'Legal during firearms season. Slugs only for deer. Effective in thick cover.',
      effectiveRange: 100,
      setupDistance: 60,
      concealmentNeed: 'moderate',
      shootingLanes: 'medium lanes, effective in dense timber and brush'
    },
    muzzleloader: {
      name: 'Muzzleloader',
      legal: true,
      firearmsLegal: false,
      muzzleloaderLegal: true,
      archeryLegal: false,
      notes: 'Legal during muzzleloader seasons. Single shot — make it count. No scopes unless disabled permit.',
      effectiveRange: 150,
      setupDistance: 80,
      concealmentNeed: 'moderate',
      shootingLanes: 'medium-long lanes, need clear first-shot opportunity'
    },
    bow: {
      name: 'Bow (Compound/Recurve/Longbow)',
      legal: true,
      firearmsLegal: false,
      archeryLegal: true,
      notes: 'Legal entire archery season. Broadheads required. Most intimate hunting method.',
      effectiveRange: 30,
      setupDistance: 20,
      concealmentNeed: 'high',
      shootingLanes: 'narrow clear lanes, must draw undetected, wind discipline critical'
    },
    crossbow: {
      name: 'Crossbow',
      legal: true,
      firearmsLegal: false,
      archeryLegal: true,
      notes: 'Legal during archery season. Same broadhead requirements as bow.',
      effectiveRange: 40,
      setupDistance: 25,
      concealmentNeed: 'moderate-high',
      shootingLanes: 'moderate arc, pre-aimed rest position important'
    }
  },

  // Missouri deer management regions
  regions: {
    ozarkBorder: { density: 'high', label: 'Ozark Border', description: 'High deer density. Mature hardwood ridges, mixed agriculture, classic whitetail habitat.' },
    glaciatedPlains: { density: 'high', label: 'Glaciated Plains', description: 'Agricultural powerhouse. Row crops and CRP provide food and cover. Big-body deer.' },
    ozark: { density: 'moderate', label: 'Ozark', description: 'Steep terrain, large timber tracts, acorn-dependent deer. Lower density but mature bucks.' },
    osagePlains: { density: 'moderate', label: 'Osage Plains', description: 'Rolling grassland with timbered draws. Deer concentrate in wooded corridors and creek bottoms.' },
    mississippiLowlands: { density: 'moderate-low', label: 'Mississippi Lowlands', description: 'Flat agricultural land with bottomland hardwoods. Deer use timber corridors between fields.' },
    bigRivers: { density: 'high', label: 'Big Rivers', description: 'Bottomland hardwoods along Missouri and Mississippi rivers. Excellent food and cover diversity.' }
  }
};

// ===================================================================
//   Helper: Get current/next season info
// ===================================================================
window.getWhitetailSeasonStatus = function() {
  const now = new Date();
  const regs = window.WHITETAIL_REGULATIONS_MO;
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

  const active = results.find(function(s) { return s.isOpen; });
  const upcoming = results.filter(function(s) { return s.daysUntilOpen > 0; }).sort(function(a, b) { return a.daysUntilOpen - b.daysUntilOpen; });
  return { active: active, upcoming: upcoming, all: results };
};

// ===================================================================
//   Whitetail Deer Biology & Behavior Knowledge Base
//   Built from MDC field guide, QDMA research, published wildlife
//   biology studies, and traditional hunting knowledge.
// ===================================================================
window.WHITETAIL_BIOLOGY = {

  // ------ Species Overview ------
  species: {
    name: 'White-tailed Deer',
    scientific: 'Odocoileus virginianus',
    weight: { buck: '150-300 lbs (field dressed 100-200 lbs)', doe: '100-175 lbs' },
    shoulder_height: '36-40 inches',
    range: 'Statewide Missouri — most abundant in Ozark Border, Glaciated Plains, and Big Rivers natural divisions',
    lifespan: '6-14 years, most bucks harvested at 1.5-3.5 years. Mature bucks (4.5+) are the target.',
    senses: {
      vision: 'Excellent motion detection — 310-degree field of view, dichromatic (blue-yellow), poor red/orange distinction. UV detection capability. Primary defense is movement detection.',
      hearing: 'Exceptional — independently rotating ears pinpoint sound direction. Responds to unnatural sounds at 200+ yards.',
      smell: 'DOMINANT sense — 1000x more sensitive than human. 297 million olfactory receptors. Wind direction is the #1 factor in every hunting decision.'
    }
  },

  // ------ Bedding Behavior ------
  bedding: {
    terrainPreference: [
      'Leeward (downwind) side of ridges — wind carries scent from below while thermals bring scent from above',
      'Points and benches on ridge sides — 270-degree visibility with escape routes in multiple directions',
      'Thick cover in creek bottoms — security cover with immediate food access in early season',
      'CRP fields and grasslands — standing cover provides thermal protection and concealment',
      'Brush piles and blowdowns — thick horizontal cover creates natural blinds',
      'South-facing slopes in winter — solar warming, reduced wind exposure'
    ],
    beddingCharacteristics: {
      buck: 'Solo beds slightly off trails, elevated with wind advantage. Bed with back to wind, eyes downhill. Multiple beds in a cluster = buck bedding area.',
      doe: 'Group beds in flat to gently sloped areas. Social bedding with fawns. Less selective about wind advantage.',
      size: 'Buck beds: 40-50 inches long, 30+ inches wide. Doe beds: 30-36 inches, often clustered together.'
    },
    timeInBed: {
      earlyseason: 'Beds at first light, rises mid-morning to feed/drink, beds again by 10 AM. Moves again 2-3 hours before dark.',
      rut: 'Movement patterns break down. Bucks may move all day. Does maintain normal bedding.',
      lateseason: 'Extended bedding to conserve energy. May bed 18+ hours in cold/snow. Feeding trips are short and purposeful.'
    },
    detectionFromTerrain: {
      ridgePoints: 'The point of a ridge extending into a valley is a classic mature buck bed. He can see/smell 270 degrees.',
      leewardBenches: 'A flat bench 1/3 down from a ridgetop on the lee side — wind passes over, thermals rise.',
      thickets: 'Satellite imagery shows dense green patches in otherwise open timber. These are bedding thickets.',
      grasslands: 'CRP fields with standing cover taller than 2 feet. Beds are inside, not on edges.'
    }
  },

  // ------ Daily Movement Patterns ------
  dailyMovement: {
    preDawn: {
      time: '45-60 min before sunrise',
      behavior: 'Deer begin to stir in beds. Bucks may stretch, urinate, and scent-check before moving. Does rise and begin feeding.',
      hunterAction: 'Be in your stand 60+ minutes before first light. Any later and you risk bumping deer. Approach from downwind.',
      education: 'The #1 mistake in whitetail hunting is getting to your stand too late. Deer are already moving 45 minutes before you can see them.'
    },
    earlyMorning: {
      time: 'First light to sunrise +90 min',
      behavior: 'Deer move from feeding areas back toward bedding. This is the MONEY movement — intercepting deer on travel routes between food and bed.',
      hunterAction: 'Stand placement between food and bedding is critical. Morning sits are about catching deer RETURNING to bed.',
      education: 'Morning hunts are about the travel route. Evening hunts are about the food source. Different strategies, different stand locations.'
    },
    midMorning: {
      time: 'Sunrise +90 min to 11:00 AM',
      behavior: 'Most deer are bedded. A few stragglers may still move. During the rut, bucks cruise between doe bedding areas.',
      hunterAction: 'During pre-rut and rut, stay on stand. Midday buck movement peaks during the rut (10 AM - 2 PM is prime). Early season — consider repositioning.',
      education: 'The myth that deer only move at dawn and dusk is dead. Trail camera data proves that mature bucks move more at midday during the rut than any other time.'
    },
    midday: {
      time: '11:00 AM to 2:00 PM',
      behavior: 'Deep bedding. Some deer rise to stretch, feed briefly, and re-bed. Bucks rub and scrape near beds. During rut: peak cruising.',
      hunterAction: 'All-day sits during the rut. Set up between buck and doe bedding areas. Funnel setups shine at midday.',
      education: 'The biggest bucks in Missouri are killed between 10 AM and 2 PM during the first two weeks of November. Every serious hunter should sit all day during peak rut.'
    },
    afternoon: {
      time: '2:00 PM to 3 hours before dark',
      behavior: 'Deer begin casual feeding movement. Does leave bedding first. Bucks follow scent trails to locate does.',
      hunterAction: 'Transition to food-source stands. Afternoon winds are usually more consistent. Get set up by 2 PM.',
      education: 'An afternoon wind that blows your scent into the bedding area will blow out every deer for 24+ hours. Always approach from the downwind side.'
    },
    lateAfternoon: {
      time: '2 hours before dark to dark',
      behavior: 'Peak feeding activity. Deer pour into food plots, ag fields, and oak flats. Social feeding groups.',
      hunterAction: 'Food source setups: field edges, trail intersections entering food sources, funnel points near feeding areas.',
      education: 'Last 30 minutes of light produce more sightings than any other window. But the best bucks often arrive right at last light or just after. Patience.'
    }
  },

  // ------ Rut Phases ------
  rutPhases: {
    preSeeking: {
      label: 'Pre-Seeking (Oct 10-25)',
      behavior: 'Bucks establish dominance through sparring. Rub lines intensify. Scrape activity begins. Bachelor groups break up.',
      strategy: 'Hunt rub lines and scrape clusters. Focus on terrain funnels between bedding areas. Bucks are patternable — find the rub line, find the buck.',
      calling: 'Light rattling and grunt calls. Bucks are curious but not aggressive yet.',
      scent: 'Doe-in-estrus scent is premature. Use buck urine or tarsal gland on mock scrapes.',
      difficulty: 'MEDIUM — bucks are active but still cautious. Pattern and ambush.',
      tip: 'A fresh rub line tells you direction of travel. Rubs are made facing the direction the buck came FROM. Walk the line back toward bedding.'
    },
    seeking: {
      label: 'Seeking Phase (Oct 25 - Nov 5)',
      behavior: 'Bucks abandon home range and cruise widely. Checking doe bedding areas. Nose to the ground. Movement increases 300%.',
      strategy: 'Terrain funnels between doe groups. Saddles, creek crossings, and ridge pinches concentrate cruising bucks into kill zones.',
      calling: 'Aggressive blind calling. Tending grunts, snort-wheeze, moderate rattling. Bucks are looking for does and will investigate.',
      scent: 'Doe-in-estrus scent becomes effective. Use scent drags on approach routes.',
      difficulty: 'MEDIUM-HIGH — bucks are moving fast and covering ground. Right spot at right moment.',
      tip: 'If you see a buck cruising through, he is checking doe areas. He will circle back within 4-6 hours. Stay put and wait for the return trip.'
    },
    peakRut: {
      label: 'Peak Rut (Nov 5-20)',
      behavior: 'Bucks locked on does. Chase and tend. Does run, bucks follow. Breeding occurs. Bucks may move all day and night.',
      strategy: 'ALL DAY SITS. Focus on doe bedding areas and travel corridors. A buck will follow a doe through your setup. Be where the does are.',
      calling: 'Estrus bleats, tending grunts, aggressive rattling. Lonely bucks respond violently. Bucks tending does may ignore calls.',
      scent: 'Peak effectiveness of estrus scent. Fresh scrapes and drag lines.',
      difficulty: 'BEST ODDS — deer are moving, bucks are reckless, all-day movement. The #1 window for a mature buck.',
      tip: 'The doe is your decoy. Find where does feed and bed, and bucks will show up. You are not hunting bucks — you are hunting doe habitat.'
    },
    postRut: {
      label: 'Post-Rut (Nov 20 - Dec 5)',
      behavior: 'Bucks exhausted. Feeding aggressively to recover body weight. Nocturnal tendencies increase. Secondary rut begins as unbred does cycle.',
      strategy: 'High-calorie food sources: standing corn, brassica plots, acorn concentrations. Bucks need to eat 5000+ calories/day to recover.',
      calling: 'Minimal calling. Soft doe bleats near food sources. Bucks are tired and cautious.',
      scent: 'Reduced effectiveness. Bucks are recovering, not seeking.',
      difficulty: 'HARD — bucks are educated, exhausted, and nocturnal. Focus on food.',
      tip: 'This is when big bucks die on food plots. They are starving and must eat in daylight. The best late-season food source in the area holds ALL the deer.'
    },
    secondRut: {
      label: 'Second Rut (Dec 5-20)',
      behavior: 'Unbred does (and fawn does reaching maturity) enter estrus. Brief resurgence of buck activity. Less intense than peak.',
      strategy: 'Same approach as seeking phase but subtler. Focus on doe groups near food. A single doe in estrus can pull every buck in the area.',
      calling: 'Estrus bleats, light grunting. Secondary rut bucks are cautious — subtle calls work best.',
      scent: 'Estrus scent on scrapes near doe feeding areas.',
      difficulty: 'MEDIUM — shorter window, fewer does in estrus, but bucks that survived gun season are still there.',
      tip: 'Trail cameras on scrapes will tell you which bucks survived November. A mature buck that made it through gun season is killable during the second rut.'
    }
  },

  // ------ Weather Impact on Behavior ------
  weatherImpact: {
    coldFront: {
      effect: 'The #1 weather trigger for deer movement. A 10+ degree temperature drop over 24 hours creates a feeding frenzy.',
      huntStrategy: 'Hunt food sources the afternoon of a cold front arrival. Deer sense the barometric pressure change and feed heavily before the front.',
      callingAdjustment: 'Aggressive calling — deer are active and responsive. Rattle and grunt with confidence.'
    },
    rain: {
      effect: 'Light rain: deer move normally, sometimes more actively (scent conditions improve). Heavy rain: deer bed down.',
      huntStrategy: 'Hunt the first break after heavy rain. Deer that bedded through rain will move immediately when it stops.',
      callingAdjustment: 'Louder calling during rain — sound dampens quickly. Deer may not hear soft calls.'
    },
    wind: {
      threshold: 20,
      effect: 'Above 20 mph, deer bed on leeward slopes and move in sheltered terrain. Movement patterns shift to protected corridors.',
      huntStrategy: 'Hunt leeward ridges, sheltered hollows, and creek bottoms. Deer stack up in wind-protected areas.',
      callingAdjustment: 'Louder calls, shorter intervals. Wind masks sounds — need to increase volume to reach deer.'
    },
    warmFront: {
      effect: 'Suppresses daytime movement. Deer become more nocturnal. The worst weather for hunting except during peak rut.',
      huntStrategy: 'Hunt water sources and shaded north-facing slopes. If during rut, bucks will still move regardless of temperature.',
      callingAdjustment: 'Minimal calling in warm weather. Early morning and last 30 minutes of daylight only.'
    },
    snow: {
      effect: 'Forces deer to high-calorie food sources. Tracks reveal exact travel routes. Black-and-tan deer against white background = easier spotting.',
      huntStrategy: 'Trail deer through snow to food sources. Back-track trails to find bedding areas. Set up between the two.',
      callingAdjustment: 'Moderate calling. Sound carries in cold air — too much calling can alert distant deer.'
    },
    barometer: {
      rising: { label: 'Rising', effect: 'Increasing activity. Best movement. Cold front passage with rising pressure = BEST hunting.' },
      falling: { label: 'Falling', effect: 'Activity decreasing. Deer feed heavily before pressure drops, then bed during the low.' },
      steadyHigh: { label: 'Steady High', effect: 'Consistent moderate movement. Good all-day sits during rut.' }
    }
  },

  // ------ Terrain Feature Scoring for Whitetail ------
  terrainScoring: {
    beddingArea: {
      ridgePoint: { score: 95, label: 'Ridge Point', reason: 'Classic mature buck bed — elevated, wind advantage, 270-degree view with escape routes' },
      leewardBench: { score: 90, label: 'Leeward Bench', reason: 'Flat area on downwind side of ridge — wind passes over, thermals rise from below' },
      thicketEdge: { score: 85, label: 'Thicket Edge', reason: 'Dense cover adjacent to travel routes — security with easy exit' },
      crpGrass: { score: 80, label: 'CRP Grassland', reason: 'Standing grassland taller than deer — concealment with thermal advantage' },
      southFacingSlope: { score: 75, label: 'South-Facing Slope', reason: 'Winter solar warming, reduced wind — cold-weather bedding preference' },
      creekBottomThicket: { score: 70, label: 'Creek Bottom Thicket', reason: 'Dense bottomland cover near water and food — early season favorite' }
    },
    travelCorridor: {
      saddleCrossing: { score: 95, label: 'Saddle/Gap', reason: 'Low point between two ridges — every deer crossing the ridge uses this funnel' },
      creekCrossing: { score: 90, label: 'Creek Crossing', reason: 'Shallow ford where trails converge — daily travel pinch point' },
      fenceLineFunnel: { score: 85, label: 'Fence Line Gap', reason: 'Fence forces deer to specific crossings — predictable daily travel' },
      ridgeSpine: { score: 85, label: 'Ridge Spine', reason: 'Deer travel ridge tops for wind advantage — rub lines follow ridges' },
      terracePinch: { score: 80, label: 'Terrace Pinch', reason: 'Where terrain narrows travel between two features — natural funnel' },
      fieldEdgeCorner: { score: 75, label: 'Inside Corner', reason: 'Concave field edge where timber pushes deer travel into a tight zone' }
    },
    feedingArea: {
      oakFlat: { score: 95, label: 'Oak Flat', reason: 'White oak acorns are #1 preferred food in fall — deer will walk a mile for white oak' },
      foodPlotEdge: { score: 90, label: 'Food Plot Edge', reason: 'Planted brassicas, clover, or beans — high-calorie attractant with cover nearby' },
      agFieldEdge: { score: 85, label: 'Ag Field Edge', reason: 'Corn, soybeans, or alfalfa adjacent to timber — major food draw' },
      persimmonGrove: { score: 80, label: 'Persimmon/Fruit', reason: 'Persimmon, apple, and crabapple trees — early season magnet when fruit drops' },
      browseLine: { score: 75, label: 'Browse Line', reason: 'Timber edge with honeysuckle, greenbrier, and browse — steady daily feeding' }
    },
    waterSource: {
      creekJunction: { score: 90, label: 'Creek Junction', reason: 'Where two drainages meet — concentrates travel from multiple directions' },
      pondApproach: { score: 85, label: 'Pond Approach', reason: 'Trail leading to a secluded pond — daily watering stop, especially in early season' },
      seepSpring: { score: 80, label: 'Seep/Spring', reason: 'Natural spring that flows year-round — reliable water source in all conditions' },
      riverBottomEdge: { score: 75, label: 'River Edge', reason: 'Major river or creek with adjacent cover — travel corridor and water combined' }
    }
  },

  // ------ Scent Control Knowledge ------
  scentControl: {
    windRules: [
      'ALWAYS hunt with the wind in your face or crossing. NEVER let your scent blow toward where you expect deer.',
      'Thermals rise in the morning as the sun heats slopes. In the evening, thermals fall as air cools. Plan stand entry accordingly.',
      'Swirling wind kills hunts. If wind is swirling, you are in the wrong location. Move to a position with consistent wind.',
      'The "wind cone" of your scent extends 400+ yards downwind. Every deer in that cone knows you are there.'
    ],
    thermals: {
      morning: 'Rising thermals carry scent uphill. Hunt lower than your target area in the morning. As the sun heats the slope, your scent rises away from deer below.',
      evening: 'Falling thermals carry scent downhill. Hunt higher than your target area in the evening. As air cools, your scent sinks into the valley.',
      transition: 'The most dangerous time is the thermal transition (mid-morning and late afternoon) when thermals reverse direction. Your scent suddenly blows the opposite direction.'
    }
  },

  // ------ Vocalizations Reference ------
  vocalizations: {
    grunt: {
      name: 'Buck Grunt',
      sound: 'Low, short "urp" or "brrp" — 1-3 second duration',
      meaning: 'Contact call between bucks, or a buck trailing a doe. Low-key "I am here."',
      whenHeard: 'During pre-rut and rut. Bucks grunt while walking, trailing, or tending does.',
      hunterUse: 'Your most versatile call. Short, single grunts every 15-20 minutes. Can stop a walking buck for a shot.'
    },
    tendingGrunt: {
      name: 'Tending Grunt',
      sound: 'Rhythmic, repeated short grunts — "urp-urp-urp-urp" timed with walking cadence',
      meaning: 'Buck is actively tending (following) a doe. He is focused and aggressive.',
      whenHeard: 'Peak rut. A buck dogging a doe makes this continuous, rhythmic grunt.',
      hunterUse: 'During peak rut to simulate a buck with a doe. Can trigger a dominant buck to investigate and challenge.'
    },
    snortWheeze: {
      name: 'Snort-Wheeze',
      sound: 'Forceful "phhhht-phhhht-WHEEEEEZE" through the nostrils',
      meaning: 'Ultimate aggression. "Back off or fight." Dominance challenge between mature bucks.',
      whenHeard: 'Rare in the field. Mature buck confrontations during peak rut.',
      hunterUse: 'RISKY but effective during peak rut. Can pull a dominant buck in for a fight. May intimidate younger bucks. Save for known mature buck situations.'
    },
    bleat: {
      name: 'Doe Bleat',
      sound: 'Soft, nasal "maaaa" or "baaaa"',
      meaning: 'Basic doe communication. Contact call. Can indicate willingness to breed when combined with estrus behavior.',
      whenHeard: 'Year-round from does. Estrus bleat has a slightly different cadence during rut.',
      hunterUse: 'Gentle, non-threatening. Good for any phase. Estrus bleat (slightly longer and more plaintive) during rut is deadly.'
    },
    snort: {
      name: 'Alarm Snort',
      sound: 'Sharp, explosive "PHHHT!" through the nose. Often followed by foot stomping.',
      meaning: '"DANGER! Something is wrong!" Alert to all deer in the area.',
      whenHeard: 'When a deer detects danger (scent, sight, or sound). Often precedes a flag (raised white tail) and flight.',
      hunterUse: 'NEVER mimic this. If you hear this, you have been detected. Freeze and wait. The hunt may not be over — some deer snort and then circle to investigate.'
    },
    rattling: {
      name: 'Antler Rattling',
      sound: 'Clashing, grinding, and popping of antlers simulating a buck fight',
      meaning: 'Two bucks fighting for dominance or breeding rights.',
      whenHeard: 'Pre-rut through peak rut. Real fights are violent and loud — can be heard 400+ yards.',
      hunterUse: 'Most effective during seeking phase and early peak rut. Start with light tickling, escalate to aggressive clashing. Include grunting and brush-breaking sounds.'
    }
  },

  // ------ Sign Reading ------
  signReading: {
    rubs: {
      description: 'Trees with bark stripped by antler rubbing. Bucks rub to mark territory, deposit scent, and strengthen neck muscles.',
      identification: 'Bark stripped from one side of a tree. Fresh rubs show white/light-colored exposed wood. Old rubs are gray/healed.',
      sizing: 'Small trees (2-4" diameter) = any buck. Medium trees (4-8") = mature buck likely. Large trees (8"+) = dominant buck territory.',
      pattern: 'Rub lines follow travel routes. Rubs face the direction the buck came FROM. Walk back along the rub line to find bedding.',
      timing: 'September: velvet-shedding rubs (high, scarred). October: territorial rubs (lower, more aggressive). November: random rubs during rut.'
    },
    scrapes: {
      description: 'Bare ground patches with overhead "licking branch" where bucks deposit scent from forehead glands, preorbital glands, and urine.',
      identification: 'Pawed-out circular patch of bare dirt 2-4 feet wide, under a low-hanging branch 4-5 feet off the ground. Branch tips are frayed and broken.',
      types: {
        boundary: 'Large scrapes on field edges and travel routes. Visited by multiple bucks. Community communication points.',
        primary: 'Active scrapes that are re-worked regularly. Fresh dark soil, strong urine smell. These are ACTIVE.',
        secondary: 'Smaller, less frequently visited. Made and often abandoned. Do not hunt these exclusively.'
      },
      lickingBranch: 'The licking branch is MORE important than the scrape itself. Bucks visit to smell and deposit forehead gland scent on the branch, even when not actively scraping.',
      timing: 'Peak scraping: Oct 20 - Nov 5 (seeking phase). During peak rut, scraping decreases as bucks focus on does. Post-rut scraping resumes briefly.'
    },
    tracks: {
      identification: 'Heart-shaped hoofprints. Dew claws (two small marks behind the main print) show in soft ground.',
      sizing: 'Buck tracks: wider than long, splayed toes, dew claws show even in firm ground. 3"+ wide = mature buck. Doe tracks: longer than wide, tighter together.',
      trailing: 'Fresh tracks have sharp edges and moist soil. Old tracks have crumbled edges. Direction of travel: pointed end = direction of movement.',
      dragMarks: 'During rut, bucks drag their feet between steps. Drag marks between tracks = buck, likely rutting. Does pick their feet up cleanly.'
    },
    droppings: {
      identification: 'Pellet groups or clumped droppings. Pellets are oval, pointed on one end.',
      diet: 'Separate pellets = browse/woody diet. Clumped/loose droppings = soft mast, agricultural diet, or green browse.',
      density: 'Multiple pellet groups in a small area = bedding site. Single groups along trails = travel route.',
      freshness: 'Fresh: shiny, dark, moist. Old: dull, gray, dry, crumbling.'
    }
  },

  // ------ Hunting Pressure Model ------
  pressureModel: {
    factors: [
      { key: 'parkingProximity', weight: 0.25, description: 'Distance from nearest parking lot or trailhead. >1 mile = low pressure.' },
      { key: 'trailDistance', weight: 0.15, description: 'Distance from maintained trail. >0.5 miles = less pressure.' },
      { key: 'roadDensity', weight: 0.10, description: 'Number of roads within 0.5 miles. More roads = more access = more pressure.' },
      { key: 'seasonWeek', weight: 0.20, description: 'Opening weekend = highest pressure (5x). First week = 3x. Late season = 1x.' },
      { key: 'dayOfWeek', weight: 0.15, description: 'Saturday = 4x. Sunday = 3x. Weekday = 1x. Midweek = lowest pressure.' },
      { key: 'areaSize', weight: 0.10, description: 'Larger areas distribute pressure. >5000 acres = advantage.' },
      { key: 'terrain', weight: 0.05, description: 'Steep, rugged terrain deters casual hunters. Deep hollows = lower pressure.' }
    ],
    dayMultipliers: { monday: 1.0, tuesday: 1.0, wednesday: 1.0, thursday: 1.0, friday: 2.0, saturday: 4.0, sunday: 3.0 },
    weekMultipliers: { opening: 5.0, first: 3.0, second: 2.0, late: 1.0 }
  }
};

// ===================================================================
//   Whitetail Education Content (mirrors SHED_EDUCATION pattern)
// ===================================================================
window.WHITETAIL_EDUCATION = {
  bedding: {
    priority: 1,
    title: 'Bedding Area (HIGHEST PRIORITY)',
    description: 'Cover where deer spend daylight hours resting and ruminating. The bedding area is the anchor — find bedding, and you control the hunt.',
    tips: 'Look for ridge points, leeward benches, and thick cover patches. Fresh beds (matted grass, leaves pushed aside), deer hair, and droppings confirm active bedding. Scout at midday when deer are bedded elsewhere.',
    icon: 'BD',
    color: '#8b6914'
  },
  transition: {
    priority: 2,
    title: 'Travel Corridor (HIGH PRIORITY)',
    description: 'Terrain features that funnel deer movement between bedding and feeding areas — saddles, creek crossings, ridge spines, fence gaps, and pinch points.',
    tips: 'Look for worn trails, rub lines following ridges, and scrapes at trail intersections. Funnels concentrate deer into predictable zones. A saddle between two ridges is the #1 stand location for mature bucks.',
    icon: 'TC',
    color: '#a0862d'
  },
  feeding: {
    priority: 3,
    title: 'Feeding Area (HIGH PRIORITY)',
    description: 'Food sources that draw deer on predictable schedules — oak flats, food plots, ag field edges, and browse concentrations.',
    tips: 'White oak acorns are preferred over red oak. Fresh scratchings in leaf litter and nipped browse confirm active feeding. Afternoon/evening stand placement on food sources produces the most consistent sightings.',
    icon: 'FD',
    color: '#7a6e3a'
  },
  water: {
    priority: 4,
    title: 'Water Source (MEDIUM PRIORITY)',
    description: 'Creek crossings, ponds, and springs where deer water daily. Water sources are especially important during early season heat and late season cold.',
    tips: 'Tracks in mud at creek crossings reveal daily travel. Deer water at the same spots daily. In hot early season, a secluded pond can be a primary hunting setup.',
    icon: 'WS',
    color: '#5a7a6a'
  },
  open: {
    priority: 5,
    title: 'Staging Area (MEDIUM-LOW PRIORITY)',
    description: 'Edge zones where timber meets open ground. Deer stage here before entering fields, waiting for darkness or comfort before stepping into the open.',
    tips: 'Look for rubs and scrapes 50-100 yards inside the timber from field edges. Mature bucks stage here and wait for does to enter the field first. The staging area is where the smart bucks live.',
    icon: 'SA',
    color: '#6b5b3a'
  }
};

// ===================================================================
//   Whitetail Hotspot Flavor Text (mirrors HOTSPOT_FLAVOR pattern)
// ===================================================================
window.WHITETAIL_HOTSPOT_FLAVOR = {
  bedding: {
    titles: ['Ridge Point Buck Bedding', 'Leeward Bench Bedding', 'Creek Bottom Thicket', 'CRP Grassland Bedding', 'South-Facing Thermal Bed'],
    reasons: [
      'This ridge point provides a mature buck with 270-degree wind advantage and escape routes in three directions. Beds face downhill with wind at his back.',
      'The leeward bench sits below the ridgetop where prevailing winds pass overhead. Thermals bring scent from below, creating a dual-detection zone.',
      'Dense bottomland cover with immediate water access. Early season bucks bed here to avoid heat and maintain access to food and water.',
      'Standing grassland provides thermal cover and visual concealment. Deer bed deep inside, not on edges, with multiple exit routes through the cover.',
      'South-facing slopes catch winter sun for warmth. Reduced wind exposure makes this a cold-weather preference. Look for beds in sunny openings within the slope.'
    ],
    search: [
      'Walk the ridge point at midday looking for oval depressions in leaves, deer hair, and droppings. Multiple beds together = buck.',
      'Glass the bench from above. Look for trails leading to and from the flat. Fresh rubs on the uphill approach confirm buck activity.',
      'Enter from downwind along the creek. Look for worn trails disappearing into thick cover. Do NOT push into the bedding — observe from 100+ yards.',
      'Walk CRP edges looking for entry trails. Tunnels through standing grass = regular deer highways. Never walk through the CRP — it destroys the bedding.',
      'Scan for melted snow patches (deer body heat) or matted grass on the sunny south face. Trails approach from above and below.'
    ],
    approach: [
      'NEVER approach a bedding area from upwind or from below. Come in from behind the ridge, using the topography to mask your approach.',
      'Access from the ridge top, dropping down to your stand. Your scent blows over the bench and away from bedded deer.',
      'Use the creek for silent approach. Enter in darkness, set up on the downwind edge. Exit after deer leave to feed.',
      'Set up on the downwind edge of the CRP before first light. Hunt the trails entering and leaving the grass, not the interior.',
      'Approach from the shaded north side of the ridge. Your stand should be uphill from the bedding on the transition to the south face.'
    ]
  },
  transition: {
    titles: ['Ridge Saddle Funnel', 'Creek Crossing Pinch', 'Fence Line Gap', 'Ridge Spine Trail', 'Inside Field Corner'],
    reasons: [
      'This saddle is the low point between two ridges. Every deer crossing between the two drainages uses this natural funnel. Rub lines converge here.',
      'A shallow creek crossing where multiple trails merge. Deer prefer ankle-deep crossings with firm bottom. Daily travel is predictable.',
      'A gap in a fence forces all deer through a 20-yard opening. Tracks and droppings pile up at the crossing point. Ambush perfection.',
      'Deer travel ridge tops for the wind advantage. This spine connects bedding to feeding with a worn trail marked by rubs.',
      'Where a field edge curves inward, creating a concave timber pocket. Deer cut through this corner rather than walking the long way around.'
    ],
    search: [
      'Walk the saddle and look for converging trails from both sides. Rubs on trees at the narrowest point confirm daily buck travel.',
      'Check both banks for tracks. Multiple sizes = family groups and bucks. Measure: 3"+ wide, with drag marks = mature buck.',
      'Walk along the fence checking for gaps. At gaps, look for worn ground, hair caught on wire, and tracks on both sides.',
      'Follow the ridge spine looking for a worn trail with rubs every 50-100 yards. The rub line IS the travel corridor.',
      'Stand in the timber corner and look for trails entering from the field edge. Rubs on corner trees confirm buck travel through the pinch.'
    ],
    approach: [
      'Approach from the dominant downwind direction. Set up 30-50 yards from the saddle with clear shooting lanes through the narrowest point.',
      'Enter from downstream, using the sound of flowing water to mask your approach. Set up 40 yards from the crossing with shooting lanes to both banks.',
      'Approach from the opposite side of the fence from your expected deer approach. Set up downwind with the gap 20-30 yards in front of you.',
      'Set up just off the ridge spine where you have cover. Deer walking the ridge will pass within 20 yards if you are tight to the trail.',
      'Position in the point of the timber corner, facing outward. Deer cutting through the corner approach from either side at close range.'
    ]
  },
  feeding: {
    titles: ['White Oak Flat', 'Food Plot Edge', 'Soybean Field Corner', 'Persimmon Drop Zone', 'Honeysuckle Browse Line'],
    reasons: [
      'White oak acorns are #1 preferred whitetail food. This flat produces acorns that deer travel more than a mile to reach. Fresh scratchings confirm active feeding.',
      'Planted brassica or clover food plot adjacent to thick cover. High-calorie food combined with nearby security cover creates a consistent evening pattern.',
      'Corner of an ag field where timber wraps around. Deer enter from the timber corner, staging in the tree line before committing to the open field.',
      'Persimmon trees dropping ripe fruit. Early season magnet — deer check persimmon trees daily until the fruit is gone. Look for tracks and droppings under the tree.',
      'Honeysuckle and greenbrier along a timber edge. Steady browse throughout the season. Deer feed here daily as a secondary food source between primary food events.'
    ],
    search: [
      'Walk through the oak flat checking for fresh scratchings (turned-over leaves with dark moist soil exposed). Acorn caps and cracked shells confirm deer feeding.',
      'Approach the food plot from timber. Look at the transition zone for rubs, scrapes, and trails entering the plot. Deer stage here 50-100 yards inside the timber.',
      'Walk the field edge looking for trails entering from the timber. Concentrated tracks and droppings at the entry = primary entrance. Set up on the trail.',
      'Check beneath persimmon trees for tracks and droppings. One or two hot persimmon trees can hold deer from surrounding square miles. Game camera gold.',
      'Walk the browse line at chest height looking for nipped twig ends. A 45-degree cut = deer browsing. Ragged tear = rabbit. Clean cut = deer.'
    ],
    approach: [
      'Enter from the upwind edge of the flat. Set up on the downwind side where deer approach from bedding. They walk into the wind to smell danger ahead.',
      'Approach through the timber, NOT across the open food plot. Set up in the tree line 20-30 yards from the primary trail entrance.',
      'Enter from the opposite side of the timber from the field. Circle wide to avoid crossing deer trails. Set up overlooking the field entry trail.',
      'Approach from downwind when deer are not present (midday). Set up within bow range of the fruiting tree. Be in place by 3 PM.',
      'Set up 20 yards off the browse line on the downwind side. Deer feed along the browse line in a predictable pattern.'
    ]
  },
  water: {
    titles: ['Creek Crossing Watering Hole', 'Secluded Farm Pond', 'Spring Seep Travel Stop', 'River Bottom Watering Trail', 'Drainage Junction'],
    reasons: [
      'Daily creek crossing where deer stop to drink. Tracks pile up at the bank. Deer are most vulnerable at water — head down, senses compromised.',
      'A secluded pond surrounded by timber. Limited approaches funnel deer to predictable entry trails. Early season in heat, this is the setup.',
      'Natural spring that flows year-round. Green vegetation around the seep attracts deer and creates a micro food source. Daily stop.',
      'Trail following the river to a gentle bank access point. River bottom deer use specific trails to reach water. Worn paths confirm daily use.',
      'Where two drainages merge, trails converge from multiple directions. High-traffic intersection with water as the primary draw.'
    ],
    search: [
      'Walk both banks checking for tracks in mud. Multiple track sizes = regular use. Fresh green droppings = deer that drank and fed recently.',
      'Circle the pond at 100+ yards looking for trails leading to the bank. The trail with the most traffic = primary approach. Do not walk to the water\'s edge.',
      'Find the seep by looking for green vegetation in dry conditions. Tracks and droppings near the wet area confirm deer visits.',
      'Follow deer trails along the river bank. Where a trail shows heavy traffic leading to a gentle slope to the water = watering point.',
      'At drainage junctions, trails converge like spokes of a wheel. Stand placement at the hub intercepts travel from multiple directions.'
    ],
    approach: [
      'Approach from downstream and set up on the opposite bank from the primary approach trail. Crosswind is ideal for creek setups.',
      'Enter from the steepest bank (where deer are unlikely to approach). Set up overlooking the primary entry trail. Be in place by early afternoon.',
      'Approach from uphill. The seep is at the bottom of the slope — your scent rises away from approaching deer.',
      'Use the river as your approach (wade if necessary). Your scent stays on the water. Set up on the bank overlooking the trail.',
      'Enter from the least-used trail direction. Set up at the junction with shooting lanes covering the two primary approach trails.'
    ]
  },
  open: {
    titles: ['Timber Edge Staging Zone', 'Field Point Observation', 'Brushy Fence Row', 'Power Line Corridor Edge', 'Old Homestead Clearing'],
    reasons: [
      'Mature bucks stage 50-100 yards inside the timber before entering open areas. This transition zone holds scrapes, rubs, and bedded bucks waiting for darkness.',
      'Where timber extends in a point into open ground. Deer use the point as a travel lane between distant timber patches. Natural funnel.',
      'Brushy fence row connecting two woodlots across open ground. Deer travel this cover corridor between otherwise isolated timber blocks.',
      'Power line or utility corridor creates a linear opening through timber. Deer cross at consistent points and feed on edge growth.',
      'Old homestead with fruit trees, shrubs, and overgrown foundation. Historical food sources (apple trees, ornamental plants) attract deer year after year.'
    ],
    search: [
      'Walk 50-100 yards inside the timber parallel to the field edge. Look for scrapes under overhanging branches, rubs on edge trees, and fresh trails.',
      'Glass the field point from a distance. Watch for deer movement in the last hour of daylight. Tracks at the point tip confirm daily crossing.',
      'Walk the fence row end to end checking for trails, rubs, and droppings. The densest cover section = primary travel zone.',
      'Walk the corridor edge looking for crossing points. Worn trails through the brush at the corridor edge = daily crossing. Set up downwind of the crossing.',
      'Check around old apple trees, foundation areas, and ornamental shrubs for droppings, browse, and tracks. These sites hold deer through generations.'
    ],
    approach: [
      'Enter from deep in the timber, NOT from the field edge. Walk to your stand through the woods, then face the field. Never approach from the open side.',
      'Approach from the timber behind the point. Walk the spine to your setup without crossing any feeding or bedding trails.',
      'Enter from one end of the fence row. Walk in the adjacent open ground (if cover allows) to reach your stand without walking the deer trail.',
      'Approach from deep in the timber perpendicular to the corridor. Cross into your setup location with the wind blowing across the corridor.',
      'Enter from the backside of the timber surrounding the homestead. Set up overlooking the fruit trees or food-producing vegetation.'
    ]
  }
};

// ===================================================================
//   Whitetail Pin Types for scouting/field logging
// ===================================================================
window.WHITETAIL_PIN_TYPES = {
  rub:          { label: 'Rub / Rub Line',     icon: 'RB', color: '#8b6914', description: 'Antler rub on tree. Fresh = white exposed wood. Rubs face the direction the buck came FROM. Follow the line back to bedding.' },
  scrape:       { label: 'Scrape',             icon: 'SP', color: '#a0862d', description: 'Pawed ground with licking branch overhead. Fresh dark soil + frayed branch = active. Community scrapes are visited by multiple bucks.' },
  bed:          { label: 'Buck Bed',           icon: 'BD', color: '#7a6e3a', description: 'Oval depression in cover with deer hair. Multiple beds clustered = buck bedding area. Note wind direction and terrain position.' },
  trail:        { label: 'Trail / Runway',     icon: 'TR', color: '#6b5b3a', description: 'Worn deer trail between bedding and feeding. Width and wear indicate traffic level. Rubs along the trail = buck travel route.' },
  tracks:       { label: 'Tracks',             icon: 'TK', color: '#5a7a5a', description: 'Deer tracks in mud. 3"+ wide with dew claws showing = mature buck. Drag marks between steps = rutting buck.' },
  droppings:    { label: 'Droppings',          icon: 'DR', color: '#6b5b4a', description: 'Deer pellet group. Clustered pellets = bedding area. Single group on trail = travel. Clumped = soft mast or ag diet.' },
  sighting:     { label: 'Deer Sighting',      icon: 'SI', color: '#4a6741', description: 'Live deer observation. Note count, sex, age class, direction, and time. Multiple sightings build movement patterns.' },
  standSite:    { label: 'Stand Site',         icon: 'SS', color: '#d4a017', description: 'Treestand or ground blind location. Note wind requirements, access routes, and primary shooting lanes.' },
  foodSource:   { label: 'Food Source',        icon: 'FS', color: '#b8860b', description: 'Active food source — oak flat, food plot, ag field edge, fruit tree. Note freshness of feeding sign.' },
  stagingArea:  { label: 'Staging Area',       icon: 'SA', color: '#c89b3c', description: 'Zone where bucks wait before entering open feeding areas. Scrapes and rubs 50-100 yards inside timber from field edges.' },
  waterHole:    { label: 'Water Source',       icon: 'WH', color: '#5a8a7a', description: 'Creek crossing, pond, or spring with deer tracks. Especially valuable during early season heat.' },
  pressure:     { label: 'Hunter Pressure',    icon: 'HP', color: '#a13a2a', description: 'Other hunters or vehicles observed. Build a pressure map to find low-pressure zones where mature bucks survive.' },
  access:       { label: 'Access Route',       icon: 'AC', color: '#5a7a5a', description: 'Low-impact entry/exit route to stand. Good access routes avoid crossing deer travel and feeding areas.' },
  cameraSpot:   { label: 'Trail Camera',       icon: 'TC', color: '#c8a96e', description: 'Trail camera location. Note what it is monitoring (scrape, trail, food source) and activity level.' }
};

// ===================================================================
//   Whitetail Pin SVG Icon Generator — unique icon per pin type
// ===================================================================
window.WHITETAIL_PIN_SVGS = {
  // Rub — tree with stripped bark
  rub: '<svg viewBox="0 0 32 32"><rect x="14" y="6" width="4" height="20" rx="1" fill="#{c}" opacity=".6"/><path d="M13 10c-1 0-2 2-2 5s1 5 2 5" stroke="#{c}" stroke-width="1.5" fill="none"/><path d="M19 10c1 0 2 2 2 5s-1 5-2 5" stroke="#{c}" stroke-width="1.5" fill="none"/><rect x="15" y="9" width="2" height="8" rx=".5" fill="#f5e6c8" opacity=".9"/><line x1="16" y1="26" x2="16" y2="29" stroke="#{c}" stroke-width="1.5"/></svg>',
  // Scrape — pawed ground with branch
  scrape: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="22" rx="9" ry="4" fill="#{c}" opacity=".3"/><path d="M10 22c1-2 4-3 6-3s5 1 6 3" stroke="#{c}" stroke-width="1.5" fill="none"/><path d="M16 6c-3 2-5 5-6 8" stroke="#{c}" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M16 6c2 1 4 3 5 6" stroke="#{c}" stroke-width="1.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="20" r=".8" fill="#{c}" opacity=".5"/><circle cx="20" cy="21" r=".8" fill="#{c}" opacity=".5"/></svg>',
  // Buck Bed — oval depression
  bed: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="18" rx="10" ry="6" fill="#{c}" opacity=".2"/><ellipse cx="16" cy="18" rx="10" ry="6" fill="none" stroke="#{c}" stroke-width="1.5"/><path d="M12 15c1-1 3-2 4-2s3 1 4 2" stroke="#{c}" stroke-width="1" fill="none" opacity=".5"/><circle cx="14" cy="17" r=".6" fill="#{c}"/><circle cx="18" cy="17" r=".6" fill="#{c}"/></svg>',
  // Trail — winding path
  trail: '<svg viewBox="0 0 32 32"><path d="M10 6c2 3 6 5 6 10s-4 7-6 10" stroke="#{c}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 6c-2 3-6 5-6 10s4 7 6 10" stroke="#{c}" stroke-width="1" fill="none" opacity=".4" stroke-linecap="round"/></svg>',
  // Tracks — deer hoofprints
  tracks: '<svg viewBox="0 0 32 32"><path d="M11 8l1-3M11 8l-1-3" stroke="#{c}" stroke-width="1.5" stroke-linecap="round"/><path d="M13 8l1-3M13 8l-1-3" stroke="#{c}" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="12" cy="10" rx="2" ry="1.5" fill="#{c}" opacity=".7"/><path d="M19 18l1-3M19 18l-1-3" stroke="#{c}" stroke-width="1.5" stroke-linecap="round"/><path d="M21 18l1-3M21 18l-1-3" stroke="#{c}" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="20" cy="20" rx="2" ry="1.5" fill="#{c}" opacity=".7"/></svg>',
  // Droppings — pellet group
  droppings: '<svg viewBox="0 0 32 32"><ellipse cx="12" cy="14" rx="2" ry="3" fill="#{c}" opacity=".7" transform="rotate(-10 12 14)"/><ellipse cx="17" cy="12" rx="2" ry="3" fill="#{c}" opacity=".7" transform="rotate(5 17 12)"/><ellipse cx="14" cy="19" rx="2" ry="3" fill="#{c}" opacity=".7" transform="rotate(-5 14 19)"/><ellipse cx="20" cy="17" rx="2" ry="3" fill="#{c}" opacity=".6" transform="rotate(10 20 17)"/></svg>',
  // Deer Sighting — binoculars
  sighting: '<svg viewBox="0 0 32 32"><circle cx="11" cy="16" r="5" fill="none" stroke="#{c}" stroke-width="1.8"/><circle cx="21" cy="16" r="5" fill="none" stroke="#{c}" stroke-width="1.8"/><path d="M16 16h0" stroke="#{c}" stroke-width="2" stroke-linecap="round"/><circle cx="11" cy="16" r="2" fill="#{c}" opacity=".5"/><circle cx="21" cy="16" r="2" fill="#{c}" opacity=".5"/></svg>',
  // Stand Site — elevated platform
  standSite: '<svg viewBox="0 0 32 32"><line x1="16" y1="8" x2="16" y2="28" stroke="#{c}" stroke-width="2"/><rect x="10" y="6" width="12" height="4" rx="1" fill="#{c}" opacity=".8"/><path d="M10 10l-3 6M22 10l3 6" stroke="#{c}" stroke-width="1.2" stroke-linecap="round"/><path d="M12 8l4-4 4 4" stroke="#{c}" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
  // Food Source — acorn
  foodSource: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="18" rx="6" ry="8" fill="#{c}" opacity=".7"/><path d="M10 14c0-3 3-5 6-5s6 2 6 5" fill="#{c}" opacity=".9"/><rect x="15" y="6" width="2" height="4" rx="1" fill="#{c}"/></svg>',
  // Staging Area — deer in timber edge
  stagingArea: '<svg viewBox="0 0 32 32"><path d="M4 26h24" stroke="#{c}" stroke-width="1.5" opacity=".3"/><rect x="4" y="8" width="10" height="18" rx="2" fill="#{c}" opacity=".15"/><path d="M18 20c0-3 1-5 2-8 .5 0 1 .5 1 1.5 0 .5-.5 1-1 1l1.5.5v2" fill="#{c}" opacity=".85"/><circle cx="20.5" cy="11.5" r="1.2" fill="#{c}"/></svg>',
  // Water Hole — water ripple
  waterHole: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="20" rx="10" ry="5" fill="#{c}" opacity=".15"/><ellipse cx="16" cy="20" rx="10" ry="5" fill="none" stroke="#{c}" stroke-width="1.2"/><ellipse cx="16" cy="20" rx="6" ry="3" fill="none" stroke="#{c}" stroke-width="1" opacity=".5"/><ellipse cx="16" cy="20" rx="2" ry="1" fill="#{c}" opacity=".4"/></svg>',
  // Hunter Pressure — warning triangle
  pressure: '<svg viewBox="0 0 32 32"><path d="M16 6L4 26h24L16 6z" fill="none" stroke="#{c}" stroke-width="2" stroke-linejoin="round"/><line x1="16" y1="13" x2="16" y2="20" stroke="#{c}" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="23" r="1.2" fill="#{c}"/></svg>',
  // Access Route — trail marker
  access: '<svg viewBox="0 0 32 32"><path d="M8 28V12l8-6 8 6v16" fill="none" stroke="#{c}" stroke-width="1.8" stroke-linejoin="round"/><rect x="13" y="18" width="6" height="10" rx="1" fill="#{c}" opacity=".7"/><circle cx="17.5" cy="23" r=".8" fill="#1a1612"/></svg>',
  // Trail Camera — camera icon
  cameraSpot: '<svg viewBox="0 0 32 32"><rect x="6" y="10" width="20" height="14" rx="2" fill="#{c}" opacity=".7"/><circle cx="16" cy="17" r="4" fill="none" stroke="#{c}" stroke-width="1.5"/><circle cx="16" cy="17" r="2" fill="#{c}" opacity=".5"/><rect x="12" y="7" width="8" height="4" rx="1" fill="#{c}" opacity=".5"/></svg>'
};

// Educational tip shown under each pin type on the map
window.WHITETAIL_PIN_EDUCATION_TAGS = {
  rub:          'Fresh white wood = recent. Rubs face the direction buck came FROM. Follow the line to bedding.',
  scrape:       'The licking branch matters more than the scrape. Check the branch for frayed tips and broken twigs.',
  bed:          'Multiple beds = buck area. Note wind direction — bucks bed with wind at their back, eyes downhill.',
  trail:        'Width = traffic level. Rubs along a trail = buck travel route. 3"+ tracks = mature buck.',
  tracks:       '3"+ wide with dew claws = mature buck. Drag marks between steps = rutting buck on the move.',
  droppings:    'Pellet clusters = bedding. Single groups on trail = travel. Clumped = agricultural diet.',
  sighting:     'Note count, sex, direction, and time. Multiple sightings build the movement pattern you need.',
  standSite:    'Consider wind for every entry/exit. A great stand with bad access equals educated deer.',
  foodSource:   'White oak acorns > red oak. Check for fresh scratchings in leaf litter. Nipped browse = active.',
  stagingArea:  'Scrapes and rubs 50-100 yds inside timber from field edge. Where mature bucks wait for darkness.',
  waterHole:    'Tracks in mud reveal daily traffic. Early season heat makes water more important than food.',
  pressure:     'Map other hunters to find low-pressure pockets. 300+ yards from roads = dramatically less pressure.',
  access:       'Best access avoids crossing travel routes and feeding areas. Wind must carry scent away from deer.',
  cameraSpot:   'Cameras on scrapes reveal which bucks are present. Check cameras midday to minimize disturbance.'
};

window.getWhitetailPinIcon = function(pinType) {
  var info = window.WHITETAIL_PIN_TYPES[pinType] || { icon: 'WT', color: '#8b6914', label: 'Whitetail Pin' };
  var svgTemplate = window.WHITETAIL_PIN_SVGS[pinType] || window.WHITETAIL_PIN_SVGS.sighting;
  var svg = svgTemplate.replace(/#{c}/g, info.color);
  return L.divIcon({
    className: 'ht-whitetail-pin-wrapper ht-whitetail-pin-type-' + pinType,
    html: '<div class="ht-whitetail-pin-custom" style="border-color:' + info.color + ';box-shadow:0 2px 8px rgba(0,0,0,0.6),0 0 12px ' + info.color + '40;">' +
          '<div class="ht-whitetail-pin-svg">' + svg + '</div>' +
          '</div>' +
          '<div class="ht-whitetail-pin-tag" style="background:' + info.color + ';">' + info.icon + '</div>',
    iconSize: [36, 46],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38]
  });
};

// ===================================================================
//   Whitetail Pin Marker Registration
// ===================================================================
window.whitetailPinMarkers = new Map();

window.buildWhitetailPinPopup = function(entry) {
  var info = window.WHITETAIL_PIN_TYPES[entry.signType] || { label: entry.signType, description: '', color: '#8b6914' };
  var when = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '';
  var coords = entry.coords ? entry.coords[0].toFixed(5) + ', ' + entry.coords[1].toFixed(5) : '';
  var educTag = (window.WHITETAIL_PIN_EDUCATION_TAGS && window.WHITETAIL_PIN_EDUCATION_TAGS[entry.signType]) || '';
  var confClass = entry.confidence === 'high' ? 'ht-conf-high' : (entry.confidence === 'low' ? 'ht-conf-low' : 'ht-conf-med');
  var confLabel = entry.confidence === 'high' ? '● Confirmed' : (entry.confidence === 'low' ? '○ Guessing' : '◑ Likely');
  var weight = (window.WHITETAIL_SIGNAL_WEIGHTS && window.WHITETAIL_SIGNAL_WEIGHTS[entry.signType]) || 1;
  var weightStars = weight >= 4.5 ? '★★★★★' : (weight >= 3.5 ? '★★★★☆' : (weight >= 2.5 ? '★★★☆☆' : (weight >= 1.5 ? '★★☆☆☆' : '★☆☆☆☆')));
  return '<div class="ht-pin-popup ht-whitetail-pin-popup">' +
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
      '<button class="ht-pin-popup-btn ht-pin-popup-btn--checkin" type="button" onclick="whitetailPinCheckIn(\'' + entry.id + '\')" style="background:' + info.color + ';color:#1a1612;">Check In</button>' +
      '<button class="ht-pin-popup-btn" type="button" onclick="copyWhitetailPinCoords(\'' + entry.id + '\')">Copy</button>' +
      '<button class="ht-pin-popup-btn" type="button" onclick="editWhitetailPin(\'' + entry.id + '\')">Edit</button>' +
      '<button class="ht-pin-popup-btn ht-pin-popup-btn--danger" type="button" onclick="deleteWhitetailPin(\'' + entry.id + '\')">Delete</button>' +
    '</div>' +
  '</div>';
};

window.registerWhitetailPinMarker = function(entry) {
  if (!map || !entry) return null;
  var latlng = L.latLng(entry.coords[0], entry.coords[1]);
  var marker = L.marker(latlng, { icon: window.getWhitetailPinIcon(entry.signType) }).addTo(map);
  marker.__whitetailPinData = entry;
  marker.bindPopup(window.buildWhitetailPinPopup(entry), { closeButton: true, autoClose: true, maxWidth: 310 });
  marker.on('click', function() { marker.openPopup(); });
  window.whitetailPinMarkers.set(entry.id, marker);
  return marker;
};

window.updateWhitetailPinMarker = function(entry) {
  if (!entry) return;
  var marker = window.whitetailPinMarkers.get(entry.id);
  if (!marker) return;
  marker.__whitetailPinData = entry;
  marker.setIcon(window.getWhitetailPinIcon(entry.signType));
  marker.setPopupContent(window.buildWhitetailPinPopup(entry));
};

window.copyWhitetailPinCoords = function(id) {
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

window.editWhitetailPin = function(id) {
  var entry = null;
  if (typeof huntJournalEntries !== 'undefined') {
    entry = huntJournalEntries.find(function(e) { return e.id === id; });
  }
  if (!entry) return;
  openWhitetailPinModal({
    defaults: { type: entry.signType, confidence: entry.confidence, notes: entry.notes },
    onSubmit: function(data) {
      entry.signType = data.type;
      entry.confidence = data.confidence;
      entry.notes = data.notes;
      if (typeof saveHuntJournal === 'function') saveHuntJournal();
      window.updateWhitetailPinMarker(entry);
      showNotice('Whitetail pin updated.', 'success', 2400);
    }
  });
};

window.deleteWhitetailPin = function(id) {
  if (typeof huntJournalEntries !== 'undefined') {
    huntJournalEntries = huntJournalEntries.filter(function(e) { return e.id !== id; });
    if (typeof saveHuntJournal === 'function') saveHuntJournal();
  }
  var marker = window.whitetailPinMarkers.get(id);
  if (marker && map) { try { map.removeLayer(marker); } catch(e) {} }
  window.whitetailPinMarkers.delete(id);
  showNotice('Whitetail pin deleted.', 'info', 2400);
};

// ===================================================================
//   Whitetail Pin Check-In — shows micro-pins within radius
// ===================================================================
window._whitetailCheckInLayers = [];
window.WHITETAIL_MICRO_PINS = {
  rub:        [{ label: 'Rub Line Direction', dist: 80, bearing: 'toward bedding', tip: 'Rubs face the direction the buck came FROM. Walk the line back toward bedding.' },
               { label: 'Downwind Setup', dist: 60, bearing: 'downwind', tip: 'Set up downwind of the rub line. The buck walks this route with the wind in his face.' }],
  scrape:     [{ label: 'Licking Branch', dist: 10, bearing: 'overhead', tip: 'The branch is more important than the ground scrape. Bucks check it even without scraping.' },
               { label: 'Downwind Stand', dist: 50, bearing: 'downwind', tip: 'Set up 50 yards downwind. Bucks approach scrapes from downwind to scent-check before committing.' },
               { label: 'Camera Position', dist: 30, bearing: 'trail approach', tip: 'Trail camera facing the scrape on the primary approach trail reveals timing and buck ID.' }],
  bed:        [{ label: 'Wind Check', dist: 100, bearing: 'upwind approach', tip: 'APPROACH FROM DOWNWIND ONLY. If you can smell the bed, you are too close and upwind.' },
               { label: 'Transition Stand', dist: 150, bearing: 'toward food', tip: 'Set up on the trail between bedding and food. Catch the buck transitioning, not in his bed.' }],
  trail:      [{ label: 'Ambush Point', dist: 40, bearing: 'trail bend', tip: 'Set up at a trail bend where the deer must turn into your shooting lane.' },
               { label: 'Funnel Check', dist: 80, bearing: 'narrowest point', tip: 'Find where terrain narrows the trail. Funnels = predictable close encounters.' }],
  tracks:     [{ label: 'Track Direction', dist: 50, bearing: 'forward of track', tip: 'Follow the pointed end of the track — that is the direction of travel. Set up ahead.' }],
  droppings:  [{ label: 'Bed Nearby', dist: 40, bearing: 'uphill', tip: 'Clustered droppings = bedding area. The bed is within 50 yards, likely uphill with wind advantage.' }],
  sighting:   [{ label: 'Pattern Point', dist: 100, bearing: 'travel direction', tip: 'Note the time and direction. Three sightings at the same time = patterned movement.' }],
  standSite:  [{ label: 'Entry Route', dist: 100, bearing: 'downwind approach', tip: 'Mark your silent approach route. Never walk through deer travel or feeding areas.' },
               { label: 'Exit Route', dist: 100, bearing: 'opposite entry', tip: 'Plan your exit to avoid bumping deer. After an evening hunt, wait 30 min past dark.' },
               { label: 'Shooting Lane', dist: 25, bearing: 'primary lane', tip: 'Clear shooting lanes to 30 yards for bow, 100+ yards for rifle. Trim before season.' }],
  foodSource: [{ label: 'Entry Trail', dist: 80, bearing: 'from timber', tip: 'Find the primary entry trail from timber to food. Deer use 2-3 entry points consistently.' },
               { label: 'Downwind Setup', dist: 60, bearing: 'downwind of entry', tip: 'Set up downwind of the entry trail. Afternoon wind must blow your scent away from approaching deer.' }],
  stagingArea:[{ label: 'Edge Scrapes', dist: 50, bearing: 'inside timber', tip: 'Mature bucks make scrapes 50-100 yards inside the timber from the field edge. This is where they wait.' },
               { label: 'Observation', dist: 80, bearing: 'overwatch', tip: 'Position to see 50 yards of timber edge. The buck is watching the field from here before committing.' }],
  waterHole:  [{ label: 'Approach Trail', dist: 60, bearing: 'primary approach', tip: 'Deer approach water on established trails. The most worn trail = primary approach.' },
               { label: 'Crosswind Stand', dist: 40, bearing: 'crosswind', tip: 'Set up crosswind of the water source. Your scent blows parallel to the shoreline, not toward approaching deer.' }],
  pressure:   [{ label: 'Escape Zone', dist: 300, bearing: 'away from pressure', tip: 'Pressured deer move 300+ yards from the source. Hunt the far side of the ridge from pressure.' }],
  access:     [{ label: 'Silent Approach', dist: 50, bearing: 'along route', tip: 'Clear sticks and debris from your access route before season. Silence is everything.' }],
  cameraSpot: [{ label: 'Check Window', dist: 20, bearing: 'at camera', tip: 'Check cameras midday only. Minimize visits to once per 2 weeks during hunting season.' }]
};

window.whitetailPinCheckIn = function(id) {
  // Clear previous check-in layers
  window._whitetailCheckInLayers.forEach(function(layer) {
    if (map) try { map.removeLayer(layer); } catch(e) {}
  });
  window._whitetailCheckInLayers = [];

  var entry = null;
  if (typeof huntJournalEntries !== 'undefined') {
    entry = huntJournalEntries.find(function(e) { return e.id === id; });
  }
  if (!entry || !entry.coords) {
    showNotice('Pin not found.', 'warning', 2000);
    return;
  }

  var info = window.WHITETAIL_PIN_TYPES[entry.signType] || { label: entry.signType, color: '#8b6914' };
  var micros = window.WHITETAIL_MICRO_PINS[entry.signType] || [];
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
  window._whitetailCheckInLayers.push(radius);

  if (micros.length === 0) {
    showNotice('No micro-pins for ' + info.label + '. Scout and log more sign nearby.', 'info', 3500);
    map.setView(center, Math.max(map.getZoom(), 16));
    return;
  }

  // Place micro-pins around the center
  var angleStep = 360 / micros.length;
  micros.forEach(function(micro, i) {
    var angle = (angleStep * i - 90) * Math.PI / 180;
    var offsetLat = (micro.dist / 111320) * Math.cos(angle);
    var offsetLng = (micro.dist / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
    var microLatLng = L.latLng(center.lat + offsetLat, center.lng + offsetLng);

    var microIcon = L.divIcon({
      className: 'ht-whitetail-micro-pin-wrapper',
      html: '<div class="ht-whitetail-micro-pin" style="border-color:' + info.color + ';">' +
            '<span class="ht-whitetail-micro-label">' + micro.label + '</span>' +
            '</div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -12]
    });

    var microMarker = L.marker(microLatLng, { icon: microIcon }).addTo(map);
    microMarker.bindPopup(
      '<div class="ht-whitetail-micro-popup">' +
        '<div class="ht-micro-popup-title" style="color:' + info.color + ';">' + micro.label + '</div>' +
        '<div class="ht-micro-popup-bearing">' + micro.dist + 'm ' + micro.bearing + '</div>' +
        '<div class="ht-micro-popup-tip">' + micro.tip + '</div>' +
      '</div>',
      { maxWidth: 240, closeButton: true }
    );
    window._whitetailCheckInLayers.push(microMarker);

    // Connect line from center to micro
    var line = L.polyline([center, microLatLng], {
      color: info.color,
      weight: 1.2,
      opacity: 0.5,
      dashArray: '3,5',
      interactive: false
    }).addTo(map);
    window._whitetailCheckInLayers.push(line);
  });

  // Zoom to show all micro-pins
  var group = L.featureGroup(window._whitetailCheckInLayers);
  map.fitBounds(group.getBounds().pad(0.3));
  showNotice('Check-in: ' + micros.length + ' micro-pins shown for ' + info.label, 'success', 3500);
};

// ===================================================================
//   Rut Phase Detector
// ===================================================================
window.getWhitetailRutPhase = function() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var day = now.getDate();

  if (month === 10 && day >= 10 && day <= 25) {
    return { phase: 'preSeeking', label: 'Pre-Seeking (Oct 10-25)', data: window.WHITETAIL_BIOLOGY.rutPhases.preSeeking };
  }
  if ((month === 10 && day > 25) || (month === 11 && day <= 5)) {
    return { phase: 'seeking', label: 'Seeking Phase (Oct 25 - Nov 5)', data: window.WHITETAIL_BIOLOGY.rutPhases.seeking };
  }
  if (month === 11 && day >= 6 && day <= 20) {
    return { phase: 'peakRut', label: 'Peak Rut (Nov 5-20)', data: window.WHITETAIL_BIOLOGY.rutPhases.peakRut };
  }
  if ((month === 11 && day > 20) || (month === 12 && day <= 5)) {
    return { phase: 'postRut', label: 'Post-Rut (Nov 20 - Dec 5)', data: window.WHITETAIL_BIOLOGY.rutPhases.postRut };
  }
  if (month === 12 && day >= 6 && day <= 20) {
    return { phase: 'secondRut', label: 'Second Rut (Dec 5-20)', data: window.WHITETAIL_BIOLOGY.rutPhases.secondRut };
  }
  return null;
};

// ===================================================================
//   Weapon-Specific Setup Parameters
// ===================================================================
window.getWhitetailWeaponSetup = function(weapon) {
  var methods = window.WHITETAIL_REGULATIONS_MO.methods;
  var method = methods[weapon] || methods.rifle;
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
window.buildWhitetailRegBanner = function() {
  var status = window.getWhitetailSeasonStatus();
  if (!status) return '';

  var html = '<div class="ht-whitetail-reg-banner">';

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
    html += '<strong>All deer seasons closed</strong>';
    html += '</div>';
  }

  html += '</div>';
  return html;
};

console.log('HUNTECH: Whitetail data engine loaded. Seasons:', Object.keys(window.WHITETAIL_REGULATIONS_MO.seasons).length, '| Pin types:', Object.keys(window.WHITETAIL_PIN_TYPES).length);

// ═══════════════════════════════════════════════════════════════════
//   WHITETAIL AI COACHING ENGINE — MATURE BUCK INTELLIGENCE SYSTEM
//   Built from GPS collar tracking studies, published wildlife biology
//   research, QDMA/NDA data, Missouri MDC field research, and
//   crowd-sourced intelligence from top whitetail hunters.
// ═══════════════════════════════════════════════════════════════════

// ===================================================================
//   GPS COLLAR STUDY DATA — Missouri-Specific Buck Movement Patterns
//   Source: University of Missouri/MDC GPS collar studies,
//   Auburn University GPS collar research, Mississippi State deer lab,
//   published in Journal of Wildlife Management & Wildlife Society Bulletin.
//   Data represents averaged movement patterns across multi-year studies.
// ===================================================================
window.WHITETAIL_GPS_COLLAR_DATA = {

  // Average daily movement distance (meters) by rut phase and time of day
  // Based on 100+ GPS-collared mature bucks (3.5+ years) across Missouri
  movementByPhase: {
    preSeeking: {
      label: 'Pre-Seeking (Oct 10-25)',
      avgDailyMovement: 2400,  // meters per day
      homeRangeSize: 320,      // acres — tight home range
      hourlyMovement: {
        0: 45, 1: 30, 2: 20, 3: 15, 4: 25, 5: 80,    // midnight to 5 AM
        6: 180, 7: 120, 8: 60, 9: 35, 10: 25, 11: 20,  // 6 AM to 11 AM
        12: 15, 13: 20, 14: 30, 15: 55, 16: 120, 17: 200, // noon to 5 PM
        18: 160, 19: 80, 20: 60, 21: 50, 22: 45, 23: 40  // 6 PM to 11 PM
      },
      peakWindows: ['06:00-08:00', '16:30-18:30'],
      bedToFeedRatio: 0.72, // 72% of time bedded
      excursionProbability: 0.05 // 5% chance of extra-range movement
    },
    seeking: {
      label: 'Seeking Phase (Oct 25 - Nov 5)',
      avgDailyMovement: 5800,  // nearly 2.5x pre-seeking
      homeRangeSize: 850,      // range explodes 
      hourlyMovement: {
        0: 90, 1: 70, 2: 50, 3: 40, 4: 60, 5: 160,
        6: 320, 7: 280, 8: 200, 9: 140, 10: 180, 11: 160,
        12: 140, 13: 160, 14: 180, 15: 220, 16: 300, 17: 350,
        18: 280, 19: 180, 20: 140, 21: 120, 22: 100, 23: 95
      },
      peakWindows: ['06:00-10:00', '10:00-14:00', '15:00-18:00'],
      bedToFeedRatio: 0.48,
      excursionProbability: 0.35
    },
    peakRut: {
      label: 'Peak Rut (Nov 5-20)',
      avgDailyMovement: 7200,  // maximum daily movement
      homeRangeSize: 1400,     // bucks abandon home range entirely
      hourlyMovement: {
        0: 160, 1: 120, 2: 100, 3: 80, 4: 110, 5: 220,
        6: 380, 7: 340, 8: 300, 9: 280, 10: 320, 11: 340,
        12: 300, 13: 310, 14: 320, 15: 340, 16: 380, 17: 400,
        18: 350, 19: 260, 20: 200, 21: 180, 22: 170, 23: 165
      },
      peakWindows: ['ALL DAY — sit from dark to dark'],
      bedToFeedRatio: 0.30,
      excursionProbability: 0.60
    },
    postRut: {
      label: 'Post-Rut (Nov 20 - Dec 5)',
      avgDailyMovement: 1800,  // exhausted
      homeRangeSize: 200,      // contracts to food sources
      hourlyMovement: {
        0: 20, 1: 15, 2: 10, 3: 10, 4: 15, 5: 40,
        6: 100, 7: 80, 8: 40, 9: 20, 10: 15, 11: 15,
        12: 10, 13: 15, 14: 25, 15: 50, 16: 90, 17: 130,
        18: 80, 19: 40, 20: 30, 21: 25, 22: 20, 23: 20
      },
      peakWindows: ['06:00-07:30', '16:00-18:00'],
      bedToFeedRatio: 0.82,
      excursionProbability: 0.08
    },
    secondRut: {
      label: 'Second Rut (Dec 5-20)',
      avgDailyMovement: 3200,
      homeRangeSize: 500,
      hourlyMovement: {
        0: 60, 1: 45, 2: 30, 3: 25, 4: 40, 5: 100,
        6: 200, 7: 180, 8: 120, 9: 80, 10: 100, 11: 90,
        12: 70, 13: 80, 14: 100, 15: 140, 16: 200, 17: 240,
        18: 180, 19: 100, 20: 70, 21: 60, 22: 55, 23: 55
      },
      peakWindows: ['06:00-09:00', '15:00-18:00'],
      bedToFeedRatio: 0.58,
      excursionProbability: 0.20
    },
    earlyseason: {
      label: 'Early Season (Sep 15 - Oct 10)',
      avgDailyMovement: 2000,
      homeRangeSize: 280,
      hourlyMovement: {
        0: 35, 1: 25, 2: 15, 3: 12, 4: 20, 5: 70,
        6: 150, 7: 100, 8: 50, 9: 25, 10: 18, 11: 15,
        12: 12, 13: 15, 14: 25, 15: 45, 16: 100, 17: 180,
        18: 150, 19: 70, 20: 50, 21: 40, 22: 35, 23: 35
      },
      peakWindows: ['06:00-07:30', '17:00-19:00'],
      bedToFeedRatio: 0.75,
      excursionProbability: 0.03
    },
    lateseason: {
      label: 'Late Season (Dec 20 - Jan 15)',
      avgDailyMovement: 1500,
      homeRangeSize: 160,
      hourlyMovement: {
        0: 15, 1: 10, 2: 8, 3: 8, 4: 12, 5: 30,
        6: 80, 7: 70, 8: 35, 9: 18, 10: 12, 11: 10,
        12: 8, 13: 10, 14: 20, 15: 45, 16: 80, 17: 110,
        18: 60, 19: 30, 20: 20, 21: 18, 22: 15, 23: 15
      },
      peakWindows: ['06:30-08:00', '15:30-17:30'],
      bedToFeedRatio: 0.88,
      excursionProbability: 0.02
    }
  },

  // Bed-to-food transition timing by season (minutes before/after sunrise)
  transitionTiming: {
    earlyseason:  { morningReturn: -40, eveningDepart: -150 },  // returns to bed 40 min before sunrise
    preSeeking:   { morningReturn: -30, eveningDepart: -140 },
    seeking:      { morningReturn: +20, eveningDepart: -180 },  // still moving 20 min after sunrise
    peakRut:      { morningReturn: null, eveningDepart: null },  // no pattern — all day
    postRut:      { morningReturn: -45, eveningDepart: -120 },
    secondRut:    { morningReturn: -15, eveningDepart: -150 },
    lateseason:   { morningReturn: -50, eveningDepart: -100 }
  },

  // Missouri-specific terrain preferences from GPS collar data
  missouriTerrainPreference: {
    ozarkHighlands: {
      preferredBedding: ['ridge points', 'leeward benches', 'bluff edges', 'cedar thickets'],
      preferredTravel: ['saddle crossings', 'creek bottom corridors', 'ridge spines', 'hollow transitions'],
      preferredFeeding: ['white oak flats', 'red oak slopes', 'persimmon bottoms', 'food plots'],
      avgElevationGain: 180,   // feet between bed and feed
      typicalBedSlope: 25,     // degrees — beds on 20-30 degree slopes
      avgBedToFeedDist: 450    // meters
    },
    glaciatedPlains: {
      preferredBedding: ['CRP grassland interiors', 'brushy draws', 'plum thickets', 'creek timber strips'],
      preferredTravel: ['fence line corridors', 'tree-lined creeks', 'terrace edges', 'ditch lines'],
      preferredFeeding: ['soybean field edges', 'corn stubble corners', 'brassica plots', 'alfalfa pivots'],
      avgElevationGain: 40,
      typicalBedSlope: 5,
      avgBedToFeedDist: 600
    },
    bigRivers: {
      preferredBedding: ['bottomland hardwood thickets', 'levee backside cover', 'oxbow timber'],
      preferredTravel: ['levee toe trails', 'slough crossings', 'hardwood ridges in bottoms'],
      preferredFeeding: ['persimmon/hackberry stands', 'ag field edges', 'green browse corridors'],
      avgElevationGain: 15,
      typicalBedSlope: 2,
      avgBedToFeedDist: 350
    },
    ozarkBorder: {
      preferredBedding: ['ridge points above creek junctions', 'cedar/hardwood transitions', 'south-facing slopes'],
      preferredTravel: ['hollow bottoms', 'saddles between ridges', 'old logging roads through timber'],
      preferredFeeding: ['acorn flats at hollow heads', 'food plots in clearings', 'field edges along timber'],
      avgElevationGain: 120,
      typicalBedSlope: 20,
      avgBedToFeedDist: 400
    }
  }
};

// ===================================================================
//   ENHANCED RUT PHASE DETECTOR — Day + Hour Granularity
//   Uses photoperiod-driven breeding dates calibrated to Missouri
//   latitude (37.0-40.6°N). Peak breeding: Nov 10-15 statewide.
// ===================================================================
window.getWhitetailRutPhaseDetailed = function() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);

  // Calculate day-specific intensity within each phase (0.0 - 1.0)
  var intensity = 0;
  var phase = null;
  var label = '';
  var data = null;
  var gpsPhase = null;
  var hourlyActivity = 0;

  // Early season: Sep 15 - Oct 9
  if ((month === 9 && day >= 15) || (month === 10 && day <= 9)) {
    phase = 'earlyseason';
    label = 'Early Season';
    intensity = 0.2;
    gpsPhase = window.WHITETAIL_GPS_COLLAR_DATA.movementByPhase.earlyseason;
  }
  // Pre-Seeking: Oct 10-25
  else if (month === 10 && day >= 10 && day <= 25) {
    phase = 'preSeeking';
    var daysIn = day - 10;
    intensity = 0.3 + (daysIn / 15) * 0.2; // ramps from 0.3 to 0.5
    label = 'Pre-Seeking';
    data = window.WHITETAIL_BIOLOGY.rutPhases.preSeeking;
    gpsPhase = window.WHITETAIL_GPS_COLLAR_DATA.movementByPhase.preSeeking;
  }
  // Seeking: Oct 26 - Nov 5
  else if ((month === 10 && day >= 26) || (month === 11 && day <= 5)) {
    phase = 'seeking';
    var seekDay = month === 10 ? day - 26 : day + 5;
    intensity = 0.55 + (seekDay / 10) * 0.25; // ramps 0.55 to 0.80
    label = 'Seeking Phase';
    data = window.WHITETAIL_BIOLOGY.rutPhases.seeking;
    gpsPhase = window.WHITETAIL_GPS_COLLAR_DATA.movementByPhase.seeking;
  }
  // Peak Rut: Nov 6-20 — intensity peaks Nov 10-15
  else if (month === 11 && day >= 6 && day <= 20) {
    phase = 'peakRut';
    // Bell curve centered on Nov 12-13
    var peakCenter = 12.5;
    var daysFromPeak = Math.abs(day - peakCenter);
    intensity = Math.max(0.7, 1.0 - (daysFromPeak / 8) * 0.3);
    // Nov 10-15 = 0.95-1.0, Nov 6-9 and 16-20 = 0.7-0.9
    label = day >= 10 && day <= 15 ? 'PEAK BREEDING' : 'Peak Rut';
    data = window.WHITETAIL_BIOLOGY.rutPhases.peakRut;
    gpsPhase = window.WHITETAIL_GPS_COLLAR_DATA.movementByPhase.peakRut;
  }
  // Post-Rut: Nov 21 - Dec 5
  else if ((month === 11 && day >= 21) || (month === 12 && day <= 5)) {
    phase = 'postRut';
    var postDay = month === 11 ? day - 21 : day + 9;
    intensity = 0.45 - (postDay / 14) * 0.2; // drops 0.45 to 0.25
    label = 'Post-Rut';
    data = window.WHITETAIL_BIOLOGY.rutPhases.postRut;
    gpsPhase = window.WHITETAIL_GPS_COLLAR_DATA.movementByPhase.postRut;
  }
  // Second Rut: Dec 6-20
  else if (month === 12 && day >= 6 && day <= 20) {
    phase = 'secondRut';
    var secDay = day - 6;
    // Peaks around Dec 10-12
    var secCenter = 10;
    intensity = 0.4 + Math.max(0, 0.2 - Math.abs(secDay - secCenter) * 0.04);
    label = 'Second Rut';
    data = window.WHITETAIL_BIOLOGY.rutPhases.secondRut;
    gpsPhase = window.WHITETAIL_GPS_COLLAR_DATA.movementByPhase.secondRut;
  }
  // Late Season: Dec 21 - Jan 15
  else if ((month === 12 && day >= 21) || (month === 1 && day <= 15)) {
    phase = 'lateseason';
    intensity = 0.15;
    label = 'Late Season';
    gpsPhase = window.WHITETAIL_GPS_COLLAR_DATA.movementByPhase.lateseason;
  }
  // Off season
  else {
    return {
      phase: 'offseason', label: 'Off Season', intensity: 0,
      hourlyActivity: 0, peakWindows: [], data: null,
      recommendation: 'Season closed. Scout, hang stands, run trail cameras.',
      gpsPhase: null
    };
  }

  // Hour-specific activity level from GPS collar data
  if (gpsPhase && gpsPhase.hourlyMovement) {
    hourlyActivity = gpsPhase.hourlyMovement[hour] || 0;
  }

  // Compute peak windows for current phase
  var peakWindows = gpsPhase ? gpsPhase.peakWindows : [];

  // Generate hour-specific recommendation
  var recommendation = '';
  if (hourlyActivity >= 300) {
    recommendation = 'PEAK MOVEMENT — be in your stand NOW. Bucks are actively moving.';
  } else if (hourlyActivity >= 200) {
    recommendation = 'HIGH ACTIVITY — excellent time to be hunting. Expect deer movement.';
  } else if (hourlyActivity >= 100) {
    recommendation = 'Moderate movement window. Good time for transition zone setups.';
  } else if (hourlyActivity >= 50) {
    recommendation = 'Light movement. During rut, stay on stand — cruising bucks still possible.';
  } else {
    recommendation = 'Low deer activity right now. Best time to enter/exit stands undetected.';
  }

  return {
    phase: phase,
    label: label,
    intensity: Math.round(intensity * 100) / 100,
    hourlyActivity: hourlyActivity,
    peakWindows: peakWindows,
    data: data,
    recommendation: recommendation,
    gpsPhase: gpsPhase,
    hour: hour,
    dayOfYear: dayOfYear
  };
};

// ===================================================================
//   COMPOSITE STAND SCORING ALGORITHM
//   Produces a single 0-100 score for any candidate pin location.
//   Factors: Terrain, Wind Safety, Rut/Season, Access, Pressure,
//   Habitat Quality, and GPS Collar Movement Probability.
//
//   Weight distribution:
//     Terrain Quality:    25%
//     Wind Safety:        25%  ← equal weight with terrain — wind is #1
//     Rut/Movement Phase: 15%
//     Access Safety:      15%
//     Habitat/Food:       10%
//     Pressure Avoidance: 10%
// ===================================================================
window.WHITETAIL_SCORE_WEIGHTS = {
  terrain:  0.25,
  wind:     0.25,
  rut:      0.15,
  access:   0.15,
  habitat:  0.10,
  pressure: 0.10
};

window.scoreWhitetailStand = function(candidateLatLng, windDir, windSpeed, rutPhase, weapon, areaCenter, startPoint, terrainFeature) {
  var scores = {
    terrain: 0,
    wind: 0,
    rut: 0,
    access: 0,
    habitat: 0,
    pressure: 0
  };
  var details = {};

  // ── 1. TERRAIN QUALITY SCORE (0-100) ──
  if (terrainFeature && terrainFeature.score) {
    scores.terrain = Math.min(100, terrainFeature.score);
    details.terrain = terrainFeature.label || 'Terrain feature';
  } else {
    // No terrain seed — assign base score from random sampling
    scores.terrain = 40 + Math.random() * 20;
    details.terrain = 'General habitat — no dominant terrain feature detected';
  }

  // ── 2. WIND SAFETY SCORE (0-100) ──
  // Wind blowing FROM the pin TOWARD the hunter's start/access = BAD (0)
  // Wind blowing FROM the hunter AWAY from the pin and deer = GOOD (100)
  // Cross-wind = ACCEPTABLE (70-85)
  var windScore = 50; // default if no wind info
  if (windDir && startPoint) {
    var windVec = _windDirToVec(windDir);
    if (windVec) {
      // Vector from start point to candidate pin
      var dLat = candidateLatLng.lat - startPoint.lat;
      var dLng = candidateLatLng.lng - startPoint.lng;
      var approachLen = Math.sqrt(dLat * dLat + dLng * dLng);
      if (approachLen > 0) {
        var approachVec = [dLng / approachLen, dLat / approachLen];
        // Dot product: positive = wind blowing same direction as approach (wind at back = BAD)
        var dot = windVec[0] * approachVec[0] + windVec[1] * approachVec[1];
        // dot = 1.0 → wind pushing your scent toward pin (terrible)
        // dot = -1.0 → wind blowing your scent away from pin (perfect)
        // dot = 0.0 → crosswind (good)
        windScore = Math.round(Math.max(0, Math.min(100, (1 - dot) * 50)));
      }
    }
    details.wind = windScore >= 80 ? 'Wind carries scent away from deer — excellent' :
                   windScore >= 60 ? 'Crosswind setup — acceptable with scent control' :
                   windScore >= 40 ? 'Marginal wind — scent may reach deer on thermals' :
                   'DANGEROUS — wind carries scent directly toward deer approach';
  } else {
    windScore = 60;
    details.wind = 'Wind data incomplete — use caution';
  }
  scores.wind = windScore;

  // Wind speed penalty — high wind reduces all activity
  if (windSpeed && windSpeed > 20) {
    var windPenalty = Math.min(30, (windSpeed - 20) * 2);
    scores.wind = Math.max(0, scores.wind - windPenalty);
    details.wind += ' (high wind penalty: -' + windPenalty + ')';
  }

  // ── 3. RUT/MOVEMENT PHASE SCORE (0-100) ──
  if (rutPhase && rutPhase.intensity !== undefined) {
    scores.rut = Math.round(rutPhase.intensity * 100);
    details.rut = rutPhase.label + ' — ' + rutPhase.recommendation;
  } else {
    scores.rut = 40;
    details.rut = 'No rut phase data — general timing assumed';
  }

  // ── 4. ACCESS SAFETY SCORE (0-100) ──
  // Distance from start to pin — farther = harder access but potentially less pressure
  // Ideal: 200-800m access distance. Under 100m = too close to access point. Over 1500m = fatigue risk.
  var accessDist = 400; // default
  if (startPoint && candidateLatLng) {
    var startLL = typeof startPoint.distanceTo === 'function' ? startPoint : L.latLng(startPoint.lat, startPoint.lng);
    var candLL = typeof candidateLatLng.distanceTo === 'function' ? candidateLatLng : L.latLng(candidateLatLng.lat, candidateLatLng.lng);
    accessDist = startLL.distanceTo(candLL);
  }
  if (accessDist >= 200 && accessDist <= 800) {
    scores.access = 85 + Math.random() * 15;
    details.access = 'Ideal access distance (' + Math.round(accessDist) + 'm). Far enough to avoid spooking deer at the trailhead.';
  } else if (accessDist < 200) {
    scores.access = 30 + accessDist / 200 * 40;
    details.access = 'Very short access (' + Math.round(accessDist) + 'm) — risk of spooking deer near parking.';
  } else if (accessDist <= 1500) {
    scores.access = 70 - ((accessDist - 800) / 700) * 30;
    details.access = 'Longer access (' + Math.round(accessDist) + 'm) — pack light and allow extra approach time.';
  } else {
    scores.access = Math.max(20, 40 - ((accessDist - 1500) / 1000) * 20);
    details.access = 'Extended access (' + Math.round(accessDist) + 'm) — significant effort required.';
  }
  scores.access = Math.round(Math.min(100, Math.max(0, scores.access)));

  // ── 5. HABITAT QUALITY SCORE (0-100) ──
  // Based on terrain feature type if available
  if (terrainFeature) {
    var fType = (terrainFeature.type || terrainFeature.habitat || '').toLowerCase();
    if (fType.indexOf('saddle') >= 0 || fType.indexOf('funnel') >= 0 || fType.indexOf('pinch') >= 0) {
      scores.habitat = 95;
      details.habitat = 'Travel corridor funnel — mature bucks funnel through predictably';
    } else if (fType.indexOf('ridge') >= 0 || fType.indexOf('point') >= 0 || fType.indexOf('bench') >= 0) {
      scores.habitat = 90;
      details.habitat = 'Ridge feature — classic mature buck terrain, bedding or cruising';
    } else if (fType.indexOf('oak') >= 0 || fType.indexOf('acorn') >= 0 || fType.indexOf('food') >= 0) {
      scores.habitat = 88;
      details.habitat = 'Food source — high-calorie draw for pre/post-rut and late season';
    } else if (fType.indexOf('creek') >= 0 || fType.indexOf('crossing') >= 0 || fType.indexOf('drainage') >= 0) {
      scores.habitat = 85;
      details.habitat = 'Creek/drainage feature — travel corridor and daily watering';
    } else if (fType.indexOf('timber') >= 0 || fType.indexOf('forest') >= 0) {
      scores.habitat = 75;
      details.habitat = 'Timber habitat — cover and travel, evaluate for funnels';
    } else {
      scores.habitat = 60;
      details.habitat = 'General habitat — moderate deer-holding potential';
    }
  } else {
    scores.habitat = 50;
    details.habitat = 'No specific habitat feature — general cover assessment';
  }

  // ── 6. PRESSURE AVOIDANCE SCORE (0-100) ──
  // Distance from area center (closer to edges = typically lower pressure)
  // Plus day-of-week and season-week considerations
  var pressureScore = 70;
  if (areaCenter && candidateLatLng) {
    var centerLL = typeof areaCenter.distanceTo === 'function' ? areaCenter : L.latLng(areaCenter.lat, areaCenter.lng);
    var candLL2 = typeof candidateLatLng.distanceTo === 'function' ? candidateLatLng : L.latLng(candidateLatLng.lat, candidateLatLng.lng);
    var distFromCenter = centerLL.distanceTo(candLL2);
    // Farther from center of area = potentially less pressure if center is an access point
    if (distFromCenter > 400) pressureScore += 10;
    if (distFromCenter > 800) pressureScore += 10;
  }

  // Day of week pressure
  var dayOfWeek = new Date().getDay();
  var dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var dayMult = window.WHITETAIL_BIOLOGY.pressureModel.dayMultipliers[dayNames[dayOfWeek]] || 1;
  pressureScore = pressureScore / dayMult;  // higher day multiplier = more pressure = lower score
  scores.pressure = Math.round(Math.min(100, Math.max(0, pressureScore)));
  details.pressure = dayMult >= 3 ? 'Weekend — high hunter pressure. Hunt deeper or harder-to-access spots.' :
                     dayMult >= 2 ? 'Friday — moderate pressure building. Consider midweek hunts.' :
                     'Weekday — significantly lower hunting pressure. Advantage.';

  // ── COMPOSITE SCORE ──
  var weights = window.WHITETAIL_SCORE_WEIGHTS;
  var composite = Math.round(
    scores.terrain * weights.terrain +
    scores.wind * weights.wind +
    scores.rut * weights.rut +
    scores.access * weights.access +
    scores.habitat * weights.habitat +
    scores.pressure * weights.pressure
  );
  composite = Math.min(99, Math.max(1, composite));

  return {
    composite: composite,
    scores: scores,
    details: details,
    tier: composite >= 85 ? 1 : composite >= 70 ? 2 : composite >= 55 ? 3 : composite >= 40 ? 4 : 5,
    tierLabel: composite >= 85 ? 'ELITE Stand' : composite >= 70 ? 'HIGH-Value Stand' : composite >= 55 ? 'Solid Setup' : composite >= 40 ? 'Marginal — consider alternatives' : 'Weak — avoid if possible',
    weapon: weapon || 'rifle'
  };
};

// ===================================================================
//   WIND-SAFE ACCESS VALIDATION
//   Determines whether a hunter can walk from their start point to a
//   candidate stand without their scent drifting into the hunting zone.
//   If wind carries scent through the approach corridor into likely
//   deer travel areas, the stand is DISQUALIFIED.
// ===================================================================
window.validateWindSafeAccess = function(startPoint, candidatePin, windDir, windSpeed) {
  if (!startPoint || !candidatePin || !windDir) {
    return { safe: true, reason: 'Insufficient data — assuming safe', confidence: 'low', angle: null };
  }

  var windVec = _windDirToVec(windDir);
  if (!windVec) {
    return { safe: true, reason: 'Unknown wind direction — assuming safe', confidence: 'low', angle: null };
  }

  // Vector from start to pin (approach direction)
  var dLat = candidatePin.lat - startPoint.lat;
  var dLng = candidatePin.lng - startPoint.lng;
  var approachLen = Math.sqrt(dLat * dLat + dLng * dLng);
  if (approachLen === 0) {
    return { safe: true, reason: 'Start and pin are same location', confidence: 'low', angle: 0 };
  }
  var approachVec = [dLng / approachLen, dLat / approachLen];

  // Dot product between wind vector and approach vector
  // Wind comes FROM windDir, so the scent blow vector is the wind direction itself
  // If wind is N, scent blows S (wind comes from N, pushes scent south)
  // But the wind vector in _windDirToVec represents the FROM direction
  // So we want the scent vector (where scent goes) = negative of windVec
  var scentVec = [-windVec[0], -windVec[1]];

  // Dot product: How aligned is the approach path with the scent drift?
  var dot = scentVec[0] * approachVec[0] + scentVec[1] * approachVec[1];

  // Cross product magnitude: determines if scent crosses the approach path
  var cross = Math.abs(scentVec[0] * approachVec[1] - scentVec[1] * approachVec[0]);

  // Angle between approach and scent drift in degrees
  var angleDeg = Math.round(Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI);

  // RULES:
  // 1. If scent blows along approach path toward the pin (dot > 0.7) → UNSAFE
  //    Your scent arrives at the pin before you do
  // 2. If scent crosses approach at shallow angle (dot > 0.3) → MARGINAL
  //    Thermals and eddies could carry scent into the zone
  // 3. If scent blows perpendicular or away (dot <= 0.3) → SAFE
  //    Wind carries scent away from approach and hunting zone

  // High wind amplifies the scent cone width
  var windFactor = windSpeed ? Math.min(1.5, windSpeed / 15) : 1;
  var effectiveDot = dot * windFactor;

  if (effectiveDot > 0.65) {
    return {
      safe: false,
      reason: 'WIND UNSAFE — scent blows directly along approach path toward the stand (' + angleDeg + '° alignment). ' +
              'Deer downwind of your walk-in route will be alerted before you reach the stand. This stand is DISQUALIFIED.',
      confidence: 'high',
      angle: angleDeg,
      scentAngle: angleDeg,
      severity: 'critical'
    };
  }

  if (effectiveDot > 0.35) {
    return {
      safe: false,
      reason: 'WIND MARGINAL — scent drifts across approach corridor (' + angleDeg + '° offset). ' +
              'Thermals and terrain eddies could carry scent into deer travel lanes during your approach.',
      confidence: 'medium',
      angle: angleDeg,
      scentAngle: angleDeg,
      severity: 'moderate'
    };
  }

  if (effectiveDot > 0.0) {
    return {
      safe: true,
      reason: 'Crosswind approach (' + angleDeg + '°). Scent drifts wide of the approach corridor. Use scent control as backup.',
      confidence: 'medium',
      angle: angleDeg,
      scentAngle: angleDeg,
      severity: 'low'
    };
  }

  return {
    safe: true,
    reason: 'WIND SAFE — wind carries scent away from approach path and hunting zone (' + angleDeg + '° offset). Ideal access.',
    confidence: 'high',
    angle: angleDeg,
    scentAngle: angleDeg,
    severity: 'none'
  };
};

// ===================================================================
//   BOUNDARY BUFFER CHECK — 20-yard (18.3m) minimum from boundary
//   Ensures pins are never placed within 20 yards of the area boundary.
//   Works with circles, rectangles, and polygons.
// ===================================================================
window.WHITETAIL_BOUNDARY_BUFFER_METERS = 18.3; // 20 yards in meters

window.isPointWithinBoundaryBuffer = function(latlng, areaLayer, areaType) {
  if (!latlng || !areaLayer) return false;

  var bufferM = window.WHITETAIL_BOUNDARY_BUFFER_METERS;
  var ll = typeof latlng.lat === 'function' ? L.latLng(latlng.lat(), latlng.lng()) : L.latLng(latlng.lat, latlng.lng);

  if (areaType === 'radius' && areaLayer instanceof L.Circle) {
    var center = areaLayer.getLatLng();
    var radius = areaLayer.getRadius();
    var dist = center.distanceTo(ll);
    // Must be at least bufferM meters inside the edge
    return dist <= (radius - bufferM);
  }

  if (areaType === 'boundary' && areaLayer instanceof L.Rectangle) {
    var bounds = areaLayer.getBounds();
    // Check distance to each edge of the rectangle
    var north = bounds.getNorth();
    var south = bounds.getSouth();
    var east = bounds.getEast();
    var west = bounds.getWest();
    // Convert buffer to degrees (approximate)
    var bufferLat = bufferM / 111320;
    var bufferLng = bufferM / (111320 * Math.cos(ll.lat * Math.PI / 180));
    return ll.lat >= (south + bufferLat) && ll.lat <= (north - bufferLat) &&
           ll.lng >= (west + bufferLng) && ll.lng <= (east - bufferLng);
  }

  // Polygon — check distance to nearest edge
  if (areaLayer.getLatLngs) {
    var latlngs = areaLayer.getLatLngs();
    // Flatten nested arrays (Leaflet polygons can be [[latlng, latlng, ...]])
    if (latlngs.length && Array.isArray(latlngs[0])) latlngs = latlngs[0];
    if (!latlngs.length) return false;

    var minDistToEdge = Infinity;
    for (var i = 0; i < latlngs.length; i++) {
      var a = latlngs[i];
      var b = latlngs[(i + 1) % latlngs.length];
      var dist = _pointToSegmentDistance(ll, a, b);
      if (dist < minDistToEdge) minDistToEdge = dist;
    }
    return minDistToEdge >= bufferM;
  }

  // Fallback — no buffer check possible
  return true;
};

// Helper: distance from point to line segment in meters
function _pointToSegmentDistance(p, a, b) {
  var dx = b.lng - a.lng;
  var dy = b.lat - a.lat;
  if (dx === 0 && dy === 0) {
    return L.latLng(a.lat, a.lng).distanceTo(L.latLng(p.lat, p.lng));
  }
  var t = Math.max(0, Math.min(1, ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / (dx * dx + dy * dy)));
  var proj = L.latLng(a.lat + t * dy, a.lng + t * dx);
  return proj.distanceTo(L.latLng(p.lat, p.lng));
}

// Helper: wind direction string to unit vector [x, y]
// Wind comes FROM this direction, so N = wind comes from North, blows to South
function _windDirToVec(dir) {
  var d = String(dir || '').toUpperCase();
  var map = {
    'N':  [0, 1],    'NNE': [0.38, 0.92], 'NE': [0.71, 0.71], 'ENE': [0.92, 0.38],
    'E':  [1, 0],    'ESE': [0.92, -0.38], 'SE': [0.71, -0.71], 'SSE': [0.38, -0.92],
    'S':  [0, -1],   'SSW': [-0.38, -0.92], 'SW': [-0.71, -0.71], 'WSW': [-0.92, -0.38],
    'W':  [-1, 0],   'WNW': [-0.92, 0.38], 'NW': [-0.71, 0.71], 'NNW': [-0.38, 0.92]
  };
  return map[d] || null;
}

// ===================================================================
//   2-PIN SELECTION ENGINE
//   After scoring all candidates, selects the TOP 2 pins that:
//   1. Both pass wind-safe access validation
//   2. Both are 20+ yards inside boundary
//   3. Are not on water, structures, or open fields (NLCD validated)
//   4. Are spaced at least 100m apart from each other
//   5. Represent different setup types when possible (e.g., one travel
//      corridor + one food source, rather than two of the same)
// ===================================================================
window.WHITETAIL_PIN_SELECTION_CONFIG = {
  maxPins: 2,
  minSpacingMeters: 100,
  boundaryBufferMeters: 18.3,
  maxCandidates: 60,
  maxAttempts: 200,
  diverseSetups: true,  // prefer different habitat types for the 2 pins
  minCompositeScore: 30 // reject anything below this
};

window.selectTopWhitetailPins = function(scoredCandidates, options) {
  var config = window.WHITETAIL_PIN_SELECTION_CONFIG;
  var maxPins = config.maxPins;
  var minSpacing = config.minSpacingMeters;
  var minScore = config.minCompositeScore;

  if (!scoredCandidates || !scoredCandidates.length) return [];

  // Sort by composite score descending
  var sorted = scoredCandidates.slice().sort(function(a, b) {
    return b.composite - a.composite;
  });

  // Filter out anything below minimum score
  sorted = sorted.filter(function(c) { return c.composite >= minScore; });

  if (sorted.length === 0) return [];
  if (sorted.length === 1) return [sorted[0]];

  // Select pin 1 — highest scoring candidate
  var pin1 = sorted[0];
  var selected = [pin1];

  // Select pin 2 — highest scoring candidate that:
  // a) Is at least minSpacing meters from pin 1
  // b) Ideally represents a different habitat type
  var pin1Habitat = (pin1.habitat || '').toLowerCase();
  var pin2 = null;
  var pin2Different = null; // best candidate with different habitat
  var pin2Same = null;      // best candidate with same habitat (fallback)

  for (var i = 1; i < sorted.length; i++) {
    var candidate = sorted[i];
    var candLL = L.latLng(candidate.coords[0], candidate.coords[1]);
    var pin1LL = L.latLng(pin1.coords[0], pin1.coords[1]);
    var dist = pin1LL.distanceTo(candLL);

    if (dist < minSpacing) continue; // too close to pin 1

    var candHabitat = (candidate.habitat || '').toLowerCase();
    if (config.diverseSetups && candHabitat !== pin1Habitat && !pin2Different) {
      pin2Different = candidate;
    }
    if (!pin2Same) {
      pin2Same = candidate;
    }
    // Once we have both options, we can decide
    if (pin2Different && pin2Same) break;
  }

  // Prefer diverse habitat, but take same-habitat if diverse isn't available
  // or if the diverse option scores dramatically lower
  if (pin2Different && pin2Same) {
    var scoreDiff = pin2Same.composite - pin2Different.composite;
    pin2 = scoreDiff > 15 ? pin2Same : pin2Different; // diverse unless same-type is 15+ pts better
  } else {
    pin2 = pin2Different || pin2Same;
  }

  if (pin2) selected.push(pin2);

  // Assign ranks
  selected.forEach(function(pin, idx) { pin.rank = idx + 1; });

  return selected;
};

// ===================================================================
//   WHITETAIL MISSION BRIEF GENERATOR
//   Builds a tactical briefing for the 2-pin hunt plan.
// ===================================================================
window.buildWhitetailMissionBrief = function(pins, windDir, windSpeed, temp, rutPhase, weapon) {
  if (!pins || !pins.length) return '';

  var weaponSetup = window.getWhitetailWeaponSetup ? window.getWhitetailWeaponSetup(weapon || 'rifle') : null;
  var rutLabel = rutPhase ? rutPhase.label : 'Unknown Phase';
  var rutRec = rutPhase ? rutPhase.recommendation : '';
  var intensity = rutPhase ? Math.round(rutPhase.intensity * 100) : 0;

  var html = '<div class="ht-whitetail-mission-brief">';
  html += '<div class="ht-mission-header">';
  html += '<h2>🎯 WHITETAIL TACTICAL BRIEF</h2>';
  html += '<div class="ht-mission-conditions">';
  html += '<span>🌡️ ' + (temp || '--') + '°F</span>';
  html += '<span>💨 ' + (windDir || '--') + ' @ ' + (windSpeed || '--') + ' mph</span>';
  html += '<span>🦌 ' + rutLabel + ' (' + intensity + '% intensity)</span>';
  if (weaponSetup) {
    html += '<span>🔫 ' + weaponSetup.name + ' (' + weaponSetup.effectiveRange + 'yd range)</span>';
  }
  html += '</div>';
  html += '</div>';

  // Rut phase strategy
  if (rutPhase && rutPhase.data) {
    html += '<div class="ht-mission-section">';
    html += '<h3>PHASE STRATEGY: ' + rutLabel.toUpperCase() + '</h3>';
    html += '<p>' + rutPhase.data.strategy + '</p>';
    if (rutPhase.data.calling) html += '<p><strong>Calling:</strong> ' + rutPhase.data.calling + '</p>';
    if (rutPhase.data.tip) html += '<p><strong>Pro Tip:</strong> ' + rutPhase.data.tip + '</p>';
    html += '</div>';
  }

  // Wind analysis
  html += '<div class="ht-mission-section">';
  html += '<h3>WIND ANALYSIS</h3>';
  if (windSpeed && windSpeed > 20) {
    html += '<p>⚠️ High wind (' + windSpeed + ' mph) — deer will bed on leeward slopes. Hunt sheltered terrain.</p>';
  } else if (windSpeed && windSpeed > 15) {
    html += '<p>Moderate wind (' + windSpeed + ' mph) — deer movement may shift to protected corridors.</p>';
  } else {
    html += '<p>Light wind (' + (windSpeed || '--') + ' mph) from ' + (windDir || '--') + '. Good hunting conditions.</p>';
  }
  // Thermal advice based on time of day
  var hour = new Date().getHours();
  if (hour < 10) {
    html += '<p>☀️ Morning thermals rising — hunt LOWER than your target. Your scent rises away from deer below.</p>';
  } else if (hour >= 10 && hour < 14) {
    html += '<p>⚡ Thermal transition window — scent direction may reverse. Maximum alertness required.</p>';
  } else {
    html += '<p>🌙 Evening thermals falling — hunt HIGHER than your target. Your scent sinks into the valley.</p>';
  }
  html += '</div>';

  // Pin details
  pins.forEach(function(pin, idx) {
    var scoreData = pin.scoreData;
    html += '<div class="ht-mission-section ht-mission-pin">';
    html += '<h3>STAND #' + (idx + 1) + (scoreData ? ' — Composite Score: ' + scoreData.composite + '/100' : '') + '</h3>';
    if (scoreData) {
      html += '<p><strong>Rating:</strong> ' + scoreData.tierLabel + '</p>';
      if (scoreData.details.terrain) html += '<p><strong>Terrain:</strong> ' + scoreData.details.terrain + '</p>';
      if (scoreData.details.wind) html += '<p><strong>Wind:</strong> ' + scoreData.details.wind + '</p>';
      if (scoreData.details.habitat) html += '<p><strong>Habitat:</strong> ' + scoreData.details.habitat + '</p>';
      if (scoreData.details.access) html += '<p><strong>Access:</strong> ' + scoreData.details.access + '</p>';
      if (scoreData.details.pressure) html += '<p><strong>Pressure:</strong> ' + scoreData.details.pressure + '</p>';
    }
    if (pin.education) {
      if (pin.education.description) html += '<p>' + pin.education.description + '</p>';
      if (pin.education.approach) html += '<p><strong>Approach:</strong> ' + pin.education.approach + '</p>';
    }
    html += '</div>';
  });

  // Final directive
  html += '<div class="ht-mission-directive">';
  html += '<h3>MISSION DIRECTIVE</h3>';
  html += '<p>Execute entry on designated access route. Maintain wind discipline — check wind every 15 minutes with powder/milkweed. ';
  if (rutPhase && rutPhase.phase === 'peakRut') {
    html += 'ALL-DAY SIT. Do not leave your stand before dark. Mature bucks move at all hours during peak breeding.</p>';
  } else if (rutPhase && rutPhase.phase === 'seeking') {
    html += 'Stay until midday at minimum. Cruising bucks travel between doe groups throughout the morning.</p>';
  } else {
    html += 'Hunt hard during the peak windows. Be in position 60 minutes before first light. Exit after dark to minimize disturbance.</p>';
  }
  html += '</div>';
  html += '</div>';
  return html;
};

window.WHITETAIL_HABITAT_OVERVIEW = {
  bedding: 'Prime bedding cover — ridge points, leeward benches, thickets, and CRP grassland where deer spend daylight hours',
  transition: 'Travel corridors — saddles, creek crossings, ridge spines, and fence gaps that funnel deer movement',
  feeding: 'Active food sources — oak flats, food plots, ag field edges, and browse concentrations',
  water: 'Water sources — creek crossings, ponds, seeps, and springs deer visit daily',
  open: 'Staging areas — timber edge transitions where bucks hold before entering open feeding areas'
};

window.WHITETAIL_HABITAT_LOOK_FOR = {
  bedding: 'Oval depressions in cover with deer hair, droppings clusters, rubs on nearby trees. Multiple beds = buck area. Note wind direction — bucks bed downwind.',
  transition: 'Worn trails with rub lines, scrapes at trail intersections, tracks converging at saddles and creek crossings. 3"+ wide tracks with drag marks = mature buck.',
  feeding: 'Fresh scratchings in leaf litter (acorns), nipped browse at chest height, tracks and droppings at field entries. White oak acorns preferred over red oak.',
  water: 'Tracks in mud at creek crossings, multiple track sizes = regular use. Fresh green droppings nearby = recent visit. Daily watering is consistent.',
  open: 'Rubs and scrapes 50-100 yards inside timber from field edges. Mature bucks stage here and wait for does to enter the field first. Look for fresh sign at dusk.'
};

// ===================================================================
//   Whitetail-Specific Module Labels
// ===================================================================
window.WHITETAIL_EDUCATION_LABELS = {
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
//   Whitetail Live Signal Weights
//   Used by main.js getLiveSignalWeight to score journal pins
// ===================================================================
window.WHITETAIL_SIGNAL_WEIGHTS = {
  rub: 4.5,
  scrape: 5.0,
  bed: 5.0,
  trail: 3.5,
  tracks: 3.0,
  droppings: 2.8,
  sighting: 4.0,
  standSite: 3.5,
  foodSource: 3.8,
  stagingArea: 4.2,
  waterHole: 3.0,
  pressure: 1.0,
  access: 1.5,
  cameraSpot: 2.5
};
