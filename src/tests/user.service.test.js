jest.mock('../models/user')

const User = require('../models/user')
const UserService = require('../services/user')

describe('UserService.findById', () => {
  const mockUser = {
    id: 'user-id-123',
    email: 'user@example.com',
    firstname: 'John',
    lastname: 'Doe',
    password: 'hashed-password',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when id is missing', async () => {
    const result = await UserService.findById(null)
    expect(User.findByPk).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns null when id is empty string', async () => {
    const result = await UserService.findById('')
    expect(User.findByPk).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns user when found', async () => {
    User.findByPk.mockResolvedValue(mockUser)

    const result = await UserService.findById('user-id-123')

    expect(User.findByPk).toHaveBeenCalledWith('user-id-123')
    expect(result).toEqual(mockUser)
  })

  it('returns null when user not found', async () => {
    User.findByPk.mockResolvedValue(null)

    const result = await UserService.findById('non-existent-id')

    expect(User.findByPk).toHaveBeenCalledWith('non-existent-id')
    expect(result).toBeNull()
  })
})

describe('UserService.updateById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when id is missing', async () => {
    const result = await UserService.updateById(null, { firstName: 'John' })
    expect(User.update).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns null when updates is missing', async () => {
    const result = await UserService.updateById('user-id-123', null)
    expect(User.update).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('calls User.update with the provided fields', async () => {
    User.update.mockResolvedValue([1])

    const updates = {
      firstName: 'Jane',
      calorieGoal: 2000,
      weightKg: 65.5,
      heightCm: 170,
      bornDate: '1990-05-15',
    }

    const result = await UserService.updateById('user-id-123', updates)

    expect(User.update).toHaveBeenCalledWith(updates, { where: { id: 'user-id-123' } })
    expect(result).toBe(true)
  })

  it('returns false when no rows are updated', async () => {
    User.update.mockResolvedValue([0])

    const result = await UserService.updateById('non-existent-id', { firstName: 'Jane' })

    expect(result).toBe(false)
  })
})
