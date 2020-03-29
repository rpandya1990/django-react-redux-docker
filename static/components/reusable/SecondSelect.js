import React from "react";


class SecondSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="nav-tab" style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}


export default SecondSelect;
