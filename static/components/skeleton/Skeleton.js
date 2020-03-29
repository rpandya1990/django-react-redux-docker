import React, {Component, Fragment} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import TopNav from "./bones/TopNav";
import {extractGetParams} from "../../utils";
import DestinyDashboard from "../pages/Destiny/DestinyDashboard";
import {SnackbarProvider} from "notistack";
import Notifier from "../reusable/Notifier";

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
                <Notifier/>
                <Fragment>
                    <Route path="*" render={(props) => <TopNav pathname={props.history.location.pathname}/>}/>
                </Fragment>
            </SnackbarProvider>
        )
    }
}


export default Skeleton;
