jest.mock('../services/calorieEntry', () => ({ create: jest.fn() }))

const CalorieEntryService = require('../services/calorieEntry')
const CalorieEntryController = require('../controllers/calorieEntry/calorieEntry')

function mockReq(overrides = {}) {
  return {
    userId: 'user-uuid-123',
    body: {},
    ...overrides,
  }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('CalorieEntryController.create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 201 and created entry when body is valid', async () => {
    const body = {
      foodName: 'Oatmeal',
      calorieAmount: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      quantity: 1,
      unit: 'bowl',
      mealType: 'breakfast',
      notes: 'With honey',
    }
    const created = {
      id: 'entry-uuid',
      userId: 'user-uuid-123',
      foodName: 'Oatmeal',
      calorieAmount: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      quantity: 1,
      unit: 'bowl',
      mealType: 'breakfast',
      notes: 'With honey',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    CalorieEntryService.create.mockResolvedValue({
      toJSON: () => created,
    })

    const req = mockReq({ body })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).toHaveBeenCalledWith('user-uuid-123', {
      foodName: 'Oatmeal',
      calorieAmount: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      quantity: 1,
      unit: 'bowl',
      mealType: 'breakfast',
      notes: 'With honey',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ data: created })
  })

  it('returns 201 with minimal body (foodName and calorieAmount only)', async () => {
    const body = { foodName: 'Rice', calorieAmount: 200 }
    const created = {
      id: 'entry-uuid',
      userId: 'user-uuid-123',
      foodName: 'Rice',
      calorieAmount: 200,
    }
    CalorieEntryService.create.mockResolvedValue({ toJSON: () => created })

    const req = mockReq({ body })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).toHaveBeenCalledWith('user-uuid-123', {
      foodName: 'Rice',
      calorieAmount: 200,
      protein: null,
      carbs: null,
      fat: null,
      quantity: null,
      unit: null,
      mealType: null,
      notes: null,
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('returns 400 when foodName is missing', async () => {
    const req = mockReq({ body: { calorieAmount: 100 } })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'foodName is required and must be a non-empty string',
    })
  })

  it('returns 400 when foodName is empty string', async () => {
    const req = mockReq({ body: { foodName: '  ', calorieAmount: 100 } })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when calorieAmount is missing', async () => {
    const req = mockReq({ body: { foodName: 'Apple' } })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'calorieAmount is required and must be a non-negative number',
    })
  })

  it('returns 400 when calorieAmount is negative', async () => {
    const req = mockReq({
      body: { foodName: 'Apple', calorieAmount: -10 },
    })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when calorieAmount is not a number', async () => {
    const req = mockReq({
      body: { foodName: 'Apple', calorieAmount: '95' },
    })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when protein is not a number', async () => {
    const req = mockReq({
      body: {
        foodName: 'Apple',
        calorieAmount: 95,
        protein: 'high',
      },
    })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(CalorieEntryService.create).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_REQUEST_BODY',
      message: 'protein must be a number when provided',
    })
  })

  it('returns 500 when service throws', async () => {
    CalorieEntryService.create.mockRejectedValue(new Error('DB error'))

    const req = mockReq({
      body: { foodName: 'Apple', calorieAmount: 95 },
    })
    const res = mockRes()

    await CalorieEntryController.create(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create calorie entry',
    })
  })
})
