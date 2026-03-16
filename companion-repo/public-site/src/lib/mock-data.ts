// src/lib/mock-data.ts
// Fallback data for local development when API endpoints are unavailable.
// In production, all data comes from the real API.

export const mockProducts = [
  {
    id: 'prod-1',
    slug: 'easy-savings',
    name: 'EasySave Account',
    summary: 'Start saving with as little as ₱100. Earn competitive interest with no maintaining balance.',
    description: 'The EasySave Account is designed for Filipinos who want to start their savings journey. With a low initial deposit and no maintaining balance requirement, it is the most accessible savings product from EastWest Bank.',
    category: 'savings' as const,
    interestRate: 2.5,
    features: [
      'No maintaining balance',
      'Free online banking access',
      'ATM card included',
      'PDIC insured up to ₱500,000',
    ],
    requirements: [
      'Valid government-issued ID',
      'Minimum initial deposit of ₱100',
      'Tax Identification Number (TIN)',
    ],
    minDeposit: 10000, // ₱100.00 in centavos
  },
  {
    id: 'prod-2',
    slug: 'personal-loan',
    name: 'Personal Loan',
    summary: 'Flexible personal loans up to ₱2M with competitive rates starting at 1.2% monthly.',
    description: 'EastWest Bank Personal Loans offer flexible financing for any purpose — home renovation, education, medical expenses, or debt consolidation. Enjoy competitive rates and terms up to 36 months.',
    category: 'loans' as const,
    interestRate: 14.4,
    features: [
      'Loan amounts from ₱50,000 to ₱2,000,000',
      'Flexible terms: 12, 24, or 36 months',
      'No collateral required',
      'Fast approval within 3 business days',
    ],
    requirements: [
      'Filipino citizen, 21-65 years old',
      'Minimum gross annual income of ₱250,000',
      'At least 2 years of employment',
      'Valid government-issued ID',
    ],
  },
  {
    id: 'prod-3',
    slug: 'classic-visa',
    name: 'Classic Visa Credit Card',
    summary: 'Earn rewards on every purchase. 0% installment on partner merchants nationwide.',
    description: 'The EastWest Classic Visa Credit Card gives you purchasing power with rewards. Earn 1 point per ₱25 spent, enjoy 0% installment plans at partner merchants, and get exclusive access to EastWest card promotions.',
    category: 'credit-cards' as const,
    features: [
      'Rewards points on all purchases',
      '0% installment at 1,000+ partner merchants',
      'Contactless payment enabled',
      'Free supplementary cards',
    ],
    requirements: [
      'Minimum gross annual income of ₱180,000',
      'Valid government-issued ID',
      'Proof of billing address',
      'Latest payslip or ITR',
    ],
  },
];

export const mockRates = [
  { currency: 'USD', currencyName: 'US Dollar', buyRate: 55.8500, sellRate: 56.2000, updatedAt: new Date().toISOString() },
  { currency: 'EUR', currencyName: 'Euro', buyRate: 60.4200, sellRate: 61.0100, updatedAt: new Date().toISOString() },
  { currency: 'JPY', currencyName: 'Japanese Yen', buyRate: 0.3720, sellRate: 0.3780, updatedAt: new Date().toISOString() },
  { currency: 'GBP', currencyName: 'British Pound', buyRate: 70.5500, sellRate: 71.3200, updatedAt: new Date().toISOString() },
  { currency: 'AUD', currencyName: 'Australian Dollar', buyRate: 36.1200, sellRate: 36.5800, updatedAt: new Date().toISOString() },
  { currency: 'SGD', currencyName: 'Singapore Dollar', buyRate: 41.8800, sellRate: 42.3500, updatedAt: new Date().toISOString() },
  { currency: 'HKD', currencyName: 'Hong Kong Dollar', buyRate: 7.1500, sellRate: 7.2200, updatedAt: new Date().toISOString() },
  { currency: 'CNY', currencyName: 'Chinese Yuan', buyRate: 7.7200, sellRate: 7.8100, updatedAt: new Date().toISOString() },
];
