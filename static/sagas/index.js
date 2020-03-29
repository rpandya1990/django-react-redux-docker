import {fork, all} from "redux-saga/effects";
import qualityDashboard from "./qualityDashboard";
import performanceMetric from "./performanceMetric";
import qualityMetrics from "./qualityMetrics"
import destinyDashboard from "./destinyDashboard";
import brahma from './brahma';
import generalData from './generalData';
import suiteDashboard from "./suiteDashboard";


export default function* rootSaga() {
    yield all([
        fork(qualityDashboard),
        fork(performanceMetric),
        fork(qualityMetrics),
        fork(destinyDashboard),
        fork(brahma),
        fork(suiteDashboard),
        fork(generalData)
    ]);
}
