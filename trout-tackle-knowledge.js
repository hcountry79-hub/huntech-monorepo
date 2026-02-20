// ═══════════════════════════════════════════════════════════════════════════
// HUNTECH — TROUT TACKLE KNOWLEDGE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Comprehensive bait, lure, and fly knowledge with condition-based
// recommendation engine. Color/type selection driven by real-time
// conditions: temperature, wind, sky, time of day, season, water clarity.
//
// This is the market differentiator — no other app does this.
// ═══════════════════════════════════════════════════════════════════════════

// ─── POWERBAIT COMPREHENSIVE GUIDE ───────────────────────────────────────
window.POWERBAIT_GUIDE = {
  colors: {
    chartreuse: {
      name: 'Chartreuse', hex: '#7FFF00',
      effectiveness: 97,
      conditions: {
        sky: ['overcast', 'cloudy', 'rain', 'any'],
        waterClarity: ['stained', 'slightly-stained', 'clear'],
        tempRange: [38, 65],
        bestPeriods: ['early-morning', 'morning', 'evening'],
        seasons: ['spring', 'fall', 'winter']
      },
      why: 'The #1 universal PowerBait color worldwide. High visibility in low-light and stained water. Chartreuse triggers aggressive feeding response in stocked rainbow trout. Studies show trout can detect chartreuse up to 3x farther than natural colors in turbid water.',
      rigging: 'Mold a pea-sized ball on a #12 treble hook. Let it float 18-24 inches above a 1/4oz egg sinker on a sliding rig. The dough floats off the bottom into the trout\'s feeding zone.',
      proTip: 'Knead the dough until warm and sticky before molding. Cold PowerBait falls off the hook. In cold water below 45°F, use the garlic-scented version for extra attraction.'
    },
    rainbow: {
      name: 'Rainbow', hex: '#FF69B4',
      effectiveness: 92,
      conditions: {
        sky: ['any'],
        waterClarity: ['clear', 'slightly-stained', 'stained'],
        tempRange: [40, 70],
        bestPeriods: ['morning', 'midday', 'afternoon'],
        seasons: ['spring', 'summer', 'fall', 'winter']
      },
      why: 'The most versatile PowerBait color. Multi-color swirl mimics natural food spectrum. Works in nearly all conditions. Your backup color when chartreuse isn\'t producing.',
      rigging: 'Same sliding sinker rig as chartreuse. Slightly larger ball — rainbow blend is less dense and needs more mass to stay on the hook.',
      proTip: 'Mix rainbow and chartreuse on the same hook for a "cocktail" bait. The color contrast is deadly, especially post-stocking.'
    },
    salmonEgg: {
      name: 'Salmon Egg Red', hex: '#FF4500',
      effectiveness: 88,
      conditions: {
        sky: ['sunny', 'partly-cloudy', 'clear-sky'],
        waterClarity: ['clear', 'slightly-stained'],
        tempRange: [42, 60],
        bestPeriods: ['morning', 'midday'],
        seasons: ['spring', 'fall']
      },
      why: 'Mimics salmon and trout eggs — a natural high-calorie food source. Best in clear water under bright conditions where the red-orange color pops naturally. Trout key on egg drift during spawning seasons.',
      rigging: 'Small ball on #14 single hook for a more natural egg profile. Or use PowerBait Power Eggs for pre-formed shape. Light split shot 12 inches above.',
      proTip: 'Devastating below spawning areas where trout expect to see drifting eggs. In trout parks, try salmon egg color right after stocking — hatchery-raised fish associate this color with food pellets.'
    },
    garlicWhite: {
      name: 'Garlic White', hex: '#F5F5DC',
      effectiveness: 85,
      conditions: {
        sky: ['any'],
        waterClarity: ['clear', 'slightly-stained'],
        tempRange: [32, 50],
        bestPeriods: ['any'],
        seasons: ['winter', 'fall']
      },
      why: 'Cold-water specialist. The garlic scent provides chemosensory attraction when trout metabolism slows in frigid water. White is visible but not aggressive — matches the subtle feeding mood of cold-water trout.',
      rigging: 'Smaller ball than normal. Cold trout have small mouths and slow strikes. #14 treble hook. Use the lightest sinker that holds bottom.',
      proTip: 'Garlic-scented dough outperforms standard scent by 40% in water below 45°F. When other colors fail in the cold, try garlic white.'
    },
    hatcheryPellet: {
      name: 'Hatchery Pellet Brown', hex: '#8B4513',
      effectiveness: 90,
      conditions: {
        sky: ['any'],
        waterClarity: ['any'],
        tempRange: [38, 65],
        bestPeriods: ['morning', 'midday'],
        seasons: ['spring', 'fall', 'winter']
      },
      why: 'Mimics the brown pellet food stocked trout ate daily for months in the hatchery. Fresh stockers recognize this color and shape instantly. The #1 color on stocking day and for 3-5 days after.',
      rigging: 'Form an oblong pellet shape, not a ball. Stocked trout recognize the pellet profile. #12 treble hook on sliding sinker rig.',
      proTip: 'This is your secret weapon at Bennett, Roaring River, and Montauk during the first week of the season. The trout literally think it\'s feeding time at the hatchery. Effectiveness drops as fish become wild-acclimated.'
    },
    fluorescentOrange: {
      name: 'Fluorescent Orange', hex: '#FF6600',
      effectiveness: 82,
      conditions: {
        sky: ['overcast', 'rain', 'storm'],
        waterClarity: ['stained', 'murky', 'muddy'],
        tempRange: [40, 65],
        bestPeriods: ['any'],
        seasons: ['spring', 'summer']
      },
      why: 'Maximum visibility in dirty water. After rain or runoff, fluorescent orange cuts through murk better than any other color. Also effective during heavy overcast or rain when light penetration is minimal.',
      rigging: 'Larger ball — you need maximum scent and color dispersion in murky water. #10 treble hook. Heavier sinker to hold in faster current after rain.',
      proTip: 'After a heavy rain raises the creek, switch immediately to fluorescent orange. When visibility drops below 12 inches, scent and color become the primary attractors. Add garlic oil to the dough for extra pull.'
    },
    cornYellow: {
      name: 'Corn Yellow', hex: '#FFD700',
      effectiveness: 80,
      conditions: {
        sky: ['sunny', 'partly-cloudy'],
        waterClarity: ['clear'],
        tempRange: [45, 65],
        bestPeriods: ['midday', 'afternoon'],
        seasons: ['spring', 'summer', 'fall']
      },
      why: 'Natural-looking color that mimics kernel corn — a proven trout bait. In clear water on sunny days, yellow is visible but not alarming. Good choice when trout are pressured and wary of bright artificial colors.',
      rigging: 'Standard rig. Consider pairing with an actual corn kernel for scent+color combo (where corn is legal as bait).',
      proTip: 'At heavily pressured parks like Bennett Zone 3, trout learn to avoid chartreuse. Switch to corn yellow for a subtler presentation that still has enough visibility.'
    },
    pinkBubblegum: {
      name: 'Pink / Bubblegum', hex: '#FF69B4',
      effectiveness: 78,
      conditions: {
        sky: ['partly-cloudy', 'overcast'],
        waterClarity: ['clear', 'slightly-stained'],
        tempRange: [48, 68],
        bestPeriods: ['morning', 'afternoon'],
        seasons: ['spring', 'summer']
      },
      why: 'Effective in warmer water when trout are more active. Pink suggests egg or shrimp/scud — natural food sources. Works well in spring when water warms into the 50s and trout metabolism increases.',
      rigging: 'Standard sliding sinker rig. Medium ball on #12 treble.',
      proTip: 'Pink PowerBait is underrated. At Maramec Spring and Taneycomo Zone 2, pink regularly outperforms chartreuse in warm spring conditions when scuds (which are pinkish) are active.'
    },
    greenPumpkin: {
      name: 'Green Pumpkin', hex: '#556B2F',
      effectiveness: 75,
      conditions: {
        sky: ['sunny'],
        waterClarity: ['clear'],
        tempRange: [50, 72],
        bestPeriods: ['midday', 'afternoon'],
        seasons: ['summer', 'fall']
      },
      why: 'Natural camouflage color. In clear water under bright sun, pressured trout reject bright colors. Green pumpkin is subtle and mimics natural aquatic food. A finesse option.',
      rigging: 'Small ball, light hook, longest leader practical. Finesse rigging for finesse color.',
      proTip: 'This is your "educated trout" color. When the fish have seen every chartreuse dough ball for a month, green pumpkin is the sleeper pick. Especially effective on Blue Ribbon catch-and-release waters where bait is banned — but excellent on White Ribbon and trout park bait zones.'
    },
    marshmallowWhite: {
      name: 'Marshmallow White', hex: '#FFFFFF',
      effectiveness: 76,
      conditions: {
        sky: ['sunny', 'partly-cloudy'],
        waterClarity: ['clear'],
        tempRange: [42, 58],
        bestPeriods: ['midday'],
        seasons: ['winter', 'spring']
      },
      why: 'Floating variant — suspends in the water column when trout are feeding mid-depth, not on the bottom. White is highly visible in clear water. Also imitates bread/pellet floating food.',
      rigging: 'Use WITHOUT a sinker or with minimal shot. Let it float freely or under a slip bobber to target suspended trout. Set depth to 3-5 feet for winter stocked lake fishing.',
      proTip: 'Winter urban lake specialist. When stocked trout are cruising at 4-6 ft depth and won\'t go to the bottom, marshmallow white under a bobber at their depth is deadly. Combine with a mini marshmallow for extra buoyancy.'
    }
  },
  generalTips: [
    'Always knead PowerBait until warm and pliable — cold dough falls off hooks.',
    'Check your bait every 15-20 minutes. Replace if it\'s washed out or hardened.',
    'Thread your hook through the center of the dough ball so the hook point is barely exposed.',
    'Use the lightest sinker that holds bottom. Over-weighted rigs feel unnatural.',
    'PowerBait works best within the first 10 days of stocking. After that, trout develop wild feeding habits.',
    'In winter, downsize everything — smaller bait ball, smaller hook, lighter line.',
    'The float rig (bobber + PowerBait) can outperform bottom rigs when trout are suspended.',
    'Mix two colors on one hook for a "cocktail" — chartreuse/orange combo is legendary.'
  ]
};

