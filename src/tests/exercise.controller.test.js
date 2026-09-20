jest.mock('../services/exercise', () => ({ create: jest.fn(), list: jest.fn() }));

const ExerciseService = require('../services/exercise');
const ExerciseController = require('../controllers/exercise/exercise');

function mockReq(overrides = {}) {
  return {
    userId: 'user-uuid-123',
    body: {},
    query: {},
    ...overrides,
  };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('ExerciseController.create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 when body is valid with all fields', async () => {
    const created = {
      id: 'exercise-id',
      userId: 'user-uuid-123',
      type: 'Running',
      durationMinutes: 30,
      distanceKm: 5.2,
      volumeKg: 50,
      caloriesBurned: 350,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON() {
        const { toJSON, ...rest } = this;
        return rest;
      },
    };
    ExerciseService.create.mockResolvedValue(created);

    const req = mockReq({
      body: {
        type: 'Running',
        durationMinutes: 30,
        distanceKm: 5.2,
        volumeKg: 50,
        caloriesBurned: 350,
      },
    });
    const res = mockRes();

    await ExerciseController.create(req, res);

    expect(ExerciseService.create).toHaveBeenCalledWith('user-uuid-123', {
      type: 'Running',
      durationMinutes: 30,
      distanceKm: 5.2,
      volumeKg: 50,
      caloriesBurned: 350,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining({ id: 'exercise-id' }) });
  });

  it('returns 201 with minimal body (type, durationMinutes, caloriesBurned only)', async () => {
    const created = {
      id: 'exercise-id-2',
      userId: 'user-uuid-123',
      type: 'Cycling',
      durationMinutes: 45,
      distanceKm: null,
      volumeKg: null,
      caloriesBurned: 400,
      toJSON() {
        const { toJSON, ...rest } = this;
        return rest;
      },
    };
    ExerciseService.create.mockResolvedValue(created);

    const req = mockReq({
      body: {
        type: 'Cycling',
        durationMinutes: 45,
        caloriesBurned: 400,
      },
    });
    const res = mockRes();

    await ExerciseController.create(req, res);

    expect(ExerciseService.create).toHaveBeenCalledWith('user-uuid-123', {
      type: 'Cycling',
      durationMinutes: 45,
      distanceKm: null,
      volumeKg: null,
      caloriesBurned: 400,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when type is missing', async () => {
    const req = mockReq({ body: { durationMinutes: 30, caloriesBurned: 200 } });
    const res = mockRes();

    await ExerciseController.create(req, res);

    expect(ExerciseService.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'type is required and must be a non-empty string',
    });
  });

  it('returns 400 when durationMinutes is not a positive integer', async () => {
    const req = mockReq({ body: { type: 'Running', durationMinutes: -10, caloriesBurned: 200 } });
    const res = mockRes();

    await ExerciseController.create(req, res);

    expect(ExerciseService.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'durationMinutes is required and must be a positive integer',
    });
  });

  it('returns 400 when caloriesBurned is negative', async () => {
    const req = mockReq({ body: { type: 'Running', durationMinutes: 30, caloriesBurned: -5 } });
    const res = mockRes();

    await ExerciseController.create(req, res);

    expect(ExerciseService.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'caloriesBurned is required and must be a non-negative number',
    });
  });

  it('returns 400 when distanceKm is not a number', async () => {
    const req = mockReq({
      body: { type: 'Running', durationMinutes: 30, caloriesBurned: 200, distanceKm: 'abc' },
    });
    const res = mockRes();

    await ExerciseController.create(req, res);

    expect(ExerciseService.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'distanceKm must be a number when provided',
    });
  });

  it('returns 400 when volumeKg is not a number', async () => {
    const req = mockReq({
      body: { type: 'Running', durationMinutes: 30, caloriesBurned: 200, volumeKg: 'abc' },
    });
    const res = mockRes();

    await ExerciseController.create(req, res);

    expect(ExerciseService.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'volumeKg must be a number when provided',
    });
  });
});

describe('ExerciseController.getList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with exercise list', async () => {
    const rows = [
      { id: '1', type: 'Running', durationMinutes: 30 },
    ];
    ExerciseService.list.mockResolvedValue(rows);

    const req = mockReq({ query: { startDate: '2026-06-01', endDate: '2026-06-18' } });
    const res = mockRes();

    await ExerciseController.getList(req, res);

    expect(ExerciseService.list).toHaveBeenCalledWith(
      { startDate: '2026-06-01', endDate: '2026-06-18' },
      'user-uuid-123'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: rows });
  });

  it('returns 200 with empty list when no exercises exist', async () => {
    ExerciseService.list.mockResolvedValue([]);

    const req = mockReq({ query: {} });
    const res = mockRes();

    await ExerciseController.getList(req, res);

    expect(ExerciseService.list).toHaveBeenCalledWith({}, 'user-uuid-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });
});
