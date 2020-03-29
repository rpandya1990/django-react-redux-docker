import axios from "axios";
import {DESTINY_GET_SUITES_ENDPOINT} from "../api/endpoints";
import {DESTINY_GET_SUITES, DESTINY_GET_SUITES_SUCCESS} from "../actions/types";
import {all, call, put, takeEvery} from 'redux-saga/effects';


function* getDestinyGetSuites(action) {
    try {
        const rawContext = yield call(axios.get, `${DESTINY_GET_SUITES_ENDPOINT}?${action.getParams}`);
        yield put({
            type: DESTINY_GET_SUITES_SUCCESS,
            payload: rawContext.data
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}


export default function* generalData() {
    yield all([
        takeEvery(DESTINY_GET_SUITES, getDestinyGetSuites)
    ]);
}