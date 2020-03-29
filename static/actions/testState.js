import axios from "axios";
import {
    DESTINY_GET_SUITES_ENDPOINT,
    DESTINY_TEST_STATE_ACROSS_BUILDS_ENDPOINT,
    DESTINY_TEST_STATE_BREAKDOWN_ENDPOINT,
    DESTINY_TEST_STATE_SUMMARY_ENDPOINT
} from "../api/endpoints";
import {
    ADD_TEST_STATE_ACROSS_BUILDS,
    DECREMENT_FETCHING,
    FINISHED_ADDING_TEST_STATE_ACROSS_BUILDS,
    GET_PQD_TITLE,
    GET_TEST_STATE_ACROSS_BUILDS,
    GET_TEST_STATE_BREAKDOWN,
    GET_TEST_STATE_SUMMARY,
    INCREMENT_FETCHING,
    TOGGLE_ADD_TABLE_ROWS_PERMISSION
} from "./types";


export const incrementFetching = value => dispatch => {
    dispatch({
        type: INCREMENT_FETCHING,
        value: value
    });
};


export const decrementFetching = value => dispatch => {
    dispatch({
        type: DECREMENT_FETCHING,
        value: value
    });
};


export const getTitle = (ids, suites) => dispatch => {
    const params = new URLSearchParams();
    if (suites && suites.length) {
        return dispatch({
            type: GET_PQD_TITLE,
            payload: suites
        });
    }
    ids.map(id => {
        params.append('id', id);
    });
    axios
        .get(`${DESTINY_GET_SUITES_ENDPOINT}?${params.toString()}`)
        .then(res => {
            dispatch({
                type: GET_PQD_TITLE,
                payload: res.data
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getTestStateSummary = params => dispatch => {
    dispatch(incrementFetching(GET_TEST_STATE_SUMMARY));

    const keyParams = new URLSearchParams(params.toString());
    keyParams.delete("filters");
    keyParams.sort();

    axios
        .get(`${DESTINY_TEST_STATE_SUMMARY_ENDPOINT}?${params.toString()}`)
        .then(res => {
            dispatch({
                type: GET_TEST_STATE_SUMMARY,
                key: keyParams.toString(),
                payload: res.data
            });

            dispatch(decrementFetching(GET_TEST_STATE_SUMMARY));
        })
        .catch(err => {
            console.log(err);
        });
};


export const getTestStateBreakdown = params => dispatch => {
    dispatch(incrementFetching(GET_TEST_STATE_BREAKDOWN));

    const keyParams = new URLSearchParams(params.toString());
    keyParams.delete("filters");
    keyParams.sort();

    axios
        .get(`${DESTINY_TEST_STATE_BREAKDOWN_ENDPOINT}?${params.toString()}`)
        .then(res => {
            dispatch({
                type: GET_TEST_STATE_BREAKDOWN,
                key: keyParams.toString(),
                payload: res.data
            });
            dispatch(decrementFetching(GET_TEST_STATE_BREAKDOWN));
        })
        .catch(err => {
            console.log(err);
        });
};


export const loadMoreTestStateAcrossBuilds = params => (dispatch, getState) => {
    const keyParams = new URLSearchParams(params.toString());
    keyParams.delete("filters");
    keyParams.delete("page");
    keyParams.sort();

    axios
        .get(`${DESTINY_TEST_STATE_ACROSS_BUILDS_ENDPOINT}?${params.toString()}`)
        .then(res => {
            dispatch({
                type: ADD_TEST_STATE_ACROSS_BUILDS,
                key: keyParams.toString(),
                payload: res.data
            });

            if (res.data.next && getState().testState.canAddTableRows) {
                const nextPage = new URL(res.data.next);
                const nextParams = new URLSearchParams(nextPage.search);
                dispatch(loadMoreTestStateAcrossBuilds(nextParams));
            } else {
                dispatch({
                    type: FINISHED_ADDING_TEST_STATE_ACROSS_BUILDS,
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
};


export const getTestStateAcrossBuilds = params => (dispatch, getState) => {
    dispatch(incrementFetching(GET_TEST_STATE_ACROSS_BUILDS));

    const keyParams = new URLSearchParams(params.toString());
    keyParams.delete("filters");
    keyParams.sort();

    axios
        .get(`${DESTINY_TEST_STATE_ACROSS_BUILDS_ENDPOINT}?${params.toString()}`)
        .then(res => {
            dispatch({
                type: GET_TEST_STATE_ACROSS_BUILDS,
                key: keyParams.toString(),
                payload: res.data
            });
            dispatch(decrementFetching(GET_TEST_STATE_ACROSS_BUILDS));

            if (res.data.next && getState().testState.canAddTableRows) {
                const nextPage = new URL(res.data.next);
                const nextParams = new URLSearchParams(nextPage.search);
                dispatch(loadMoreTestStateAcrossBuilds(nextParams));
            } else {
                dispatch({
                    type: FINISHED_ADDING_TEST_STATE_ACROSS_BUILDS,
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
};


export const toggleFetchingPermissions = value => (dispatch) => {
    dispatch({
        type: TOGGLE_ADD_TABLE_ROWS_PERMISSION,
        value: value
    })
};
