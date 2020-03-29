import _ from "lodash";

const generateConfig = (state, props) => {
    let config = {
        flags: ["deploy_system"],
        vm: {},
        protection: {},
        fileset: {},
        resources: {
            hypervisor: {},
            hypervisors_manager: {}
        },
    };

    const vm_fields = ['template', 'os', 'count', 'name_prefix', 'fileset_reference', "start_from", "power_on"];

    const hypervisor_fields = ['name', 'type', 'concurrency', 'additional_load'];

    const hypervisor_manager_fields = ['hostname', 'username', 'password', 'port', 'type'];

    const filesets = new Set();

    // ADD HYPERVISOR MANAGER TO CONFIG
    config.resources.hypervisors_manager[state.hypervisor_manager.name] = {
        id: state.hypervisor_manager.name
    };

    hypervisor_manager_fields.forEach(field => {
        config.resources.hypervisors_manager
            [state.hypervisor_manager.name][field] = state.hypervisor_manager[field];
    });

    // ADD VM TO CONFIG
    state.vm.forEach(vm => {
        let obj = {
            id: vm.name,
            hypervisors_manager_reference: state.hypervisor_manager.name
        };

        vm_fields.forEach(field => {
            obj[field] = vm[field];
        });

        obj.credential = {
            username: vm.username,
            password: vm.password
        };
        obj.tags = {
            machine_type: vm.machine_type,
            snappable: vm.snappable
        };

        // ADD FILESETS
        if (vm.fileset_reference.length === 0)
            delete obj.fileset_reference;
        else
            vm.fileset_reference.forEach(fileset => {
                filesets.add(fileset);
            });

        // Modify section
        if (vm.modify) {
            obj.modify = {
                cpu: {
                    count: vm.cpu_count,
                    socket_count: vm.socket_count
                },
                memory: vm.memory,
                disks: []
            };

            vm.disks.forEach(disk => {
                obj.modify.disks.push({
                    size: disk.size,
                    thin_provision: disk.thin_provision
                })
            })
        }

        config.vm[vm.name] = obj;
    });

    // ADD SLA TO CONFIG
    state.sla.forEach(sla => {
        let obj = {
            overwrite: sla.overwrite
        };

        obj.spec = {
            name: sla.name,
            frequencies: sla.frequency.map(freq => {
                return {
                    timeUnit: freq.time_unit,
                    frequency: freq.frequency,
                    retention: freq.retention
                }
            })
        };

        obj.protect = {
            hypervisor: {},
            vm: {}
        };

        sla.protect_counts.forEach(item => {
            if (item.count > 0)
                obj.protect.vm[item.name] = item.count;
        });

        config.protection[sla.name] = obj;
    });

    if (state.sla.length === 0)
        delete config.protection;


    // ADD HYPERVISOR TO CONFIG
    state.hypervisor.forEach(hypervisor => {
        let obj = {
            id: hypervisor.name,
            hypervisors_manager_reference: state.hypervisor_manager.name,
            datastore: {},
            vm: {},
        };

        // ADD HYPERVISOR FIELDS
        hypervisor_fields.forEach(field => {
            obj[field] = hypervisor[field];
        });

        // ADD DATASTORES
        hypervisor.datastores.forEach(datastore => {
            obj.datastore[datastore.name] = {
                name: datastore.name,
                type: datastore.type,
                vm: {}
            };
        });

        // ASSIGN HYPERVISOR DEPLOY COUNTS
        state.vm.forEach(vm => {

            vm.deploy_counts.forEach(deployment_hypervisor => {
                if (deployment_hypervisor.name !== hypervisor.name)
                    return;

                if (deployment_hypervisor.count > 0)
                    obj.vm[vm.name] = deployment_hypervisor.count;

                // ASSIGN DATASTORE DEPLOY COUNTS
                deployment_hypervisor.datastores.forEach(datastore => {
                    if (datastore.count > 0)
                        obj.datastore[datastore.name].vm[vm.name] = datastore.count;
                })
            })
        });

        // REMOVE EMPTY VM OBJECTS FROM DATASTORE
        hypervisor.datastores.forEach(datastore => {
            if (_.isEmpty(obj.datastore[datastore.name].vm))
                delete obj.datastore[datastore.name].vm;
        });

        // REMOVE EMPTY VM OBJECTS OF HYPERVISOR
        if (_.isEmpty(obj.vm))
            delete obj.vm;

        config.resources.hypervisor[hypervisor.name] = obj;
    });


    // ADD FILESET TO CONFIG
    for (let fileset of filesets) {
        let index = props.fileset.findIndex(item => item.template_name === fileset);
        let item = props.fileset[index];

        let obj = {
            name: item.name,
            includes: item.fileset_paths,
            snappable: item.snappable
        };

        if (item.exceptions.length > 0)
            obj.exceptions = item.exceptions;

        if (item.excludes.length > 0)
            obj.excludes = item.excludes;

        config.fileset[item.template_name] = obj;
    }

    if (filesets.size === 0)
        delete config.fileset;

    return config;
};

export default generateConfig;