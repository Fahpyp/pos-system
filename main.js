const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow
const PORT = 3000

function startNextServer() {
  const serverPath = path.join(
    process.resourcesPath,
    'app',                 
    '.next',
    'standalone',
    'server.js'
  )

  console.log('Loading Next server:', serverPath)

  if (!fs.existsSync(serverPath)) {
    console.error('❌ server.js not found')
    return
  }

  require(serverPath)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  })

  mainWindow.loadURL(`http://localhost:${PORT}`)
}

app.whenReady().then(() => {
  startNextServer()

  // หน่วงเล็กน้อยพอให้ server boot
  setTimeout(() => {
    createWindow()
  }, 3000)
})

app.on('window-all-closed', () => {
  app.quit()
})