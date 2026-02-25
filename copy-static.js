const fs = require('fs')
const path = require('path')

const root = __dirname

const source = path.join(root, '.next', 'static')
const dest = path.join(root, '.next', 'standalone', '.next', 'static')

if (!fs.existsSync(source)) {
  console.error('❌ static folder not found')
  process.exit(1)
}

fs.mkdirSync(dest, { recursive: true })
fs.cpSync(source, dest, { recursive: true })

console.log('✅ Static copied to standalone/.next/static')