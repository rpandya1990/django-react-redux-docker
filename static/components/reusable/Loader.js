import React, {Component} from 'react';
import '../../css/Loader.css'

class Loader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
        };
    }

    getLoaderClass = () => {
        if (this.props.small) {
            return "small-loader";
        }
        if (this.props.medium) {
            return "medium-loader";
        }
        return "loader";
    };

    render() {
        return (
            <div className="d-flex justify-content-center align-content-center flex-wrap"
                 style={{
                     ...this.props.style,
                     display: this.state.show ? "inline-block" : "none",
                     width: this.props.width,
                     height: this.props.height
                 }}>
                <div className={this.getLoaderClass()}/>
            </div>
        );
    }
}

export default Loader;