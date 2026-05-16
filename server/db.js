const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id          TEXT        PRIMARY KEY,
      barcode     TEXT        NOT NULL DEFAULT '',
      customer    TEXT        NOT NULL DEFAULT '',
      address     TEXT        NOT NULL DEFAULT '',
      make        TEXT        NOT NULL DEFAULT '',
      model       TEXT        NOT NULL DEFAULT '',
      scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  console.log('Database ready')
}

module.exports = { pool, init }
