import {
    ADD_TEST_CASE_SUCCESS,
    ADD_TEST_RESULT_SUCCESS,
    BULK_IMPORT_SYSTEM_TEST_CASE_SUCCESS,
    BULK_IMPORT_SYSTEM_TEST_RESULT_SUCCESS,
    DELETE_TEST_CASE_SUCCESS,
    DELETE_TEST_RESULT_SUCCESS,
    GET_BRANCHES_SUCCESS,
    GET_PRODUCTS_SUCCESS,
    GET_REPOSITORIES_SUCCESS,
    GET_TEST_CASE_LIST_SUCCESS,
    GET_TEST_CATEGORY_LIST_SUCCESS,
    GET_TEST_FRAMEWORK_LIST_SUCCESS,
    GET_TEST_RESULT_LIST_SUCCESS,
    GET_TEST_STATUS_LIST_SUCCESS,
    GET_TRIAGE_RESOLUTION_LIST_SUCCESS,
    GET_TRIAGE_STATUS_LIST_SUCCESS,
    GET_USERS_SUCCESS,
    GET_VERSIONS_SUCCESS,
    UPDATE_TEST_CASE_SUCCESS,
    UPDATE_TEST_RESULT_SUCCESS
} from "../actions/types";

import _ from "lodash"

const initialState = {
    users: {
        'count': 0,
        'results': []
    },
    repositories: {
        'count': 0,
        'results': []
    },
    products: {
        'count': 0,
        'results': []
    },
    branches: {
        'count': 0,
        'results': []
    },
    versions: {
        'count': 0,
        'results': []
    },
    test_status: {
        'count': 0,
        'results': []
    },
    triage_status: {
        'count': 0,
        'results': []
    },
    triage_resoltion: {
        'count': 0,
        'results': []
    },
    test_framworks: {
        'count': 0,
        'results': []
    },
    test_category: {
        'count': 0,
        'results': []
    },
    testCases: {
        'count': 0,
        'results': []
    },
    testResults: {
        'count': 0,
        'results': []
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case (GET_USERS_SUCCESS):
            return {
                ...state,
                users: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.users['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_REPOSITORIES_SUCCESS):
            return {
                ...state,
                repositories: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.repositories['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_PRODUCTS_SUCCESS):
            return {
                ...state,
                products: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.products['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_BRANCHES_SUCCESS):
            return {
                ...state,
                branches: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.branches['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_VERSIONS_SUCCESS):
            return {
                ...state,
                versions: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.versions['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_TEST_STATUS_LIST_SUCCESS):
            return {
                ...state,
                test_status: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.test_status['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_TRIAGE_STATUS_LIST_SUCCESS):
            return {
                ...state,
                triage_status: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.triage_status['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_TRIAGE_RESOLUTION_LIST_SUCCESS):
            return {
                ...state,
                triage_resoltion: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.triage_resoltion['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_TEST_FRAMEWORK_LIST_SUCCESS):
            return {
                ...state,
                test_framworks: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.test_framworks['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_TEST_CATEGORY_LIST_SUCCESS):
            return {
                ...state,
                test_category: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.test_category['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_TEST_CASE_LIST_SUCCESS):
            return {
                ...state,
                testCases: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.testCases['results'], ...action.payload['results']], "id")
                }
            };
        case(GET_TEST_RESULT_LIST_SUCCESS):
            return {
                ...state,
                testResults: {
                    'count': action.payload['count'],
                    'results': _.uniqBy([...state.testResults['results'], ...action.payload['results']], "id")
                }
            };
        case(ADD_TEST_CASE_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
                testCases: {
                    'count': action.payload['count'],
                    'results': _.orderBy(_.uniqBy([...state.testCases['results'].filter(testCase => testCase.id !== action.payload.id), action.payload], "id"), "id", ["desc"])
                }
            };
        case(ADD_TEST_RESULT_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
                testResults: {
                    'count': action.payload['count'],
                    'results': _.orderBy(_.uniqBy([...state.testResults['results'].filter(testResult => testResult.id !== action.payload.id), action.payload], "id"), "id", ["desc"])
                }
            };
        case(UPDATE_TEST_CASE_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
                testCases: {
                    'count': action.payload['count'],
                    'results': _.orderBy(_.uniqBy([...state.testCases['results'].filter(testCase => testCase.id !== action.payload.id), action.payload], "id"), "id", ["desc"])
                }
            };
        case(UPDATE_TEST_RESULT_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
                testResults: {
                    'count': action.payload['count'],
                    'results': _.orderBy(_.uniqBy([...state.testResults['results'].filter(testResult => testResult.id !== action.payload.id), action.payload], "id"), "id", ["desc"])
                }
            };
        case(DELETE_TEST_CASE_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
                testCases: {
                    'count': state.testCases['count'] - 1,
                    'results': _.orderBy(state.testCases['results'].filter(testCase => testCase.id !== action.payload), "id", ["desc"])
                }
            };
        case(DELETE_TEST_RESULT_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
                testResults: {
                    'count': state.testResults['count'] - 1,
                    'results': _.orderBy(state.testResults['results'].filter(testResult => testResult.id !== action.payload), "id", ["desc"])
                }
            };
        case (BULK_IMPORT_SYSTEM_TEST_CASE_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
            };
        case (BULK_IMPORT_SYSTEM_TEST_RESULT_SUCCESS):
            console.log(action.payload);
            return {
                ...state,
            };
        default:
            return state;
    }
}


