'use strict';

const USDAFoodService = require('../services/usda');

const originalBaseUrl = process.env.USDA_GOV_BASE_URL;
const originalApiKey = process.env.USDA_GOV_API_KEY;

beforeEach(() => {
  jest.restoreAllMocks();
  process.env.USDA_GOV_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
  process.env.USDA_GOV_API_KEY = 'test-api-key';
});

afterAll(() => {
  process.env.USDA_GOV_BASE_URL = originalBaseUrl;
  process.env.USDA_GOV_API_KEY = originalApiKey;
});

describe('USDAFoodService.searchFoods', () => {
  it('throws 400 when query is empty string', async () => {
    await expect(USDAFoodService.searchFoods('')).rejects.toThrow('Query is required');
  });

  it('throws 400 when query is only whitespace', async () => {
    await expect(USDAFoodService.searchFoods('   ')).rejects.toThrow('Query is required');
  });

  it('throws 400 when query is not a string', async () => {
    await expect(USDAFoodService.searchFoods(123)).rejects.toThrow('Query is required');
  });

  it('throws 500 when BASE_URL is not configured', async () => {
    delete process.env.USDA_GOV_BASE_URL;
    await expect(USDAFoodService.searchFoods('Lemon Tea')).rejects.toThrow(
      'USDA_GOV_BASE_URL is not configured'
    );
  });

  it('throws 500 when API_KEY is not configured', async () => {
    delete process.env.USDA_GOV_API_KEY;
    await expect(USDAFoodService.searchFoods('Lemon Tea')).rejects.toThrow(
      'USDA_GOV_API_KEY is not configured'
    );
  });

  it('calls fetch with correct URL and returns parsed data on success', async () => {
    const rawResponse = [
      {
        fdcId: 1886787,
        description: 'LEMON TEA CAKES, LEMON TEA',
        brandOwner: 'Tennessee Bun Company',
        foodNutrients: [
          { number: '203', name: 'Protein', amount: 3.57, unitName: 'G' },
          { number: '204', name: 'Total lipid (fat)', amount: 21.4, unitName: 'G' },
          { number: '205', name: 'Carbohydrate, by difference', amount: 57.1, unitName: 'G' },
          { number: '208', name: 'Energy', amount: 429, unitName: 'KCAL' },
        ],
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(rawResponse),
    });

    const result = await USDAFoodService.searchFoods('Lemon Tea');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.nal.usda.gov/fdc/v1/foods/list?api_key=test-api-key&query="Lemon%20Tea"&pageSize=5'
    );
    expect(result).toEqual([
      {
        fdcId: 1886787,
        foodName: 'LEMON TEA CAKES, LEMON TEA',
        brandOwner: 'Tennessee Bun Company',
        protein: { amount: 3.57, unitName: 'G' },
        totalFat: { amount: 21.4, unitName: 'G' },
        carbohydrate: { amount: 57.1, unitName: 'G' },
        energy: { amount: 429, unitName: 'KCAL' },
      },
    ]);
  });

  it('returns null for nutrients that are missing from the response', async () => {
    const rawResponse = [
      {
        fdcId: 999,
        description: 'Water',
        brandOwner: null,
        foodNutrients: [
          { number: '208', name: 'Energy', amount: 0, unitName: 'KCAL' },
        ],
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(rawResponse),
    });

    const result = await USDAFoodService.searchFoods('Water');

    expect(result).toEqual([
      {
        fdcId: 999,
        foodName: 'Water',
        brandOwner: null,
        protein: null,
        totalFat: null,
        carbohydrate: null,
        energy: { amount: 0, unitName: 'KCAL' },
      },
    ]);
  });

  it('returns empty array when USDA returns non-array data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(null),
    });

    const result = await USDAFoodService.searchFoods('Nothing');
    expect(result).toEqual([]);
  });

  it('throws 502 when USDA API responds with error status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(USDAFoodService.searchFoods('Chicken')).rejects.toThrow(
      'USDA API responded with status 401'
    );
  });
});
