import React from "react";


class InputBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false
        }
    }

    handleKeyUp = (e) => {
        if (e.keyCode === 13) {
            this.props.handleEnter();
        }
    };

    render() {
        return (
            <div style={this.props.style}>
                <span className="input-box-title" style={Object.assign({}, this.state.focused ? {color: "rgb(0,125,255)"} : {})}>{this.props.title}</span>
                <input type="text" className="input-box" onFocus={() => this.setState({focused: true})} onBlur={() => this.setState({focused: false})} placeholder="Enter here" value={this.props.inputValue} onKeyUp={this.handleKeyUp} onChange={this.props.handleChange}/>
            </div>
        )
    }
}


InputBlock.defaultProps = {
    style: {}
};


export default InputBlock;
