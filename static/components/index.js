import ReactDOM from "react-dom";
import {BrowserRouter as Router} from "react-router-dom";
import Skeleton from "./skeleton/Skeleton.js";
import React from "react";
import {Provider} from "react-redux";
import store from "../store";
import {SnackbarProvider} from "notistack";


ReactDOM.render((
        <Provider store={store}>
            <SnackbarProvider maxSnack={8}>
                <Router>
                    <Skeleton/>
                </Router>
            </SnackbarProvider>
        </Provider>
    ), document.getElementById("root")
);