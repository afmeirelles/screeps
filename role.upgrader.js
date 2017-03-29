resources = require('resources')

const roleUpgrader = {

    /** @param {Creep} worker **/
    run: function(workers) {
      for (i in workers) {
        var worker = workers[i]
        // worker.say(worker.memory.role)

        if (worker.memory.upgrading && worker.carry.energy == 0) {
            worker.memory.upgrading = false;
  	    }

  	    if (!worker.memory.upgrading && worker.carry.energy == worker.carryCapacity) {
  	        worker.memory.upgrading = true;
  	    }

  	    if (worker.memory.upgrading) {
              if(worker.upgradeController(worker.room.controller) == ERR_NOT_IN_RANGE) {
                  worker.moveTo(worker.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
              }
          }
          else {
              const energySource = Game.getObjectById(worker.memory.energySource.id)
              if (worker.harvest(energySource) == ERR_NOT_IN_RANGE) {
                  worker.moveTo(energySource, {visualizePathStyle: {stroke: '#ffaa00'}});
              }
          }
      }
	}
};

module.exports = roleUpgrader;