// ─── NATURAL BAIT COMPREHENSIVE GUIDE ────────────────────────────────────
window.NATURAL_BAIT_GUIDE = {
  nightcrawlers: {
    name: 'Nightcrawlers', effectiveness: 94,
    conditions: {
      tempRange: [38, 75], seasons: ['spring', 'summer', 'fall', 'winter'],
      sky: ['any'], waterClarity: ['any']
    },
    rigging: 'Thread a full crawler on a #8 bait-holder hook. Let 1-2 inches trail. Use just enough split shot to drift naturally through the current.',
    sizes: 'Full crawler for pools and deep water. Half crawler or piece for riffles and shallow runs. Smaller pieces = more bites, bigger pieces = bigger fish.',
    proTip: 'The single best natural trout bait. Inflate the worm by injecting air with a syringe for neutral buoyancy. In current, it drifts naturally instead of dragging on bottom.',
    when: 'Universal — works in all conditions. Best after rain when natural worms wash into streams. Spring and fall are peak. Crawlers are less effective in extreme cold (< 35°F) when trout metabolisms are minimal.'
  },
  waxWorms: {
    name: 'Wax Worms', effectiveness: 82,
    conditions: {
      tempRange: [32, 55], seasons: ['winter', 'fall', 'spring'],
      sky: ['any'], waterClarity: ['clear', 'slightly-stained']
    },
    rigging: 'Thread 1-2 wax worms on a #12-14 light wire hook. Use under a small slip bobber set to the depth where trout are holding. Minimal split shot.',
    sizes: 'Use 2-3 on a hook for visibility. Hook through the fat end, leaving the tail to wiggle.',
    proTip: 'Cold-water specialist. When trout won\'t eat PowerBait or crawlers in frigid winter water, wax worms produce. The natural scent and soft texture trigger bites from lethargic cold-water trout. The #1 winter urban lake bait.',
    when: 'Best below 50°F. Outstanding for winter urban lake trout. Keep them warm in your pocket — cold wax worms don\'t move, and movement triggers bites.'
  },
  corn: {
    name: 'Whole Kernel Corn', effectiveness: 85,
    conditions: {
      tempRange: [42, 70], seasons: ['spring', 'summer', 'fall'],
      sky: ['any'], waterClarity: ['clear', 'slightly-stained']
    },
    rigging: 'Thread 2-3 kernels on a #10-12 hook, piercing through the flat side. Use just enough split shot to drift naturally. Can also fish under a bobber.',
    sizes: 'Standard canned whole kernel. Drain the liquid but keep the can — the juice can be used to scent other baits.',
    proTip: 'Corn is banned on some waters in Missouri — CHECK REGULATIONS before using. Legal at trout park bait zones. Stocked trout recognize corn from hatchery feeding. Yellow corn + a bit of PowerBait chartreuse on the same hook is a legendary combination.',
    when: 'Best during and immediately after stocking. Effectiveness decreases as trout wild-acclimate. Sunny clear days when the yellow color pops naturally.'
  },
  salmonEggs: {
    name: 'Salmon Eggs (Preserved)', effectiveness: 80,
    conditions: {
      tempRange: [38, 60], seasons: ['spring', 'fall', 'winter'],
      sky: ['any'], waterClarity: ['clear']
    },
    rigging: 'Single egg on a #12-14 egg hook. No added weight — let the egg drift naturally through current. Can also rig on a tiny jig head (1/64oz) and drift through runs.',
    sizes: 'Single egg for clear water finesse. Egg cluster for murky water or deep pools.',
    proTip: 'Pautzke Fire Cure eggs in bright red are the standard. The scent trail in clear water draws trout from 10+ feet downstream. Outstanding in spring-fed streams where water clarity is extreme.',
    when: 'Best in clear water where the bright color draws attention. Spring and fall when natural egg drift occurs from spawning trout upstream.'
  },
  mealworms: {
    name: 'Mealworms', effectiveness: 72,
    conditions: {
      tempRange: [38, 65], seasons: ['spring', 'fall', 'winter'],
      sky: ['any'], waterClarity: ['any']
    },
    rigging: 'Thread 2-3 on a #14 hook through the head. They\'re smaller than wax worms so quantity helps. Light split shot. Fish under a bobber for best results.',
    sizes: 'Standard or giant mealworms. Giants stay on the hook better.',
    proTip: 'Budget alternative to wax worms. Available at any pet store. Keep them bedded in oatmeal at room temperature — they stay lively for weeks.',
    when: 'Similar conditions to wax worms. Better in slightly warmer water (40-55°F). Good choice for winter urban lake fishing.'
  },
  cheese: {
    name: 'Velveeta / Cheese Bait', effectiveness: 70,
    conditions: {
      tempRange: [45, 70], seasons: ['spring', 'summer'],
      sky: ['any'], waterClarity: ['any']
    },
    rigging: 'Mold a small ball of Velveeta around a #10-12 treble hook. Press firmly — cheese tends to fall off in current. Best in still water or very slow pools.',
    sizes: 'Pea-sized ball. Smaller than PowerBait — cheese is denser.',
    proTip: 'Old-school bait that still works on freshly stocked trout. The strong scent attracts in stained water. Not legal on all waters — check regs. Velveeta stays on hooks better than natural cheese.',
    when: 'Best in slower current or still water. After stocking when trout are actively feeding on anything scented.'
  },
  crickets: {
    name: 'Crickets / Grasshoppers', effectiveness: 78,
    conditions: {
      tempRange: [55, 80], seasons: ['summer', 'fall'],
      sky: ['sunny', 'partly-cloudy'], waterClarity: ['any']
    },
    rigging: 'Hook through the collar behind the head on a #8-10 light wire hook. No weight — let them float and kick on the surface. Or add light split shot for a drowned presentation.',
    sizes: 'Full-size field crickets or grasshoppers. Bigger = better for large trout in pools.',
    proTip: 'Summer specialist. When terrestrial insects are falling into the stream naturally, trout key on them. Cast tight to overhanging grass and banks. Let the live insect kick and struggle on the surface — the movement triggers explosive strikes.',
    when: 'Late June through September when grasshoppers are abundant. Best on sunny afternoons when insects are active near streambanks.'
  }
};

// ─── DOUGH BAIT & SPECIALTY BAIT GUIDE ───────────────────────────────────
window.DOUGH_BAIT_GUIDE = {
  berkleyPowerBait: {
    name: 'Berkley PowerBait Trout Dough',
    forms: ['Dough (jar)', 'Power Eggs (individual)', 'Trout Nibbles (tiny floating)', 'Mice Tails (two-tone)', 'Turbo Dough (floating enhanced)'],
    bestForm: {
      'bottom-fishing': 'Standard Dough on treble hook with sliding sinker rig',
      'suspended': 'Turbo Dough or Power Eggs — extra buoyancy to float off bottom',
      'drift-fishing': 'Power Eggs on single hook with split shot — rolls naturally through current',
      'bobber-fishing': 'Trout Nibbles or small dough ball under slip bobber at 3-6 ft depth'
    },
    scents: {
      original: { effectiveness: 80, notes: 'Standard scent. Good baseline.' },
      garlic: { effectiveness: 88, notes: 'Top performer in cold water. Extra chemosensory attraction. Best below 50°F.' },
      anise: { effectiveness: 75, notes: 'Subtle, natural scent. Good for pressured fish.' },
      corn: { effectiveness: 82, notes: 'Mimics natural corn scent. Good at stocked waters where corn is used as chum.' },
      cheese: { effectiveness: 78, notes: 'Strong scent for murky water. Stocked trout respond well.' }
    }
  },
  pautzkeBait: {
    name: 'Pautzke Fire Bait',
    notes: 'Salmon egg derivative. Cured eggs in a jar. Strong natural scent. Best in clear, cold water. Thread egg cluster on #12 egg hook. Let drift naturally through current.',
    effectiveness: 82,
    bestConditions: 'Clear water, cold temperatures, spring-fed streams. The scent trail pulls trout from downstream.'
  },
  gulpDough: {
    name: 'Berkley Gulp! Trout Dough',
    notes: 'Biodegradable. Water-based formula disperses more scent than oil-based PowerBait. Dissolves underwater over time — generates a scent cloud. Best for flowing water where scent dispersal matters.',
    effectiveness: 79,
    bestConditions: 'Moving water. The scent disperses with current and covers more area than standard dough.'
  },
  miceTails: {
    name: 'Berkley PowerBait Mice Tails',
    notes: 'Two-tone worm shape with floating head and sinking tail. Creates undulating motion underwater even without current. Thread on jig head or single hook.',
    effectiveness: 81,
    bestConditions: 'Stillwater — winter urban lakes where movement attracts cruising trout. Also good in slow pools. The motion of the dual-density design mimics a swimming insect larva.',
    colors: {
      'white-pink': { notes: 'Best in clear water. Subtle movement.', sky: ['sunny', 'partly-cloudy'] },
      'chartreuse-orange': { notes: 'High visibility for stained water.', sky: ['overcast', 'rain'] },
      'rainbow': { notes: 'Universal. All conditions.', sky: ['any'] }
    }
  }
};

