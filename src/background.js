import { app, protocol, screen, ipcMain, shell, desktopCapturer } from 'electron'
import Launch from '@/wins/launch'
import Main from '@/wins/main'
import TrayBox from '@/wins/tray'
import { DESIGN_WIDTH, DESIGN_HEIGHT, BASE_WIN_WIDTH, BASE_WIN_HEIGHT, DESIGN_WIDTH_SMALL, DESIGN_HEIGHT_SMALL, DESIGN_ARC_BALL, VIDEO_PATH } from '@/utils/constant'
import { httpServer } from '@/utils/server'
const path = require('path')

protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

const getSize = () => {
    const { size, scaleFactor } = screen.getPrimaryDisplay()
    return {
        width: size.width * scaleFactor,
        height: size.height * scaleFactor
    }
}

let MainPage
app.on('ready', async () => {
    const bounds = screen.getPrimaryDisplay().bounds
    const winW = Math.floor((bounds.width / BASE_WIN_WIDTH) * DESIGN_WIDTH)
    const winH = Math.ceil((bounds.height / BASE_WIN_HEIGHT) * DESIGN_HEIGHT)
    const winWSm = Math.floor((bounds.width / BASE_WIN_WIDTH) * DESIGN_WIDTH_SMALL)
    const winHSm = Math.ceil((bounds.height / BASE_WIN_HEIGHT) * DESIGN_HEIGHT_SMALL)
    
    const LaunchPage = new Launch({
        width: winWSm,
        height: winHSm
    })
    LaunchPage.on('show', function () {
        console.log('启动页开启')
        httpServer(() => {
            console.log('server running')
        })
    

        setTimeout(() => {
            MainPage = new Main({
                width: winW,
                height: winH,
                minWidth: winW,
                minHeight: winH
            })

            MainPage.on('show', function () {
                LaunchPage.close()
            })
        }, 3000)
        
        new TrayBox(MainPage)
    })
})

ipcMain.on('open-suspend',() => {
    MainPage.min()
    MainPage.getWebContents().send('record-start')
})

ipcMain.on('close-suspend',()=>{
    MainPage.getWebContents().send('record-stop')
})

ipcMain.on('main-show',()=>{
    MainPage.show()
})

ipcMain.on('directory-open',(event,arg) => {
    const file = path.join(VIDEO_PATH,arg)
    shell.showItemInFolder(file)
})

ipcMain.on('recive-desktop',async (event) => {
    const sizeInfo = getSize()
    const source = await desktopCapturer.getSources({
        types:['window','screen'],
        thumbnailSize: sizeInfo
    })

    event.reply('transport-source',source[0])
})