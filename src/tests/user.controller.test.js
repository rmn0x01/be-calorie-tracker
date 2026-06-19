jest.mock('../services/user', () => ({ findById: jest.fn(), updateById: jest.fn() }))

const UserService = require('../services/user')
const UserController = require('../controllers/user/user')

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
  res.send = jest.fn().mockReturnValue(res)
  return res
}

describe('UserController.findByLoggedIn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 200 with user data (excluding password)', async () => {
    const user = {
      id: 'user-uuid-123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'secret',
      calorieGoal: null,
      weightKg: null,
      targetWeightKg: null,
      heightCm: null,
      bornDate: null,
      toJSON() {
        return {
          id: this.id,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          calorieGoal: this.calorieGoal,
          weightKg: this.weightKg,
          targetWeightKg: this.targetWeightKg,
          heightCm: this.heightCm,
          bornDate: this.bornDate,
        }
      },
    }
    UserService.findById.mockResolvedValue(user)

    const req = mockReq()
    const res = mockRes()

    await UserController.findByLoggedIn(req, res)

    expect(UserService.findById).toHaveBeenCalledWith('user-uuid-123')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      id: 'user-uuid-123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      calorieGoal: null,
      weightKg: null,
      targetWeightKg: null,
      heightCm: null,
      bornDate: null,
    })
    // Verify password is excluded
    const callArg = res.json.mock.calls[0][0]
    expect(callArg).not.toHaveProperty('password')
  })

  it('returns 404 when user not found', async () => {
    UserService.findById.mockResolvedValue(null)

    const req = mockReq()
    const res = mockRes()

    await UserController.findByLoggedIn(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: 'NOT_FOUND',
      message: 'User not found',
    })
  })
})

describe('UserController.updateByLoggedIn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 204 when updating calorieGoal only', async () => {
    UserService.updateById.mockResolvedValue(true)

    const req = mockReq({ body: { calorieGoal: 2000 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).toHaveBeenCalledWith('user-uuid-123', { calorieGoal: 2000 })
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  it('returns 204 when updating all new physical fields', async () => {
    UserService.updateById.mockResolvedValue(true)

    const req = mockReq({
      body: {
        weightKg: 72.5,
        targetWeightKg: 68,
        heightCm: 175,
        bornDate: '1990-05-15',
      },
    })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).toHaveBeenCalledWith('user-uuid-123', {
      weightKg: 72.5,
      targetWeightKg: 68,
      heightCm: 175,
      bornDate: '1990-05-15',
    })
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  it('returns 204 when updating a mix of fields', async () => {
    UserService.updateById.mockResolvedValue(true)

    const req = mockReq({
      body: {
        calorieGoal: 1800,
        weightKg: 70,
        bornDate: '1988-12-01',
      },
    })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).toHaveBeenCalledWith('user-uuid-123', {
      calorieGoal: 1800,
      weightKg: 70,
      bornDate: '1988-12-01',
    })
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  it('returns 400 when weightKg is negative', async () => {
    const req = mockReq({ body: { weightKg: -10 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_WEIGHT',
      message: 'weightKg must be a positive number (max 999.99)',
    })
  })

  it('returns 400 when weightKg exceeds max', async () => {
    const req = mockReq({ body: { weightKg: 1000 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_WEIGHT',
      message: 'weightKg must be a positive number (max 999.99)',
    })
  })

  it('returns 204 when updating targetWeightKg', async () => {
    UserService.updateById.mockResolvedValue(true)

    const req = mockReq({ body: { targetWeightKg: 68 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).toHaveBeenCalledWith('user-uuid-123', { targetWeightKg: 68 })
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  it('returns 400 when targetWeightKg is negative', async () => {
    const req = mockReq({ body: { targetWeightKg: -5 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_TARGET_WEIGHT',
      message: 'targetWeightKg must be a positive number (max 999.99)',
    })
  })

  it('returns 400 when targetWeightKg exceeds max', async () => {
    const req = mockReq({ body: { targetWeightKg: 1000 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_TARGET_WEIGHT',
      message: 'targetWeightKg must be a positive number (max 999.99)',
    })
  })

  it('returns 204 when setting targetWeightKg to null', async () => {
    UserService.updateById.mockResolvedValue(true)

    const req = mockReq({ body: { targetWeightKg: null } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).toHaveBeenCalledWith('user-uuid-123', { targetWeightKg: null })
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  it('returns 400 when heightCm is zero', async () => {
    const req = mockReq({ body: { heightCm: 0 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_HEIGHT',
      message: 'heightCm must be a positive number (max 999.99)',
    })
  })

  it('returns 400 when bornDate is not a valid date', async () => {
    const req = mockReq({ body: { bornDate: 'invalid-date' } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_BORN_DATE',
      message: 'bornDate must be a valid date in YYYY-MM-DD format',
    })
  })

  it('returns 400 when bornDate is in the future', async () => {
    const req = mockReq({ body: { bornDate: '2099-01-01' } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_BORN_DATE',
      message: 'bornDate must be a valid past date',
    })
  })

  it('returns 400 when no fields are provided', async () => {
    const req = mockReq({ body: {} })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'NO_FIELDS_TO_UPDATE',
      message: 'At least one field must be provided',
    })
  })

  it('returns 400 when calorieGoal is invalid', async () => {
    const req = mockReq({ body: { calorieGoal: -1 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_CALORIE_GOAL',
      message: 'calorieGoal must be a positive integer or null',
    })
  })

  it('returns 404 when user not found', async () => {
    UserService.updateById.mockResolvedValue(false)

    const req = mockReq({ body: { calorieGoal: 2000 } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: 'NOT_FOUND',
      message: 'User not found',
    })
  })

  it('allows setting fields to null', async () => {
    UserService.updateById.mockResolvedValue(true)

    const req = mockReq({ body: { weightKg: null, heightCm: null, bornDate: null } })
    const res = mockRes()

    await UserController.updateByLoggedIn(req, res)

    expect(UserService.updateById).toHaveBeenCalledWith('user-uuid-123', {
      weightKg: null,
      heightCm: null,
      bornDate: null,
    })
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
