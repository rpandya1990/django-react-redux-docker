import React, {Fragment} from "react";
import * as PropTypes from "prop-types";
import { Chart } from "react-google-charts";


class PerformanceQualityPieGraphBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    renderPieContainer = () => {
        let total = this.props.data.data.slice(1).map((item) => {return item[1]}).reduce((a,b) => a + b, 0);
        let options = {};
        if (this.props.data.hasOwnProperty('slice_data')) {
            options.slices = this.props.data.slice_data
        }
        return (
            <div className="data-card">
                <div style={{display: "flex", flexDirection: "column"}} >
                    <div style={{display: "flex"}} >
                        <div
                            style={{fontWeight: 1000, padding: "10px"}}>
                            {total}
                        </div>
                        <div
                            style={{padding: "10px", color: "rgb(160,160,160"}}>
                            Total {this.props.measurement}
                        </div>
                    </div>
                    <div  className="pie-container" style={{paddingLeft: "5px"}}>
                        <Chart
                          width={'400px'}
                          height={'300px'}
                          chartType="PieChart"
                          data={this.props.data.data}
                          options={options}
                          // rootProps={{ 'data-testid': '7' }}
                        />
                    </div>
                </div>
                <div className="half-title">{this.props.title}</div>
            </div>
        )
    };

    render() {
        return (
            <div style={{position: "relative", display: "flex", ...this.props.style}} className={this.props.className}>
                {this.renderPieContainer()}
            </div>
        )
    }
}

PerformanceQualityPieGraphBlock.propTypes = {
    title: PropTypes.string.isRequired,
    measurement: PropTypes.string.isRequired,
    data: PropTypes.object
};

PerformanceQualityPieGraphBlock.defaultProps = {
    hideFailures: false,
    smallTitle: false,
    style: {}
};


export default PerformanceQualityPieGraphBlock;
