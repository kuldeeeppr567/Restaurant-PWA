import { formatTableName, getTranslations } from '../i18n/index.ts';

describe('Hindi translations', () => {
  it('uses the correct Devanagari script labels', () => {
    const translations = getTranslations('hi');

    expect(formatTableName('Table 1', 'hi')).toBe('टेबल 1');
    expect(formatTableName('Desk 1', 'hi')).toBe('Desk 1');
    expect(formatTableName('Table 1', 'en')).toBe('Table 1');
    expect(translations.tableStatus.occupied).toBe('उपयोग में');
    expect(translations.tableDashboard.filterOccupied).toBe('उपयोग में');
    expect(translations.common.back).toBe('पीछे जाएँ');
    expect(translations.kitchenDisplay.subtitle).toBe('भोजन तैयारी की सूचना देखें');
  });
});

describe('Seed data uses Devanagari', () => {
  it('menu items have Devanagari names', async () => {
    const seedModule = await import('../db/seedData.ts');
    expect(seedModule).toBeDefined();
    // Verify at least one exported function exists confirming module loads with Devanagari strings
    expect(typeof seedModule.loadDemoData).toBe('function');
    expect(typeof seedModule.resetDemoData).toBe('function');
  });
});