// ─── TROUT LURE COMPREHENSIVE GUIDE ──────────────────────────────────────
window.TROUT_LURE_GUIDE = {
  inlineSpinners: {
    roosterTail: {
      name: 'Rooster Tail (Yakima/Worden)', type: 'inline-spinner',
      effectiveness: 95,
      sizes: ['1/16oz (small creek)', '1/8oz (general stream — #1 size)', '1/4oz (big water/tailwater)'],
      colors: {
        white: { effectiveness: 95, conditions: { sky: ['any'], waterClarity: ['clear', 'slightly-stained'], tempRange: [40, 70] }, why: 'The #1 trout spinner color in Missouri. White hackle resembles a fleeing baitfish. Visible in all conditions without being garish.' },
        goldBody: { effectiveness: 90, conditions: { sky: ['overcast', 'cloudy', 'rain'], waterClarity: ['stained', 'slightly-stained'], tempRange: [42, 68] }, why: 'Gold blade flash in low light. Excellent in overcast and stained water where silver flash is too subtle.' },
        chartreuse: { effectiveness: 85, conditions: { sky: ['overcast', 'rain'], waterClarity: ['stained', 'murky'], tempRange: [40, 65] }, why: 'Maximum visibility. Dirty water specialist. After rain, this is your go-to.' },
        black: { effectiveness: 82, conditions: { sky: ['any'], waterClarity: ['any'], tempRange: [38, 65] }, why: 'Dark silhouette visible from below. Dawn and dusk specialist. Also excellent in murky water — creates maximum contrast.' },
        brownTrout: { effectiveness: 80, conditions: { sky: ['sunny'], waterClarity: ['clear'], tempRange: [45, 65] }, why: 'Natural baitfish imitation. Clear water in bright sun where white or chartreuse look unnatural. Educated fish play.' },
        rainbow: { effectiveness: 88, conditions: { sky: ['sunny', 'partly-cloudy'], waterClarity: ['clear'], tempRange: [42, 70] }, why: 'Multi-color flash mimics light refracting through water. Sunny clear conditions. Versatile second choice behind white.' }
      },
      technique: 'Cast quartering upstream. Let it sink 2-3 seconds. Retrieve just fast enough to feel the blade spinning. In riffles, cast across and let the current swing the spinner downstream. The "downstream swing" triggers reflex strikes.',
      proTip: 'Retrieve speed is everything. Too fast = missed fish. Too slow = blade stalls. Find the minimum speed that keeps the blade turning. In cold water, slow down dramatically — trout won\'t chase far in the cold.'
    },
    pantherMartin: {
      name: 'Panther Martin', type: 'inline-spinner',
      effectiveness: 90,
      sizes: ['1/16oz (creek)', '1/8oz (standard)', '1/4oz (river)'],
      colors: {
        goldBodyGoldBlade: { effectiveness: 92, conditions: { sky: ['overcast', 'rain'], waterClarity: ['stained'], tempRange: [40, 65] }, why: 'Double gold flash in low light and dirty water. The Panther Martin blade spins at slower speeds than Rooster Tail — better for cold water slow retrieves.' },
        silverBodySilverBlade: { effectiveness: 85, conditions: { sky: ['sunny'], waterClarity: ['clear'], tempRange: [45, 70] }, why: 'Bright flash for clear sunny conditions. Mimics shiners and dace.' },
        black: { effectiveness: 80, conditions: { sky: ['any'], waterClarity: ['stained', 'murky'], tempRange: [38, 65] }, why: 'High contrast silhouette. Dawn/dusk or dirty water.' }
      },
      technique: 'Panther Martin blades are shaft-mounted (not clevis) so they spin at very low speeds. This makes them the best spinner for SLOW retrieves in cold water. Cast across, barely turn the reel handle. Perfect for winter and early spring.',
      proTip: 'The gold body/gold blade Panther Martin is the #1 spinner for Bennett Spring Zone 2 and Roaring River Zone 1 according to local guides. It outfishes Rooster Tails in cold, slightly stained water.'
    },
    meppsAglia: {
      name: 'Mepps Aglia', type: 'inline-spinner',
      effectiveness: 87,
      sizes: ['#0 (creek)', '#1 (stream)', '#2 (river)'],
      colors: {
        gold: { effectiveness: 88, conditions: { sky: ['overcast'], waterClarity: ['stained'], tempRange: [40, 65] }, why: 'Classic gold blade. The widest blade wobble of any inline spinner. Creates maximum vibration that trout detect with their lateral line in murky water.' },
        silver: { effectiveness: 85, conditions: { sky: ['sunny'], waterClarity: ['clear'], tempRange: [42, 70] }, why: 'Bright silver flash for clear water.' },
        copper: { effectiveness: 80, conditions: { sky: ['overcast', 'cloudy'], waterClarity: ['slightly-stained'], tempRange: [42, 60] }, why: 'Subdued warm flash. Excellent in twilight conditions. Less threatening than gold or silver for spooky fish.' }
      },
      technique: 'The Aglia blade has maximum wobble — creates underwater vibration detectable from far away. Best in stained or deep water where visual is limited. Cast slightly upstream, let sink to depth, slow retrieve.',
      proTip: 'In Missouri spring creeks, a #1 gold Mepps Aglia retrieved through the head of a pool at dawn is deadly for big browns. The vibration triggers the predatory instinct.'
    }
  },
  spoons: {
    kastmaster: {
      name: 'Acme Kastmaster', type: 'spoon',
      effectiveness: 82,
      sizes: ['1/8oz (stream)', '1/4oz (river/tailwater)'],
      colors: {
        gold: { effectiveness: 85, conditions: { sky: ['overcast'], waterClarity: ['any'], tempRange: [40, 65] }, why: 'Compact, heavy profile casts far in wind. Gold flash with tight wobble. Great for reaching distant pools from bank.' },
        silver: { effectiveness: 82, conditions: { sky: ['sunny'], waterClarity: ['clear'], tempRange: [42, 70] }, why: 'Chrome flash mimics darting baitfish. Best in clear water where the flutter and flash can be seen.' },
        goldWithRedStripe: { effectiveness: 80, conditions: { sky: ['any'], waterClarity: ['any'], tempRange: [42, 65] }, why: 'The red stripe adds a subtle prey injury cue. Trout target injured or bleeding prey. Effective in all conditions.' }
      },
      technique: 'Cast and let it flutter on the fall. Many strikes come on the drop. Retrieve with a lift-drop motion — lift the rod tip, let the spoon flutter back down. This "dying baitfish" action is what triggers strikes.',
      proTip: 'The Kastmaster is the best bankside casting lure because it\'s compact and heavy for its size. When you can\'t wade and need to reach water from shore, the Kastmaster casts 30% farther than a spinner of the same weight.'
    },
    littleCleo: {
      name: 'Little Cleo', type: 'spoon',
      effectiveness: 78,
      sizes: ['1/8oz', '1/4oz'],
      colors: {
        hammeredGold: { effectiveness: 80, conditions: { sky: ['overcast'], waterClarity: ['stained'] }, why: 'Hammered finish sends scattered light in all directions. Effective in low light where smooth spoons don\'t have enough presence.' },
        firetiger: { effectiveness: 75, conditions: { sky: ['overcast', 'rain'], waterClarity: ['stained', 'murky'] }, why: 'Maximum visibility pattern. When water is blown out, firetiger is the last resort that still gets seen.' }
      },
      technique: 'Slow retrieve with occasional pauses. The wide body creates a side-to-side wobble that works well in slow current.',
      proTip: 'Less common than Kastmaster or Thomas Buoyant, but the wide wobble action can trigger follows-to-strikes from big fish that ignore tighter-action spoons.'
    }
  },
  softPlastics: {
    troutMagnet: {
      name: 'Trout Magnet', type: 'micro-jig',
      effectiveness: 88,
      sizes: ['1/64oz jighead + split tail grub'],
      colors: {
        white: { effectiveness: 90, conditions: { sky: ['any'], waterClarity: ['clear', 'slightly-stained'], tempRange: [38, 70] }, why: 'Universal color. Imitates a small minnow or insect larva. The split-tail design creates lifelike swimming action even on 1/64oz jighead.' },
        chartreuse: { effectiveness: 87, conditions: { sky: ['overcast', 'rain'], waterClarity: ['stained'], tempRange: [40, 65] }, why: 'High-vis in dirty water. Same color theory as PowerBait chartreuse but in a swimming presentation.' },
        pink: { effectiveness: 82, conditions: { sky: ['sunny'], waterClarity: ['clear'], tempRange: [45, 65] }, why: 'Subtle shrimp/scud imitation. Excellent in spring creek systems where scuds are a primary food source.' },
        black: { effectiveness: 80, conditions: { sky: ['any'], waterClarity: ['any'], tempRange: [38, 65] }, why: 'Maximum contrast silhouette. Works in any condition. Dawn/dusk specialist.' },
        mealworm: { effectiveness: 78, conditions: { sky: ['any'], waterClarity: ['any'], tempRange: [40, 65] }, why: 'Natural brown color mimics actual aquatic insect larvae. Pressured fish option.' }
      },
      technique: 'Cast upstream, let the tiny jig drift through the current on slack line. Trout inhale it like a natural insect. Keep the line just tight enough to feel the take. Set the hook with a strip-set, not a rod lift — the jig is so light that a sharp hookset pulls it away.',
      proTip: 'The Trout Magnet system is a revelation at Missouri winter urban lakes. At Chaumiere, Coot, Boathouse — everywhere. Cast out, slow count-down to the trout\'s depth, and retrieve with tiny twitches. It mimics a swimming insect larva perfectly. Outperforms PowerBait when trout are finicky.'
    },
    berkleyGulpMinnow: {
      name: 'Berkley Gulp! Alive Minnow', type: 'soft-plastic',
      effectiveness: 78,
      sizes: ['1 inch', '2 inch'],
      colors: {
        pearl: { effectiveness: 80, conditions: { sky: ['sunny'], waterClarity: ['clear'] }, why: 'Natural minnow color. Clear water where trout can see details.' },
        chartreuse: { effectiveness: 78, conditions: { sky: ['overcast'], waterClarity: ['stained'] }, why: 'Visibility color. Add scent attraction in murky water.' }
      },
      technique: 'On 1/32oz jig head, swim slowly through pools and runs. The Gulp formula disperses scent — more attractive than standard plastic.',
      proTip: 'Cut the minnow in half for smaller profile. Half a Gulp minnow on a 1/64oz jig fishes like a Trout Magnet but with 400% more scent attraction.'
    }
  },
  crankbaits: {
    rapalaUltraLight: {
      name: 'Rapala Ultra Light Minnow', type: 'crankbait',
      effectiveness: 75,
      sizes: ['ULM-04 (1.5 inch)', 'ULM-06 (2.5 inch)'],
      colors: {
        rainbowTrout: { effectiveness: 78, conditions: { sky: ['any'], waterClarity: ['clear'] }, why: 'Matching local prey. In streams with small wild trout, this profiles as a forage fish.' },
        silver: { effectiveness: 75, conditions: { sky: ['sunny'], waterClarity: ['clear'] }, why: 'Classic baitfish. Flash in clear water.' },
        gold: { effectiveness: 73, conditions: { sky: ['overcast'], waterClarity: ['stained'] }, why: 'Gold finish in low light.' }
      },
      technique: 'Cast across stream, twitch-pause retrieve. Let current swing it through the pool. The balsa body has the best action of any trout crankbait.',
      proTip: 'Advanced technique: Cast tight to structure (boulders, log jams, undercut banks) and twitch once, then let it sit motionless for 3-5 seconds, then twitch again. Big browns that won\'t chase a moving lure will smash a twitched-and-paused Rapala.'
    }
  }
};

// ─── CONDITION-BASED RECOMMENDATION ENGINE ───────────────────────────────
// This is the core intelligence that makes Huntech unique.
// Call getConditionTackleRec(method, conditions) and get a tailored recommendation.
window.getConditionTackleRec = function(method, conditions) {
  // conditions = { temp, wind, period, season, waterClarity }
  // waterClarity is inferred from recent rain, season, etc.
  // Returns: { primary, alternate, rigging, color, why, proTip }

  var temp = conditions.temp;
  var wind = conditions.wind;
  var period = conditions.period || 'morning';
  var season = conditions.season || 'spring';

  // Infer sky condition from temperature + time of day
  var sky = conditions.sky || 'partly-cloudy';
  // Infer water clarity (can be overridden by voice report)
  var clarity = conditions.waterClarity || 'clear';

  if (method === 'bait') {
    return _getBaitRec(temp, wind, sky, clarity, period, season);
  } else if (method === 'spin') {
    return _getLureRec(temp, wind, sky, clarity, period, season);
  } else {
    return _getFlyRec(temp, wind, sky, clarity, period, season);
  }
};

