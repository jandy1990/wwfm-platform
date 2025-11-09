/**
 * Quality Validator for AI-Generated Narrative Commentary
 *
 * Implements the 10-point authenticity checklist and 3 core ingredients framework
 * from peer commentary research.
 */

export interface AuthenticityCheck {
  passed: boolean;
  score: number; // 0-10
  details: ChecklistItem[];
  coreIngredients: CoreIngredientsCheck;
  recommendation: string;
}

export interface ChecklistItem {
  criterion: string;
  passed: boolean;
  evidence?: string;
  suggestion?: string;
}

export interface CoreIngredientsCheck {
  emotionalHonesty: boolean;
  specificDetails: boolean;
  temporalProgression: boolean;
  count: number; // Must be at least 2 of 3
  passed: boolean;
}

/**
 * The 10-Point Authenticity Checklist
 * Content must pass 7+ of 10 items to be considered authentic
 */
export const validateAuthenticity = (content: string): AuthenticityCheck => {
  const checklist: ChecklistItem[] = [
    {
      criterion: 'Includes specific number(s) (time, cost, amount, percentage)',
      passed: false
    },
    {
      criterion: 'Names a tool/product/method by actual name',
      passed: false
    },
    {
      criterion: 'Admits a mistake, fear, or struggle explicitly',
      passed: false
    },
    {
      criterion: 'Shows non-linear progression (setback, plateau, or "worse before better")',
      passed: false
    },
    {
      criterion: 'Includes unglamorous/unsexy detail (not Instagram-worthy)',
      passed: false
    },
    {
      criterion: 'Uses first-person experience ("I," "my," not "people should")',
      passed: false
    },
    {
      criterion: 'Has peer-to-peer disclaimer ("worked for me," "YMMV," "everyone\'s different")',
      passed: false
    },
    {
      criterion: 'Mentions time investment (how long it took, not overnight)',
      passed: false
    },
    {
      criterion: 'Acknowledges ongoing work/imperfection ("still working on," "occasionally")',
      passed: false
    },
    {
      criterion: 'Provides specific cost or trade-off (what was sacrificed, price paid)',
      passed: false
    }
  ];

  // Check 1: Specific numbers
  const numberPatterns = [
    /\$\d+/,                          // $50, $1,000
    /\d+\s*(?:days?|weeks?|months?|years?)/i,  // 73 days, 6 months
    /\d+(?:\.\d+)?%/,                 // 98.9%, 50%
    /\d+\s*lbs?/i,                    // 24lbs
    /(?:week|month|year)\s*\d+/i,     // Week 6, Month 3
    /\d+:\d+(?:am|pm)?/i              // 3:23am
  ];
  const hasNumbers = numberPatterns.some(pattern => pattern.test(content));
  checklist[0].passed = hasNumbers;
  if (hasNumbers) {
    const matches = content.match(/\$\d+|\d+\s*(?:days?|weeks?|months?)|\\d+%/gi);
    checklist[0].evidence = `Found: ${matches?.slice(0, 3).join(', ')}`;
  } else {
    checklist[0].suggestion = 'Add specific numbers like "$150/session", "73 days", "98.9%"';
  }

  // Check 2: Named tools/products
  const capitalizedWords = content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  const hasToolNames = capitalizedWords.length >= 2;
  checklist[1].passed = hasToolNames;
  if (hasToolNames) {
    checklist[1].evidence = `Found: ${capitalizedWords.slice(0, 3).join(', ')}`;
  } else {
    checklist[1].suggestion = 'Name specific tools like "CeraVe Cleanser", "MyFitnessPal app"';
  }

  // Check 3: Admits mistake/fear/struggle
  const strugglePatterns = [
    /(?:i was|i felt|i am)\s+(?:terrified|afraid|scared|ashamed|embarrassed|anxious|depressed)/i,
    /(?:mistake|failed|struggled|messed up|screwed up|relapsed)/i,
    /(?:wish i|if i could|should have|regret)/i,
    /(?:still (?:struggle|deal with|work on|trying))/i
  ];
  const hasStruggle = strugglePatterns.some(pattern => pattern.test(content));
  checklist[2].passed = hasStruggle;
  if (!hasStruggle) {
    checklist[2].suggestion = 'Add vulnerability like "I was terrified" or "I made the mistake of..."';
  }

  // Check 4: Non-linear progression
  const nonLinearPatterns = [
    /(?:not linear|wasn't linear|isn't linear)/i,
    /(?:plateau|setback|relapse|backslid)/i,
    /(?:got worse before|worse before better)/i,
    /(?:week|month)\s*\d+.*(?:still|but|however)/i
  ];
  const hasNonLinear = nonLinearPatterns.some(pattern => pattern.test(content));
  checklist[3].passed = hasNonLinear;
  if (!hasNonLinear) {
    checklist[3].suggestion = 'Add "got worse before better" or mention plateaus/setbacks';
  }

  // Check 5: Unglamorous details
  const unglamorousPatterns = [
    /(?:sweating|crying|vomiting|purging|breakout|acne)/i,
    /(?:embarrassing|humiliating|awkward)/i,
    /(?:cheap|generic|budget)/i,
    /(?:bathroom|toilet|shower)/i,
    /sticky notes?/i
  ];
  const hasUnglamorous = unglamorousPatterns.some(pattern => pattern.test(content));
  checklist[4].passed = hasUnglamorous;
  if (!hasUnglamorous) {
    checklist[4].suggestion = 'Add unglamorous detail like "night sweats" or "sticky notes everywhere"';
  }

  // Check 6: First-person perspective
  const firstPersonCount = (content.match(/\b(?:i|my|me)\b/gi) || []).length;
  const secondPersonPrescriptive = /\b(?:you should|you must|you need to)\b/gi.test(content);
  checklist[5].passed = firstPersonCount >= 5 && !secondPersonPrescriptive;
  if (!checklist[5].passed) {
    checklist[5].suggestion = 'Use first-person "I" perspective, avoid "you should" prescriptive tone';
  }

  // Check 7: Peer disclaimers
  const disclaimerPatterns = [
    /(?:worked for me|works for me)/i,
    /(?:ymmv|your mileage may vary)/i,
    /(?:everyone'?s different|everyone is different)/i,
    /(?:for me|in my case|personally)/i,
    /(?:might not work for you|may not work for everyone)/i
  ];
  const hasDisclaimer = disclaimerPatterns.some(pattern => pattern.test(content));
  checklist[6].passed = hasDisclaimer;
  if (!hasDisclaimer) {
    checklist[6].suggestion = 'Add peer disclaimer like "worked for me" or "everyone\'s different"';
  }

  // Check 8: Time investment
  const timePatterns = [
    /(?:took|takes)\s+\d+\s*(?:days?|weeks?|months?|years?)/i,
    /(?:after|within)\s+\d+\s*(?:days?|weeks?|months?)/i,
    /(?:overnight|immediately|instantly)/i  // Should NOT be instant
  ];
  const hasTimeInvestment = timePatterns.slice(0, 2).some(pattern => pattern.test(content));
  const claimsInstant = timePatterns[2].test(content);
  checklist[7].passed = hasTimeInvestment && !claimsInstant;
  if (!checklist[7].passed) {
    checklist[7].suggestion = 'Mention realistic timeframe like "took 6 weeks" or "after 3 months"';
  }

  // Check 9: Ongoing work/imperfection
  const ongoingPatterns = [
    /(?:still (?:working on|trying|learning|figuring out|dealing with))/i,
    /(?:sometimes|occasionally|still have|not perfect)/i,
    /(?:ongoing|continues to|keep working)/i
  ];
  const hasOngoing = ongoingPatterns.some(pattern => pattern.test(content));
  checklist[8].passed = hasOngoing;
  if (!hasOngoing) {
    checklist[8].suggestion = 'Add "still working on" or "occasionally struggle with" for realism';
  }

  // Check 10: Specific costs/trade-offs
  const costPatterns = [
    /\$\d+/,
    /(?:free|paid|cost)/i,
    /(?:gave up|sacrificed|trade-off|cost me)/i,
    /(?:wasted|lost)\s+(?:\$\d+|\d+\s*(?:months?|years?))/i
  ];
  const hasCost = costPatterns.some(pattern => pattern.test(content));
  checklist[9].passed = hasCost;
  if (!hasCost) {
    checklist[9].suggestion = 'Mention costs like "$150/session" or trade-offs like "gave up travel for 2 years"';
  }

  // Calculate score
  const score = checklist.filter(item => item.passed).length;

  // Check core ingredients (must have 2 of 3)
  const coreIngredients: CoreIngredientsCheck = {
    emotionalHonesty: checklist[2].passed || checklist[4].passed,  // Struggle admission or unglamorous details
    specificDetails: checklist[0].passed && checklist[1].passed,   // Numbers AND named tools
    temporalProgression: checklist[3].passed || checklist[7].passed,  // Non-linear OR time investment
    count: 0,
    passed: false
  };

  coreIngredients.count = [
    coreIngredients.emotionalHonesty,
    coreIngredients.specificDetails,
    coreIngredients.temporalProgression
  ].filter(Boolean).length;

  coreIngredients.passed = coreIngredients.count >= 2;

  // Generate recommendation
  let recommendation: string;
  if (score >= 7 && coreIngredients.passed) {
    recommendation = '✅ READY TO PUBLISH - Passes authenticity requirements';
  } else if (score >= 7 && !coreIngredients.passed) {
    recommendation = '⚠️ NEEDS IMPROVEMENT - Passes checklist but missing core ingredients';
  } else if (score >= 5) {
    recommendation = '⚠️ NEEDS WORK - Add more authenticity markers from failed criteria';
  } else {
    recommendation = '❌ REJECT - Too generic, needs significant authenticity improvements';
  }

  return {
    passed: score >= 7 && coreIngredients.passed,
    score,
    details: checklist,
    coreIngredients,
    recommendation
  };
};

/**
 * Check for authenticity destroyers (anti-patterns to avoid)
 */
export const checkDestroyersAuthenticity = (content: string): {
  found: string[];
  severity: 'none' | 'minor' | 'major';
} => {
  const destroyers: { pattern: RegExp; name: string; severity: 'minor' | 'major' }[] = [
    { pattern: /\b(?:recently|a while ago|soon)\b/i, name: 'Vague time references', severity: 'major' },
    { pattern: /(?:perfect|flawless|completely cured)/i, name: 'Perfect outcomes', severity: 'major' },
    { pattern: /(?:just believe|stay positive|you got this)/i, name: 'Motivation clichés', severity: 'major' },
    { pattern: /\byou should\b/gi, name: 'Expert positioning ("you should")', severity: 'minor' },
    { pattern: /(?:the right way|the best way|always|never)\b/i, name: 'Absolute statements', severity: 'minor' }
  ];

  const found: string[] = [];
  let maxSeverity: 'none' | 'minor' | 'major' = 'none';

  for (const destroyer of destroyers) {
    if (destroyer.pattern.test(content)) {
      found.push(destroyer.name);
      if (maxSeverity === 'none' || (maxSeverity === 'minor' && destroyer.severity === 'major')) {
        maxSeverity = destroyer.severity;
      }
    }
  }

  return { found, severity: maxSeverity };
};

/**
 * Quality control question check
 * "Could this have been written by someone who didn't actually do the thing?"
 */
export const checkLivedExperience = (content: string): {
  likelyAuthentic: boolean;
  signals: string[];
  redFlags: string[];
} => {
  const authenticSignals: string[] = [];
  const redFlags: string[] = [];

  // Positive signals
  if (/\d{1,3}(?:,\d{3})*(?:\.\d+)?/.test(content)) {
    authenticSignals.push('Precise numbers (not rounded)');
  }
  if (/[A-Z][a-z]+\s+[A-Z][a-z]+/.test(content)) {
    authenticSignals.push('Specific brand/product names');
  }
  if (/(?:terrified|ashamed|embarrassed|scared|hopeless)/i.test(content)) {
    authenticSignals.push('Emotional vulnerability');
  }
  if (/(?:relapsed|failed|mistake|screwed up)/i.test(content)) {
    authenticSignals.push('Failure/mistake admission');
  }

  // Red flags
  if (!/\bi\b/gi.test(content)) {
    redFlags.push('Lacks first-person perspective');
  }
  if (content.match(/\byou should\b/gi)?.length ?? 0 > 2) {
    redFlags.push('Too prescriptive');
  }
  if (!(/\$\d+/.test(content) || /\d+\s*(?:days?|weeks?|months?)/i.test(content))) {
    redFlags.push('No specific costs or timelines');
  }

  const likelyAuthentic = authenticSignals.length >= 2 && redFlags.length === 0;

  return { likelyAuthentic, signals: authenticSignals, redFlags };
};

/**
 * Generate a detailed quality report
 */
export const generateQualityReport = (content: string): string => {
  const auth = validateAuthenticity(content);
  const destroyers = checkDestroyersAuthenticity(content);
  const lived = checkLivedExperience(content);

  let report = '# Authenticity Quality Report\n\n';

  // Overall result
  report += `## Overall: ${auth.recommendation}\n\n`;
  report += `**Score:** ${auth.score}/10 (need 7+)\n`;
  report += `**Core Ingredients:** ${auth.coreIngredients.count}/3 (need 2+)\n\n`;

  // Core ingredients breakdown
  report += '## Core Ingredients\n\n';
  report += `- ${auth.coreIngredients.emotionalHonesty ? '✅' : '❌'} Emotional Honesty\n`;
  report += `- ${auth.coreIngredients.specificDetails ? '✅' : '❌'} Specific Details\n`;
  report += `- ${auth.coreIngredients.temporalProgression ? '✅' : '❌'} Temporal Progression\n\n`;

  // Checklist details
  report += '## 10-Point Checklist\n\n';
  auth.details.forEach((item, index) => {
    report += `${index + 1}. ${item.passed ? '✅' : '❌'} ${item.criterion}\n`;
    if (item.evidence) {
      report += `   Evidence: ${item.evidence}\n`;
    }
    if (item.suggestion) {
      report += `   💡 Suggestion: ${item.suggestion}\n`;
    }
  });

  // Destroyers
  if (destroyers.found.length > 0) {
    report += `\n## ⚠️ Authenticity Destroyers Found (${destroyers.severity})\n\n`;
    destroyers.found.forEach(destroyer => {
      report += `- ${destroyer}\n`;
    });
  }

  // Lived experience check
  report += '\n## Lived Experience Check\n\n';
  report += `**Likely Authentic:** ${lived.likelyAuthentic ? 'Yes ✅' : 'No ❌'}\n\n`;
  if (lived.signals.length > 0) {
    report += 'Positive signals:\n';
    lived.signals.forEach(signal => report += `- ${signal}\n`);
  }
  if (lived.redFlags.length > 0) {
    report += '\nRed flags:\n';
    lived.redFlags.forEach(flag => report += `- ${flag}\n`);
  }

  return report;
};
