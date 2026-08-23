/**
 * PM2 ecosystem for Sambhavi Handloom ONLY.
 * AFTIONIX must remain separate (typically Docker on port 3000).
 *
 * Prefer deploy.sh which starts blue/green by name.
 * This file is a reference for manual starts.
 */
module.exports = {
  apps: [
    {
      name: 'sambhavi-blue',
      cwd: '/var/www/sambhavi-handloom/current',
      script: 'pnpm',
      args: 'start -- -p 3001',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'sambhavi-green',
      cwd: '/var/www/sambhavi-handloom/current',
      script: 'pnpm',
      args: 'start -- -p 3002',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
}
