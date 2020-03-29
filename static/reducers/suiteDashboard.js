import {
    GET_MANAGER_SUITE_TREE_SUCCESS,
    GET_MANAGER_SUITE_TREE,
    CHANGE_TR_TRIAGE_STATUS_SUCCESS,
    CHANGE_TR_ISSUE_LINK_SUCCESS,
    GET_MANAGERS_SUITES_SUCCESS,
    UPDATE_INFO
} from "../actions/types.js";
import _ from "lodash";


const initialState = {
    suiteTrees: {
        columns: [],
        children: {},
    },
    loading: 0,
    updatedInfo: {},
    managerSuites: {}
};

export default function (state=initialState, action) {
    switch(action.type) {
        case GET_MANAGER_SUITE_TREE_SUCCESS:
            let newState = {
                ...state,
                loading: state.loading - 1,
                suiteTrees: {
                    children: {
                        ...state.suiteTrees.children,
                        ...action.payload.children
                    },
                },
            };
            if (_.isEmpty(newState.suiteTrees.columns)) {
                newState.suiteTrees.columns = action.payload.columns;
            }
            // let displayTreeBranch = {};
            // let childToParentBranch = {};
            // findInitialState(action.payload.children, displayTreeBranch, childToParentBranch);
            // newState.displayTree = Object.assign({}, newState.displayTree, displayTreeBranch);
            // newState.childToParent = Object.assign({}, newState.childToParent, childToParentBranch);
            return newState;
        case GET_MANAGER_SUITE_TREE:
            return {
                ...state,
                loading: state.loading + 1
            };
        case UPDATE_INFO:
        case CHANGE_TR_TRIAGE_STATUS_SUCCESS:
            return {
                ...state,
                updatedInfo: {
                    ...state.updatedInfo,
                    [action.id]: {
                        ...state.updatedInfo[action.id],
                        ...action.payload
                    }
                }
            };
        case CHANGE_TR_ISSUE_LINK_SUCCESS:
            return {
                ...state,
                updatedInfo: {
                    ...state.updatedInfo,
                    [action.id]: {
                        ...state.updatedInfo[action.id],
                        ...action.payload
                    }
                }
            };
        case GET_MANAGERS_SUITES_SUCCESS:
            return {
                ...state,
                managerSuites: {
                    ...state.managerSuites,
                    [action.manager]: {
                        ...state.managerSuites[action.manager],
                        ...action.payload
                    }
                }
            };
        default:
            return state;
    }
}