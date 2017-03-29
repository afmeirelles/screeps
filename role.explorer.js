resources = require('resources')

const roleExplorer = {

    /** @param {Creep} worker **/
    run: function(workers) {
        for (i in workers) {
            var worker = workers[i]
            worker.say(worker.memory.role)
            if (!worker.memory.lastRoomName) {
                worker.memory.lastRoomName = worker.room.name
                worker.memory.lastPosition = worker.pos
                worker.memory.directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]
                Memory.exits.push({
                    roomName: worker.room.name
                })
            }
            if (!worker.memory.lastRoomName || worker.memory.lastRoomName !== worker.room.name) {
                worker.memory.lastRoomName = worker.room.name
                const alreadyFound = _.find(Memory.exits, {'roomName': worker.room.name})
                // Is that a new room?!
                if (!alreadyFound || alreadyFound.length == 0) {
                    console.log('explorer found a new room:', worker.room.name)
                    Memory.exits.push({
                        roomName: worker.room.name,
                        exitPoint: worker.pos,
                        originRoom: worker.memory.lastRoomName,
                        controllerPosition: worker.room.controller.pos,
                        energySources: worker.room.find(FIND_SOURCES)
                    })
                } else {
                    // She's back again, let's randomize the direction
                    this.changeDirection(worker)
                }
            }
            worker.move(worker.memory.directions[0])
            const lastPosition = new RoomPosition(worker.memory.lastPosition.x, worker.memory.lastPosition.y, worker.room.name)
            if (_.isEqual(worker.pos, lastPosition)) {
                this.changeDirection(worker)
            } else {
                worker.memory.lastPosition = worker.pos
            }
        }
    },

    changeDirection: (worker) => {
        worker.memory.directions = worker.memory.directions.slice(-3).concat(worker.memory.directions.splice(0,5))
    }
}

module.exports = roleExplorer;
