import React from "react";
import "../../css/Dashboard.css";
import {preventInputCursorChange} from "../../utils";
import * as PropTypes from "prop-types";


class Filter extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            focused: this.props.focused,
            titleFontSize: this.props.titleFontSize,
            inputValue: this.props.value,
            index: -1
        };
    }

    outsideClick = () => {
        this.setState({focused: false});
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.focused) {
            window.addEventListener("click", this.outsideClick);
            if (!prevState.focused) {
                this.props.onFocus(this.props.value);
            }
        } else {
            window.removeEventListener("click", this.outsideClick)
        }

        if (this.props.focused !== prevProps.focused) {
            this.setState({focused: this.props.focused});
        }

        if (prevState.index !== this.state.index) {
            this.props.handleChange(this.props.dropdownData[this.state.index]);
        }
    }

    handleInputOnKeyUp = (e) => {
        if (e.key === "Enter") {
            this.props.handleFilterEnter(e.target.value);
        }
        if (this.props.dropdownData.length) {
            if (e.key === "ArrowDown") {
                if (this.state.index < this.props.dropdownData.length - 1) {
                    this.setState({
                        index: this.state.index + 1,
                    });
                }
            } else if (e.key === "ArrowUp") {
                if (this.state.index > 0) {
                    this.setState({
                        index: this.state.index - 1,
                    });
                }
            }
        }
        e.persist();
        this.props.handleKeyUp(e);
    };

    handleDropDownRowClick = (e, datum) => {
        this.props.handleFilterEnter(datum);
    };

    handleInputFocus = (e) => {
        e.stopPropagation();
        this.props.handleClick();
        let compStyles = window.getComputedStyle(this.inputFilter);
        let fontSize = parseInt(compStyles.getPropertyValue("font-size"));
        if (!this.state.focused) {
            this.setState({
                focused: true,
                showCancel: true
            })
        }
        this.inputFilter.focus();
    };

    handleCancelClick = () => {
        this.props.handleChange(this.props.defaultValue);
    };

    onChange = e => {
        this.props.handleChange(e.target.value);
    };

    componentWillUnmount() {
        window.removeEventListener("click", this.outsideClick);
    }

    render() {
        return (
            <div onClick={this.handleInputFocus} style={{position: "relative", padding: "6px 0", ...this.props.style}}>
                <div>
                    <input ref={node => this.inputFilter = node} onKeyUp={this.handleInputOnKeyUp}
                           onKeyDown={preventInputCursorChange} className="input-filter" type="text"
                           style={{padding: "8px 5px 2px", borderBottom: this.state.focused ? "1px solid white" : "1px solid rgb(180,180,180)"}}
                           value={!this.state.focused ? "" : this.props.value}
                           onChange={this.onChange}
                           disabled={this.props.disabled}/>
                    <div className="input-bottom-border" style={this.state.focused ? {
                        width: "100%",
                        padding: "0 5px",
                        backgroundColor: this.props.disabled ? "rgb(220,220,220)" : this.props.focusColor
                    } : {}}/>
                </div>
                <div ref={node => this.titleNode = node}
                     className="input-title" style={this.state.focused ? {
                    transform: "translate(-10px, -20px) scale(0.78)",
                    color: this.props.disabled ? "rgb(150,150,150)" : this.props.focusColor,
                } : {}}>{this.props.title}</div>
                <i onClick={this.handleCancelClick} ref={node => this.cancel = node}
                   style={{display: this.state.focused ? "block" : "none"}} className="material-icons cancel">cancel</i>
                {(this.state.focused && this.props.dropdownData.length) ?
                    <div className="filter-dropdown">
                        {
                            this.props.dropdownData.map(
                                (datum, i) =>
                                    <div onClick={(e) => this.handleDropDownRowClick(e, datum)} className="filter-item" key={datum} style={{
                                        color: i === this.state.index ? "black" : "rgb(100,100,100)",
                                        cursor: "pointer",
                                        padding: "2px 30px 2px 8px",
                                        fontSize: "13.6px",
                                        backgroundColor: i === this.state.index && "rgb(243,243,245)"
                                    }}>{datum}</div>
                            )
                        }
                    </div> : <span/>}
            </div>
        )
    }
}

Filter.propTypes = {
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    handleFilterEnter: PropTypes.func.isRequired
};


Filter.defaultProps = {
    value: "",
    titleFontSize: "14px",
    focusColor: "rgb(0, 125, 255)",
    dropdownData: [],
    focused: false,
    disabled: false,
    handleKeyUp: () => {
    },
    handleClick: () => {
    },
    onFocus: () => {
    }
};


export default Filter;