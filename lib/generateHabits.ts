interface OnboardingData {
  main_goal?: any[];
  entrepreneurial_status?: any[];
  life_domains?: any[];
  main_motivation?: any[];
  main_obstacle?: any[];
}

export function generatePersonalizedHabits(onboardingData: OnboardingData): string[] {
  const goals = Array.isArray(onboardingData.main_goal) ? onboardingData.main_goal : [];
  const domains = Array.isArray(onboardingData.life_domains) ? onboardingData.life_domains : [];
  const motivations = Array.isArray(onboardingData.main_motivation) ? onboardingData.main_motivation : [];
  const obstacles = Array.isArray(onboardingData.main_obstacle) ? onboardingData.main_obstacle : [];

  const habits: string[] = [];

  const goalsText = goals.join(' ').toLowerCase();
  const domainsText = domains.join(' ').toLowerCase();
  const motivationsText = motivations.join(' ').toLowerCase();
  const obstaclesText = obstacles.join(' ').toLowerCase();
  const combinedText = `${goalsText} ${domainsText} ${motivationsText} ${obstaclesText}`;

  console.log('Generating habits from onboarding:', { goals, domains, motivations, obstacles });

  if (
    combinedText.includes('financ') ||
    combinedText.includes('argent') ||
    combinedText.includes('business') ||
    combinedText.includes('entrepren') ||
    combinedText.includes('projet') ||
    combinedText.includes('vente') ||
    combinedText.includes('client')
  ) {
    habits.push('Travailler 2h sur mon business');
  }

  if (
    combinedText.includes('santé') ||
    combinedText.includes('sport') ||
    combinedText.includes('physique') ||
    combinedText.includes('forme') ||
    combinedText.includes('musclé') ||
    combinedText.includes('muscle') ||
    combinedText.includes('fitness') ||
    combinedText.includes('entraînement')
  ) {
    habits.push('Faire 45 min de sport');
  }

  if (
    combinedText.includes('stress') ||
    combinedText.includes('anxiété') ||
    combinedText.includes('mental') ||
    combinedText.includes('équilibre') ||
    combinedText.includes('méditation') ||
    combinedText.includes('zen')
  ) {
    habits.push('Méditer 10 minutes');
  }

  if (
    combinedText.includes('apprendre') ||
    combinedText.includes('connaissance') ||
    combinedText.includes('développement') ||
    combinedText.includes('lire') ||
    combinedText.includes('livre') ||
    combinedText.includes('formation')
  ) {
    habits.push('Lire 20 pages');
  }

  if (
    combinedText.includes('concentr') ||
    combinedText.includes('focus') ||
    combinedText.includes('productiv') ||
    combinedText.includes('distraction') ||
    combinedText.includes('procrastin') ||
    combinedText.includes('disciplin')
  ) {
    habits.push('Session de Deep Work 90 min');
  }

  if (
    combinedText.includes('sommeil') ||
    combinedText.includes('fatigue') ||
    combinedText.includes('dormir') ||
    combinedText.includes('énergie')
  ) {
    habits.push('Dormir 8h par nuit');
  }

  if (
    combinedText.includes('alimenta') ||
    combinedText.includes('manger') ||
    combinedText.includes('nutrition') ||
    combinedText.includes('régime')
  ) {
    habits.push('Préparer un repas sain');
  }

  if (
    combinedText.includes('relation') ||
    combinedText.includes('famille') ||
    combinedText.includes('ami') ||
    combinedText.includes('social')
  ) {
    habits.push('Appeler un proche');
  }

  if (habits.length === 0) {
    console.log('No specific habits found, using defaults');
    habits.push('Méditer 10 minutes');
    habits.push('Faire 30 min de sport');
    habits.push('Lire 20 pages');
  }

  const complementaryHabits = [
    'Boire 2L d\'eau',
    'Planifier ma journée',
    'Réviser mes objectifs',
    'Écrire dans mon journal',
    'Prendre une douche froide',
    'Faire mon lit le matin',
    'Dire 3 gratitudes',
  ];

  while (habits.length < 3) {
    for (const h of complementaryHabits) {
      if (!habits.includes(h) && habits.length < 3) {
        habits.push(h);
        break;
      }
    }
  }

  const selectedHabits = habits.slice(0, 3);
  console.log('Generated habits:', selectedHabits);
  return selectedHabits;
}
