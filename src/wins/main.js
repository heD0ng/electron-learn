import { app, BrowserWindow, ipcMain, WebContents, crashReporter, Notification } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const events = require('events')

const defaultConfig = {
    title: '录屏软件',
    resizable: true,
    show: false,
    frame: false,
    center: true,
    focusable: true,
    alwaysOnTop: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    }
}

class Main extends events {
    constructor (config) {
        super()
        this.config = config
        this.state = Object.assign({}, defaultConfig, config)
        this.windowInstance = new BrowserWindow(this.state)

        if(Notification.isSupported()) {
            const notification = new Notification({
                title: '欢迎来到录屏软件'
            });
            notification.show()
        }
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            console.log(`${process.env.WEBPACK_DEV_SERVER_URL}/#/dashboard`)
            this.windowInstance.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/dashboard`)
            this.windowInstance.webContents.openDevTools()
        } else {
            createProtocol('app')
            this.windowInstance.loadURL('app://./index.html/#/dashboard')
        }
        // 崩溃日志上传
        // crashReporter.start({ submitURL: 'https://your-domain.com/url-to-submit' })
        
        this.init();
        
    }

    init () {
        this.windowInstance.once('ready-to-show', () => {
            this.windowInstance.show()
        })

        this.windowInstance.on('show', () => {
            this.emit('show')
        })

        this.windowInstance.on('close', () => {
            this.emit('close')
        })

        this.listenIpc()
    }

    listenIpc () {
        const { width, height } = this.config
        ipcMain.on('move-main', (event, pos) => {
            this.windowInstance && this.windowInstance.setBounds({ width, height })
            this.windowInstance && this.windowInstance.setPosition(pos.baseX, pos.baseY)
        })
        // 全屏
        ipcMain.on('mainWin:max', () => {
            this.windowInstance.setFullScreen(true)
        })
        // 还原
        ipcMain.on('mainWin:min', () => {
            this.windowInstance.setFullScreen(false)
        })
        // 隐藏主窗口
        ipcMain.on('mainWin:hide', () => {
            this.windowInstance.hide()
        })
        // 关闭主窗口
        ipcMain.on('mainWin:close', () => {
            app.quit()
        })
        // 最大化
        ipcMain.on('mainWin:maximize', () => {
            this.windowInstance.maximize()
        })
        // 最大化恢复
        ipcMain.on('mainWin:restore', () => {
            this.windowInstance.restore()
        })
        // 最小化
        ipcMain.on('mainWin:minimize', () => {
            this.windowInstance.minimize()
        })
    }

    getWebContents () {
        return this.windowInstance.webContents
    }

    getWindowInstance () {
        return this.windowInstance
    }

    show () {
        this.windowInstance && this.windowInstance.show()
    }

    min () {
        this.windowInstance && this.windowInstance.minimize()
    }

    close () {
        this.windowInstance && this.windowInstance.close()
    }
}

export default Main