function _getBaitRec(temp, wind, sky, clarity, period, season) {
  var rec = { primary: '', alternate: '', rigging: '', color: '', why: '', proTip: '' };

  // Cold water strategy (< 45°F)
  if (temp !== null && temp < 45) {
    rec.primary = 'PowerBait Garlic White on #14 treble, sliding sinker rig';
    rec.alternate = 'Wax worms (2-3 on #14 hook) under slip bobber at 4-5 ft';
    rec.color = 'White / Natural';
    rec.why = 'Cold water below 45°F slows trout metabolism. Garlic scent provides chemosensory attraction when visual feeding decreases. Smaller presentations match reduced appetite.';
    rec.rigging = 'Light sliding sinker rig. 1/4oz egg sinker, 18" fluorocarbon leader, #14 treble. Smaller bait ball than normal — cold trout take small bites.';
    rec.proTip = 'In frigid water, let your bait sit 30+ minutes before moving. Cold trout investigate slowly. Patience = fish.';
    return rec;
  }

  // Hot/warm water strategy (> 68°F)
  if (temp !== null && temp > 68) {
    rec.primary = 'Nightcrawler half on #10 hook, drifted through shaded pools';
    rec.alternate = 'Cricket or grasshopper on #8 hook floated tight to banks';
    rec.color = 'Natural brown';
    rec.why = 'Warm water trout seek shade, depth, and cooler oxygenated water. Natural baits that match current food sources outperform artificial scents in warm conditions.';
    rec.rigging = 'Minimal weight. Drift bait naturally into shaded pools and deep runs. Fish early morning or late evening when water is coolest.';
    rec.proTip = 'In summer heat, fish the first and last 2 hours of daylight. Midday trout are stressed and don\'t feed actively above 65°F water temp.';
    return rec;
  }

  // Murky/stained water
  if (clarity === 'stained' || clarity === 'murky') {
    rec.primary = 'PowerBait Fluorescent Orange on #12 treble, heavier sinker rig';
    rec.alternate = 'Nightcrawler inflated with air syringe, on #8 hook with split shot';
    rec.color = 'Fluorescent Orange / High-vis';
    rec.why = 'Stained water reduces visual range. Bright colors and strong scent are the only way to reach trout in murky conditions. Scent becomes the primary attractor.';
    rec.rigging = 'Heavier sliding sinker (3/8oz) to hold bottom in the faster post-rain current. Larger bait ball for maximum scent release.';
    rec.proTip = 'After rain, fish the edges where muddy water meets clear spring inflow. Trout stack up at the clarity transition line.';
    return rec;
  }

  // Overcast conditions
  if (sky === 'overcast' || sky === 'cloudy' || sky === 'rain') {
    rec.primary = 'PowerBait Chartreuse on #12 treble, sliding sinker rig';
    rec.alternate = 'PowerBait Rainbow on #12 treble (if chartreuse slows down)';
    rec.color = 'Chartreuse';
    rec.why = 'Overcast skies = prime trout feeding conditions. Trout feel safe without direct sun and move to shallower feeding positions. Chartreuse is the single best color in low light — highly visible without being unnatural.';
    rec.rigging = 'Standard sliding sinker rig. 1/4oz egg sinker, 24" fluorocarbon leader, #12 treble hook. Overcast trout feed aggressively so size up slightly.';
    rec.proTip = 'Overcast drizzle is the #1 trout fishing condition in Missouri. They feed all day. Cast to riffles and run transitions — trout spread out in low light.';
    return rec;
  }

  // Sunny + clear water
  if (sky === 'sunny' && clarity === 'clear') {
    rec.primary = 'PowerBait Corn Yellow on #14 treble, light sliding sinker rig';
    rec.alternate = 'Salmon Egg Red PowerBait on #14 single hook for finesse';
    rec.color = 'Natural Yellow / Salmon Egg';
    rec.why = 'Clear water + bright sun = pressured, wary trout. Natural colors that don\'t scream "BAIT" outperform neons. Yellow mimics corn, a familiar food. Red mimics eggs, a high-calorie natural food.';
    rec.rigging = 'Lightest possible setup. 1/8oz sinker, long 30" fluorocarbon leader (6lb test), small bait ball. In clear water, trout inspect before biting — finesse beats brute force.';
    rec.proTip = 'Find shade. On sunny days, trout hold in shadow lines from trees, bridges, and bluffs. Cast your bait into shadow, not sunlight. Fish on the shadow side of every structure.';
    return rec;
  }

  // Dawn/dusk periods
  if (period === 'early-morning' || period === 'evening' || period === 'night') {
    rec.primary = 'PowerBait Chartreuse on #12 treble, sliding sinker rig';
    rec.alternate = 'Nightcrawler full on #8 bait-holder hook, drifted through runs';
    rec.color = 'Chartreuse or dark natural';
    rec.why = 'Low light periods trigger aggressive feeding. Trout move to shallower riffles and runs. Chartreuse glows in low light. Nightcrawlers are the #1 natural bait — big meal for actively feeding fish.';
    rec.rigging = 'Standard rig for PowerBait. For crawlers, use just enough split shot to drift naturally — no more.';
    rec.proTip = 'Dawn is the absolute best time for bait fishing. Get to your spot before first light. Set up, cast out, and be still. The first 30 minutes of legal fishing time produce more than the next 2 hours.';
    return rec;
  }

  // Default / midday with mild conditions
  rec.primary = 'PowerBait Rainbow on #12 treble, sliding sinker rig in deepest available pool';
  rec.alternate = 'Nightcrawler half-crawler on bottom in shade';
  rec.color = 'Rainbow blend';
  rec.why = 'Standard conditions — the rainbow blend is the safest all-around choice. It works in any light level and water clarity. Trout recognize the spectrum of colors.';
  rec.rigging = 'Standard sliding sinker rig. Fish deep pools and shaded areas in midday. Let bait soak 15-20 minutes before repositioning.';
  rec.proTip = 'Rotate between spots. Set 2-3 rods (where legal) in different pools. When one rod gets a hit, focus your attention on that water type for the next hour.';
  return rec;
}

function _getLureRec(temp, wind, sky, clarity, period, season) {
  var rec = { primary: '', alternate: '', rigging: '', color: '', why: '', proTip: '' };

  // Cold water (< 45°F)
  if (temp !== null && temp < 45) {
    rec.primary = '1/8oz Panther Martin, gold body/gold blade — dead-slow retrieve';
    rec.alternate = 'Trout Magnet white on 1/64oz jig, drifted through pools';
    rec.color = 'Gold / White';
    rec.why = 'Cold trout won\'t chase. The Panther Martin blade spins at extremely slow retrieves — slower than any other spinner. Gold flash in cold-water low light. Trout Magnet drifts naturally like an insect larva.';
    rec.rigging = 'Ultra-slow retrieve. Count to 5 after cast before starting the reel. Single slow handle turns. If you feel the blade stop spinning, you\'re going the right speed — speed up just barely.';
    rec.proTip = 'In water below 45°F, trout won\'t move more than 12 inches to strike. Your lure must pass within a foot of their face. Target the deepest, slowest pools and drift the lure right through the strike zone.';
    return rec;
  }

  // Hot water (> 68°F)
  if (temp !== null && temp > 68) {
    rec.primary = '1/8oz Rooster Tail white, retrieved along shaded banks and deep pools';
    rec.alternate = 'Rapala ULM-04 rainbow trout color, twitched past structure in shade';
    rec.color = 'White / Natural';
    rec.why = 'Warm-water trout hold in shade and depth. Target structure and deep water. Natural colors in clear warm water. Retrieve slightly faster — active summer trout will chase.';
    rec.rigging = 'Fish early and late. Retrieve along shaded banks and cool-water sources (spring inflows). The first 3 feet of a spring branch confluence is the prime warm-weather target.';
    rec.proTip = 'Find cold-water spring inflows — trout stack up where cold spring water enters warm stream water. That temperature transition zone is where every trout in the section will be in summer.';
    return rec;
  }

  // Windy conditions (> 15 mph)
  if (wind !== null && wind > 15) {
    rec.primary = '1/8oz Kastmaster gold — heavy spoon casts through wind';
    rec.alternate = '1/8oz Rooster Tail white — compact spinner handles wind';
    rec.color = 'Gold / White';
    rec.why = 'Wind makes casting light lures difficult. The Kastmaster is the densest lure for its weight — casts 30% farther in wind than a spinner. Gold flash compensates for the rippled water surface that reduces visibility.';
    rec.rigging = 'Cast downwind for maximum distance. Retrieve with lift-drop motion. Wind-generated ripples actually help you — trout can\'t see you clearly, so you can approach closer.';
    rec.proTip = 'Windy days are BETTER than calm days for lure fishing. The choppy surface gives you cover. Trout feed more aggressively because the debris stirred up mimics falling insects. Don\'t stay home on windy days.';
    return rec;
  }

  // Murky water
  if (clarity === 'stained' || clarity === 'murky') {
    rec.primary = '1/8oz Rooster Tail chartreuse — maximum visibility in dirty water';
    rec.alternate = '1/8oz Panther Martin gold body/gold blade for vibration + flash';
    rec.color = 'Chartreuse / Gold';
    rec.why = 'Stained water requires high-visibility colors and vibration. Chartreuse hackle + gold blade creates both visual and lateral-line attraction. The Mepps Aglia is also excellent here — its wide blade wobble creates maximum vibration.';
    rec.rigging = 'Slower retrieve than normal. In dirty water, trout use vibration more than sight to locate prey. Keep the lure slow enough for them to track and intercept.';
    rec.proTip = 'In stained water, VIBRATION is your primary attractor. The wide-blade spinners (Mepps Aglia, Panther Martin) outperform narrow-blade designs here because they push more water.';
    return rec;
  }

  // Dawn/dusk
  if (period === 'early-morning' || period === 'evening' || period === 'night') {
    rec.primary = '1/8oz Rooster Tail black — dark silhouette in low light';
    rec.alternate = '1/4oz Kastmaster gold — flutter spoon visible at dawn/dusk';
    rec.color = 'Black / Dark olive / Gold';
    rec.why = 'At dawn/dusk, trout look UP at prey silhouetted against the lighter sky. Dark lures create the strongest silhouette. This is basic predator optics — dark on light background.';
    rec.rigging = 'Retrieve slightly slower than normal. Trout are aggressive at dawn/dusk but strike based on silhouette, not detail. Keep the lure moving steadily.';
    rec.proTip = 'The biggest trout in any stream feed at dawn and dusk. Use your confidence lure in BLACK and fish the best water. Big trout = dawn and dusk period, every time.';
    return rec;
  }

  // Sunny + clear
  if (sky === 'sunny' && clarity === 'clear') {
    rec.primary = '1/8oz Rooster Tail brown trout color — natural profile in clear water';
    rec.alternate = 'Rapala ULM-04 silver — subtle flash for educated fish';
    rec.color = 'Natural (brown, olive, silver)';
    rec.why = 'Clear water + bright sun = trout see everything including your lure\'s flaws. Natural colors that closely match local forage (dace, sculpins, crayfish) perform best. Stay away from neon colors.';
    rec.rigging = 'Long cast, subtle retrieve. In clear water, keep distance between you and the fish. Use 4lb fluorocarbon leader — invisible in clear conditions.';
    rec.proTip = 'Sunny clear conditions are the hardest for lure fishing. Stay low, cast long, use natural colors, and target shaded structure. If the sun is at your back, your shadow is on the water and trout see you.';
    return rec;
  }

  // Overcast — prime time
  if (sky === 'overcast' || sky === 'cloudy') {
    rec.primary = '1/8oz Rooster Tail white with gold blade — the universal choice';
    rec.alternate = '1/8oz Panther Martin gold body — slow cold-water option';
    rec.color = 'White + Gold blade';
    rec.why = 'Overcast is the best lure fishing condition. Trout feed actively in diffused light. White hackle with gold blade flash is the single most effective spinner combination in Missouri trout water. Period.';
    rec.rigging = 'Standard upstream cast with downstream swing. Vary your retrieve speed until you get a follower or strike, then repeat that speed.';
    rec.proTip = 'On overcast days, fish move out of their normal holding lies and spread through riffles and runs. Cover more water. Move quickly. The fish are actively hunting, so don\'t park in one spot.';
    return rec;
  }

  // Default
  rec.primary = '1/8oz Rooster Tail white — the safest all-around choice';
  rec.alternate = 'Trout Magnet white on 1/64oz jig — finesse backup';
  rec.color = 'White';
  rec.why = 'White Rooster Tail is the single most effective trout lure in Missouri history. It works in almost every condition, every season, every water. When in doubt, tie on white.';
  rec.rigging = 'Cast quartering upstream. Retrieve steadily just fast enough to feel the blade turning. Target seam lines between fast and slow current.';
  rec.proTip = 'Change lure COLORS, not lure types. If white isn\'t working, try gold. Then chartreuse. Then black. Give each color 15 casts before switching. Most anglers switch too fast.';
  return rec;
}

