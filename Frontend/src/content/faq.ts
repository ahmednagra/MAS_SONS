// FAQ copy shared by /faq and the home page accordion. Keep answers factual — every
// claim here is also a claim on the Verification and Shipping pages.
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Company',
    items: [
      { q: 'Who is M.A.S & SONS?', a: 'A family-run exporter of used vehicles and heavy equipment based in Shimotsuma, Ibaraki, Japan. We are a licensed secondhand dealer (古物商許可 第401210001551).' },
      { q: 'Do you sell only vehicles, or equipment too?', a: 'Both, as two co-equal catalogs — cars, vans and kei-cars, and excavators, wheel loaders, tractors and forklifts. Every unit is sourced and grade-verified the same way.' },
      { q: 'Is there a dealer network, or is it just you?', a: 'Just us. There is one stock pool, not multiple dealers — every listing is our own unit, so there is no dealer rating system to check.' },
    ],
  },
  {
    title: 'Buying',
    items: [
      { q: 'Do I need an account to get a quote?', a: 'No. Browsing stock, viewing a listing and requesting a quote all work without creating an account.' },
      { q: 'What does the auction grade mean?', a: 'It is the standard Japanese auction condition scale: 5 is effectively as new, 4.5–3.5 cover normal use with decreasing condition, 3 or lower means an older or higher-use unit, and R/RA indicate disclosed repair history.' },
      { q: "What if the exact unit I want isn't in stock?", a: 'Use "Request a Car" — tell us the make, grade and budget, and we source it at a Japanese auction on your behalf, sending you the real inspection sheet before you commit.' },
      { q: 'Can I get a car in left-hand drive?', a: 'Steering position is shown on every listing (LHD or RHD). Filter by it directly when browsing, since it has real consequences for import eligibility in your country.' },
    ],
  },
  {
    title: 'Payment & Trust',
    items: [
      { q: 'How do I pay?', a: 'By bank wire to our Japanese account, confirmed before anything ships. See the Verification page for the full payment-safety checklist.' },
      { q: 'How do I know the condition is accurate?', a: 'Every listing carries the real auction inspector’s sheet — grade, condition notes and diagram — not a description we wrote ourselves.' },
      { q: 'What if there was accident or repair history?', a: 'It is disclosed on the sheet as 修復歴, translated. We do not omit it.' },
    ],
  },
  {
    title: 'Shipping & Documents',
    items: [
      { q: 'What shipping terms do you quote?', a: 'FOB, C&F (CFR) or CIF, priced to your destination port. See the Shipping page for what each term includes.' },
      { q: 'RoRo or container?', a: 'Vehicles typically ship RoRo (roll-on/roll-off); heavy equipment and multiple units are often more economical in a container. We recommend the right method per shipment.' },
      { q: 'What documents do I receive?', a: 'Export Certificate, Bill of Lading and commercial invoice, sent once the unit has shipped. Customs clearance and duty in your country are your responsibility.' },
    ],
  },
];

/** The six questions a first-time buyer asks before anything else — shown on the home page. */
export const HOME_FAQ: FaqItem[] = [
  FAQ_SECTIONS[1].items[0],
  FAQ_SECTIONS[1].items[1],
  FAQ_SECTIONS[2].items[0],
  FAQ_SECTIONS[2].items[1],
  FAQ_SECTIONS[3].items[0],
  FAQ_SECTIONS[3].items[2],
];
