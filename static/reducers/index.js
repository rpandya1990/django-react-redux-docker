import {combineReducers} from "redux";
import testState from "./testState";
import topNav from "./topNav";
import generalData from "./generalData";
import qualityDashboard from "./qualityDashboard";
import performanceMetric from "./performanceMetric"
import destinyDashboard from "./destinyDashboard"
import qualityMetrics from "./qualityMetrics";
import brahma from './brahma';
import suiteDashboard from "./suiteDashboard";


export default combineReducers({
    testState: testState,
    topNav: topNav,
    generalData: generalData,
    qualityDashboard: qualityDashboard,
    performanceMetric: performanceMetric,
    qualityMetrics: qualityMetrics,
    destinyDashboard: destinyDashboard,
    brahma: brahma,
    suiteDashboard
});
