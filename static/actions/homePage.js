import axios from "axios";

import {
    GET_ITEMS
} from "./types";

import {
    GET_ITEMS_ENDPOINT,
} from "../api/endpoints";


export const getItems = () => dispatch => {
    let axiosInstance = axios.create({timeout: 60 * 2 * 1000});
    axiosInstance
        .get(`${GET_ITEMS_ENDPOINT}`)
        .then(rsp => {
            dispatch({
                type: GET_ITEMS,
                payload: rsp.data
            });
        })
        .catch(err => {
            console.log(err);
        });
};