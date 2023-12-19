import { WasmModule } from "playcanvas-physics-advanced";

export function loadAmmo() {
    return new Promise<void>((resolve, reject) => {
        WasmModule.setConfig('Ammo', {
            glueUrl: './ammojs/ammo.wasm.js', //ammoWasmGlue as unknown as string,
            wasmUrl: './ammojs/ammo.wasm.wasm', // ammoWasm as unknown as string,
            fallbackUrl: './ammojs/ammo.js', // ammoFallbackJS as unknown as string
        })

        WasmModule.getInstance('Ammo', A => {
            ///@ts-ignore
            globalThis['Ammo'] = A

            resolve()
        })
    })
}