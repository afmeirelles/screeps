const roleHarvester = require('role.harvester')
const roleUpgrader = require('role.upgrader')
const roleBuilder = require('role.builder')
const roleExplorer = require('role.explorer')
const population = require('population')
const infrastructure = require('infrastructure')
const _ = require('lodash')

/**
    Goals:
        - keep room energy level by dedicated workers
        - upgrade the controller by dedicated workers
        - build roads linking resources to containers
        - keep upgrading workers as room capacity expands
        - explore new rooms to enable harvesting new energy sources
**/

module.exports.loop = function () {

    // Iterates over the available rooms
    _.forIn(Game.rooms, (room) => {
        // Saves some references for easier access
        if (!Memory[room.name]) {
            const spawn = _.filter(Game.spawns, (spawn) => {
                return spawn.room.name == room.name
            })
            const sources = Game.rooms[room.name].find(FIND_SOURCES)
            Memory[room.name] = {
                structures: {
                    spawn: spawn[0],
                    sources
                },
                exits: []
            }
        }

        // If this room has no spawn, it isn't ours
        if (!Memory[room.name].structures.spawn) {
            return
        }

        // Cateorize creeps based on their roles
        const categorizedWorkers = population.workersByRole(Game.creeps)

        // Checks if there's need for creating new workers
        population.check(categorizedWorkers, room)

        // Runs each worker role logic
        if (!_.isEmpty(categorizedWorkers.harvester)) roleHarvester.run(categorizedWorkers.harvester)
        if (!_.isEmpty(categorizedWorkers.upgrader)) roleUpgrader.run(categorizedWorkers.upgrader)
        if (!_.isEmpty(categorizedWorkers.builder)) roleBuilder.run(categorizedWorkers.builder)
        if (!_.isEmpty(categorizedWorkers.explorer)) roleExplorer.run(categorizedWorkers.explorer, room.name)

        // Checks for infrasctructure upgrades
        infrastructure.check(room)

        //TODO: clean dead creeps from memory
    })
}
