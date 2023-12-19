import { Application, FILLMODE_FILL_WINDOW, RESOLUTION_AUTO } from "playcanvas-physics-advanced"
import { loadAmmo } from "./ammo"
import { setupScene } from "./scene"

export async function load() {
    await loadAmmo()

    const canvas = <HTMLCanvasElement>document.getElementById('theCanvas')
    const app = new Application(canvas)
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
    app.setCanvasResolution(RESOLUTION_AUTO)

    window.addEventListener('resize', () => app.resizeCanvas())
    app.start()
    app.once('update', () => setupScene(app))
}

load()