function _getFlyRec(temp, wind, sky, clarity, period, season) {
  var rec = { primary: '', alternate: '', rigging: '', color: '', why: '', proTip: '' };

  // Cold water nymphing
  if (temp !== null && temp < 45) {
    rec.primary = '#20 Zebra Midge (black/silver) dead-drifted under indicator';
    rec.alternate = '#16 San Juan Worm (red) bounced along the bottom';
    rec.color = 'Dark / Subtle';
    rec.why = 'Cold-water trout feed on midges and worms — the only insects active below 45°F. Go small, go slow, go deep. Tiny patterns drifted right through the strike zone.';
    rec.rigging = 'Long leader (12ft), 5X to 6X tippet. Small split shot 8" above fly. Indicator set at 1.5× water depth. Dead drift — absolutely no drag.';
    rec.proTip = 'In winter, trout hold in the slowest, deepest pools. Set your indicator deep enough that the fly occasionally ticks the bottom. If you\'re not snagging occasionally, you\'re not deep enough.';
    return rec;
  }

  // Windy
  if (wind !== null && wind > 15) {
    rec.primary = '#12 Woolly Bugger (black, bead-head) stripped through pools';
    rec.alternate = '#14 Copper John (weighted) under a heavy indicator';
    rec.color = 'Dark / Weighted';
    rec.why = 'Wind kills delicate dry fly work. Switch to heavy subsurface patterns you can cast with minimal false casting. Roll casts and sidearm presentations beat wind.';
    rec.rigging = 'Short leader (7.5ft), 3X-4X tippet. Heavy fly does the casting. Use a tuck cast to cut through wind. Strip streamers — no mending needed.';
    rec.proTip = 'Wind actually helps nymphing — debris blown into the water creates a natural "buffet line" of insects. Trout move to windward banks to intercept food blown off trees.';
    return rec;
  }

  // Dawn/dusk
  if (period === 'early-morning' || period === 'evening') {
    rec.primary = '#14 Elk Hair Caddis — skated across tailouts and pool edges';
    rec.alternate = '#12 Woolly Bugger (olive) stripped through deep runs at dawn';
    rec.color = 'Natural tan/olive';
    rec.why = 'Prime feeding window. Caddis and mayfly spinners are active. Evening rises concentrate fish in tailouts. Dawn triggers aggressive predatory feeding — streamers provoke reaction strikes.';
    rec.rigging = 'Evening: 12ft leader, 5X tippet, dry fly with drag-free drift, match the hatch. Dawn: 7.5ft leader, 3X, streamer stripped fast through dark water.';
    rec.proTip = 'Evening dry fly fishing is the pinnacle. Pick one rising fish, determine its feeding lane, and make one perfect cast. Don\'t splash casts around — one shot per fish is the guide way.';
    return rec;
  }

  // Midday
  if (period === 'midday') {
    rec.primary = '#16 Pheasant Tail Nymph (bead-head) drifted through deep runs';
    rec.alternate = '#14 Hares Ear under indicator through shaded pools';
    rec.color = 'Natural brown/olive';
    rec.why = 'Midday sun pushes trout deep. Subsurface nymphs fished along the bottom of pools and runs. Target shade lines from bluffs, bridges, and overhanging trees.';
    rec.rigging = 'Standard nymph rig. 9ft leader, 4X-5X tippet. Indicator set deep. Add weight if needed to bounce bottom. Mend upstream for long drag-free drifts.';
    rec.proTip = 'Midday is underrated. While everyone else is at lunch, big trout are still eating nymphs on the bottom of shaded pools. The key is depth — you MUST be on the bottom.';
    return rec;
  }

  // Overcast — hatch time
  if (sky === 'overcast' || sky === 'cloudy' || sky === 'rain') {
    rec.primary = '#16 Parachute Adams (dry) or #18 BWO CDC Emerger in drizzle';
    rec.alternate = '#14 Elk Hair Caddis if caddis are popping';
    rec.color = 'Gray/olive dun';
    rec.why = 'Overcast conditions trigger insect hatches and surface feeding. BWOs (Blue Winged Olives) are famous for hatching in drizzly overcast weather. This is dry fly paradise.';
    rec.rigging = 'Long fine leaders (12-15ft), 5X-6X tippet. Drag-free drift is absolutely critical. Match the size of what\'s hatching — go smaller if in doubt.';
    rec.proTip = 'When it\'s drizzling and overcast, DROP EVERYTHING and go trout fishing. This is THE best dry fly condition that exists. BWO hatches can last 2-3 hours on dark rainy days. Pure magic.';
    return rec;
  }

  // Clear + sunny — technical
  if (sky === 'sunny' && clarity === 'clear') {
    rec.primary = '#18-20 RS2 Emerger or Griffith\'s Gnat (tiny midge cluster)';
    rec.alternate = '#16 Pheasant Tail Nymph on 6X tippet with long leader';
    rec.color = 'Sparse / Small / Natural';
    rec.why = 'Clear water, bright sun. Trout see everything. Small, natural-looking flies on fine tippets with perfect presentations. This is technical fly fishing — finesse over force.';
    rec.rigging = '12-14ft leader, 6X-7X fluorocarbon tippet. Tiny flies need light wire hooks. Indicators must be micro (small yarn or putty). Fish the shade.';
    rec.proTip = 'Sunny clear is the hardest condition to fly fish. Your advantage: go where other anglers won\'t. Hike further, wade to harder spots, find the fish no one else bothers with. The best fly fisher wins in tough conditions.';
    return rec;
  }

  // Default
  rec.primary = '#16 Pheasant Tail Nymph under indicator through riffles and runs';
  rec.alternate = '#14 Elk Hair Caddis on top if you see rises';
  rec.color = 'Natural brown';
  rec.why = 'The Pheasant Tail nymph is the most effective fly in Missouri. It imitates mayfly nymphs — a universal trout food. Dead-drifted through riffles and runs, it catches more trout than any other pattern on earth.';
  rec.rigging = 'Standard nymph rig. 9ft leader, 4X-5X tippet. Strike indicator at 1.5× water depth. Small split shot 8" above. Dead drift through seams.';
  rec.proTip = 'When nothing works, go back to basics: #16 Pheasant Tail, dead drift, riffles and runs. If THAT doesn\'t work, you\'re in the wrong spot — move.';
  return rec;
}

