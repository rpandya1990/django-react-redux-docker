import {
    GET_VMS,
    GET_HYPERVISOR_MANAGERS,
    GET_HYPERVISORS,
    GET_FILESETS,
    ADD_VM,
    ADD_HYPERVISOR_MANAGER,
    ADD_HYPERVISOR,
    ADD_FILESET,
    GET_SLA,
    ADD_DATASTORE,
    ADD_SLA,
    ADD_PATH_TO_FILESET,
    ADD_FREQUENCY_TO_SLA,
    DELETE_VM,
    DELETE_HYPERVISOR,
    DELETE_HYPERVISOR_MANAGER,
    DELETE_FILESET,
    DELETE_SLA,
    REMOVE_SNACKBAR,
    REMOVE_PATH_FROM_FILESET,
    DELETE_FREQUENCY,
    DELETE_DATASTORE,
    GET_CONFIG,
    ADD_CONFIG,
    DELETE_CONFIG,
    DEPLOY_SYSTEM,
    GET_DEPLOYED_SYSTEMS,
    CHECK_DEPLOYED_SYSTEM_STATUS,
    DELETE_DEPLOYMENT,
    ADD_EXCEPTION_TO_FILESET,
    ADD_EXCLUDE_TO_FILESET,
    REMOVE_EXCEPTION_FROM_FILESET,
    REMOVE_EXCLUDE_FROM_FILESET,
    ADD_COMMAND_TO_VM,
    REMOVE_COMMAND_FROM_VM,
    DELETE_DISK,
    ADD_DISK,
    SLA_TOGGLE_STATUS,
    FILESET_TOGGLE_STATUS,
    HYPERVISOR_TOGGLE_STATUS,
    HYPERVISOR_MANAGER_TOGGLE_STATUS,
    VM_TOGGLE_STATUS,
    FETCH_LOGS
} from "./types";


export const get_vms = params => dispatch => {
    dispatch({
        type: GET_VMS,
        params: params
    });
};

export const get_hypervisor_managers = params => dispatch => {
    dispatch({
        type: GET_HYPERVISOR_MANAGERS,
        params: params
    });
};

export const get_hypervisors = params => dispatch => {
    dispatch({
        type: GET_HYPERVISORS,
        params: params
    });
};

export const get_filesets = params => dispatch => {
    dispatch({
        type: GET_FILESETS,
        params: params
    });
};

export const get_sla = params => dispatch => {
    dispatch({
        type: GET_SLA,
        params: params
    })
};

export const get_configs = params => dispatch => {
    dispatch({
        type: GET_CONFIG,
        params: params
    })
};

export const get_deployed_systems = params => dispatch => {
    dispatch({
        type: GET_DEPLOYED_SYSTEMS,
        params: params
    })
};

export const check_depoyed_system_status = deployed_systems => dispatch => {
    deployed_systems.forEach(item => {
        if (item.status === 'PENDING')
            dispatch({
                type: CHECK_DEPLOYED_SYSTEM_STATUS,
                id: item.id
            })
    });
};

export const get_status = params => dispatch => {
    dispatch({
        type: GET_DEPLOYED_SYSTEMS,
        params: params
    })
};

export const add_vm = vm => dispatch => {
    dispatch({
        type: ADD_VM,
        vm: vm
    })
};

export const add_hypervisor_manager = hypervisor_manager => dispatch => {
    dispatch({
        type: ADD_HYPERVISOR_MANAGER,
        hypervisor_manager: hypervisor_manager
    })
};

export const add_hypervisor = hypervisor => dispatch => {
    dispatch({
        type: ADD_HYPERVISOR,
        hypervisor: hypervisor
    })
};

export const add_fileset = fileset => dispatch => {
    dispatch({
        type: ADD_FILESET,
        fileset: fileset
    })
};

export const add_datastore = datastore => dispatch => {
    dispatch({
        type: ADD_DATASTORE,
        datastore: datastore
    })
};

export const add_sla = sla => dispatch => {
    dispatch({
        type: ADD_SLA,
        sla: sla
    })
};

export const add_disk = disk => dispatch => {
    dispatch({
        type: ADD_DISK,
        disk: disk
    })
};

export const add_path_to_fileset = (path, fileset_id) => dispatch => {
    dispatch({
        type: ADD_PATH_TO_FILESET,
        path: path,
        fileset_id: fileset_id
    })
};

