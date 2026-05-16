const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')

module.exports = function createAuthMiddleware(tenantId, clientId) {
  const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
    cache: true,
    rateLimit: true,
  })

  function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err)
      callback(null, key.getPublicKey())
    })
  }

  return function requireAuth(req, res, next) {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorised' })
    }

    jwt.verify(
      auth.slice(7),
      getKey,
      {
        audience: clientId,
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          console.warn('Auth rejected:', err.message)
          return res.status(401).json({ error: 'Invalid token' })
        }
        req.user = decoded
        next()
      }
    )
  }
}
