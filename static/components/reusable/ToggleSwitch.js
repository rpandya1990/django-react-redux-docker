import React from "react";
import "../../css/ToggleSwitch.css";


class ToggleSwitch extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{display: "flex", ...this.props.style}}>
                <label className="switch" onClick={this.props.onClick}>
                    <input type="checkbox" checked={this.props.checked} onChange={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}/>
                    <span className={"slider round " + this.props.sliderClass}/>
                </label>
                <div className="toggle-title">{this.props.title}</div>
            </div>
        )
    }
}

export default ToggleSwitch;
