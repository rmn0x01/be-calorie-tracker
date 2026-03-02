jest.mock('../models/userToken', () => ({
  findOne: jest.fn(),
}))

const UserToken = require('../models/userToken')
const userTokenService = require('../services/userToken')

describe('userTokenService.findUserTokenByToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when token is missing', async () => {
    expect(await userTokenService.findUserTokenByToken()).toBeNull()
    expect(await userTokenService.findUserTokenByToken(null)).toBeNull()
    expect(UserToken.findOne).not.toHaveBeenCalled()
  })

  it('returns null when token is not a string', async () => {
    expect(await userTokenService.findUserTokenByToken(123)).toBeNull()
    expect(UserToken.findOne).not.toHaveBeenCalled()
  })

  it('returns null when token is empty or whitespace', async () => {
    expect(await userTokenService.findUserTokenByToken('')).toBeNull()
    expect(await userTokenService.findUserTokenByToken('   ')).toBeNull()
    expect(UserToken.findOne).not.toHaveBeenCalled()
  })

  it('returns null when no record is found', async () => {
    UserToken.findOne.mockResolvedValue(null)

    const result = await userTokenService.findUserTokenByToken('valid-uuid-token')

    expect(UserToken.findOne).toHaveBeenCalledWith({
      where: { token: 'valid-uuid-token' },
    })
    expect(result).toBeNull()
  })

  it('returns the user token record when found', async () => {
    const record = {
      id: 'token-id',
      userId: 'user-id',
      token: 'valid-uuid-token',
    }
    UserToken.findOne.mockResolvedValue(record)

    const result = await userTokenService.findUserTokenByToken('valid-uuid-token')

    expect(UserToken.findOne).toHaveBeenCalledWith({
      where: { token: 'valid-uuid-token' },
    })
    expect(result).toEqual(record)
  })
})
