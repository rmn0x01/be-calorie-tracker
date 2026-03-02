const bcrypt = require('bcrypt')

jest.mock('bcrypt')
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }))
jest.mock('../models/userToken', () => ({ create: jest.fn().mockResolvedValue({}) }))
jest.mock('../services/user', () => ({
  findByEmail: jest.fn(),
}))

const UserService = require('../services/user')
const AuthService = require('../services/auth')

describe('AuthService.login', () => {
  const baseUser = {
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed-password',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when user is not found', async () => {
    UserService.findByEmail.mockResolvedValue(null)

    const result = await AuthService.login({
      email: 'missing@example.com',
      password: 'password',
    })

    expect(UserService.findByEmail).toHaveBeenCalledWith('missing@example.com')
    expect(result).toBeNull()
  })

  it('returns null when password is invalid', async () => {
    UserService.findByEmail.mockResolvedValue(baseUser)
    bcrypt.compare.mockResolvedValue(false)

    const result = await AuthService.login({
      email: baseUser.email,
      password: 'wrong-password',
    })

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrong-password',
      baseUser.password
    )
    expect(result).toBeNull()
  })

  it('returns token and user data when credentials are valid', async () => {
    UserService.findByEmail.mockResolvedValue(baseUser)
    bcrypt.compare.mockResolvedValue(true)

    const result = await AuthService.login({
      email: baseUser.email,
      password: 'correct-password',
    })

    expect(UserService.findByEmail).toHaveBeenCalledWith(baseUser.email)
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'correct-password',
      baseUser.password
    )

    expect(result).not.toBeNull()
    expect(typeof result.token).toBe('string')
    expect(result.user).toEqual({
      id: baseUser.id,
      email: baseUser.email,
      firstName: baseUser.firstName,
      lastName: baseUser.lastName,
    })
  })
})

