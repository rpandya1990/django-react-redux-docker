import {all, call, put, takeEvery, takeLatest} from 'redux-saga/effects';
import axios from "axios";
import {getCookie} from "../utils";
import React from "react";

import {
    GET_VMS,
    GET_VMS_SUCCESS,
    GET_FILESETS,
    GET_FILESETS_SUCCESS,
    GET_HYPERVISOR_MANAGERS,
    GET_HYPERVISOR_MANAGERS_SUCCESS,
    GET_HYPERVISORS,
    GET_HYPERVISORS_SUCCESS,
    ADD_VM,
    ADD_VM_SUCCESS,
    ADD_HYPERVISOR_MANAGER,
    ADD_HYPERVISOR_MANAGER_SUCCESS,
    ADD_HYPERVISOR_SUCCESS,
    ADD_HYPERVISOR,
    ADD_FILESET_SUCCESS,
    ADD_FILESET,
    GET_SLA,
    GET_SLA_SUCCESS,
    ADD_DATASTORE,
    ADD_SLA_SUCCESS,
    ADD_SLA,
    ADD_PATH_TO_FILESET,
    ADD_FREQUENCY_TO_SLA,
    DELETE_VM,
    DELETE_VM_SUCCESS,
    DELETE_HYPERVISOR_SUCCESS,
    DELETE_HYPERVISOR,
    DELETE_HYPERVISOR_MANAGER_SUCCESS,
    DELETE_HYPERVISOR_MANAGER,
    DELETE_FILESET_SUCCESS,
    DELETE_FILESET,
    DELETE_SLA_SUCCESS,
    DELETE_SLA,
    ENQUEUE_SNACKBAR,
    REMOVE_PATH_FROM_FILESET,
    DELETE_FREQUENCY,
    DELETE_DATASTORE,
    GET_CONFIG,
    GET_CONFIG_SUCCESS,
    ADD_CONFIG_SUCCESS,
    ADD_CONFIG,
    DELETE_CONFIG,
    DELETE_CONFIG_SUCCESS,
    DEPLOY_SYSTEM,
    GET_DEPLOYED_SYSTEMS,
    GET_DEPLOYED_SYSTEMS_SUCCESS,
    UPDATE_DEPLOYED_SYSTEM_STATUS,
    CHECK_DEPLOYED_SYSTEM_STATUS,
    DELETE_DEPLOYMENT,
    DELETE_DEPLOYMENT_SUCCESS,
    ADD_EXCEPTION_TO_FILESET,
    ADD_EXCLUDE_TO_FILESET,
    REMOVE_EXCEPTION_FROM_FILESET,
    REMOVE_EXCLUDE_FROM_FILESET,
    ADD_COMMAND_TO_VM,
    REMOVE_COMMAND_FROM_VM,
    ADD_DISK,
    DELETE_DISK,
    SLA_TOGGLE_STATUS,
    FILESET_TOGGLE_STATUS,
    HYPERVISOR_TOGGLE_STATUS,
    HYPERVISOR_MANAGER_TOGGLE_STATUS,
    VM_TOGGLE_STATUS,
    FETCH_LOGS
} from "../actions/types";

import {
    ADD_COMMAND_VM_ENDPOINT,
    ADD_EXCEPTION_FILESET_ENDPOINT,
    ADD_EXCLUSION_FILESET_ENDPOINT,
    ADD_PATH_FILESET_ENDPOINT,
    CONFIG_ENDPOINT,
    DATASTORE_ENDPOINT,
    DEPLOY_SYSTEM_ENDPOINT,
    DEPLOYED_SYSTEMS_ENDPOINT,
    DISK_ENDPOINT, FETCH_LOGS_ENDPOINT,
    FILESET_ENPOINT,
    FREQUENCY_ENDPOINT,
    HYPERVISOR_MANAGERS_ENPOINT,
    HYPERVISORS_ENPOINT,
    REMOVE_COMMAND_VM_ENDPOINT,
    REMOVE_EXCEPTION_FILESET_ENDPOINT,
    REMOVE_EXLUSION_FILESET_ENDPOINT,
    REMOVE_PATH_FILESET_ENDPOINT,
    SLA_ENDPOINT,
    TOGGLE_FILESET_STATUS,
    TOGGLE_HYPERVISOR_MANAGER_STATUS,
    TOGGLE_HYPERVISOR_STATUS,
    TOGGLE_SLA_STATUS,
    TOGGLE_VM_STATUS,
    VMS_ENDPOINT
} from "../api/endpoints";


