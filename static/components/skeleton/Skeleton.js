import React, {Component, Fragment} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import TopNav from "./bones/TopNav";
import {extractGetParams} from "../../utils";
import {SnackbarProvider} from "notistack";
import App from "../App"

import "../../css/Base.css";


class Skeleton extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    render() {
        return (
            <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}>
                <Fragment>
                    <Route path="/home" render={(props) => <App/>}/>
                </Fragment>
            </SnackbarProvider>
        )
    }
}


export default Skeleton;
