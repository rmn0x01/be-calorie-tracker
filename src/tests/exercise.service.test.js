jest.mock('../models/exercise', () => ({ create: jest.fn(), findAll: jest.fn() }));

const { Op } = require('sequelize');
const Exercise = require('../models/exercise');
const ExerciseService = require('../services/exercise');

describe('ExerciseService.create', () => {
  const userId = 'user-uuid-123';
  const payload = {
    type: 'Running',
    durationMinutes: 30,
    distanceKm: 5.2,
    volumeKg: null,
    caloriesBurned: 350,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Exercise.create with userId and payload fields', async () => {
    const created = { id: 'exercise-id', userId, ...payload };
    Exercise.create.mockResolvedValue(created);

    const result = await ExerciseService.create(userId, payload);

    expect(Exercise.create).toHaveBeenCalledTimes(1);
    expect(Exercise.create).toHaveBeenCalledWith({
      userId,
      type: payload.type,
      durationMinutes: payload.durationMinutes,
      distanceKm: payload.distanceKm,
      volumeKg: payload.volumeKg,
      caloriesBurned: payload.caloriesBurned,
    });
    expect(result).toEqual(created);
  });

  it('passes null for optional fields when omitted', async () => {
    const minimalPayload = {
      type: 'Swimming',
      durationMinutes: 45,
      caloriesBurned: 400,
    };
    const created = { id: 'exercise-id-2', userId, ...minimalPayload };
    Exercise.create.mockResolvedValue(created);

    await ExerciseService.create(userId, minimalPayload);

    expect(Exercise.create).toHaveBeenCalledWith({
      userId,
      type: 'Swimming',
      durationMinutes: 45,
      distanceKm: null,
      volumeKg: null,
      caloriesBurned: 400,
    });
  });
});

describe('ExerciseService.list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all exercises for user when no dates provided', async () => {
    const rows = [{ id: '1', type: 'Running' }];
    Exercise.findAll.mockResolvedValue(rows);

    const result = await ExerciseService.list({}, 'user-uuid-123');

    expect(Exercise.findAll).toHaveBeenCalledWith({
      where: { userId: 'user-uuid-123' },
      order: [['createdAt', 'DESC']],
    });
    expect(result).toEqual(rows);
  });

  it('filters by startDate only', async () => {
    Exercise.findAll.mockResolvedValue([]);

    await ExerciseService.list({ startDate: '2026-06-18' }, 'user-uuid-123');

    expect(Exercise.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-uuid-123',
          createdAt: expect.objectContaining({
            [Op.gte]: expect.any(Date),
          }),
        }),
      })
    );
  });

  it('filters by startDate and endDate', async () => {
    Exercise.findAll.mockResolvedValue([]);

    await ExerciseService.list(
      { startDate: '2026-06-01', endDate: '2026-06-18' },
      'user-uuid-123'
    );

    expect(Exercise.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-uuid-123',
          createdAt: expect.objectContaining({
            [Op.gte]: expect.any(Date),
            [Op.lt]: expect.any(Date),
          }),
        }),
      })
    );
  });
});
