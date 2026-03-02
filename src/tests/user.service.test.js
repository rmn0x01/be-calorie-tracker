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
