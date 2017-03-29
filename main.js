var roleHarvester = require('role.harvester')
var roleUpgrader = require('role.upgrader')
var roleBuilder = require('role.builder')
var roleExplorer = require('role.explorer')
var population = require('population')
var infrastructure = require('infrastructure')
var resources = require('resources')
var _ = require('lodash')

/**
    Strategy:
        - priority 1: keep room energy level by dedicated workers
        - priority 2: upgrade the controller by dedicated workers
        - build roads
        - extract minerals
        - keep upgrading workers as room capacity expands
**/

module.exports.loop = function () {

    // _.forIn(Game.creeps, (creep) => {  creep.suicide() })

    // Memory.creeps = undefined
    // Memory.W5N8 = undefined

    // TODO: set the nearest energy source for harvesters
    // TODO: handle multiple rooms
    _.forIn(Game.rooms, (room) => {
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

        if (!Memory[room.name].structures.spawn) {
            console.log('Room', room.name, 'not mine... yet!')
            return
        }

        const categorizedCreeps = population.creepsByRole(Game.creeps)
        population.check(categorizedCreeps, room)
        //
        if (!_.isEmpty(categorizedCreeps.harvester)) roleHarvester.run(categorizedCreeps.harvester)
        if (!_.isEmpty(categorizedCreeps.upgrader)) roleUpgrader.run(categorizedCreeps.upgrader)
        if (!_.isEmpty(categorizedCreeps.builder)) roleBuilder.run(categorizedCreeps.builder)
        if (!_.isEmpty(categorizedCreeps.explorer)) roleExplorer.run(categorizedCreeps.explorer)
        infrastructure.check(room)

        //TODO: clean dead creeps from memory
    })
}
