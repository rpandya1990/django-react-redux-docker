import React, {Component} from 'react';
import Chart from "react-google-charts";

import "../../../css/TestStateSummary.css"
import Loader from "../../reusable/Loader";
import {getStatusColor} from "../../../utils"
import * as _ from "lodash";

const colorMap = {
    success: "#43a047",
    skip: "#c0ca33",
    notrun: "#eceff1",
    xfail: "#cddc39",
    uxpass: "#ef9a9a",
    error: "#d32f2f",
    fail: "#e57373"
};

const labelMap = {
    success: "Success",
    skip: "Skip",
    notrun: "Not Run",
    xfail: "XFail",
    uxpass: "#UXPass",
    error: "Error",
    fail: "Fail"
};

class BuildSummaryPieChart extends Component {
    constructor(props) {
        super(props);
    }

    getStatusColor = status => {
        return colorMap[status];
    };

    getLabel = status => {
        return labelMap[status];
    };

    renderChart = chartData => {
        let chartLabels = [['State', 'Percentage'],];
        let chartColors = [];

        for (const piece of chartData) {
            chartLabels.push([this.getLabel(piece['label']), piece['value']]);
            chartColors.push(this.getStatusColor(piece['label']));
        }

        const pieOptions = {
            colors: chartColors,
            tooltip: {
                showColorCode: true
            },
            legend: {
                position: "right",
                alignment: "center",
            },
            fontName: "Roboto",
            fontSize: 18,
        };

        return (
            <Chart
                width={'1100px'}
                height={'500px'}
                chartType="PieChart"
                loader={<Loader width="100%" height="400px"/>}
                data={chartLabels}
                options={pieOptions}
            />
        )
    };

    render() {
        if (!this.props.fetching && _.isEmpty(this.props.data)) {
            return <div className="load-data-button-container" onClick={() => {
                this.props.handleFetchData();
            }}>
                <div className="load-data-button">Render Summary</div>
            </div>
        }

        if (!this.props.data || Object.keys(this.props.data).length === 0) {
            return <Loader width="100%" height="400px"/>
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        {this.renderChart(this.props.data)}
                    </div>
                </div>
            </div>
        );
    }
}

export default BuildSummaryPieChart;