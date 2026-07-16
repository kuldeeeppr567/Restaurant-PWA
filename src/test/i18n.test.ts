import { formatTableName, getTranslations } from '../i18n/index.ts';

describe('Hindi translations', () => {
  it('uses the requested Roman Hindi labels', () => {
    const translations = getTranslations('hi');

    expect(formatTableName('Table 1', 'hi')).toBe('Tebal 1');
    expect(translations.tableStatus.occupied).toBe('Upyog me');
    expect(translations.tableDashboard.filterOccupied).toBe('Upyog me');
    expect(translations.common.back).toBe('Piche Jaye');
    expect(translations.kitchenDisplay.subtitle).toBe('Bhojan taiyaari ki suchna dekhe');
  });
});
