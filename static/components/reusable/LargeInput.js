import React from "react";
import _ from "lodash";
import {preventInputCursorChange} from "../../utils";


class LargeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: -1,
            focused: false,
        }
    }

    loseFocus = () => {
        this.setState({focused: false});
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.index !== prevState.index) {
            this.props.handleKeyUp(this.props.data[this.state.index]);
        }
        if (this.state.focused) {
            if (!prevState.focused) {
                this.props.handleKeyUp(this.props.value);
            }
            window.addEventListener("click", this.loseFocus);
        } else {
            window.removeEventListener("click", this.loseFocus);
        }
        if (!_.isEqual(this.props.data, prevProps.data)) {
            this.setState({index: -1});
        }
    }

    onChange = (e) => {
        const value = e.target.value;
        this.props.handleKeyUp(value);
    };

    onKeyUp = (e) => {
        const value = e.target.value;
        if (e.key === "Enter") {
            return this.props.handleEnter(value);
        }
        if (this.props.data.length) {
            if (e.key === "ArrowDown") {
                if (this.state.index < this.props.data.length - 1) {
                    this.setState({
                        index: this.state.index + 1,
                    });
                }
                return;
            } else if (e.key === "ArrowUp") {
                if (this.state.index > 0) {
                    return this.setState({
                        index: this.state.index - 1,
                    });
                }
                return;
            }
        }
        this.props.getResults(value);
    };

    componentWillUnmount() {
        window.removeEventListener("click", this.loseFocus);
    }

    handleEnter = (datum) => {
        this.loseFocus();
        this.props.handleEnter(datum);
    };

    render() {
        return (
            <div style={{animation: ".5s fade-in", height: this.props.height, ...this.props.style}} onClick={(e) => e.stopPropagation()}>
                <div style={{display: "flex", alignItems: "center", height: "100%"}}>
                    <input type="text" className={this.props.inputClass} value={this.props.value} onFocus={() => this.setState({focused: true})} onKeyUp={this.onKeyUp} onKeyDown={preventInputCursorChange} onChange={this.onChange}/>
                    <i className="material-icons" style={{color: "rgba(226, 155, 10, .7)", cursor: "pointer"}} onClick={() => this.props.handleEnter(this.props.value)}>
                        search
                    </i>
                </div>
                {
                    (this.state.focused && !_.isEmpty(this.props.data)) &&
                <div
                    className="large-input-dropdown"
                    style={{
                        position: "absolute",
                        backgroundColor: "white",
                        border: "1px solid rgb(200,200,200)",
                        fontSize: "15px",
                        borderTop: "none",
                        transform: "translateX(14px)",
                    }}
                >
                    {this.props.data.map((datum, i) =>
                        <div key={datum} onClick={() => this.handleEnter(datum)} className="large-input-tab"
                             style={this.state.index === i ? {
                                 color: "black",
                                 backgroundColor: "rgb(247,247,247)"
                             } : {}}>{datum}</div>
                    )}
                </div>
                }
            </div>
        )
    }
}


LargeInput.defaultProps = {
    data: [],
    height: "34px",
    inputClass: "suite-search"
};


export default LargeInput;
