import React, {Component} from 'react';
import SystemBarGraph from "./SystemBarGraph";
import * as PropTypes from "prop-types";
import * as _ from "lodash";

class SystemBarGraphBlock extends Component {
    constructor(props) {
        super(props);

        this.wrapperRef = React.createRef();

        this.state = {
            width: null,
        }
    }

    componentDidMount() {
        if (!_.isEmpty(this.wrapperRef) &&
            !_.isEmpty(this.wrapperRef.current) &&
            !_.isEqual(this.wrapperRef.current.clientWidth, this.state.width)) {
            this.setState({width: this.wrapperRef.current.clientWidth});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEmpty(this.wrapperRef) &&
            !_.isEmpty(this.wrapperRef.current) &&
            !_.isEqual(this.wrapperRef.current.clientWidth, this.state.width)) {
            this.setState({width: this.wrapperRef.current.clientWidth});
        }
    }

    render() {
        const {width} = this.state;

        return (
            <div className="data-card run-graph" ref={this.wrapperRef}>
                {!_.isEmpty(this.props.title) &&
                <div className="big-card-title half-title"
                     style={{paddingTop: "10px"}}>{this.props.title}</div>
                }
                {!_.isNull(width) &&
                <SystemBarGraph {...this.props} width={width}/>}
            </div>
        );
    }
}

SystemBarGraph.propTypes = {
    title: PropTypes.string,
};

export default SystemBarGraphBlock;