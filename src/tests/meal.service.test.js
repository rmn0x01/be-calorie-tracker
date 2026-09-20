jest.mock('../models/meal', () => ({ create: jest.fn(), findAll: jest.fn() }));

const { Op } = require('sequelize');
const Meal = require('../models/meal');
const MealService = require('../services/meal');

describe('MealService.create', () => {
  const payload = {
    name: 'Nasi Goreng',
    calories: 500,
    protein: 20,
    carbs: 60,
    fat: 15,
    unit: 'plate',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Meal.create with payload fields', async () => {
    const created = { id: 'meal-uuid', toJSON: () => created, ...payload };
    Meal.create.mockResolvedValue(created);

    const result = await MealService.create(payload);

    expect(Meal.create).toHaveBeenCalledTimes(1);
    expect(Meal.create).toHaveBeenCalledWith({
      name: payload.name,
      calories: payload.calories,
      protein: payload.protein,
      carbs: payload.carbs,
      fat: payload.fat,
      unit: payload.unit,
    });
    expect(result).toEqual(created);
  });

  it('passes null for optional fields when omitted', async () => {
    const minimal = { name: 'Teh', calories: 50 };
    const created = { id: 'meal-uuid-2', toJSON: () => created, ...minimal, protein: null, carbs: null, fat: null, unit: null };
    Meal.create.mockResolvedValue(created);

    const result = await MealService.create(minimal);

    expect(Meal.create).toHaveBeenCalledWith({
      name: 'Teh',
      calories: 50,
      protein: null,
      carbs: null,
      fat: null,
      unit: null,
    });
    expect(result).toEqual(created);
  });
});

describe('MealService.list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all meals when no query is provided', async () => {
    const rows = [{ id: '1', name: 'Nasi Goreng' }];
    Meal.findAll.mockResolvedValue(rows);

    const result = await MealService.list();

    expect(Meal.findAll).toHaveBeenCalledWith({
      where: {},
      order: [['createdAt', 'DESC']],
    });
    expect(result).toEqual(rows);
  });

  it('filters by name using case-insensitive partial match', async () => {
    const rows = [{ id: '1', name: 'Bakso' }, { id: '2', name: 'Soto' }];
    Meal.findAll.mockResolvedValue(rows);

    const result = await MealService.list({ name: 'so' });

    expect(Meal.findAll).toHaveBeenCalledWith({
      where: {
        name: { [Op.iLike]: '%so%' },
      },
      order: [['createdAt', 'DESC']],
    });
    expect(result).toEqual(rows);
  });

  it('filters by dateFilter when provided', async () => {
    const rows = [{ id: '1', name: 'Nasi Goreng' }];
    Meal.findAll.mockResolvedValue(rows);

    const result = await MealService.list({ dateFilter: '2026-06-18' });

    expect(Meal.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({
            [Op.gte]: expect.any(Date),
            [Op.lt]: expect.any(Date),
          }),
        }),
        order: [['createdAt', 'DESC']],
      })
    );
    expect(result).toEqual(rows);
  });

  it('combines name search with dateFilter', async () => {
    const rows = [{ id: '1', name: 'Soto Ayam' }];
    Meal.findAll.mockResolvedValue(rows);

    const result = await MealService.list({ name: 'soto', dateFilter: '2026-06-18' });

    expect(Meal.findAll).toHaveBeenCalledWith({
      where: {
        name: { [Op.iLike]: '%soto%' },
        createdAt: expect.objectContaining({
          [Op.gte]: expect.any(Date),
          [Op.lt]: expect.any(Date),
        }),
      },
      order: [['createdAt', 'DESC']],
    });
    expect(result).toEqual(rows);
  });

  it('returns empty array when no meals match', async () => {
    Meal.findAll.mockResolvedValue([]);

    const result = await MealService.list({ name: 'zzzznotfound' });

    expect(result).toEqual([]);
  });
});
