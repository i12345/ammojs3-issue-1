import { Application, BLEND_NORMAL, BODYGROUP_DYNAMIC, BODYGROUP_USER_1, BODYTYPE_DYNAMIC, BODYTYPE_KINEMATIC, BasicMaterial, Color, Entity, LIGHTFALLOFF_INVERSESQUARED, SHADOWUPDATE_REALTIME, SHADOW_PCF3, StandardMaterial, Vec3 } from "playcanvas-physics-advanced"

// Layers
// 4 - stable
// 5 - stable?
// 6 - some clipping, frame rate drops significantly
// 7 - crashes

const layers = 7
const length = 10
const height = 0.5
const radius = 0.5

const materials: Record<number, StandardMaterial> = {}

function material(i: number, alpha = 1) {
    const color = [Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW, Color.MAGENTA, Color.CYAN, Color.GRAY][i]

    if (alpha !== 1) {
        const material = new StandardMaterial()
        material.diffuse = color.clone()
        material.opacity = alpha
        material.blendType = BLEND_NORMAL
        material.update()
        return material
    }

    if (!(i in materials)) {
        const material = new StandardMaterial()
        material.diffuse = color
        material.update()
        materials[i] = material
    }

    return materials[i]
}

function collisionGroup(i: number) {
    return BODYGROUP_USER_1 * (1 << i)
}

function platform_y(layer: number, t = 0) {
    return (10 * Math.cos(layer + t)) - 10
}

function platform(layer: number, height: number, length: number) {
    const entity = new Entity()

    entity.addComponent('collision', { type: 'box', halfExtents: new Vec3(length, height, length) })
    entity.addComponent('physics', { type: BODYTYPE_KINEMATIC, group: collisionGroup(layer) })
    entity.addComponent('render', { type: 'box', material: material(layer, 0.5) })
    entity.render.receiveShadows = true

    // local scale does not affect collision shape
    entity.setLocalScale(entity.collision.halfExtents.clone().mulScalar(2))

    entity.setLocalPosition(0, platform_y(layer), 0)

    return entity
}

export function ball(radius: number, i: number, j: number, layer: number) {
    const entity = new Entity()

    entity.setLocalScale(2 * radius, 2 * radius, 2 * radius)
    
    const group = BODYGROUP_DYNAMIC | collisionGroup(layer)

    entity.addComponent('collision', { type: 'sphere', radius })
    entity.addComponent('physics', { type: BODYTYPE_DYNAMIC, mass: 1, group, mask: group })
    entity.addComponent('render', { type: 'sphere', material: material(layer) })
    entity.render.castShadows = true
    entity.render.receiveShadows = true

    entity.setLocalPosition(i, (2.5 * radius * layer) + 5, j)

    return entity
}

export function setupScene(app: Application) {
    app.systems.physics.maxSubSteps = 100
    const root = app.root
    
    const light = new Entity()
    light.setLocalPosition(-3, 10, 4)
    light.lookAt(Vec3.ZERO)
    light.addComponent('light')
    light.light.type = 'directional'
    // light.light.innerConeAngle = 45
    // light.light.outerConeAngle = 60
    light.light.color = Color.WHITE
    light.light.intensity = 1
    light.light.castShadows = true
    light.light.shadowResolution = 2048
    light.light.shadowDistance = 30
    light.light.shadowIntensity = 0.8
    light.light.shadowBias = 0.1
    light.light.shadowUpdateMode = SHADOWUPDATE_REALTIME
    light.light.shadowType = SHADOW_PCF3
    root.addChild(light)

    const camera = new Entity()
    camera.setLocalPosition(8, 5, -50)
    camera.lookAt(Vec3.ZERO)
    camera.addComponent('camera')
    root.addChild(camera)

    const diameter = 2 * radius
    const margin = 0.618

    const platforms: Entity[] = []

    for (let layer = 0; layer < layers; layer++) {
        const platformEntity = platform(layer, height, length)
        platforms.push(platformEntity)
        root.addChild(platformEntity)
    }

    for (let i = -length + radius; i < length; i += diameter * (1 + margin))
        for (let j = -length + radius; j < length; j += diameter * (1 + margin))
            for (let layer = 0; layer < layers; layer++)
                root.addChild(ball(radius, i, j, layer))
    
    let t = 0
    
    app.on('update', (dt: number) => {
        t += dt

        for (let layer = 0; layer < layers; layer++) {
            const platform = platforms[layer]
            const position = platform.getLocalPosition()
            position.y = platform_y(layer, t)
            platform.setLocalPosition(position)
        }
    })
}