const population = require('population')
const resources = require('resources')

/**
 * Helper class with some tweaking and non-loop funcions
 */
const helpers = {

    /**
     * Switches haversters and upgraders sources
     */
    switchSources: (roomName) => {
        Memory[roomName].structures.sources.reverse()
        const categorizedWorkers = population.workersByRole(Game.creeps)
        categorizedWorkers.harvester.forEach( (worker) => {worker.memory.energySource.id = resources.getHarvestEnergySources(roomName).id})
        categorizedWorkers.builder.forEach( (worker) => {worker.memory.energySource.id = resources.getHarvestEnergySources(roomName).id})
        categorizedWorkers.upgrader.forEach( (worker) => {worker.memory.energySource.id = resources.getUpgradeEnergySources(roomName).id})
    },

    countWorkers: (roomName) => {
        const categorizedWorkers = population.workersByRole(Game.creeps)
        console.log('There are:')
        _.forIn(categorizedWorkers, (workers, key) => {
            console.log(workers.length, key + '(s)')
        })
    }
}

module.exports = helpers
