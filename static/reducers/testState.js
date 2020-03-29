import {
    ADD_TEST_STATE_ACROSS_BUILDS,
    FINISHED_ADDING_TEST_STATE_ACROSS_BUILDS,
    GET_PQD_TITLE,
    GET_TEST_STATE_ACROSS_BUILDS,
    GET_TEST_STATE_BREAKDOWN,
    GET_TEST_STATE_SUMMARY,
    TOGGLE_ADD_TABLE_ROWS_PERMISSION
} from "../actions/types.js";
import * as _ from "lodash";

const initialState = {
    canAddTableRows: false,
    addingTableRows: false,
    title: "",
    testStateSummary: {},
    testStateBreakDown: {},
    testStateData: {},
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_PQD_TITLE:
            let titles = action.payload;
            titles.sort();
            titles = titles.join(" / ");
            return {
                ...state,
                title: titles
            };
        case GET_TEST_STATE_SUMMARY:
            return {
                ...state,
                testStateSummary: {
                    ...state.testStateSummary,
                    [action.key]: action.payload
                }
            };
        case GET_TEST_STATE_BREAKDOWN:
            return {
                ...state,
                testStateBreakDown: {
                    ...state.testStateBreakDown,
                    [action.key]: action.payload
                }
            };
        case GET_TEST_STATE_ACROSS_BUILDS:
            return {
                ...state,
                testStateData: {
                    ...state.testStateData,
                    [action.key]: action.payload
                },
                addingTableRows: true
            };
        case ADD_TEST_STATE_ACROSS_BUILDS:
            return {
                ...state,
                testStateData: {
                    ...state.testStateData,
                    [action.key]: {
                        ...state.testStateData[action.key],
                        results: _.has(state.testStateData, action.key) && _.has(state.testStateData[action.key], 'results') ?
                            state.testStateData[action.key]['results'].concat(action.payload.results) :
                            action.payload.results
                    }
                },
                addingTableRows: true
            };
        case FINISHED_ADDING_TEST_STATE_ACROSS_BUILDS:
            return {
                ...state,
                addingTableRows: false,
            };
        case TOGGLE_ADD_TABLE_ROWS_PERMISSION:
            return {
                ...state,
                canAddTableRows: action.value,
            };
        default:
            return state;
    }
}
