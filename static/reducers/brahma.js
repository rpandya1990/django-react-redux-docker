import {
    ADD_VM_SUCCESS,
    GET_FILESETS_SUCCESS,
    GET_HYPERVISOR_MANAGERS_SUCCESS,
    GET_HYPERVISORS_SUCCESS,
    GET_VMS_SUCCESS,
    ADD_HYPERVISOR_MANAGER_SUCCESS,
    ADD_HYPERVISOR_SUCCESS,
    ADD_FILESET_SUCCESS,
    GET_SLA_SUCCESS,
    ADD_SLA_SUCCESS,
    DELETE_VM_SUCCESS,
    DELETE_HYPERVISOR_SUCCESS,
    DELETE_HYPERVISOR_MANAGER_SUCCESS,
    DELETE_FILESET_SUCCESS,
    DELETE_SLA_SUCCESS,
    GET_CONFIG_SUCCESS,
    ADD_CONFIG_SUCCESS,
    DELETE_CONFIG_SUCCESS,
    GET_DEPLOYED_SYSTEMS_SUCCESS,
    UPDATE_DEPLOYED_SYSTEM_STATUS,
    DELETE_DEPLOYMENT_SUCCESS
} from "../actions/types";


const initialState = {
    vm: [],
    fileset: [],
    hypervisor: [],
    hypervisor_manager: [],
    sla: [],
    config: [],
    deployed_system: [],
    fetching: {
        VM: true,
        SLA: true,
        FILESET: true,
        HYPERVISOR: true,
        HYPERVISOR_MANAGER: true,
        CONFIG: true,
        DEPLOYED_SYSTEM: true
    }
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_SLA_SUCCESS:
            return {
                ...state,
                sla: action.payload,
                fetching: {
                    ...state.fetching,
                    SLA: false
                }
            };
        case GET_VMS_SUCCESS:
            return {
                ...state,
                vm: action.payload,
                fetching: {
                    ...state.fetching,
                    VM: false
                }
            };
        case GET_FILESETS_SUCCESS:
            return {
                ...state,
                fileset: action.payload,
                fetching: {
                    ...state.fetching,
                    FILESET: false
                }
            };
        case GET_HYPERVISORS_SUCCESS:
            return {
                ...state,
                hypervisor: action.payload,
                fetching: {
                    ...state.fetching,
                    HYPERVISOR: false
                }
            };
        case GET_HYPERVISOR_MANAGERS_SUCCESS:
            return {
                ...state,
                hypervisor_manager: action.payload,
                fetching: {
                    ...state.fetching,
                    HYPERVISOR_MANAGER: false
                }
            };
        case GET_CONFIG_SUCCESS:
            return {
                ...state,
                config: action.payload,
                fetching: {
                    ...state.fetching,
                    CONFIG: false
                }
            };
        case GET_DEPLOYED_SYSTEMS_SUCCESS:
            return {
                ...state,
                deployed_system: action.payload,
                fetching: {
                    ...state.fetching,
                    DEPLOYED_SYSTEM: false
                }
            };
        case UPDATE_DEPLOYED_SYSTEM_STATUS:
            return {
                ...state,
                deployed_system: [
                    ...state.deployed_system.filter(item => item.id < action.payload.id),
                    action.payload,
                    ...state.deployed_system.filter(item => item.id > action.payload.id)
                ]
            };
        case ADD_VM_SUCCESS:
            return {
                ...state,
                vm: [
                    ...state.vm.filter(item => item.id !== action.payload.id),
                    action.payload
                ]
            };
        case ADD_HYPERVISOR_MANAGER_SUCCESS:
            return {
                ...state,
                hypervisor_manager: [
                    ...state.hypervisor_manager.filter(item => item.id !== action.payload.id),
                    action.payload
                ]
            };
        case ADD_HYPERVISOR_SUCCESS:
            return {
                ...state,
                hypervisor: [
                    ...state.hypervisor.filter(item => item.id !== action.payload.id),
                    action.payload
                ]
            };
        case ADD_FILESET_SUCCESS:
            return {
                ...state,
                fileset: [
                    ...state.fileset.filter(item => item.id !== action.payload.id),
                    action.payload
                ]
            };
        case ADD_SLA_SUCCESS:
            return {
                ...state,
                sla: [
                    ...state.sla.filter(item => item.id !== action.payload.id),
                    action.payload
                ]
            };
        case ADD_CONFIG_SUCCESS:
            return {
                ...state,
                config: [
                    ...state.config.filter(item => item.id !== action.payload.id),
                    action.payload
                ]
            };
        case DELETE_VM_SUCCESS:
            return {
                ...state,
                vm: [
                    ...state.vm.filter(item => item.id !== action.payload)
                ]
            };
        case DELETE_HYPERVISOR_SUCCESS:
            return {
                ...state,
                hypervisor: [
                    ...state.hypervisor.filter(item => item.id !== action.payload)
                ]
            };
        case DELETE_HYPERVISOR_MANAGER_SUCCESS:
            return {
                ...state,
                hypervisor_manager: [
                    ...state.hypervisor_manager.filter(item => item.id !== action.payload)
                ]
            };
        case DELETE_FILESET_SUCCESS:
            return {
                ...state,
                fileset: [
                    ...state.fileset.filter(item => item.id !== action.payload)
                ]
            };
        case DELETE_SLA_SUCCESS:
            return {
                ...state,
                sla: [
                    ...state.sla.filter(item => item.id !== action.payload)
                ]
            };
        case DELETE_CONFIG_SUCCESS:
            return {
                ...state,
                config: [
                    ...state.config.filter(item => item.id !== action.payload)
                ]
            };
        case DELETE_DEPLOYMENT_SUCCESS:
            return {
                ...state,
                deployed_system: [
                    ...state.deployed_system.filter(item => item.id !== action.payload)
                ]
            };
        default:
            return state;
    }
}
