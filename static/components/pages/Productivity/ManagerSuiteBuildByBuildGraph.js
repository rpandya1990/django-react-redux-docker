import React, {Component} from 'react';
import _ from "lodash";
import Loader from "../../reusable/Loader";
import LineGraph from "../../reusable/Charts/LineGraph";

class ManagerSuiteBuildByBuildGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
            isLoading: props.isLoading,
            graphData: this.getGraphData(props.data),
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isLoading: nextProps.isLoading,
            graphData: this.getGraphData(nextProps.data),
        });
    }

    getGraphData = data => {
        const graphData = {
            'domain': [],
            'data': {}
        };

        if (_.isEmpty(data)) {
            return graphData;
        }

        graphData['domain'] = data.allversions;
        graphData['data'] = data.data.graph_data;

        return graphData;
    };

    render() {
        const {graphData, isLoading} = this.state;

        if (_.isEmpty(graphData) || _.isEmpty(graphData['domain']) || _.isEmpty(graphData['data']) || isLoading) {
            return <Loader width="100%" height="450px"/>
        }

        return (
            <div id="manager-suite-build-by-build-graph" className="data-card run-graph">
                <LineGraph width={this.props.width} height={this.props.height} data={graphData['data']}
                           domain={graphData['domain']}/>
            </div>
        );
    }
}

ManagerSuiteBuildByBuildGraph.defaultProps = {
    width: 1230,
    height: 350
};

export default ManagerSuiteBuildByBuildGraph;