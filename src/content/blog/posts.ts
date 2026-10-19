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
          "After waiting at least thirty to forty-five minutes, check the underside of the vehicle for puddles of coolant. A green, pink, or orange liquid on the pavement points toward a ruptured hose, cracked radiator tank, or failed water pump seal.",
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
          "Heavy white, powdery crust or blue-green sulfate deposits on the lead battery posts.",
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
