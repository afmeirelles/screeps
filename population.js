C = require('constants')
resources = require('resources')

/**
 * Controls the population numbers
 */
const population = {

    /**
     * Categorize workers
     */
    workersByRole: (workers) => {
        return _.reduce(workers, (memo, worker) => {
            if (memo[worker.memory.role] == undefined) memo[worker.memory.role] = []
            memo[worker.memory.role].push(worker)
            return memo
        }, {});
    },

    /**
     * Creates new workers if needed
     */
    check: (workersByRole, room) => {
        // Sums up the harvesters energy carry capacity
        const harvestersTotalCapacity = _.reduce(workersByRole[C.WORKERS.ROLE.HARVESTER], (memo, worker) => {
            return memo + worker.carryCapacity
        }, 0)

        const controller = resources.getController(room.name)

        // Harvesters total capacity must match the energy capacity available
        if (harvestersTotalCapacity < room.energyCapacityAvailable) {
            return population.newWorker(C.WORKERS.ROLE.HARVESTER, room)
        }
        // Are there enough builders for this level?
        if (!workersByRole[C.WORKERS.ROLE.BUILDER] || workersByRole[C.WORKERS.ROLE.BUILDER].length < C.WORKERS.MINIMUM_BUILDERS_PER_LEVEL * controller.level) {
            return population.newWorker(C.WORKERS.ROLE.BUILDER, room)
        }
        // Are there enough upgraders for this level?
        if (!workersByRole[C.WORKERS.ROLE.UPGRADER] || workersByRole[C.WORKERS.ROLE.UPGRADER].length < C.WORKERS.MINIMUM_UPGRADERS_PER_LEVEL * controller.level) {
            return population.newWorker(C.WORKERS.ROLE.UPGRADER, room)
        }
        // Are there enough explorers for this level?
        if (!workersByRole[C.WORKERS.ROLE.EXPLORER] || workersByRole[C.WORKERS.ROLE.EXPLORER].length < controller.level) {
            return population.newExplorer(room.name)
        }
    },

    /**
     * Creates a new explorer
     */
    newExplorer: (roomName) => {
        const bodyParts = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        const name = resources.getSpawn(roomName).createCreep(bodyParts, undefined, {role: C.WORKERS.ROLE.EXPLORER})
        if (_.isString(name)) {
            console.log('Spawning new explorer:', name)
        }
    },

    /**
     * Creates a new worker (harvester, upgrader or builder)
     */
    newWorker: (role, room) => {
        const roomEnergyCapacity = room.energyCapacityAvailable
        let bodyParts = null
        // The skillset depends on the enegy capacity available
        switch (roomEnergyCapacity) {
            case 300: {
                bodyParts = [WORK, CARRY, MOVE, MOVE, MOVE]
                break
            }
            case 350: {
                bodyParts = [WORK, WORK, CARRY, MOVE, MOVE]
                break
            }
            case 400: {
                bodyParts = [WORK, WORK, CARRY, MOVE, MOVE, MOVE]
                break
            }
            case 450: {
                bodyParts = [WORK, WORK, WORK, CARRY, MOVE, MOVE]
                break
            }
            case 500: {
                bodyParts = [WORK, WORK, WORK, CARRY, MOVE, MOVE]
                break
            }
            default: {
                bodyParts = [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE]
                break
            }
        }

        // Checks if there's enough energy to create this worker
        const energyNeeded = _.reduce(bodyParts, (memo, part) => {
            return memo += C.WORKERS.PART_WEIGHTS[part]
        }, 0)
        if (energyNeeded > room.energyAvailable) {
            return null
        }
        // Sets the default energy source
        workerSource = resources.getHarvestEnergySources(room.name)
        // For upgraders, we assign a dedicated energy source, if available
        if (role === C.WORKERS.ROLE.UPGRADER) {
            workerSource = resources.getUpgradeEnergySources(room.name)
        }
        const newWorkerName = resources.getSpawn(room.name).createCreep(bodyParts, undefined, {role: role, energySource: workerSource, idleRounds: 0})
        if (_.isString(newWorkerName)) {
            console.log('Spawning new', role, ':', newWorkerName)
        }
    }
}

module.exports = population
