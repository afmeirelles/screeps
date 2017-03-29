module.exports = {
    WORKERS: {
        ROLE: {
            HARVESTER: 'harvester',
            UPGRADER: 'upgrader',
            BUILDER: 'builder',
            EXPLORER: 'explorer',
            CONQUERER: 'conquerer'
        },
        PART_WEIGHTS: {
            work: 100,
            carry: 50,
            move: 50
        },
        TASKS: {
            HARVEST: 'harvest',
            TRANSFER: 'transfer'
        },
        MINIMUM_UPGRADERS_PER_LEVEL: 4,
        MINIMUM_BUILDERS_PER_LEVEL: 2
    },
    INFRA: {
        MAXIMUM_ROAD_SITES: 100
    }
}
