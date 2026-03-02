jest.mock('../services/userToken', () => ({
  findUserTokenByToken: jest.fn(),
}))

const userTokenService = require('../services/userToken')
const authentication = require('../middlewares/authentication')

function mockReq(res, overrides = {}) {
  return {
    headers: {},
    ...overrides,
  }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

function mockNext() {
  return jest.fn()
}

describe('authentication middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when Authorization header is missing', async () => {
    const req = mockReq()
    const res = mockRes()
    const next = mockNext()

    await authentication(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Authorization header is required',
    })
    expect(next).not.toHaveBeenCalled()
    expect(userTokenService.findUserTokenByToken).not.toHaveBeenCalled()
  })

  it('returns 401 when Authorization header is not Bearer format', async () => {
    const req = mockReq(null, {
      headers: { authorization: 'Basic xyz' },
    })
    const res = mockRes()
    const next = mockNext()

    await authentication(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Invalid authorization format. Use: Bearer <token>',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when Bearer has no token', async () => {
    const req = mockReq(null, {
      headers: { authorization: 'Bearer' },
    })
    const res = mockRes()
    const next = mockNext()

    await authentication(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Invalid authorization format. Use: Bearer <token>',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when token is invalid or not found in user_token', async () => {
    userTokenService.findUserTokenByToken.mockResolvedValue(null)

    const req = mockReq(null, {
      headers: { authorization: 'Bearer invalid-token' },
    })
    const res = mockRes()
    const next = mockNext()

    await authentication(req, res, next)

    expect(userTokenService.findUserTokenByToken).toHaveBeenCalledWith(
      'invalid-token'
    )
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Token is invalid or expired',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next() and sets req.userId and req.userToken when token is valid', async () => {
    const userToken = {
      id: 'token-id',
      userId: 'user-uuid',
      token: 'valid-uuid',
    }
    userTokenService.findUserTokenByToken.mockResolvedValue(userToken)

    const req = mockReq(null, {
      headers: { authorization: 'Bearer valid-uuid' },
    })
    const res = mockRes()
    const next = mockNext()

    await authentication(req, res, next)

    expect(userTokenService.findUserTokenByToken).toHaveBeenCalledWith(
      'valid-uuid'
    )
    expect(req.userId).toBe('user-uuid')
    expect(req.userToken).toEqual(userToken)
    expect(next).toHaveBeenCalledWith()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('returns 500 when findUserTokenByToken throws', async () => {
    userTokenService.findUserTokenByToken.mockRejectedValue(
      new Error('DB error')
    )

    const req = mockReq(null, {
      headers: { authorization: 'Bearer some-token' },
    })
    const res = mockRes()
    const next = mockNext()

    await authentication(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Authentication failed',
    })
    expect(next).not.toHaveBeenCalled()
  })
})