function* getVMs(action) {
    try {
        const {params} = action;

        const rsp = yield call(axios.get, `${VMS_ENDPOINT}?${params ? params.toString() : ''}`);

        // store id to index mapping
        const indexes = {}, vm = rsp.data;
        vm.forEach((item, i) => {
            indexes[item.id] = i;
            item.disks = [];
        });

        // fetch all disks
        const {data} = yield call(axios.get, `${DISK_ENDPOINT}?${params ? params.toString() : ''}`);

        // assign each disk to its vm
        data.forEach(item => {
            let for_vm = item.for_vm;
            vm[indexes[for_vm]]['disks'].push(item);
        });

        yield put({
            type: GET_VMS_SUCCESS,
            payload: vm
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* getSlas(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${SLA_ENDPOINT}?${params ? params.toString() : ''}`);

        // store id to index mapping
        const indexes = {}, sla = rsp.data;
        sla.forEach((sla, i) => {
            indexes[sla.id] = i;
            sla.frequency = [];
        });


        // fetch all frequencies
        const {data} = yield call(axios.get, `${FREQUENCY_ENDPOINT}?${params ? params.toString() : ''}`);

        // assign each freq to its sla
        data.forEach(item => {
            let for_sla = item.for_sla;
            sla[indexes[for_sla]]['frequency'].push(item);
        });

        yield put({
            type: GET_SLA_SUCCESS,
            payload: sla
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* get_hypervisor_managers(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${HYPERVISOR_MANAGERS_ENPOINT}?${params ? params.toString() : ''}`);

        yield put({
            type: GET_HYPERVISOR_MANAGERS_SUCCESS,
            payload: rsp.data
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* get_hypervisors(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${HYPERVISORS_ENPOINT}?${params ? params.toString() : ''}`);

        // store id to index mapping
        const indexes = {}, hypervisor = rsp.data;
        hypervisor.forEach((item, i) => {
            indexes[item.id] = i;
            item.datastores = [];
        });

        // fetch all frequencies
        const {data} = yield call(axios.get, `${DATASTORE_ENDPOINT}?${params ? params.toString() : ''}`);

        // assign each freq to its sla
        data.forEach(item => {
            let for_hypervisor = item.for_hypervisor;
            hypervisor[indexes[for_hypervisor]]['datastores'].push(item);
        });

        yield put({
            type: GET_HYPERVISORS_SUCCESS,
            payload: hypervisor
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* get_filesets(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${FILESET_ENPOINT}?${params ? params.toString() : ''}`);

        yield put({
            type: GET_FILESETS_SUCCESS,
            payload: rsp.data
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* getConfigs(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${CONFIG_ENDPOINT}?${params ? params.toString() : ''}`);

        yield put({
            type: GET_CONFIG_SUCCESS,
            payload: rsp.data
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* getDeployedSystems(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DEPLOYED_SYSTEMS_ENDPOINT}?${params ? params.toString() : ''}`);

        yield put({
            type: GET_DEPLOYED_SYSTEMS_SUCCESS,
            payload: rsp.data
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addVM(action) {
    try {
        const {vm} = action;
        const res = yield call(axios.post, VMS_ENDPOINT, vm, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${VMS_ENDPOINT}${res.data.id}/`);
        rsp.data.disks = [];

        yield put({
            type: ADD_VM_SUCCESS,
            payload: rsp.data
        });


        yield call(handleNotification, {
            message: "VM Added Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addHypervisorManager(action) {
    try {
        const {hypervisor_manager} = action;
        const res = yield call(axios.post, HYPERVISOR_MANAGERS_ENPOINT, hypervisor_manager, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${HYPERVISOR_MANAGERS_ENPOINT}${res.data.id}/`);
        yield put({
            type: ADD_HYPERVISOR_MANAGER_SUCCESS,
            payload: rsp.data
        });

        yield call(handleNotification, {
            message: "Hypervisor Manager Added Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addHypervisor(action) {
    try {
        const {hypervisor} = action;
        const res = yield call(axios.post, HYPERVISORS_ENPOINT, hypervisor, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${HYPERVISORS_ENPOINT}${res.data.id}/`);
        rsp.data.datastores = [];

        yield put({
            type: ADD_HYPERVISOR_SUCCESS,
            payload: rsp.data
        });

        yield call(handleNotification, {
            message: "Hypervisor Added Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addFileset(action) {
    try {
        const {fileset} = action;
        const res = yield call(axios.post, FILESET_ENPOINT, fileset, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${FILESET_ENPOINT}${res.data.id}/`);
        yield put({
            type: ADD_FILESET_SUCCESS,
            payload: rsp.data
        });

        yield call(handleNotification, {
            message: "Fileset Added Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addDatastore(action) {
    try {
        const {datastore} = action;
        const res = yield call(axios.post, DATASTORE_ENDPOINT, datastore, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(axios.get, `${DATASTORE_ENDPOINT}${res.data.id}/`);

        yield put({
            type: GET_HYPERVISORS,
        });

        yield call(handleNotification, {
            message: "Datastore Added Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addSla(action) {
    try {
        const {sla} = action;
        const res = yield call(axios.post, SLA_ENDPOINT, sla, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${SLA_ENDPOINT}${res.data.id}/`);
        rsp.data.frequency = [];

        yield put({
            type: ADD_SLA_SUCCESS,
            payload: rsp.data
        });

        yield call(handleNotification, {
            message: 'Sla Added',
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addDisk(action) {
    try {
        const {disk} = action;
        const res = yield call(axios.post, DISK_ENDPOINT, disk, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(axios.get, `${DISK_ENDPOINT}${res.data.id}/`);

        yield call(handleNotification, {
            message: "Disk Added to VM Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_VMS,
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addExceptionToFileset(action) {
    try {
        const {exception, fileset_id} = action;

        const res = yield call(axios.post, ADD_EXCEPTION_FILESET_ENDPOINT, {exception, fileset_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: res.data.success,
            variant: 'success'
        });

        yield put({
            type: GET_FILESETS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addExcludeToFileset(action) {
    try {
        const {exclude, fileset_id} = action;

        const res = yield call(axios.post, ADD_EXCLUSION_FILESET_ENDPOINT, {exclude, fileset_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: res.data.success,
            variant: 'success'
        });

        yield put({
            type: GET_FILESETS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addPathToFileset(action) {
    try {
        const {path, fileset_id} = action;

        const res = yield call(axios.post, ADD_PATH_FILESET_ENDPOINT, {path, fileset_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: res.data.success,
            variant: 'success'
        });

        yield put({
            type: GET_FILESETS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addCommandToVM(action) {
    try {
        const {command, vm_id} = action;

        const res = yield call(axios.post, ADD_COMMAND_VM_ENDPOINT, {command, vm_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: res.data.success,
            variant: 'success'
        });

        yield put({
            type: GET_VMS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* removePathFromFileset(action) {
    try {
        const {index, fileset_id} = action;

        yield call(axios.post, REMOVE_PATH_FILESET_ENDPOINT, {index, fileset_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Path Removed from Fileset Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_FILESETS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* removeExceptionFromFileset(action) {
    try {
        const {index, fileset_id} = action;

        yield call(axios.post, REMOVE_EXCEPTION_FILESET_ENDPOINT, {index, fileset_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Exception Removed from Fileset Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_FILESETS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* removeExcludeFromFileset(action) {
    try {
        const {index, fileset_id} = action;

        yield call(axios.post, REMOVE_EXLUSION_FILESET_ENDPOINT, {index, fileset_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Exclusion Removed from Fileset Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_FILESETS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* removeCommandFromVM(action) {
    try {
        const {index, vm_id} = action;

        yield call(axios.post, REMOVE_COMMAND_VM_ENDPOINT, {index, vm_id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Command Removed from VM Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_VMS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addFrequencyToSla(action) {
    try {
        const {values, sla_id} = action;
        values.for_sla = sla_id;

        yield call(axios.post, FREQUENCY_ENDPOINT, values, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Frequency Added to Sla Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_SLA
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* addConfig(action) {
    try {
        const {config, name} = action;
        const res = yield call(axios.post, CONFIG_ENDPOINT, {config, name}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${CONFIG_ENDPOINT}${res.data.id}/`);
        yield put({
            type: ADD_CONFIG_SUCCESS,
            payload: rsp.data
        });

        yield call(handleNotification, {
            message: "Config Added Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteVm(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${VMS_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: DELETE_VM_SUCCESS,
            payload: id
        });

        yield call(handleNotification, {
            message: "VM deleted Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

function* deleteHypervisor(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${HYPERVISORS_ENPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: DELETE_HYPERVISOR_SUCCESS,
            payload: id
        });

        yield call(handleNotification, {
            message: "Hypervisor deleted Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteHypervisorManager(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${HYPERVISOR_MANAGERS_ENPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: DELETE_HYPERVISOR_MANAGER_SUCCESS,
            payload: id
        });

        yield call(handleNotification, {
            message: "Hypervisor Manager deleted Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteFileset(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${FILESET_ENPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: DELETE_FILESET_SUCCESS,
            payload: id
        });

        yield call(handleNotification, {
            message: "Fileset deleted Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteSla(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${SLA_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: DELETE_SLA_SUCCESS,
            payload: id
        });

        yield call(handleNotification, {
            message: "Sla deleted Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteFrequency(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${FREQUENCY_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Frequency deleted from Sla Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_SLA
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteDatastore(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${DATASTORE_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Datastore deleted from Hypervisor Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_HYPERVISORS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteConfig(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${CONFIG_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: DELETE_CONFIG_SUCCESS,
            payload: id
        });

        yield put({
            type: GET_DEPLOYED_SYSTEMS,
        });

        yield call(handleNotification, {
            message: "Config deleted Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteDeployment(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${DEPLOYED_SYSTEMS_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: DELETE_DEPLOYMENT_SUCCESS,
            payload: id
        });

        yield call(handleNotification, {
            message: "Deployment Record deleted Successfully",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deleteDisk(action) {
    try {
        const {id} = action;
        yield call(axios.delete, `${DISK_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: "Disk deleted from VM Successfully",
            variant: 'success'
        });

        yield put({
            type: GET_VMS
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* deploySystem(action) {
    try {
        const {id} = action;

        yield call(axios.post, DEPLOY_SYSTEM_ENDPOINT, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${DEPLOYED_SYSTEMS_ENDPOINT}`);

        yield put({
            type: GET_DEPLOYED_SYSTEMS_SUCCESS,
            payload: rsp.data
        });

        yield call(handleNotification, {
            message: "Config Deploy Started",
            variant: 'success'
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* toggleSlaStatus(action) {
    try {
        const {id} = action;

        yield call(axios.post, TOGGLE_SLA_STATUS, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: `Sla status changed successfully`,
            variant: 'success'
        });

        yield put({
            type: GET_SLA,
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* toggleFilesetStatus(action) {
    try {
        const {id} = action;

        yield call(axios.post, TOGGLE_FILESET_STATUS, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: `Fileset status changed successfully`,
            variant: 'success'
        });

        yield put({
            type: GET_FILESETS,
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* toggleHypervisorStatus(action) {
    try {
        const {id} = action;

        yield call(axios.post, TOGGLE_HYPERVISOR_STATUS, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: `Hypervisor status changed successfully`,
            variant: 'success'
        });

        yield put({
            type: GET_HYPERVISORS,
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* toggleHypervisorManagerStatus(action) {
    try {
        const {id} = action;

        yield call(axios.post, TOGGLE_HYPERVISOR_MANAGER_STATUS, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: `Hypervisor Manager status changed successfully`,
            variant: 'success'
        });

        yield put({
            type: GET_HYPERVISOR_MANAGERS,
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* toggleVMStatus(action) {
    try {
        const {id} = action;

        yield call(axios.post, TOGGLE_VM_STATUS, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield call(handleNotification, {
            message: `VM status changed successfully`,
            variant: 'success'
        });

        yield put({
            type: GET_VMS,
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* checkDeployStatus(action) {
    try {
        const {id} = action;

        yield call(axios.post, FETCH_LOGS_ENDPOINT, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        const rsp = yield call(axios.get, `${DEPLOYED_SYSTEMS_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

        yield put({
            type: UPDATE_DEPLOYED_SYSTEM_STATUS,
            payload: rsp.data
        });

        if (rsp.data.status === 'SUCCESS')
            yield call(handleNotification, {
                message: `Deployment of config id: ${id} completed`,
                variant: 'success'
            });

        if (rsp.data.status === 'FAILED')
            yield call(handleNotification, {
                message: `Error occured in deploying config with id: ${id}`,
                variant: 'error'
            });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* fetchLogs(action) {
    try {
        const {id} = action;

        yield call(axios.post, FETCH_LOGS_ENDPOINT, {id}, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });

    } catch (e) {
        console.log("Failed because", e);

        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}


function* handleNotification({message, variant}) {
    let notification = {
        message: message,
        options: {
            key: new Date().getTime() + Math.random(),
            variant: variant,
            anchorOrigin: {
                horizontal: 'right',
                vertical: 'top'
            }
        }
    };

    const key = notification.options && notification.options.key;

    yield put({
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            key: key || new Date().getTime() + Math.random(),
        }
    });
}


export default function* brahma() {
    yield all([
        takeEvery(ADD_SLA, addSla),
        takeEvery(ADD_VM, addVM),
        takeEvery(ADD_HYPERVISOR_MANAGER, addHypervisorManager),
        takeEvery(ADD_FREQUENCY_TO_SLA, addFrequencyToSla),
        takeEvery(ADD_HYPERVISOR, addHypervisor),
        takeEvery(ADD_FILESET, addFileset),
        takeEvery(ADD_DATASTORE, addDatastore),
        takeEvery(ADD_PATH_TO_FILESET, addPathToFileset),
        takeEvery(ADD_EXCEPTION_TO_FILESET, addExceptionToFileset),
        takeEvery(ADD_EXCLUDE_TO_FILESET, addExcludeToFileset),
        takeEvery(ADD_COMMAND_TO_VM, addCommandToVM),
        takeEvery(ADD_CONFIG, addConfig),
        takeEvery(ADD_DISK, addDisk),
        takeLatest(GET_SLA, getSlas),
        takeLatest(GET_VMS, getVMs),
        takeLatest(GET_FILESETS, get_filesets),
        takeLatest(GET_HYPERVISORS, get_hypervisors),
        takeLatest(GET_HYPERVISOR_MANAGERS, get_hypervisor_managers),
        takeLatest(GET_CONFIG, getConfigs),
        takeLatest(GET_DEPLOYED_SYSTEMS, getDeployedSystems),
        takeEvery(DELETE_VM, deleteVm),
        takeEvery(DELETE_HYPERVISOR, deleteHypervisor),
        takeEvery(DELETE_HYPERVISOR_MANAGER, deleteHypervisorManager),
        takeEvery(DELETE_FILESET, deleteFileset),
        takeEvery(DELETE_SLA, deleteSla),
        takeEvery(DELETE_CONFIG, deleteConfig),
        takeEvery(DELETE_DEPLOYMENT, deleteDeployment),
        takeEvery(DELETE_FREQUENCY, deleteFrequency),
        takeEvery(DELETE_DATASTORE, deleteDatastore),
        takeEvery(DELETE_DISK, deleteDisk),
        takeEvery(REMOVE_PATH_FROM_FILESET, removePathFromFileset),
        takeEvery(REMOVE_EXCEPTION_FROM_FILESET, removeExceptionFromFileset),
        takeEvery(REMOVE_EXCLUDE_FROM_FILESET, removeExcludeFromFileset),
        takeEvery(REMOVE_COMMAND_FROM_VM, removeCommandFromVM),
        takeEvery(DEPLOY_SYSTEM, deploySystem),
        takeEvery(CHECK_DEPLOYED_SYSTEM_STATUS, checkDeployStatus),
        takeEvery(SLA_TOGGLE_STATUS, toggleSlaStatus),
        takeEvery(FILESET_TOGGLE_STATUS, toggleFilesetStatus),
        takeEvery(HYPERVISOR_TOGGLE_STATUS, toggleHypervisorStatus),
        takeEvery(HYPERVISOR_MANAGER_TOGGLE_STATUS, toggleHypervisorManagerStatus),
        takeEvery(VM_TOGGLE_STATUS, toggleVMStatus),
        takeEvery(FETCH_LOGS, fetchLogs)
    ]);
}
