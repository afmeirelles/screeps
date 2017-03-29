resources = require('resources')
/**
 * Defines the builder role
 */
const roleBuilder = {

    run: function(workers) {
      for (i in workers) {
        var worker = workers[i]

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
            let constructionSite = Game.getObjectById(worker.memory.targetId)
            // If this there's no target locked
            if (!constructionSite) {
                // Checks for construction sites
                const unfinishedBuildings = worker.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (site) => {
                        return site.progress < site.progressTotal
                    }
                })
                // If there are unfinished buildings, lock it as the target
                if (unfinishedBuildings.length) {
                    constructionSite = unfinishedBuildings.pop()
                    worker.memory.targetId = constructionSite.id
                }
            }
            // There is work to be done, tell the worker to build
            if (constructionSite) {
                if (worker.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    worker.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ffff99'}});
                }
            // If there's nothing to build, tell them to help the upgraders
            } else {
                const helpUpgraders = true
                if (worker.upgradeController(worker.room.controller) == ERR_NOT_IN_RANGE) {
                    worker.moveTo(worker.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        // Time to gather energy
        } else {
            // Switches the energy source depending on the task assigned
            const energySource = helpUpgraders ? Game.getObjectById(worker.memory.energySource.id) : Game.getObjectById(resources.getUpgradeEnergySources(worker.room.name).id)
            const harvestResult = worker.harvest(energySource)
            if (harvestResult == ERR_NOT_IN_RANGE) {
                worker.moveTo(energySource, {visualizePathStyle: {stroke: '#ffaa00'}})
            }
        }
      }
	}
}

module.exports = roleBuilder;
