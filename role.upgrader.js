resources = require('resources')

/**
 * Defines the upgrader role
 */
const roleUpgrader = {

    run: function(workers) {
        workers.forEach( (worker) => {

            // Checks what should this upgrader do
            if (worker.memory.upgrading && worker.carry.energy == 0) {
                worker.memory.upgrading = false;
      	    }
      	    if (!worker.memory.upgrading && worker.carry.energy == worker.carryCapacity) {
      	        worker.memory.upgrading = true;
      	    }
            // Upgrade the controller
      	    if (worker.memory.upgrading) {
                  if(worker.upgradeController(worker.room.controller) == ERR_NOT_IN_RANGE) {
                      worker.moveTo(worker.room.controller);
                  }
            } else {
                const energySource = Game.getObjectById(worker.memory.energySource.id)
                if (worker.harvest(energySource) == ERR_NOT_IN_RANGE) {
                    worker.moveTo(energySource);
                }
            }
        })
	}
}

module.exports = roleUpgrader;
