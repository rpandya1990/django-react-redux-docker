import {combineReducers} from "redux";
import homePage from "./homePage";
import topNav from "./topNav";


export default combineReducers({
    homePage: homePage,
    topNav: topNav
});
