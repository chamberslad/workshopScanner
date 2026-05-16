const express = require('express')
const { pool, init } = require('./db')
const createAuthMiddleware = require('./auth')

const app = express()
app.use(express.json())

const { ENTRA_TENANT_ID, ENTRA_CLIENT_ID } = process.env

if (!ENTRA_TENANT_ID || !ENTRA_CLIENT_ID) {
  console.warn('Warning: ENTRA_TENANT_ID or ENTRA_CLIENT_ID not set — auth disabled')
}

const requireAuth = ENTRA_TENANT_ID && ENTRA_CLIENT_ID
  ? createAuthMiddleware(ENTRA_TENANT_ID, ENTRA_CLIENT_ID)
  : (req, res, next) => next()

// Public endpoint — frontend fetches this to initialise MSAL
app.get('/api/config', (req, res) => {
  res.json({ tenantId: ENTRA_TENANT_ID ?? '', clientId: ENTRA_CLIENT_ID ?? '' })
})

function toClient(row) {
  return {
    id:        row.id,
    barcode:   row.barcode,
    customer:  row.customer,
    address:   row.address,
    make:      row.make,
    model:     row.model,
    scannedAt: row.scanned_at,
  }
}

function wrap(fn) {
  return async (req, res) => {
    try { await fn(req, res) }
    catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// All /api/entries routes require authentication
app.use('/api/entries', requireAuth)

app.get('/api/entries', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM entries ORDER BY scanned_at DESC')
  res.json(rows.map(toClient))
}))

app.post('/api/entries', wrap(async (req, res) => {
  const { id, barcode, customer, address, make, model, scannedAt } = req.body
  const { rows } = await pool.query(
    `INSERT INTO entries (id, barcode, customer, address, make, model, scanned_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, barcode ?? '', customer ?? '', address ?? '', make ?? '', model ?? '', scannedAt ?? new Date()]
  )
  res.status(201).json(toClient(rows[0]))
}))

app.patch('/api/entries/:id', wrap(async (req, res) => {
  const allowed = ['barcode', 'customer', 'address', 'make', 'model']
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
  if (!updates.length) return res.status(400).json({ error: 'No valid fields provided' })

  const set = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ')
  const values = [req.params.id, ...updates.map(([, v]) => v)]
  const { rows } = await pool.query(`UPDATE entries SET ${set} WHERE id = $1 RETURNING *`, values)

  if (!rows.length) return res.status(404).json({ error: 'Not found' })
  res.json(toClient(rows[0]))
}))

app.delete('/api/entries/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM entries WHERE id = $1', [req.params.id])
  res.status(204).end()
}))

app.delete('/api/entries', wrap(async (req, res) => {
  await pool.query('DELETE FROM entries')
  res.status(204).end()
}))

init()
  .then(() => app.listen(3000, () => console.log('API server listening on :3000')))
  .catch(err => { console.error('Failed to initialise database:', err); process.exit(1) })
