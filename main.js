autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', () => {
  console.log('Update available.')
})

autoUpdater.on('update-not-available', () => {
  console.log('Update not available.')
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Download speed: ${progressObj.bytesPerSecond}`)
  console.log(`Downloaded ${progressObj.percent}%`)
})

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded; will install now')
  autoUpdater.quitAndInstall()
})