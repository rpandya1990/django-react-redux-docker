import axios from "axios";

import {
    TARA_APP_LIST
} from "../api/endpoints";

import {
    GET_APP_LIST
} from "./types";


export const getAppList = () => dispatch => {
    axios
        .get(TARA_APP_LIST)
        .then(res => {
            dispatch({
                type: GET_APP_LIST,
                payload: res.data
            });
        })
        .catch(err => {
            console.log(err);
        });
};