// ─── PER-LOCATION LOCAL KNOWLEDGE ────────────────────────────────────────
// Compiled from angler reports, guide recommendations, MDC data, and
// decades of Missouri trout fishing experience.
window.LOCAL_TROUT_KNOWLEDGE = {
  'bennett-spring': {
    bait: {
      zone3: {
        topPicks: [
          'PowerBait Chartreuse — far and away the #1 producer at Bennett Zone 3. Use on #12 treble with sliding sinker rig.',
          'PowerBait Hatchery Pellet Brown — deadly first 5 days after stocking. Trout think it\'s feeding time.',
          'Nightcrawler full on #8 bait-holder hook — the best natural bait. Inflate with air syringe for drift fishing.',
          'Corn (2-3 kernels on #10) — legal in Zone 3. Especially effective opening week when trout recognize hatchery food.',
          'Wax worms under slip bobber — winter C&R season secret. Tiny, natural, irresistible to cold-water trout.'
        ],
        localSecrets: 'Zone 3 gets less pressure than Zone 1 and 2. Fish the far downstream end near the Niangua confluence for holdover trout that have been in the stream for months — they fight harder and taste different. The shaded pool just below the old stone wall is the single best bait spot in Zone 3.',
        hotTip: 'Opening day March 1: Arrive by 5:30am. Get a spot at the deep pool below the footbridge. PowerBait hatchery pellet brown, cast to the middle, let it sit. You\'ll limit out in 30 minutes.'
      }
    },
    lures: {
      zone2: {
        topPicks: [
          '1/8oz Rooster Tail White — THE lure at Bennett Zone 2. Cast upstream, steady slow retrieve. More Zone 2 trout have been caught on white Rooster Tails than any other lure in history.',
          '1/8oz Panther Martin Gold/Gold — the cold-weather alternative. When water is below 50°F and trout won\'t chase, the Panther Martin spins at half the speed of a Rooster Tail.',
          'Trout Magnet White on 1/64oz jig — drift through runs like a natural insect. When spinners stop working, this micro-jig produces.',
          'Small Kastmaster Gold — bankside casting when you can\'t wade. Casts 40 yards. Flutter on the drop triggers strikes.',
          '1/16oz Rooster Tail (any color) — for the narrow runs upstream. Downsize when the stream narrows.'
        ],
        localSecrets: 'Zone 2 (Hatchery Dam to Whistle Bridge) is the longest zone with the most diverse water. The riffles below the hatchery outflow are the #1 lure spot — trout stack up in the oxygenated, food-rich water. The deep pool at the first big bend holds the largest Zone 2 trout.',
        hotTip: 'Midweek fishing is a completely different experience at Bennett. Weekend crowds in Zone 2 can be shoulder-to-shoulder. Tuesday-Thursday you might have the best water to yourself.'
      }
    },
    flies: {
      zone1: {
        topPicks: [
          '#14-16 Scud (tan or orange) — Bennett Zone 1\'s secret weapon. Scuds are the primary food source in the spring-fed water. Dead drift through the spring pool.',
          '#18-20 Zebra Midge (black/silver) — when Zone 1 trout are being picky, go small. Midge activity is nearly constant in the spring creek.',
          '#16 Pheasant Tail Nymph — the universal Zone 1 nymph. Dead drift through every riffle. If you only bring one fly, bring this.',
          '#16 Elk Hair Caddis — spring and fall caddis hatches bring Zone 1 trout to the surface. Afternoon is prime.',
          '#14 Woolly Bugger Olive — early morning stripped through the spring pool. Big trout ambush from the deep spring hole.'
        ],
        localSecrets: 'Zone 1 is the shortest zone (spring pool to hatchery dam) but the most technical. The spring pool itself holds enormous trout visible in the crystal-clear water. Long leaders (14 ft+), 6X-7X tippet, and the lightest presentations you can manage. Guides call this "sight fishing for spring creek monsters."',
        hotTip: 'Winter C&R season (Nov-Feb) is when Zone 1 is at its best. Crowds vanish, trout are fat from a season of feeding, and BWO/midge hatches can produce incredible dry fly fishing on overcast winter afternoons.'
      }
    }
  },
  'montauk': {
    bait: {
      zone3: {
        topPicks: [
          'PowerBait Rainbow — Montauk Zone 3\'s top producer. The deeper pools near the park boundary hold stocked trout. Standard rig.',
          'Nightcrawler drifted through runs — the Current River influence gives Montauk a more "river" character. Drift crawlers naturally.',
          'Corn on #10 hook — simple and effective. Zone 3 trout are the most recently stocked and most receptive to familiar food.',
          'Wax worms under bobber — winter option. The cold-water approach for selective holdover fish.'
        ],
        localSecrets: 'Montauk Zone 3 is the lowest pressure zone in any Missouri trout park. Most anglers focus on Zone 1 C&R and Zone 2 fly water. Zone 3 bait anglers often have prime water to themselves. The deep pool at the downstream park boundary is the sleeper spot.',
        hotTip: 'After your trout limit in Zone 3, walk downstream to the main Current River. Smallmouth bass fishing is world-class from the park boundary downstream.'
      }
    },
    lures: {
      zone3: {
        topPicks: [
          '1/8oz Rooster Tail white — effective in all three zones where legal. Zone 3 allows lures.',
          'Panther Martin gold — cast to the head of deep pools and slow-retrieve through.',
          'Small Rapala (CD-3 rainbow trout) — twitched through the deepest pools. Montauk pools hold big fish.',
          'Trout Magnet — drift through the current like a natural insect. Montauk trout see tons of hatchery feed and respond to natural movement.'
        ],
        localSecrets: 'The Current River runs right through Montauk. This gives the stream more character and flow variation than other trout parks. Lure fishing the transitions between riffle and pool is particularly productive.',
        hotTip: 'The Montauk store (inside the lodge) sells daily tags and has excellent local advice. Ask the staff what\'s been working this week — they fish the stream daily.'
      }
    },
    flies: {
      zone1: {
        topPicks: [
          '#16 Scud (tan) — Zone 1 C&R near the spring pool. Scuds are the primary food source. Dead drift along the bottom.',
          '#18-20 Griffith\'s Gnat — when midges are hatching on the surface, this tiny cluster fly is devastating.',
          '#16 Pheasant Tail Nymph — universal nymph. Works every time in every zone.',
          '#14 Woolly Bugger black — stripped through the spring pool at first light. Zone 1 C&R holds the biggest fish in the park.',
          '#16 BWO (Blue Winged Olive) dry — afternoon hatches on overcast days. Zone 1 C&R is where you\'ll see the best risers.'
        ],
        localSecrets: 'Zone 1 C&R holds truly large trout — fish that have been caught and released many times. They are educated. Leaders of 14 feet in 6X-7X tippet are standard. These fish have seen every fly in the catalog.',
        hotTip: 'The best Zone 1 anglers use a two-fly nymph rig: #14 scud on top, #20 midge dropper 18" below. Covers two food sources in one drift.'
      }
    }
  },
  'roaring-river': {
    bait: {
      zone3: {
        topPicks: [
          'PowerBait Chartreuse — standard Zone 3 producer. Standard rig.',
          'PowerBait + corn cocktail — mold a PowerBait ball around 2 corn kernels. Double scent + visibility.',
          'Nightcrawler on bottom in deep pools — Roaring River pools are deep and cold.',
          'Wax worms — particularly effective in the cold spring-fed water of Roaring River.'
        ],
        localSecrets: 'Roaring River is in far SW Missouri — fewer STL/KC crowds. Zone 3 near the campground gets family traffic but the lower half has excellent isolated pools. The spring branch water is colder than other parks — Roaring River trout prefer smaller, natural presentations.',
        hotTip: 'Cardiac Hill trail gives access to less-pressured water that most anglers avoid because of the steep climb. If you\'re in shape, hike it for the best water in the park.'
      }
    },
    lures: {
      zone1: {
        topPicks: [
          '1/8oz Rooster Tail white — the go-to spinner. Zone 1 allows lures.',
          '1/8oz Panther Martin gold — outperforms Rooster Tail in early season cold water.',
          'Small white marabou jig (1/32oz) — drifted through runs. Local guides love the marabou action.',
          'Berkley Gulp Minnow on 1/32oz jig — scented soft plastic. Drift like natural baitfish.'
        ],
        localSecrets: 'Roaring River Zone 1 is from the hatchery to Dry Hollow Creek. The hatchery outflow area has the highest concentration of trout but also the most anglers. Walk past the crowd to the riffles below.',
        hotTip: 'The hatchery at Roaring River is worth a visit — you can watch them feed the trout. Note what color the pellets are. Then match that color with your lure or bait.'
      }
    },
    flies: {
      zone2: {
        topPicks: [
          '#16 Scud tan/orange — Roaring River spring water is loaded with scuds. The #1 pattern.',
          '#18 Zebra Midge — year-round producer. Black thread, silver wire, silver bead.',
          '#16 Pheasant Tail — dead drift through every riffle in Zone 2.',
          '#14 Elk Hair Caddis — late afternoon on summer days. Caddis hatch is reliable.',
          '#20-24 Griffith\'s Gnat — when midges are thick on the water and fish are sipping.'
        ],
        localSecrets: 'Zone 2 is FLIES ONLY with a C&R section above the Hwy F bridge. This C&R water holds the park\'s largest and most educated trout. 7X tippet, #20-24 midge patterns, and extreme patience.',
        hotTip: 'The C&R section above Hwy F bridge is where local fly fishing guides take visiting anglers for the challenge. If you can catch a fish here on a dry fly, you can fish anywhere.'
      }
    }
  },
  'maramec-spring': {
    bait: {
      zone3: {
        topPicks: [
          'PowerBait Chartreuse — standard rig in the northern pools near the Meramec confluence.',
          'Nightcrawler drifted through runs — the stream widens near Zone 3 with excellent drift fishing.',
          'Salmon eggs — clear spring water makes red/orange eggs highly visible against the light gravel bottom.'
        ],
        localSecrets: 'Maramec Spring is privately owned (James Foundation) — different rules than MDC parks. The entrance fee ($5/vehicle) reduces casual traffic. Zone 3 near the Meramec River confluence often gets warm water mixing in from the river — fish the upstream end of Zone 3 where spring water dominates.',
        hotTip: 'The spring pool at Maramec is the 5th largest in Missouri (96M gallons/day). The deep blue pool holds massive trout that are rarely caught. If you can see them, you can try — but they\'ve seen it all.'
      }
    },
    lures: {
      zone2: {
        topPicks: [
          '1/8oz Rooster Tail white — standard producer.',
          'Small Kastmaster gold — the stream widens in Zone 2 with good bankside casting water.',
          'Trout Magnet pink — scud-colored. Maramec Spring has excellent scud populations.'
        ],
        localSecrets: 'Zone 2 has some of the best riffle water in any trout park. The stream gradient here creates classic riffles-runs-pools that reward methodical lure presentations. Work upstream, covering every seam.',
        hotTip: 'Less crowded than Bennett on weekdays. If you live near STL, Maramec is the play for midweek solitude.'
      }
    },
    flies: {
      zone1: {
        topPicks: [
          '#14-16 Scud (orange) — the Maramec Spring scud population is legendary. Orange is the local color.',
          '#16 Pheasant Tail — universal nymph, works everywhere in Zone 1.',
          '#18 Midge Larva (red/black) — the crystal-clear spring water showcases midges.',
          '#14 Woolly Bugger olive — stripped through the spring pool. Big fish lurk in the blue water.',
          '#16 Elk Hair Caddis — reliable caddis hatches spring and fall.'
        ],
        localSecrets: 'The spring pool at Maramec is unlike anything else in Missouri. Gin-clear, deep blue, with huge trout visible at the bottom. This is more like Western spring creek fishing than typical Missouri trout. Long leaders (14-16ft) and 7X tippet are not overkill here.',
        hotTip: 'The museum and nature center on-site are worth visiting. The James Foundation runs the park beautifully and the entire setting is one of Missouri\'s hidden gems.'
      }
    }
  },
  'lake-taneycomo-z1': {
    lures: {
      topPicks: [
        'Marabou jig 1/32oz white — THE Taneycomo lure. Drag slowly along the bottom. The marabou fibers pulse in the current like a living thing.',
        'Marabou jig 1/32oz pink — secondary color. Pink matches the scud/sowbug prey base.',
        'Micro inline spinner (Rooster Tail 1/16oz) — when fish are actively chasing.',
        'Trout Magnet white — drifted through runs in Zone 1.',
        'Small sculpin-colored jig — big brown trout eat sculpin. Dawn and dusk.'
      ],
      localSecrets: 'Taneycomo Zone 1 is world-class tailwater. The trout here are FAT from eating scuds and sowbugs year-round. Marabou jigs mimicking scuds are the local standard — guide boats use them exclusively. Walk past the first quarter mile of crowded water below the dam for better fish.',
      hotTip: 'October-November: Trophy brown trout move into Zone 1 for pre-spawn feeding. Big sculpin-pattern jigs and streamers at dawn. The biggest browns in Missouri are caught at Taneycomo in fall darkness.'
    },
    flies: {
      topPicks: [
        '#16 Scud tan/orange — 80% of Taneycomo trout diet is scuds. This is THE fly. Dead drift along the bottom.',
        '#18 Sowbug gray — the other 20% of the diet. Fish it the same way as a scud.',
        '#20 Zebra Midge — midge activity is constant below the dam. When scuds aren\'t working, go to midges.',
        '#14 Copper John — weighted nymph that gets deep fast in the tailwater current.',
        '#8 Woolly Bugger black — predawn and post-dark. Stripped slow along the bottom for trophy browns.',
        '#6 Sculpin olive — October/November pre-spawn brown trout target. Cast tight to structure, strip fast.'
      ],
      localSecrets: 'Taneycomo is a tailwater fed by cold hypolimnion releases from Table Rock Dam. Water temp is 48-58°F year-round. The aquatic ecosystem runs on scuds (Gammarus) and sowbugs (Isopoda). Every fly pattern should imitate these two organisms or the midge larvae that also thrive here.',
      hotTip: 'SAFETY: Table Rock Dam generation changes water levels dramatically and FAST. When the generation siren sounds, GET OUT OF THE WATER IMMEDIATELY. Check the generation schedule before every trip. Fish only during minimum flow for wade fishing.'
    }
  },
  'lake-taneycomo-z2': {
    bait: {
      topPicks: [
        'PowerBait Rainbow under bobber from dock — the classic Taneycomo family experience. Set depth to 4-6 feet.',
        'Nightcrawler on bottom below dock — let it sit in the current. Big rainbows cruise the docks.',
        'Wax worms under bobber — finesse option when PowerBait slows down. Especially good in cold water.',
        'Corn (where legal) — stocked trout recognize it. Check current Taneycomo regs for corn legality.',
        'Berkley Mice Tails chartreuse/orange — the motion in current triggers bites from cruising trout.'
      ],
      localSecrets: 'Zone 2 is 20 miles of fishable water from Fall Creek to Powersite Dam. The best bait spots are dock and bank access in the upper half (near Branson) where cold dam water still dominates. As you go downstream, water warms and trout thin out.',
      hotTip: 'A guide boat trip is the best way to fish Zone 2. Guides know exactly where trout hold on any given day based on generation flow. Lilleys Landing is the premier guide service.'
    },
    lures: {
      topPicks: [
        '1/8oz Rooster Tail white — standard spinner from bank or boat.',
        'Marabou jig 1/32oz white — same technique as Zone 1. Drag along bottom.',
        'Trout Magnet — cast from dock, slow retrieve. The micro-jig is perfect for dock fishing.',
        'Small crankbait (Rapala CD-3) trolled behind a drift boat — covers water efficiently.',
        'Kastmaster 1/8oz gold — bankside casting into current seams.'
      ],
      localSecrets: 'The key to Zone 2 lure fishing is finding current seams where fast discharge water meets slower lake water. Trout patrol these seams picking off stunned/disoriented prey. The seam shifts with generation level.',
      hotTip: 'Rockaway Beach area (mid-lake) gets much less pressure than the Branson waterfront. If you want bank fishing solitude on Taneycomo, drive past the tourist areas.'
    }
  },
  // Winter Urban Lakes — generic knowledge applies to all
  '_winter-lakes': {
    bait: {
      topPicks: [
        'PowerBait Rainbow under slip bobber at 4-6 ft — the #1 winter lake technique. Set depth based on where trout are cruising.',
        'PowerBait Chartreuse on bottom rig — standard sliding sinker setup. Fish near the deepest point.',
        'Nightcrawler on bottom with #8 hook and light split shot — natural bait in still water.',
        'Wax worms under micro bobber — cold water finesse. When PowerBait and crawlers fail.',
        'Corn (2-3 kernels) on #10 hook — simple, effective, legal on winter urban lakes.',
        'Berkley PowerBait Power Eggs (floating) under bobber — pre-shaped for consistent hooking.'
      ],
      localSecrets: 'Winter urban lakes are stocked by MDC from November through March. Fish are freshest (and easiest to catch) within 5 days of stocking. Check the MDC stocking schedule at mdc.mo.gov for exact dates. Arrive early on stocking day — it\'s the one day everyone limits out.',
      hotTip: 'Most winter lake trout cruise at 4-6 ft depth along the dam face and deepest bank. Cast your bobber rig to the deep side and wait. The trout come to you on their patrol route.'
    },
    lures: {
      topPicks: [
        'Trout Magnet white on 1/64oz jig — the winter lake MVP lure. Cast and slow-swim at trout depth. So natural it looks alive.',
        '1/8oz Rooster Tail white — classic. Fan-cast to cover water. Retrieve slowly.',
        'Small gold Kastmaster — flutter on the drop catches suspended trout.',
        'Small spoon (Thomas Buoyant or Acme Phoebe) — flutter action for still water.',
        'Berkley Gulp Minnow on 1/32oz jig — scented soft plastic for finicky fish.'
      ],
      localSecrets: 'Winter lake trout don\'t have current to orient to, so they patrol. Fan-cast in a pattern to find their patrol route. Once you catch one, they\'re probably all on the same circuit.',
      hotTip: 'The most effective winter lake technique nobody uses: Trout Magnet on 1/64oz jig under a tiny slip bobber at 4-5 ft. The jig stays at trout depth and the small movements of the bobber create tiny jigging action. It\'s a hybrid bait/lure technique and it outperforms everything.'
    }
  }
};

