import React from "react";
import {Arrow} from "./Icons";


class DropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.mouseTimeOut = null;

        this.openButtonStyle = Object.assign({
            color: "rgb(250,250,250)",
            backgroundColor: "rgb(27,34,51)",
        }, this.props.openButtonStyle);

        this.closedButtonStyle = this.props.closedButtonStyle || {};
    }

    mapItems = (data) => {
        return Object.keys(data).map(datum => {
                return (
                    <div onClick={() => this.props.handleClick(datum)} key={datum} className="tab" style={data[datum] ? {backgroundColor: "rgb(27,34,51)", color: "rgb(250,250,250)"} : {}}>
                        {data[datum] ?
                            (<i data-id={datum}
                               className="material-icons check"
                               style={{
                                   marginBottom: "-1px",
                                   marginRight: "auto",
                                   fontSize: "1.15em",
                               }}>check_box</i>) :
                            (<i data-id={datum}
                               className="material-icons check"
                               style={{
                                   marginBottom: "-1px",
                                   marginRight: "auto",
                                   fontSize: "1.15em",
                                   color: "rgb(180,180,180)"
                               }}>check_box_outline_blank</i>)
                        }
                        <span style={{marginLeft: "10px"}}>{datum}</span>
                    </div>
                )
            }
        )
    };

    onMouseEnter = () => {
        window.clearTimeout(this.mouseTimeOut);
        this.setState({open: true});
    };

    onMouseLeave = () => {
        this.mouseTimeOut = window.setTimeout(() => {
            this.setState({open: false});
        }, 1000)
    };

    handleDropDownData = (props) => {
        let {data, handleSubmit} = props;
        let items = this.mapItems(data);
        if (handleSubmit) {
            items.push(
                <div className="tab extra" style={{display: "flex"}} onClick={handleSubmit}>
                    <i className="material-icons" style={{marginRight: "auto"}}>send</i>
                </div>
            )
        }
        return items;
    };

    render() {
        return (
            <div style={{animation: ".5s fade-in", position: "relative", ...this.props.style}} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                <div className="drop-down-button" style={this.state.open ? this.openButtonStyle : this.closedButtonStyle}>
                    <span>{this.props.title}</span>
                    <Arrow flip={this.state.open} defaultState="down"/>
                </div>
                <div className="drop-down" style={
                        Object.assign({}, this.props.dropDownStyle, this.state.open ? {
                            visibility: "visible",
                            opacity: 1,
                            transform: "translate(15px, -2px)"
                        } : {visibility: "hidden", opacity: 0, transform: "translate(15px, -7px)"}, this.props.alignment === "left" ? {} : {right: 0})
                    }
                >
                    {
                        !this.props.children ?
                        this.handleDropDownData(this.props)
                        :  this.props.children
                    }
                </div>
            </div>
        )
    }
}


DropDown.defaultProps = {
    style: {},
    dropDownStyle: {},
    openButtonStyle: {},
    data: {},
    alignment: "left"
};


export default DropDown;
