resources = require('resources')

/**
 * Defines the harvester role
 */
const roleHarvester = {

    run: function(workers) {
        workers.forEach( (worker) => {

            // Changes the task depending on the current energy payload
            if (worker.carry.energy == 0) {
                worker.memory.assignedTask = C.WORKERS.TASKS.HARVEST
                worker.memory.targetId = null
            } else if (worker.carry.energy == worker.carryCapacity) {
                worker.memory.assignedTask = C.WORKERS.TASKS.TRANSFER
            }

            if (worker.memory.assignedTask == C.WORKERS.TASKS.HARVEST) {
                const energySource = Game.getObjectById(worker.memory.energySource.id)
                const harvestResult = worker.harvest(energySource)
                if (harvestResult == ERR_NOT_IN_RANGE) {
                    worker.moveTo(energySource);
                }
            // Defines the target structure to transfer energy to
            } else if (worker.memory.assignedTask == C.WORKERS.TASKS.TRANSFER) {
                let structure = resources.getStructureForWorker(worker.memory.targetId)
                // If this there's no target locked or if this strucure is fully charged
                if (!structure || structure.energyLevel == 1) {
                    // Looks for another one
                    const targets = worker.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                        }
                    })
                    // Locks a new target if found
                    if (targets.length > 0) {
                        structure = targets[0]
                        worker.memory.targetId = targets[0].id
                    // All strucures charged
                    } else {
                        // TODO: assign other tasks to harvester depending on the idle rounds #
                        worker.memory.idleRounds++
                    }
                }
                if (structure) {
                    // Attempts to transfer energy
                    const transferResult = worker.transfer(structure, RESOURCE_ENERGY)
                    // Moves toward the structure if not in range
                    if (transferResult == ERR_NOT_IN_RANGE) {
                        worker.moveTo(structure)
                    // Changes the target if it's invalid
                    } else if (transferResult == ERR_INVALID_TARGET) {
                        worker.memory.targetId = null
                    }
                // If there's no work to do, go back to spawn, so everyone is near and loaded
                // when the spawn needs energy again
                } else {
                    worker.moveTo(resources.getSpawn(worker.room.name))
                }
            }
        })
	}
}

module.exports = roleHarvester;