export const add_exception_to_fileset = (exception, fileset_id) => dispatch => {
    dispatch({
        type: ADD_EXCEPTION_TO_FILESET,
        exception: exception,
        fileset_id: fileset_id
    })
};

export const add_excludes_to_fileset = (exclude, fileset_id) => dispatch => {
    dispatch({
        type: ADD_EXCLUDE_TO_FILESET,
        exclude: exclude,
        fileset_id: fileset_id
    })
};

export const add_command_to_vm = (command, vm_id) => dispatch => {
    dispatch({
        type: ADD_COMMAND_TO_VM,
        command: command,
        vm_id: vm_id
    })
};

export const add_config = (name, config) => dispatch => {
    dispatch({
        type: ADD_CONFIG,
        config: config,
        name: name
    })
};

export const remove_path_from_fileset = (index, fileset_id) => dispatch => {
    dispatch({
        type: REMOVE_PATH_FROM_FILESET,
        index: index,
        fileset_id: fileset_id
    })
};

export const remove_exception_from_fileset = (index, fileset_id) => dispatch => {
    dispatch({
        type: REMOVE_EXCEPTION_FROM_FILESET,
        index: index,
        fileset_id: fileset_id
    })
};

export const remove_excludes_from_fileset = (index, fileset_id) => dispatch => {
    dispatch({
        type: REMOVE_EXCLUDE_FROM_FILESET,
        index: index,
        fileset_id: fileset_id
    })
};

export const remove_command_from_vm = (index, vm_id) => dispatch => {
    dispatch({
        type: REMOVE_COMMAND_FROM_VM,
        index: index,
        vm_id: vm_id
    })
};

export const add_frequency_to_sla = (values, sla_id) => dispatch => {
    dispatch({
        type: ADD_FREQUENCY_TO_SLA,
        values: values,
        sla_id: sla_id
    })
};

export const delete_vm = id => dispatch => {
    dispatch({
        type: DELETE_VM,
        id: id
    })
};

export const delete_hypervisor = id => dispatch => {
    dispatch({
        type: DELETE_HYPERVISOR,
        id: id
    })
};

export const delete_hypervisor_manager = id => dispatch => {
    dispatch({
        type: DELETE_HYPERVISOR_MANAGER,
        id: id
    })
};

export const delete_fileset = id => dispatch => {
    dispatch({
        type: DELETE_FILESET,
        id: id
    })
};

export const delete_sla = id => dispatch => {
    dispatch({
        type: DELETE_SLA,
        id: id
    })
};

export const delete_frequency = id => dispatch => {
    dispatch({
        type: DELETE_FREQUENCY,
        id: id
    })
};

export const delete_datastore = id => dispatch => {
    dispatch({
        type: DELETE_DATASTORE,
        id: id
    })
};

export const delete_config = id => dispatch => {
    dispatch({
        type: DELETE_CONFIG,
        id: id
    })
};

export const delete_deployment = id => dispatch => {
    dispatch({
        type: DELETE_DEPLOYMENT,
        id: id
    })
};

export const delete_disk = id => dispatch => {
    dispatch({
        type: DELETE_DISK,
        id: id
    })
};

export const deploy_system = id => dispatch => {
    dispatch({
        type: DEPLOY_SYSTEM,
        id: id
    })
};

export const removeSnackbar = key => ({
    type: REMOVE_SNACKBAR,
    key,
});

export const toggle_sla_status = id => dispatch => {
    dispatch({
        type: SLA_TOGGLE_STATUS,
        id: id
    })
};

export const toggle_fileset_status = id => dispatch => {
    dispatch({
        type: FILESET_TOGGLE_STATUS,
        id: id
    })
};

export const toggle_hypervisor_status = id => dispatch => {
    dispatch({
        type: HYPERVISOR_TOGGLE_STATUS,
        id: id
    })
};

export const toggle_hypervisor_manager_status = id => dispatch => {
    dispatch({
        type: HYPERVISOR_MANAGER_TOGGLE_STATUS,
        id: id
    })
};


export const toggle_vm_status = id => dispatch => {
    dispatch({
        type: VM_TOGGLE_STATUS,
        id: id
    })
};

export const fetch_logs = id => dispatch => {
    dispatch({
        type: FETCH_LOGS,
        id: id
    })
};