resources = require('resources')
_ = require('lodash')

const infra = {

    check: (room) => {
        infra.extensions(room)
        infra.roads(room)
    },

    extensions: (room) => {
        const availableExtensions = CONTROLLER_STRUCTURES.extension[resources.getController(room.name).level]
        const currentExtensions = (room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION
            }
        })).length
        if (availableExtensions > currentExtensions) {
            let extensionsToCreate = availableExtensions - currentExtensions
            // console.log(availableExtensions, currentExtensions, extensionsToCreate)
            // Create extensions at northeast of spawn
            let position = resources.getSpawn(room.name).pos
            position.x -= 3
            position.y += availableExtensions / 5
            while (extensionsToCreate--) {
                room.createConstructionSite(position.x++, position.y, STRUCTURE_EXTENSION)
            }
        }
    },

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
                    newRoadsPoints = Memory[room.name].structures.roadSitesNotBuilt
                }
                console.log('------ roads')
                let roadSitesNotBuilt = []
                // If there are too many sites, we'll save for the next tick
                if (newRoadsPoints.length > C.INFRA.MAXIMUM_ROAD_SITES) {
                    roadSitesNotBuilt = newRoadsPoints.splice(C.INFRA.MAXIMUM_ROAD_SITES)
                }
                console.log(newRoadsPoints.length)
                console.log(roadSitesNotBuilt.length)
                // Create a construction site on this path
                newRoadsPoints.forEach( (position) => {
                    const status = room.createConstructionSite(position, STRUCTURE_ROAD)
                })
                if (!_.isEmpty(roadSitesNotBuilt)) {
                     Memory[room.name].structures.roadSitesNotBuilt = roadSitesNotBuilt
                     roadsNotBuilt = true
                }
            })
            if (!roadsNotBuilt) {
                Memory[room.name].structures.roadsBuilt = true
            }
        }
    }
}

module.exports = infra
