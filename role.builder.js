resources = require('resources')
/**
 * Defines the builder role
 */
const roleBuilder = {

    run: function(workers) {
      workers.forEach( (worker) => {

        // Checks whether the workers should be building
        if (worker.memory.building && worker.carry.energy == 0) {
            worker.memory.building = false;
  	    }
  	    if (!worker.memory.building && worker.carry.energy == worker.carryCapacity) {
  	        worker.memory.building = true;
  	    }

        const helpUpgraders = false

  	    if (worker.memory.building) {
            // Gets the build target
            let builderTarget = Game.getObjectById(worker.memory.targetId)
            // If this there's no target locked
            if (!builderTarget) {
                // Checks for construction sites
                const unfinishedBuildings = worker.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (site) => {
                        return site.progress < site.progressTotal
                    }
                })
                // If there are unfinished buildings, lock it as the target
                if (unfinishedBuildings.length) {
                    builderTarget = unfinishedBuildings.pop()
                    worker.memory.targetId = builderTarget.id
                } else {
                    const rottenRoads = room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_ROAD && structure.ticksToDecay < 200
                        }
                    })
                    if (unfinishedBuildings.length) {
                        builderTarget = unfinishedBuildings.pop()
                        worker.memory.targetId = builderTarget.id
                    }
                }
            }
            // There is work to be done, tell the worker to build
            if (builderTarget) {
                if (worker.build(builderTarget) == ERR_NOT_IN_RANGE) {
                    worker.moveTo(builderTarget)
                }
            // If there's nothing to build, tell them to help the upgraders
            } else {
                const helpUpgraders = true
                if (worker.upgradeController(worker.room.controller) == ERR_NOT_IN_RANGE) {
                    worker.moveTo(worker.room.controller);
                }
            }
        // Time to gather energy
        } else {
            // Switches the energy source depending on the task assigned
            const energySource = helpUpgraders ? Game.getObjectById(resources.getUpgradeEnergySources(worker.room.name).id) : Game.getObjectById(worker.memory.energySource.id)
            const harvestResult = worker.harvest(energySource)
            if (harvestResult == ERR_NOT_IN_RANGE) {
                worker.moveTo(energySource)
            }
        }
    })
	}
}

module.exports = roleBuilder;
