'use strict';

jest.mock('../services/usda', () => ({ searchFoods: jest.fn() }));

const USDAFoodService = require('../services/usda');
const MealController = require('../controllers/meal/meal');

function mockReq(overrides = {}) {
  return {
    userId: 'user-uuid-123',
    query: {},
    body: {},
    ...overrides,
  };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('MealController.getExternalUSDA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with food data when query is provided', async () => {
    const mockResults = [
      {
        fdcId: 1,
        foodName: 'Lemon tea',
        brandOwner: null,
        protein: { amount: 0.5, unitName: 'G' },
        totalFat: null,
        carbohydrate: null,
        energy: { amount: 1, unitName: 'KCAL' },
      },
    ];
    USDAFoodService.searchFoods.mockResolvedValue(mockResults);

    const req = mockReq({ query: { query: 'Lemon Tea' } });
    const res = mockRes();

    await MealController.getExternalUSDA(req, res);

    expect(USDAFoodService.searchFoods).toHaveBeenCalledWith('Lemon Tea');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: mockResults });
  });

  it('returns 400 when query is missing', async () => {
    const req = mockReq({ query: {} });
    const res = mockRes();

    await MealController.getExternalUSDA(req, res);

    expect(USDAFoodService.searchFoods).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_QUERY',
      message: 'query parameter is required',
    });
  });

  it('returns 400 when query is empty string', async () => {
    const req = mockReq({ query: { query: '   ' } });
    const res = mockRes();

    await MealController.getExternalUSDA(req, res);

    expect(USDAFoodService.searchFoods).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_QUERY',
      message: 'query parameter is required',
    });
  });

  it('returns error status from USDAFoodService when it throws', async () => {
    USDAFoodService.searchFoods.mockRejectedValue(
      Object.assign(new Error('USDA API responded with status 401'), { statusCode: 502 })
    );

    const req = mockReq({ query: { query: 'Chicken' } });
    const res = mockRes();

    await MealController.getExternalUSDA(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      error: 'USDA_API_ERROR',
      message: 'USDA API responded with status 401',
    });
  });

  it('returns 500 for unexpected errors without statusCode', async () => {
    USDAFoodService.searchFoods.mockRejectedValue(new Error('Something broke'));

    const req = mockReq({ query: { query: 'Beef' } });
    const res = mockRes();

    await MealController.getExternalUSDA(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'USDA_API_ERROR',
      message: 'Something broke',
    });
  });
});
