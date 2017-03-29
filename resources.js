const resources = {

    getSpawn: (roomName) => {
        return Game.getObjectById(Memory[roomName].structures.spawn.id)
    },

    getRoom: (roomName) => {
        return Game.rooms[roomName]
    },

    getSources: (roomName) => {
        return Memory[roomName].structures.sources
    },

    getController: (roomName) => {
        return Game.rooms[roomName].controller
    },

    getHarvestEnergySources: (roomName) => {
        return Memory[roomName].structures.sources[0]
    },

    getUpgradeEnergySources: (roomName) => {
        if (Memory[roomName].structures.sources.length > 1) {
            return Memory[roomName].structures.sources[1]
        }
        return Memory[roomName].structures.sources[0]
    },

    getStructureForWorker: (structureId) => {
        if (!structureId) return null
        const structure = Game.getObjectById(structureId)
        return _.extend(structure, {energyLevel: structure.energy / structure.energyCapacity})
    }

}

module.exports = resources
