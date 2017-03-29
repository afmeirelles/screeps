resources = require('resources')

const roleHarvester = {

    /** @param {Creep} worker **/
    run: function(workers) {
        for (i in workers) {
            var worker = workers[i]

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
                    worker.moveTo(energySource, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            // Defines the target structure to transfer energy to
            } else if (worker.memory.assignedTask == C.WORKERS.TASKS.TRANSFER) {
                // If there is a defined target
                let structure = resources.getStructureForWorker(worker.memory.targetId)
                // If this there's no target locked or if this strucure is fully charged
                // if (worker.name == 'Max') {console.log(worker.memory.targetId, !structure, structure.energyLevel == 1)}
                if (!structure || structure.energyLevel == 1) {
                    // Looks for another one
                    const targets = worker.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                        }
                    })
                    if (targets.length > 0) {
                        structure = targets[0]
                        worker.memory.targetId = targets[0].id
                    } else {
                        // All strucures charged
                        worker.memory.idleRounds++
                    }
                }
                if (structure) {
                    // Attempts to transfer energy
                    const transferResult = worker.transfer(structure, RESOURCE_ENERGY)
                    // Moves toward the structure if not in range
                    if (transferResult == ERR_NOT_IN_RANGE) {
                        worker.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}})
                    // Changes the target if it's invalid
                    } else if (transferResult == ERR_INVALID_TARGET) {
                        worker.memory.targetId = null
                    }
                } else {
                    worker.moveTo(resources.getSpawn(worker.room.name))
                }
            }
        }
	}
};

module.exports = roleHarvester;
