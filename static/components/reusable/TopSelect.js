import React from "react";
import "../../css/Dashboard.css";
import {Arrow} from "./Icons";


class TopSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
        };
        // let selectedBranches = {};
        // for (const branch of this.props.branches) {
        //     selectedBranches[branch] = "false"
        // }

    }

    submitTime = () => {
        // function submitTime() {
        //     let checkboxes = document.getElementsByClassName("check");
        //     let url = window.location.origin+"/QualityDashboard/"+"?";
        //     for (let i = 0; i < checkboxes.length; i++) {
        //         if (checkboxes[i].innerHTML == "check_box") {
        //             if (checkboxes[i].dataset.id == "branch") {
        //                 url += ("branch=" + checkboxes[i].getAttribute("data-value") + "&")
        //             } else if (checkboxes[i].dataset.id == "pipeline") {
        //                 url += ("pipeline=" + checkboxes[i].getAttribute("data-value") + "&")
        //             }
        //         }
        //     }
        //     window.open(url + "start-date=" + startInput.value, target="_blank");
        // }
        // startInput.addEventListener("keyup", (event) => {
        //     if (event.keyCode == 13) {
        //         submitTime();
        //     }
        // });
    };

    hideButtonHandler = () => {
        this.setState((state, props) => ({show: !state.show}));
    };

    rowOnClick = () => {

    };

    render() {
        return (
            <div className="top-select" style={{transform: this.state.show ? "" : "translateY(-50px)", ...this.props.style}}>
                {/*<div className="hide-button" onClick={this.hideButtonHandler}>*/}
                {/*    <span>{this.state.show ? "Hide" : "Show"}</span>*/}
                {/*    <Arrow flip={this.state.show} defaultState="up"/>*/}
                {/*</div>*/}
                <div className="top-select-block" style={this.props.topSelectBlockStyle}>
                    <div style={{marginRight: this.props.endAlignContent ? "auto" : "none"}}>
                        <span style={{fontSize: "22px", padding: "0 25px", marginLeft: "15px", fontFamily: "Raleway"}}>{this.props.title}</span>
                    </div>
                    {this.props.children}
                </div>
            </div>
        )
    }
}


TopSelect.defaultProps = {
    children: [],
    endAlignContent: true,
    topSelectBlockStyle: {}
};


export default TopSelect;
