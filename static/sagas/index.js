import {fork, all} from "redux-saga/effects";
import homePage from "./homePage"


export default function* rootSaga() {
    yield all([
        fork(homePage)
    ]);
}
