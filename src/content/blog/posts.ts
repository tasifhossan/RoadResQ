import { BlogPost, BlogCategory } from "./types";

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Safety",
  "Maintenance",
  "Emergency",
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-to-do-when-your-car-overheats-on-the-road",
    title: "What to do when your car overheats on the road",
    excerpt:
      "Engine overheating requires calm and immediate caution. Learn the warning signs, how to pull over safely, and why you must never touch a hot radiator cap.",
    category: "Emergency",
    publishedAt: "2026-10-12",
    readingMinutes: 4,
    sections: [
      {
        heading: "Recognizing the Warning Signs Early",
        paragraphs: [
          "An overheating engine is among the most urgent roadside emergencies a driver can encounter. Modern vehicles operate within a tightly regulated temperature range, and any sudden increase can cause severe internal damage within minutes.",
          "The first indication is typically the temperature gauge creeping into the red zone or an illuminated engine temperature symbol on the dashboard. You may also observe steam or vapor escaping from the edges of the hood, notice a pungent, sweet smell indicating hot coolant, or experience an abrupt loss of engine power.",
        ],
        list: [
          "Dashboard temperature needle entering the red zone or high-heat indicator light.",
          "Steam or coolant vapor venting from beneath the hood.",
          "A distinct sweet chemical odor circulating through the air vents.",
          "Unusual ticking, pinging, or thumping sounds coming from the engine block.",
        ],
      },
      {
        heading: "Immediate Steps: Safely Leaving the Road",
        paragraphs: [
          "If the needle begins to rise while moving in traffic, immediately turn off the air conditioning system to reduce load on the engine. If safe to do so, turn the interior heater on to maximum heat and high blower speed; the heater core acts as a secondary mini-radiator, drawing thermal energy away from the coolant loop.",
          "Signal your intention and carefully steer toward the nearest shoulder or safe turnout away from fast-moving lanes. Avoid sudden braking, as sudden deceleration under extreme heat can stress the water pump and cooling lines. Once stopped safely, turn off the engine immediately and turn on your emergency hazard flashers.",
        ],
      },
      {
        heading: "Critical Engine Safety Rules",
        paragraphs: [
          "The most vital safety rule when dealing with an overheated car is never to open the radiator cap or coolant reservoir while the engine is hot. The cooling circuit operates under high pressure, and cracking the cap will release pressurized boiling coolant and steam that causes severe burns.",
          "Keep the hood closed for at least fifteen to twenty minutes if you observe active steam venting. Trapped steam and boiling fluid can spray violently if a hose ruptures when the latch is released. Give the entire compartment sufficient time to radiate its trapped heat naturally.",
        ],
      },
      {
        heading: "Safe Inspection Once Cooled",
        paragraphs: [
          "After waiting at least thirty to forty-five minutes, check the underside of the vehicle for puddles of coolant. A pool of leaking engine coolant on the pavement points toward a ruptured hose, cracked radiator tank, or failed water pump seal.",
          "With the engine completely cold to the touch, inspect the transparent plastic overflow tank. If the reservoir is completely empty, air has entered the circuit. Adding room-temperature water or coolant to a still-hot engine block can crack the metal cylinder head, so patience is essential.",
        ],
      },
      {
        heading: "When to Request Professional Roadside Help",
        paragraphs: [
          "Never attempt to continue driving if the temperature indicator immediately spikes upon restart, if coolant is actively pouring onto the ground, or if you hear metal-on-metal grinding noises. Continuing to drive an overheated engine can warp the cylinder head, blow the head gasket, or permanently seize the pistons.",
          "In these circumstances, remain in a secure location away from moving traffic and request roadside assistance. A qualified mobile technician can diagnose whether the issue stems from a broken drive belt, an inoperative electric radiator fan, or a stuck thermostat before irreversible engine damage occurs.",
        ],
      },
    ],
  },
  {
    slug: "how-to-tell-a-weak-battery-from-a-charging-problem",
    title: "How to tell a weak battery from a charging problem",
    excerpt:
      "A car that will not start could have a drained battery or a failed alternator. Distinguish between storage and generation issues with these diagnostic steps.",
    category: "Maintenance",
    publishedAt: "2026-10-14",
    readingMinutes: 4,
    sections: [
      {
        heading: "Understanding the Vehicle Electrical Loop",
        paragraphs: [
          "Vehicle starting problems frequently leave motorists uncertain whether the issue lies in the battery or the charging circuit. While both components work together, their responsibilities are distinct.",
          "The twelve-volt battery provides the massive surge of electrical energy required by the starter motor to turn over the combustion engine. Once the engine runs, the alternator takes over, generating electrical current to run the vehicle electronics while recharging the battery. Misdiagnosing the fault often leads to buying a replacement battery when the real culprit is an inactive alternator.",
        ],
      },
      {
        heading: "Symptoms of a Weak or Failing Battery",
        paragraphs: [
          "A failing battery gives subtle warning signs before it refuses to start the car completely. Pay close attention to how the starter sounds during the first turn of the ignition key after the vehicle has sat overnight.",
          "If the engine cranks sluggishly with a dragging, slow rotation before catching, the battery is losing its cold-cranking capacity. When you turn the key and hear rapid clicking without any engine movement, the starter solenoid is engaging but the battery cannot deliver the required amperage to spin the flywheel.",
        ],
        list: [
          "Slow, sluggish engine crank during the first morning start.",
          "Rapid metallic clicking noises from the starter relay without engine turnover.",
          "Interior dome lights and dashboard displays dim noticeably during starting attempts.",
          "Heavy white, powdery crust or sulfate corrosion deposits on the lead battery posts.",
        ],
      },
      {
        heading: "Symptoms of an Alternator or Charging Failure",
        paragraphs: [
          "An alternator failure produces different symptoms because the problem manifests while the engine is already operating. If your vehicle suddenly stalls while driving or idling at a signal, the alternator has likely stopped generating sufficient voltage, forcing the ignition system to drain the battery until exhaustion.",
          "Watch for the battery-shaped warning light on your instrument cluster while driving. Contrary to popular belief, this indicator does not measure battery life; it signals that the charging system voltage has dropped below acceptable operational limits. You may also observe headlights dimming as engine speed drops or fluctuating cabin fan speeds.",
        ],
      },
      {
        heading: "Diagnostic Checks You Can Perform Safely",
        paragraphs: [
          "A jump-start provides an effective practical diagnostic check. Connect booster cables correctly and start the stalled vehicle. Once running, disconnect the booster cables. If the engine dies almost immediately, the alternator is not producing electricity to sustain ignition, and the car cannot run on its own.",
          "If the vehicle continues running smoothly for thirty minutes after the jump-start but refuses to restart after you turn it off, the alternator is supplying operational voltage but the battery can no longer hold an electrical charge. Using a simple digital multimeter confirms this: a healthy resting battery shows roughly 12.6 volts, while an active alternator should supply between 13.8 and 14.4 volts with the engine idling.",
        ],
      },
      {
        heading: "Preventative Care and Terminal Inspection",
        paragraphs: [
          "Before replacing either component, inspect the physical wiring. Loose or corroded battery terminals increase electrical resistance, preventing both proper starting current and incoming recharge flow. Tighten terminal clamps and clean corrosion using a wire brush.",
          "Similarly, check the alternator drive belt for glazing, cracks, or loose tension. A slipping belt cannot spin the alternator pulley at full speed, reducing output even when the internal regulator is undamaged. When in doubt, a professional technician can perform a carbon-pile load test to determine remaining component health accurately.",
        ],
      },
    ],
  },
  {
    slug: "changing-a-flat-tire-safely-on-a-busy-road",
    title: "Changing a flat tire safely on a busy road",
    excerpt:
      "A roadside flat tire can be hazardous without proper precautions. Follow this essential safety guide on positioning, visibility, and safe jacking technique.",
    category: "Safety",
    publishedAt: "2026-10-16",
    readingMinutes: 4,
    sections: [
      {
        heading: "Assessing the Environment Before Stopping",
        paragraphs: [
          "Experiencing a sudden tire puncture or blowout on a busy highway is stressful, but your primary responsibility is selecting a safe location to bring the vehicle to rest. Never stop abruptly in an active lane of travel or on a blind curve.",
          "Continue driving slowly on the flat tire until you reach a wide shoulder, an emergency turnout, or an exit ramp. While driving on a flat tire may damage the wheel rim, your physical safety is far more valuable than a replaceable metal wheel. Aim for ground that is as flat and solid as possible, avoiding soft gravel, mud, or steep roadway embankments.",
        ],
      },
      {
        heading: "Maximizing Vehicle Visibility",
        paragraphs: [
          "As soon as you detect tire trouble, activate your hazard warning flashers to communicate with surrounding drivers. Pull as far to the right edge of the shoulder as possible to maximize the buffer zone between your working area and speeding traffic.",
          "Before stepping out, confirm through your side mirror that traffic is clear. Set up a reflective emergency warning triangle approximately forty to fifty meters behind your vehicle if conditions allow safe walking along the verge. At night, keep your parking lights on and wear a reflective vest if one is stored in your vehicle emergency kit.",
        ],
        list: [
          "Turn on hazard warning flashers before decelerating.",
          "Pull the vehicle entirely off the paved roadway surface when possible.",
          "Engage the emergency parking brake firmly to lock the rear wheels.",
          "Place a wheel chock or sturdy stone behind the tire diagonally opposite the flat.",
        ],
      },
      {
        heading: "Preparing the Vehicle on Firm, Level Ground",
        paragraphs: [
          "Shift automatic transmissions into Park, or engage first gear on manual vehicles. Firmly engage the emergency parking brake. Place a wheel chock, wood block, or solid rock against the wheel diagonally opposite the flat tire to prevent the car from rolling while lifted.",
          "Retrieve your spare tire, vehicle jack, and lug wrench from the trunk before raising the car. Use the lug wrench to loosen the lug nuts on the flat wheel by one half turn counterclockwise while the tire is still firmly planted on the pavement. Loosening nuts while the tire is elevated can cause the wheel to spin and destabilize the jack.",
        ],
      },
      {
        heading: "Step-by-Step Wheel and Tire Replacement",
        paragraphs: [
          "Position the jack directly beneath the reinforced jacking point specified in your vehicle handbook. These points are notched steel tabs along the rocker panel designed to bear vehicle weight without puncturing the floorboard.",
          "Raise the vehicle until the flat tire clears the ground by approximately five to eight centimeters. Remove the loosened lug nuts and pull the wheel straight off the hub. Mount the spare tire onto the wheel studs and screw the lug nuts on by hand until snug. Lower the car until the tire touches the ground lightly, then tighten the lug nuts firmly in a crisscross or star pattern to ensure even clamping pressure.",
        ],
      },
      {
        heading: "When Roadside Tire Replacement Is Too Dangerous",
        paragraphs: [
          "There are situations where attempting a DIY tire change poses unacceptable personal danger. If the flat occurs on the traffic side of a narrow highway shoulder, in severe weather with poor visibility, or on a steep incline where a jack cannot stand plumb, do not attempt to lift the car.",
          "In these high-risk scenarios, stay belted inside the vehicle with hazard flashers illuminated or move safely behind a roadside guardrail, and request on-demand emergency assistance. A roadside service vehicle equipped with high-intensity warning beacons and hydraulic equipment can secure the lane or transport your vehicle to safety.",
        ],
      },
    ],
  },
  {
    slug: "driving-safely-through-waterlogged-roads-in-the-monsoon",
    title: "Driving safely through waterlogged roads in the monsoon",
    excerpt:
      "Monsoon downpours frequently lead to street waterlogging. Understand the risks of hydrostatic engine lock, when to turn back, and what to inspect after crossing water.",
    category: "Safety",
    publishedAt: "2026-10-16",
    readingMinutes: 5,
    sections: [
      {
        heading: "Assessing Water Depth Before Proceeding",
        paragraphs: [
          "Monsoon season brings intense tropical rainstorms that can overwhelm drainage systems and submerge roadways within minutes. Standing water conceals numerous road hazards, including deep potholes, missing manhole covers, submerged debris, and washed-out shoulders.",
          "Before attempting to drive through any flooded road, pause and evaluate the depth. A reliable visual reference is the water level relative to other vehicles. If water reaches above the lower edge of wheel rims or the center of the wheel hub on an average passenger car, the road is impassable for standard automobiles. If water is moving with an observable current, do not enter; moving water can sweep even heavy vehicles off the roadway with remarkable ease.",
        ],
        list: [
          "Observe water depth against curbs, sidewalks, and the wheels of other vehicles.",
          "Never cross moving or rapidly flowing water across a roadway.",
          "Turn around and seek an alternative route if the depth exceeds the bottom of your wheel rims.",
          "Remain alert for hidden open sewer covers and submerged road depressions.",
        ],
      },
      {
        heading: "The Critical Danger of Hydrostatic Lock",
        paragraphs: [
          "The most serious mechanical risk during a water crossing is hydrostatic lock, commonly known as hydrolock. In internal combustion engines, air is drawn through an intake snorkel typically positioned behind the front bumper or wheel well. Because water cannot be compressed like an air-fuel mixture, any water sucked into the cylinders halts piston travel instantaneously, shattering connecting rods and cracking the engine block.",
          "If your vehicle stalls while traversing standing water, resist the natural urge to turn the key or press the start button. Attempting to crank an engine with water inside the combustion chambers will guarantee complete mechanical destruction. Leave the ignition switched off, turn on your hazard lights, and prioritize safe evacuation or assistance.",
        ],
      },
      {
        heading: "Driving Technique for Unavoidable Shallow Water",
        paragraphs: [
          "If water is confirmed to be shallow, below the wheel hub, and you have no viable turning space or detour, proceed with deliberate caution. Select the lowest available gear: first gear in a manual transmission or manual mode in an automatic. This keeps the engine revving higher while vehicle speed remains low.",
          "Maintain a steady, continuous throttle to create a small bow wave ahead of your front bumper. This wave depresses the water level directly inside the engine bay. Never accelerate sharply, as sudden surging pushes water over the hood and directly toward the air intake. Avoid tailgating other vehicles, and never cross while oncoming heavy trucks or buses are creating large conflicting wakes.",
        ],
      },
      {
        heading: "Immediate Post-Crossing Brake Inspection",
        paragraphs: [
          "Immediately after clearing standing water, your braking performance will be severely compromised. Water forms a temporary low-friction film between the brake pads, shoes, rotors, and drums, significantly lengthening stopping distance.",
          "While traveling at a low speed on dry ground, tap and pump the brake pedal gently several times. The resulting friction generates heat that rapidly evaporates trapped moisture and restores full braking grip. Listen carefully for squealing belts or erratic engine revs caused by a slipping serpentine belt.",
        ],
      },
      {
        heading: "Post-Monsoon Maintenance and Contamination Checks",
        paragraphs: [
          "Submerging wheels and undercarriage components can push water past mechanical seals into sensitive assemblies. Once you reach a safe destination, inspect the engine oil dipstick. If the oil appears milky or resembles coffee with milk, water has contaminated the crankcase and the oil must be replaced immediately before running the engine.",
          "Inspect the air filter housing for signs of dampness. In addition, deep water crossings can contaminate transmission fluid, differential gear oil, and wheel bearings with road silt. Schedule an underbody wash and mechanical inspection after encountering severe flooding to flush abrasive grit and prevent premature corrosion.",
        ],
      },
    ],
  },
  {
    slug: "pre-trip-checklist-before-a-long-drive",
    title: "A pre-trip checklist before a long drive",
    excerpt:
      "Long-distance highway travel places sustained demands on your vehicle. Complete this systematic checklist of tires, fluids, lighting, spare gear, and documents before leaving.",
    category: "Maintenance",
    publishedAt: "2026-10-17",
    readingMinutes: 5,
    sections: [
      {
        heading: "Tires, Inflation Pressure, and the Spare",
        paragraphs: [
          "Sustained high-speed highway travel generates significant friction and internal tire heat. Underinflated tires flex excessively, causing dangerous heat buildup that dramatically increases the risk of high-speed blowouts. Check tire inflation pressures in the morning when tires are completely cold, matching the manufacturer values listed on the driver door jamb.",
          "Inspect tire tread depth using a tread depth gauge or the built-in wear indicators across the grooves. Look closely for sidewall cracks, bulges, embedded nails, or irregular wear patterns indicating poor wheel alignment. Never forget the spare tire; ensure it is properly pressurized and verify that your lug wrench and vehicle jack are present, undamaged, and functioning.",
        ],
        list: [
          "Check cold tire inflation pressure on all four road wheels and the spare.",
          "Inspect tire tread depth and check sidewalls for bulges or deep cracks.",
          "Confirm the jack, wheel lug wrench, and lock key are in the trunk.",
          "Ensure the spare tire holds rated pressure and has no severe dry rot.",
        ],
      },
      {
        heading: "Vital Engine and Hydraulic Fluids",
        paragraphs: [
          "Long trips demand consistent lubrication and cooling under elevated engine speeds. Park on level ground and check the engine oil dipstick, verifying the level sits between the minimum and maximum markings. Dark, gritty, or low oil should be changed or topped up with the vehicle manufacturer recommended viscosity grade before departure.",
          "Inspect the translucent coolant overflow reservoir to confirm the fluid reaches the cold fill line. Examine the brake fluid reservoir; fluid should be clear and within operating marks. Low brake fluid often signals worn friction pads. Top off the windshield washer reservoir with clean washer fluid, as highway dust and insects quickly obstruct forward vision.",
        ],
      },
      {
        heading: "Exterior Lighting and Electrical System",
        paragraphs: [
          "Complete a walk-around inspection to test all exterior lights. Turn on low beams, high beams, hazard warning flashers, reverse lights, and license plate lamps. Ask a companion to observe brake lamps while you press the brake pedal, or park facing a reflective wall to check reflection patterns.",
          "Clean dust and road grime off all lens covers to maximize illumination during night driving. Open the hood to examine battery terminals for loose clamps or white crystalline corrosion. Clean any corrosion with a stiff nylon brush and ensure cables cannot wiggle by hand.",
        ],
      },
      {
        heading: "Emergency and Breakdown Safety Equipment",
        paragraphs: [
          "Preparedness separates an inconvenient highway delay from a perilous emergency. Every long-distance journey should include a reflective warning triangle to alert trailing vehicles in the event of an unexpected breakdown. Pack a dependable LED flashlight with fresh batteries or a full charge.",
          "Carry a set of heavy-duty jumper cables or a portable jump starter pack. Keep a compact digital tire pressure gauge, a basic mechanical hand-tool kit, an emergency first-aid kit, and an ample supply of drinking water for all vehicle occupants in case of prolonged highway congestion.",
        ],
      },
      {
        heading: "Mandatory Documentation and Route Verification",
        paragraphs: [
          "Before setting off, organize your legal vehicular documentation. In Bangladesh, carry the vehicle and driver documents required for your vehicle type and route (commonly the driving licence, registration certificate, tax token and fitness certificate).",
          "Verify expiration dates well in advance to prevent administrative complications during highway police checkpoints. Finally, review your planned travel corridor, noting active road work, bypass bridges, toll plaza requirements, and designated rest areas.",
        ],
      },
    ],
  },
  {
    slug: "what-to-prepare-before-calling-for-roadside-help",
    title: "What to prepare before calling for roadside help",
    excerpt:
      "When an unexpected breakdown leaves you stranded, gathering key details ensures an efficient response. Learn the exact information mobile technicians need and how to stay safe.",
    category: "Emergency",
    publishedAt: "2026-10-18",
    readingMinutes: 5,
    sections: [
      {
        heading: "Prioritize Personal Safety and Emergency Assessment",
        paragraphs: [
          "Experiencing an unexpected vehicle failure on a busy roadway is inherently stressful, but personal safety must take priority over all mechanical concerns. If a collision has occurred, anyone is injured, or your vehicle is trapped in an active traffic lane with imminent danger of collision, call Bangladesh national emergency service at 999 immediately before contacting roadside assistance.",
          "If the vehicle is mobile, guide it onto the far left shoulder or an emergency turnout. Switch on your hazard warning flashers immediately. If safe to exit, stand away from the roadway behind the steel crash barrier or well up onto the embankment rather than remaining seated in a vulnerable vehicle on the shoulder.",
        ],
        list: [
          "Call 999 immediately if there are personal injuries or immediate danger on the roadway.",
          "Guide the vehicle completely out of moving traffic lanes whenever possible.",
          "Activate hazard flashers and deploy your reflective triangle at a safe distance.",
          "Exit the vehicle through curbside doors and wait behind the roadside barrier.",
        ],
      },
      {
        heading: "Pinpoint Your Exact Geographical Location",
        paragraphs: [
          "Mobile dispatchers and technicians require precise location details to locate you promptly. On intercity highways, look for kilometre markers, bridge nameplates, toll barrier names, or highway restaurant signs. On city roads, identify the nearest major intersection, prominent commercial building, or metro rail pillar number.",
          "Open your mobile navigation application and generate a dropped map pin. Take note of your latitude and longitude coordinates or share the live location link. Be prepared to state the direction of travel, such as northbound toward Gazipur or eastbound toward Chattogram, to avoid dispatching a technician to the opposing divided carriageway.",
        ],
      },
      {
        heading: "Identify Accurate Vehicle Specifications",
        paragraphs: [
          "Knowing the specific details of your automobile allows the emergency response team to prepare correct equipment. State the exact make, model, model year, and exterior color of your car, along with your official license plate registration number.",
          "Inform the dispatcher whether the vehicle is equipped with a manual, automatic, or continuously variable transmission, and whether it is front-wheel, rear-wheel, or all-wheel drive. Drivetrain configuration is essential if flatbed towing is needed, as towing an all-wheel-drive vehicle with driven wheels touching the pavement will cause serious transmission damage.",
        ],
      },
      {
        heading: "Document Exact Mechanical Symptoms and Photos",
        paragraphs: [
          "Providing clear diagnostic observations helps technicians arrive with the correct spare parts, specialized diagnostic tools, or towing apparatus. Describe exactly what happened leading up to the stoppage: did you hear a loud bang, smell burning electrical wire, feel severe vibration, or observe sudden engine sputtering?",
          "Note which dashboard warning symbols are illuminated, such as the check engine icon, oil pressure can, or battery light. If you are in a safe position completely away from moving traffic, capture clear photographs of the vehicle, the surrounding road conditions, and any visible leaks or tire damage to share with the technician.",
        ],
      },
      {
        heading: "Communicate Roadway Conditions and Access",
        paragraphs: [
          "Finally, describe the environment surrounding your stranded car. Let the service provider know if the shoulder is narrow, paved, muddy, or unpaved, and whether extreme rain, waterlogging, or severe traffic congestion affects access.",
          "Providing realistic terrain context ensures the dispatch unit brings appropriate hydraulic jacks, wooden leveling pads, or heavy-duty recovery gear suited to the specific physical location.",
        ],
      },
    ],
  },
];

// Content queries
export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getBlogPostBySlug(currentSlug);
  const otherPosts = BLOG_POSTS.filter((post) => post.slug !== currentSlug);

  if (!currentPost) return otherPosts.slice(0, limit);

  // Prioritize same category if available, then other posts
  return otherPosts
    .sort((a, b) => {
      const aSame = a.category === currentPost.category ? -1 : 1;
      const bSame = b.category === currentPost.category ? -1 : 1;
      return aSame - bSame;
    })
    .slice(0, limit);
}

export function getAllCategories(): BlogCategory[] {
  return BLOG_CATEGORIES;
}
