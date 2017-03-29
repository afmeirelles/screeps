C = require('constants')
resources = require('resources')

// Sets the tasks for each creep type, based on the global energy level
const population = {

    creepsByRole: (creeps) => {
        return _.reduce(creeps, (memo, creep) => {
            if (memo[creep.memory.role] == undefined) memo[creep.memory.role] = []
            memo[creep.memory.role].push(creep)
            return memo
        }, {});
    },

    changeEnergySource: (workers, energySourceId) => {
        workers.forEach( (worker) => { worker.memory.energySource = energySourceId })
    },

    check: (workersByRole, room) => {
        // console.log(JSON.stringify(workersByRole, null, 2))
        // _.forIn(workersByRole, (workers, role) => {
        //     console.log(role, ':', workers.length)
        // })
        const harvestersTotalCapacity = _.reduce(workersByRole[C.WORKERS.ROLE.HARVESTER], (memo, worker) => {
            return memo + worker.carryCapacity
        }, 0)

        const controller = resources.getController(room.name)

        // Harvesters total capacity must match the energy capacity available
        if (harvestersTotalCapacity < room.energyCapacityAvailable) {
            return population.newWorker(C.WORKERS.ROLE.HARVESTER, room)
        }
        // Two builders per level
        if (!workersByRole[C.WORKERS.ROLE.BUILDER] || workersByRole[C.WORKERS.ROLE.BUILDER].length < C.WORKERS.MINIMUM_BUILDERS_PER_LEVEL * controller.level) {
            return population.newWorker(C.WORKERS.ROLE.BUILDER, room)
        }
        // Four upgraders per level
        if (!workersByRole[C.WORKERS.ROLE.UPGRADER] || workersByRole[C.WORKERS.ROLE.UPGRADER].length < C.WORKERS.MINIMUM_UPGRADERS_PER_LEVEL * controller.level) {
            return population.newWorker(C.WORKERS.ROLE.UPGRADER, room)
        }
        // One explorer per level
        if (!workersByRole[C.WORKERS.ROLE.EXPLORER] || workersByRole[C.WORKERS.ROLE.EXPLORER].length < controller.level) {
            return population.newExplorer(room.name)
        }
    },

    newExplorer: (roomName) => {
        const bodyParts = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        const name = resources.getSpawn(roomName).createCreep(bodyParts, undefined, {role: C.WORKERS.ROLE.EXPLORER})
        if (_.isString(name)) {
            console.log('Spawning new explorer:', name)
        }
    },

    newWorker: (role, room) => {
        // Not enough energy to create a worker
        // TODO: improve exit logic to avoid creation attempt failure because of lack of energy
        // if (room.energyAvailable < room.energyCapacityAvailable) return null
        const roomEnergyCapacity = room.energyCapacityAvailable
        let bodyParts = null
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

        // Checks if there's enough energy
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
