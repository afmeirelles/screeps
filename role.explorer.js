resources = require('resources')

/**
 * Assings a very rudimentary logic to find new rooms
 */
const roleExplorer = {

    run: function(workers, mainRoomName) {
        workers.forEach( (worker) => {
            // First time this explorer run this role, we need to set some info
            if (!worker.memory.lastRoomName) {
                worker.memory.lastRoomName = worker.room.name
                worker.memory.lastPosition = worker.pos
                worker.memory.directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]
                if (Memory[mainRoomName].exits.length == 0) {
                    Memory[mainRoomName].exits.push({
                        roomName: worker.room.name
                    })
                }
            // If the explorer is in a room different from the last one saved
            } else if (worker.memory.lastRoomName !== worker.room.name) {
                worker.memory.lastRoomName = worker.room.name
                const alreadyFound = _.find(Memory[mainRoomName].exits, {'roomName': worker.room.name})
                // Is that a new room?!
                if (!alreadyFound) {
                    console.log('explorer found a new room:', worker.room.name)
                    // Saves relevant information about the room in the memory
                    Memory[mainRoomName].exits.push({
                        roomName: worker.room.name,
                        exitPoint: worker.pos,
                        originRoom: worker.memory.lastRoomName,
                        controllerPosition: worker.room.controller && worker.room.controller.pos,
                        energySources: worker.room.find(FIND_SOURCES)
                    })
                } else {
                    // She's back to a known room, let's randomize the direction
                    this.changeDirection(worker)
                }
            }
            // Tells the explorer to move
            const lastPosition = new RoomPosition(worker.memory.lastPosition.x, worker.memory.lastPosition.y, worker.room.name)
            worker.move(worker.memory.directions[0])
            // If she didn't move, it's facing an obstacle, we need to change direction
            if (_.isEqual(worker.pos, lastPosition)) {
                this.changeDirection(worker)
            } else {
                worker.memory.lastPosition = worker.pos
            }
        })
    },

    changeDirection: (worker) => {
        worker.memory.directions = _.shuffle(worker.memory.directions)
    }
}

module.exports = roleExplorer;