// ─── METHOD-SPECIFIC HABITAT COACHING TEXT ───────────────────────────────
// Replaces the fly-only coaching in TROUT_HOTSPOT_FLAVOR with method-aware text.
window.HABITAT_METHOD_COACHING = {
  riffle: {
    fly: {
      titles: ['Prime Nymphing Riffle', 'Indicator Water', 'Drift Lane', 'Emerger Riffle', 'Feeding Riffle'],
      approach: [
        'Approach from downstream. Set your indicator at 1.5× the depth. Dead drift a nymph through the seam where fast meets slow.',
        'Wade to knee depth at the tail. Cast upstream quartering. Let the nymph tumble naturally through the riffle.',
        'Position below. False cast away from the water. Deliver the fly 6 feet upstream of the target lane and let it drift.',
        'Watch for subtle surface breaks — trout sipping emergers in riffles show as tiny dimples, not splashy rises.',
        'High-stick nymph through the riffle. Keep your rod tip up, line off the water. Feel for the tick of the take.'
      ],
      tackle: [
        '#16 Pheasant Tail nymph under an indicator. The single most effective riffle fly in Missouri. Dead drift through the seam.',
        '#14 Hares Ear nymph — slightly larger profile than a Pheasant Tail. Use when trout want a bigger meal.',
        'Dry-dropper: #14 Elk Hair Caddis on top with #18 Pheasant Tail 20" below. Cover surface and subsurface.',
        '#18-20 RS2 emerger. When midges are popping in the riffle, this sparse emerger is deadly.',
        'Euro nymph: #16 Perdigon point fly with #20 midge tag. Tight-line through the riffle, feel for the take.'
      ]
    },
    spin: {
      titles: ['Riffle Run', 'Spinner Water', 'Fast-Water Zone', 'Current Channel', 'Gravel Riffle'],
      approach: [
        'Cast your spinner upstream and retrieve just fast enough to keep the blade turning. The current does most of the work.',
        'Stand downstream, cast quartering upstream. Let the spinner swing across the riffle on the retrieve — trout intercept.',
        'Work upstream in a grid. Cast, reel a few feet, cast again. Cover every current lane systematically.',
        'The key in riffles is retrieve speed. Too fast and trout can\'t catch it. Too slow and the blade stalls. Find the sweet spot.',
        'Target the seam lines — the edges where fast water meets slow. Trout patrol these seams waiting for food carried by current.'
      ],
      tackle: [
        '1/8oz Rooster Tail white — cast upstream, steady slow retrieve. The #1 riffle presentation in Missouri.',
        '1/8oz Panther Martin gold — better in cold water. The blade spins at slower speeds for sluggish cold-water trout.',
        'Trout Magnet white on 1/64oz jig — drift through the riffle like a natural insect. No reeling, just drift.',
        '1/16oz Rooster Tail (any color) — downsize in narrow riffles. Smaller profile, more natural.',
        'Kastmaster gold 1/8oz — when riffles are too shallow for spinners, a spoon flutters through with less snag risk.'
      ]
    },
    bait: {
      titles: ['Drift Lane', 'Current Seam', 'Gravel Run', 'Feeding Channel', 'Natural Drift'],
      approach: [
        'Add just enough split shot to bounce your bait along the bottom. It should tick rocks as it drifts through — that\'s the right weight.',
        'Position upstream and let your bait drift naturally through the riffle. Trout sit behind rocks waiting for food to come to them.',
        'Use a drift rig: split shot 12" above the hook, let the current carry the bait. Riffles deliver food — match the drift.',
        'Watch your line. In riffles, bait strikes feel like a momentary stop or twitch in the drift. Not a hard tug.',
        'Move your bait through different current lanes. Each lane holds different sized trout. Start near-side, then work farther.'
      ],
      tackle: [
        'Nightcrawler half on #10 hook with 2 small split shot — drift through the riffle naturally. The current rolls the bait past feeding trout.',
        'PowerBait chartreuse on #12 treble, just enough weight to maintain bottom contact. Riffles dislodge natural food — match it.',
        'Wax worms on #14 hook drifted through with single split shot — cold-water finesse in riffles.',
        'Salmon eggs on #12 egg hook — bright color visible in the faster riffle water. Single egg, no weight.',
        'Corn kernel on #10 hook with split shot — heavy enough to stay in the strike zone as it drifts through.'
      ]
    }
  },
  pool: {
    fly: {
      titles: ['Deep Holding Pool', 'Trophy Water', 'Structure Pool', 'Thermal Refuge', 'Cedar Hole'],
      approach: [
        'Approach from well downstream. Keep low. Big trout in clear pools spook at shadows and line flash.',
        'Dead drift nymphs through the pool head where current delivers food. Switch to streamers along deep edges.',
        'Long leader (12ft+), stay behind cover. Make your first cast count — pool fish spook hard.',
        'High-stick nymph through the head. Let it swing at the tailout. Fish every depth layer systematically.',
        'Identify the deepest slot. Add enough weight to reach bottom. Pool trout eat on the bottom 80% of the time.'
      ],
      tackle: [
        '#12 Woolly Bugger (olive or black) stripped through the pool at dawn. Trophy fish eat big meals.',
        'Double nymph rig: #14 Stonefly top, #18 Pheasant Tail dropper. Cover the water column from mid to bottom.',
        '#14 San Juan Worm (red or pink) drifted deep and slow. Effective year-round in Missouri pool water.',
        '#14 Glo-bug (peach or chartreuse) drifted through the pool head. Irresistible opportunistic meal.',
        '#6 Sculpin pattern dead-drifted or stripped along bottom structure. Big fish eat big baitfish.'
      ]
    },
    spin: {
      titles: ['Deep Pool', 'Slow Water', 'Trophy Water', 'Bottleneck Pool', 'Holding Pool'],
      approach: [
        'Cast to the head of the pool and let your lure sink. Slow, slow, slow retrieve along the bottom.',
        'Target the deepest water. Count your lure down — 1 second per foot — to reach bottom before retrieving.',
        'Work the pool edges first, then the middle. Big trout hold in the deepest slot. The lure must pass through their zone.',
        'Fan-cast the pool — start near-side, move progressively farther. Each cast covers new water.',
        'Retrieve with pauses. Cast, let sink, retrieve 3 turns, pause 3 seconds, repeat. Stop-and-go triggers reaction strikes.'
      ],
      tackle: [
        '1/8oz Rooster Tail white — count it down to the pool bottom. Ultra-slow retrieve along the deepest lane.',
        'Kastmaster gold 1/8oz — the lift-and-flutter technique is deadly in pools. Lift rod tip, let spoon flutter on a slack line.',
        'Trout Magnet black on 1/64oz jig — drift through the pool head. High contrast on the light bottom.',
        'Rapala ULM-04 (suspend version) — twitch and pause at pool depth. Big trout strike motionless lures.',
        'Marabou jig white 1/32oz — drag slowly along the pool bottom. The breathing marabou fibers trigger strikes.'
      ]
    },
    bait: {
      titles: ['Deep Pool', 'Soak Spot', 'Holding Water', 'Bottom Rig Water', 'Patience Pool'],
      approach: [
        'Pools are where bait fishing excels. Cast to the deepest section, let your bait sit on the bottom. Patience wins.',
        'Set up camp at a deep pool. Multiple rods (where legal). Let the bait soak. Trout cruise pools and find your offering.',
        'The pool head where current enters is the feeding lane. Cast there first. If no bites, let bait settle in deep center.',
        'Use a bobber rig to suspend bait 1-2 feet off the bottom. Sometimes trout cruise just above the bottom layer.',
        'Check your bait every 15 minutes. Waterlogged or washed-out PowerBait loses scent. Fresh bait = more bites.'
      ],
      tackle: [
        'PowerBait (condition-matched color) on #12 treble, sliding sinker rig. The deep pool is PowerBait\'s ideal water.',
        'Nightcrawler full on #8 hook on the bottom. The biggest trout in any pool prefer the biggest meal.',
        'PowerBait Power Eggs (floating) on #14 single hook — the eggs float just off the bottom where trout cruise.',
        'Salmon eggs on #12 hook in clear pools — the red/orange stands out against the gravel. Natural look.',
        'Berkley Mice Tails chartreuse/orange on #10 hook — the dual-density design moves in even the slightest current.'
      ]
    }
  },
  run: {
    fly: {
      titles: ['Feeding Lane Run', 'Glide', 'Current Seam', 'Emerger Alley', 'Prime Drift'],
      approach: [
        'Dry-dropper rig is ideal. Cast across, mend upstream, let the nymph swing below the dry through the seam.',
        'Fish from the bank if possible. Less disturbance = trout stay in feeding mode in the smooth water.',
        'Work upstream in a grid — cast, two steps, cast. Cover every current lane systematically.',
        'Use a reach cast to extend your drift. The longer your fly drifts naturally, the more fish you hook.',
        'Start at the tail end, work up. Fish the near seam first, middle next, far seam last. Never line fish.'
      ],
      tackle: [
        '#16 Parachute Adams dead-drifted — the best all-around dry fly for Missouri runs.',
        'Dry-dropper: #14 Stimulator on top, #18 Pheasant Tail 20" below. Best of both worlds.',
        'Euro-nymph: #16 Perdigon point, #20 midge tag. Tight line, keep contact, feel for the take.',
        '#14 Soft Hackle (Partridge and Orange) — swing through the run at the end of each drift. Emerger imitation.',
        '#16 CDC Blue Winged Olive during the afternoon hatch. When dries work in a run, it\'s pure magic.'
      ]
    },
    spin: {
      titles: ['Current Run', 'Spin Lane', 'Sweep Water', 'Transition Run', 'Glide Lane'],
      approach: [
        'Cast quartering upstream. Let the spinner swing downstream through the run. Trout intercept on the swing.',
        'Retrieve just fast enough to keep the blade spinning. In runs, the current adds speed — retrieve SLOWER than you think.',
        'Target the seams — edges between faster and slower current. Trout patrol these seams systematically.',
        'Work the entire run length. Start downstream, move up. Trout hold in staggered positions throughout.',
        'Vary your retrieve depth. Start shallow (fast retrieve), then progressively slower to sweep deeper water on each pass.'
      ],
      tackle: [
        '1/8oz Rooster Tail white — quartering upstream cast, let it swing through the run. Classic technique.',
        'Trout Magnet on 1/64oz jig — drift through runs like a natural. The most natural-looking lure presentation.',
        '1/8oz Panther Martin gold — slow swing through runs in cold water. The blade turns at the slowest speeds.',
        'Kastmaster 1/8oz silver — flutter it through the deeper end of runs. Lift-drop retrieve.',
        'Small inline spinner cast across the run — the downstream swing imitates a baitfish caught in current.'
      ]
    },
    bait: {
      titles: ['Drift Run', 'Natural Lane', 'Easy Drift', 'Chuck-and-Duck', 'Bottom Bounce'],
      approach: [
        'Drift bait through the run using split shot. The current does the work — your job is keeping the drift natural.',
        'Position at the top of the run. Cast downstream with enough weight to bounce bottom. Let it drift the entire length.',
        'Use a slip bobber set to 1.5× run depth. The bobber carries your bait downstream through the feeding lane naturally.',
        'Watch for line twitches. Run trout pick up bait and swim with current — the strike feels like a momentary weight.',
        'After each drift, recast 2 feet to the side. Cover the entire run width before moving to the next section.'
      ],
      tackle: [
        'Nightcrawler on #10 hook with split shot — drift through the run naturally. The crawlers tumble like natural food in current.',
        'PowerBait on #12 treble under slip bobber — the bobber carries it through the entire run. Set depth to bottom-bounce.',
        'Corn on #10 hook drifted with single split shot — lightweight and natural. Rolls through the run like real drift food.',
        'Wax worms on #14 hook — cold water finesse in runs. Small natural profile drifts perfectly in moderate current.',
        'PowerBait Power Eggs on #14 hook with micro shot — the floating eggs ride just off bottom where trout search for food.'
      ]
    }
  },
  boulder: {
    fly: {
      titles: ['Pocket Water', 'Structure Lie', 'Log Jam', 'Root Wad', 'Rock Garden'],
      approach: [
        'Cast tight behind boulders. Dead drift nymph through pockets. Each pocket holds a separate fish.',
        'Roll cast parallel to log jams. Get your fly right along the wood — trout hold inches away.',
        'Short, accurate casts to each pocket. Work methodically. There may be a fish in every pocket.',
        'Cast upstream of the boulder. Let fly drift around both sides — the cushion in front and eddy behind both hold fish.',
        'Streamers stripped past structure trigger aggressive ambush strikes from territorial trout.'
      ],
      tackle: [
        '#12 Woolly Bugger (black or olive) — stripped past structure. Aggressive trout chase.',
        '#14 Copper John tight-lined through every pocket. Structure fish want food delivered — bring it to them.',
        '#14 Glo-Bug or egg drifted through the eddy behind boulders. Opportunistic fish grab easy meals.',
        '#8 Sculpin bounced along the bottom near big boulders. Trophy fish eat big baitfish.',
        '#14 Prince Nymph high-sticked right along structure. Keep it deep and close to the wood or rock.'
      ]
    },
    spin: {
      titles: ['Structure Water', 'Boulder Field', 'Pocket Water', 'Ambush Zone', 'Rock Garden'],
      approach: [
        'Short, accurate casts into the slack water behind each boulder. Let the lure drop into the pocket before retrieving.',
        'Cast past the structure and retrieve the lure into the pocket water. Trout ambush from behind rocks.',
        'Fan-cast around each boulder — upstream, side, behind. Each angle produces a different reaction.',
        'Use a countdown method. Cast, let the lure sink to the bottom of the pocket (count 1-per-foot), then slow retrieve.',
        'In boulder fields, expect snags. Use mono or light fluoro leader so you can break off a snag without losing the whole rig.'
      ],
      tackle: [
        '1/8oz Rooster Tail white — cast past the boulder, retrieve through the eddy. Short casts, quick retrieves.',
        'Kastmaster gold 1/8oz — flutter into pockets. The tight wobble works in small water behind structure.',
        'Trout Magnet on 1/64oz jig — drop into each pocket. The tiny jig sinks into the slack water where trout hold.',
        'Small crankbait (Rapala ULM-04) — twitched past structure. Pause in the eddy behind boulders.',
        'Marabou jig 1/32oz — drag along the bottom near structure. The breathing fibers trigger ambush response.'
      ]
    },
    bait: {
      titles: ['Pocket Spot', 'Structure Bottom', 'Rock Eddy', 'Log Jam Pool', 'Ambush Point'],
      approach: [
        'Drop bait into the calm pocket behind each boulder. Trout sit in these protected spots and ambush whatever drifts past.',
        'Let your bait settle in the eddy behind structure. The slack water holds food — and trout know it.',
        'Cast upstream of the boulder and let bait drift through the current break into the pocket. Natural delivery.',
        'Use just enough weight to stay in the pocket. Too heavy and it rolls through — too light and current pulls it out.',
        'Fish each structure pocket for 5 minutes, then move. Structure fish usually bite quickly or not at all.'
      ],
      tackle: [
        'Nightcrawler on #10 hook — drop into boulder pockets. The crawler sits on bottom and trout find it by scent.',
        'PowerBait (condition-matched color) — mold onto #12 treble, drop into the slack water behind rocks.',
        'Wax worms on #14 hook — natural pocket water presentation. Small target, smaller hook.',
        'Single salmon egg on #14 hook — drift through the pocket with no weight. Bright, visible, natural drift.',
        'Live cricket on #10 hook — cast tight to structure in summer. The struggling insect triggers immediate strikes.'
      ]
    }
  },
  tailout: {
    fly: {
      titles: ['Evening Rise Tailout', 'Emerger Zone', 'Transition Flat', 'Feeding Tailout', 'Sipping Water'],
      approach: [
        'Approach very carefully — tailout fish are in thin, clear water and hyper-alert. Kneel or stay low.',
        'Cast upstream from a kneeling position. 12ft leader minimum — go light and long.',
        'Fish the edges first. Trout in tailouts hug banks where they feel safer in the thin water.',
        'Let your dry fly drift all the way through the tailout. Fish follow food downstream into the riffle below.',
        'If fish are rising, identify ONE fish and cast only to that one. Don\'t spray casts randomly.'
      ],
      tackle: [
        '#16 Parachute Adams or #18 BWO — match the evening rise. Tailout trout are selective and precise.',
        '#14 Elk Hair Caddis — skated across the tailout at dusk. Triggers explosive surface strikes.',
        '#18 CDC emerger — deadly when trout are sipping just under the surface film in the smooth tailout.',
        'Soft hackle swing — cast across, let it swing through the tailout. Imitates emerging insects perfectly.',
        '#16 Pheasant Tail unweighted — fished just subsurface. Tailout trout eat emergers more than adult dries.'
      ]
    },
    spin: {
      titles: ['Thin Water', 'Transition Zone', 'Flat Water Spin', 'Shallow Sprint', 'Finesse Zone'],
      approach: [
        'Ultralight is key here. Thin tailout water requires the lightest lure you can cast. Downsize everything.',
        'Cast upstream and retrieve slowly through the thin water. Trout in tailouts are wary — finesse presentation.',
        'Stay back from the bank — tailout fish see everything in shallow water. Long casts from a distance.',
        'Fish the tailout at dawn and dusk when trout move from pools into shallow feeding positions.',
        'Slow steady retrieve. No erratic action — tailout trout prefer a calm, natural-looking target in thin water.'
      ],
      tackle: [
        'Trout Magnet white on 1/64oz — the lightest lure option. Drifts naturally through thin tailout water.',
        '1/16oz Rooster Tail (downsize!) — smaller spinner for shallow tailout water. Retrieve barely fast enough for blade spin.',
        'Small spoon (1/16oz Phoebe) — flutters through thin water. The wide wobble is visible even in shallow conditions.',
        'Micro jig (1/64oz) with tiny Gulp grub — drift through the tailout like a natural insect.',
        '1/8oz Kastmaster — cast far, flutter through the tailout on retrieve. Works when you need distance from spooky fish.'
      ]
    },
    bait: {
      titles: ['Shallow Feed', 'Thin Water Drift', 'Dawn Flat', 'Bank Edge', 'Transition Spot'],
      approach: [
        'Light and natural. In thin tailout water, heavy rigs look wrong. Minimal weight, small bait, natural drift.',
        'Fish the tailout at first light. Trout move up from pools to feed in the warming shallows at dawn.',
        'Use a small bobber set shallow (2-3 ft). The bobber drifts your bait through the tailout feeding lane.',
        'Stay low and quiet. Tailout fish in 12-18 inches of water feel every footstep through the bank. Be a ghost.',
        'Cast upstream and let bait drift through naturally. No tension on the line — just ride the current.'
      ],
      tackle: [
        'Single wax worm on #14 hook — lightest possible. Drift through the tailout on 4lb fluorocarbon.',
        'PowerBait tiny ball on #14 hook — downsize from #12. Thin water trout inspect before biting.',
        'Single corn kernel on #12 hook — natural and lightweight. Drifts through tailouts perfectly.',
        'Nightcrawler piece (2 inches) on #12 hook — half a crawler for natural drift speed in shallow water.',
        'Mini marshmallow + PowerBait combo — floating presentation in the thin tailout. Suspends at trout level.'
      ]
    }
  }
};

console.log('HUNTECH: Trout tackle knowledge engine loaded — ' +
  Object.keys(window.POWERBAIT_GUIDE.colors).length + ' PowerBait colors, ' +
  Object.keys(window.TROUT_LURE_GUIDE.inlineSpinners).length + ' spinner types, ' +
  Object.keys(window.LOCAL_TROUT_KNOWLEDGE).length + ' location profiles');
