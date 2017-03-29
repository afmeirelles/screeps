resources = require('resources')

const roleUpgrader = {

    /** @param {Creep} worker **/
    run: function(workers) {
      for (i in workers) {
        var worker = workers[i]
        // worker.say(worker.memory.role)

        if (worker.memory.building && worker.carry.energy == 0) {
            worker.memory.building = false;
  	    }

  	    if (!worker.memory.building && worker.carry.energy == worker.carryCapacity) {
  	        worker.memory.building = true;
  	    }

        const helpUpgraders = false

  	    if (worker.memory.building) {
            let extension = Game.getObjectById(worker.memory.targetId)
            // If this construction site isn't a road yet
            if (!extension) {
                const unfinishedExtensions = worker.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (site) => {
                        return site.progress < site.progressTotal
                    }
                })
                if (unfinishedExtensions.length) {
                    extension = unfinishedExtensions.pop()
                    worker.memory.targetId = extension.id
                }
            }
            if (extension) {
                if (worker.build(extension) == ERR_NOT_IN_RANGE) {
                    worker.moveTo(extension, {visualizePathStyle: {stroke: '#ffff99'}});
                }
            } else {
                const helpUpgraders = true
                if (worker.upgradeController(worker.room.controller) == ERR_NOT_IN_RANGE) {
                    worker.moveTo(worker.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            const energySource = helpUpgraders ? Game.getObjectById(worker.memory.energySource.id) : Game.getObjectById(resources.getUpgradeEnergySources(worker.room.name).id)
            const harvestResult = worker.harvest(energySource)
            if (harvestResult == ERR_NOT_IN_RANGE) {
                worker.moveTo(energySource, {visualizePathStyle: {stroke: '#ffaa00'}});
            } 
        }
      }
	}
};

module.exports = roleUpgrader;
