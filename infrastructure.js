resources = require('resources')
_ = require('lodash')

const infra = {

    /**
     * Performs the checks over the available infrastructure
     */
    check: (room) => {
        infra.extensions(room)
        infra.roads(room)
    },
    /**
     * Creates extensions as levels upgrade
     */
    extensions: (room) => {
        // Gets total available extensions
        const availableExtensions = CONTROLLER_STRUCTURES.extension[resources.getController(room.name).level]
        // Checks how many extensions are done
        const currentExtensions = (room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION
            }
        })).length
        // If there are extensions to be built
        if (availableExtensions > currentExtensions) {
            let extensionsToCreate = availableExtensions - currentExtensions
            // TODO: check the best location for the extensions
            let position = resources.getSpawn(room.name).pos
            position.x -= 3
            position.y += availableExtensions / 5
            while (extensionsToCreate--) {
                room.createConstructionSite(position.x++, position.y, STRUCTURE_EXTENSION)
            }
        }
    },
    /**
     * Creates roads to link sources to spawn and controller
     */
    roads: (room) => {
        let roadsNotBuilt = false
        if (!Memory[room.name].structures.roadsBuilt) {
            const sources = resources.getSources(room.name)
            // For each source we'll build a route from the spawn and from the controller
            sources.forEach( (energySource) => {
                let newRoadsPoints = []
                // If there are no previously saved road sites
                if (_.isEmpty(Memory[room.name].structures.roadSitesNotBuilt)) {
                    // We'll find a path from the source to the spawn...
                    const spawnPath = PathFinder.search(energySource.pos, resources.getSpawn(room.name))
                    const controllerPath = PathFinder.search(energySource.pos, resources.getController(room.name))
                    newRoadsPoints = spawnPath.path.concat(controllerPath.path)
                // If there are saved road sites, get'em
                } else {
                    // TODO: check if there's need to create RoomPositions from this
                    newRoadsPoints = Memory[room.name].structures.roadSitesNotBuilt
                }
                let roadSitesNotBuilt = []
                // If there are too many sites, we'll save for the next tick
                if (newRoadsPoints.length > C.INFRA.MAXIMUM_ROAD_SITES) {
                    roadSitesNotBuilt = newRoadsPoints.splice(C.INFRA.MAXIMUM_ROAD_SITES)
                }
                // Create a construction site on this path
                newRoadsPoints.forEach( (position) => {
                    const status = room.createConstructionSite(position, STRUCTURE_ROAD)
                })
                if (!_.isEmpty(roadSitesNotBuilt)) {
                     Memory[room.name].structures.roadSitesNotBuilt = roadSitesNotBuilt
                     roadsNotBuilt = true
                }
            })
            // Some roads weren't built, save them
            if (!roadsNotBuilt) {
                Memory[room.name].structures.roadsBuilt = true
            }
        }
    }
}

module.exports = infra
