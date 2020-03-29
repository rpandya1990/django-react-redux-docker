import React, {Fragment} from "react";
import * as PropTypes from "prop-types";
import { Chart } from "react-google-charts";
import {connect} from "react-redux";
import {
    changePerfMetricJiraTags,
    getPerformanceMetricData,
    getPreviousPerfMetrics,
    invalidateMetric,
    toggleBaseline
} from "../../../../actions/performanceMetric";
import Collapsible from "react-collapsible";
import Modal from "../../../reusable/Modal";
import TagsInput from "react-tagsinput";
import {getSearchParams, isURL} from "../../../../utils";
import {redirectFeatureTableauDash} from "../../../../actions/qualityDashboard";
import Loader from "../../../reusable/Loader";

class PerformanceMetric extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            perfModalCompareVersions: []
        }
    }

    componentDidMount() {
        this.props.getPreviousPerfMetrics(this.props.match.params.id, 10);
        this.props.getPerformanceMetricData(this.props.match.params.id);
    }
    
    addPerfMetricJiraTags = (jira_tags) => {
        this.props.changePerfMetricJiraTags(this.props.match.params.id, jira_tags);
    };

    handlePerfComparison = (compare_tags) => {

        this.setState({perfModalCompareVersions: compare_tags});
        this.props.getPreviousPerfMetrics(this.props.match.params.id, 10, compare_tags)
    };

    renderJira = (branch, id, previous_metrics) => {
        if (previous_metrics !== undefined && previous_metrics.hasOwnProperty(branch)) {
            // Merge metric specific JIRAs with previous metrics JIRAs
            let prev_jiras = new Set();
            let cur_jiras = new Set(this.props.performance_metric_data[this.props.match.params.id]["jira_tags"]);
            for (let metric of previous_metrics[branch]) {
                if (metric["id"] != id && "data" in metric && "jira_tags" in metric["data"]) {
                    metric["data"]["jira_tags"].forEach(item => prev_jiras.add(item));
                }
            }
            // Remove cur jiras from prev jiras
            prev_jiras = new Set([...prev_jiras].filter(x => !cur_jiras.has(x)));
            let previousItems = [];
            for (let jira of prev_jiras.values()) {
                let ref = isURL(jira) ? jira : "https://rubrik.atlassian.net/browse/" + jira;
                previousItems.push(<li key={jira}><a href={ref}>{ref}</a></li>);
            }
            let jiraItems = [];
            for (let jira of cur_jiras.values()) {
                let ref = isURL(jira) ? jira : "https://rubrik.atlassian.net/browse/"+jira;
                jiraItems.push(<li key={jira}><a href= {ref}>{ref}</a></li>);
            }
            return (
                <Fragment>
                    <ol>
                        {jiraItems}
                    </ol>
                    {!this.props.fetchingPreviousPerfMetrics && previousItems.length > 0 &&
                        <Fragment>
                            Previous JIRAs:
                            <ol>
                                {previousItems}
                            </ol>
                        </Fragment>}
                </Fragment>
            )
        }
    };    

    renderGraph = (data, perfBaseline) => {
        let values = [];
        let compare = true;
        let max_count = 0;
        let columns = [{ label: 'x' }];
        let unit;
        for (let [version, metrics] of Object.entries(data)){
            columns.push({ type: 'number', label: version});
            columns.push({ type: 'string', role: 'tooltip'});
            if (metrics.length > max_count) {
                max_count = metrics.length;
                unit = metrics[0]['unit']
            }
        }
        let options = {
            backgroundColor: '#FAFAFA',
            // curveType: "function",
            pointSize: 10,
            theme: "material",
            hAxis: {
                viewWindowMode: "pretty"
            },
            vAxis: {
                baseline: perfBaseline,
                title: unit,
                baselineColor: "red",
                baselineTitle: "abc",
                viewWindowMode: "pretty"
            }
        };
        if (Object.keys(data).length === 1) {
            compare = false;
            columns = [{ type: 'string', label: 'Version'}, { type: 'number', label: unit}];
            options['vAxis']['viewWindow'] = {min: 0}
        }
        values.push(columns);
        if (max_count) {
            for (let i = 1; i <= max_count; i++) {
                let data_point = [i];
                for (let [version, metrics] of Object.entries(data)) {
                    if (compare) {
                        if (i > metrics.length) {
                            data_point.push(null);
                            data_point.push(null);
                        }
                        else {
                            data_point.push(metrics[i - 1]['value']);
                            data_point.push(`Version String: ${metrics[i - 1]['version_string']} \nValue: ${metrics[i - 1]['value']}`);
                        }
                    }
                    else {
                        data_point = [metrics[i - 1]['version_string'], metrics[i - 1]['value']]
                    }
                }
                values.push(data_point);
            }
            return (
                <div className={"my-pretty-chart-container"} >
                    <Chart chartType="LineChart" data={values} width="100%" height="250px" options={options}/>
                </div>);
            }
        else {
            return (<p>No previous data points found</p>)
        }
    };


    getPerfMetricSummary () {
        return (
            <div>
                {
                    this.props.performance_metric_data[this.props.match.params.id] !== undefined &&
                    <div className="content-block" style={{display: "block", justifyContent: "flex-start", width: "100%", margin: "0 auto", overflow: "auto", minHeight: "300px"}}>
                        <Modal>
                            <div className="performance-modal modal-content-container" onClick={(e) => e.stopPropagation()}>
                                <div style={{color: "black", fontWeight: 700, fontSize: "17px", marginBottom: "12px"}}>
                                    Performance Metric View
                                </div>
                                {this.props.performance_metric_data[this.props.match.params.id]["jira_tags"] &&
                                    <Fragment>
                                        <div style={{
                                            display: "flex",
                                        }}>
                                            <div style={{marginTop: "10px", marginRight: "10px"}}>Add JIRAs: </div>
                                            <TagsInput
                                                style={{width: "200px"}}
                                                inputProps={
                                                    {
                                                        className: 'react-tagsinput-input',
                                                        placeholder: 'Add JIRA'
                                                    }
                                                }
                                                onlyUnique="true"
                                                value={this.props.performance_metric_data[this.props.match.params.id]["jira_tags"]}
                                                onChange={this.addPerfMetricJiraTags}/>
                                        </div>
                                        <div>
                                            {(this.renderJira(
                                                this.props.performance_metric_data[this.props.match.params.id]["branch"],
                                                this.props.match.params.id,
                                                this.props.previous_perf_metrics))}
                                        </div>
                                    </Fragment>
                                }
                                <div><span className="baseline-modal-key">Atlantis ID:</span>
                                <span className="baseline-modal-value">
                                    {this.props.performance_metric_data[this.props.match.params.id]["id"]}
                                </span>
                                </div>
                                <div><span className="baseline-modal-key">Label:</span>
                                    <span className="baseline-modal-value">
                                        {this.props.performance_metric_data[this.props.match.params.id]["label"]}
                                    </span>
                                </div>
                                <div><span className="baseline-modal-key">Value:</span>
                                    <span className="baseline-modal-value">
                                        {this.props.performance_metric_data[this.props.match.params.id]["value"]}
                                    </span>
                                </div>
                                <div><span className="baseline-modal-key">Baseline:</span>
                                    <span className="baseline-modal-value">
                                        {this.props.performance_metric_data[this.props.match.params.id]["baseline_value"]}
                                    </span>
                                </div>
                                <div>
                                    <span>
                                        Tableau dashboard:
                                        <i className="material-icons"
                                           style={{color: "rgb(234, 180, 19)", cursor: "pointer"}}
                                           onClick={
                                               (e) => {
                                                   e.stopPropagation();
                                                   let params = getSearchParams({
                                                       feature: this.props.performance_metric_data[this.props.match.params.id]["feature"],
                                                       branch: this.props.performance_metric_data[this.props.match.params.id]["branch"],
                                                       metric_id: this.props.performance_metric_data[this.props.match.params.id]["id"]});
                                                   this.props.redirectFeatureTableauDash(
                                                       this.props.performance_metric_data[this.props.match.params.id]["feature"],
                                                       params);
                                               }
                                           }>
                                            timeline
                                        </i>
                                    </span>
                                </div>
                                <div><span className="baseline-modal-key">Diff:</span>
                                    <span className="baseline-modal-value">
                                        {this.props.performance_metric_data[this.props.match.params.id]["diff"] + '%'}
                                    </span>
                                </div>
                                <Fragment>
                                    <div style={{
                                        display: "flex",
                                    }}>
                                        <div style={{marginTop: "10px", marginRight: "10px"}}>Compare with versions: </div>
                                        <TagsInput
                                                style={{width: "200px"}}
                                                inputProps={
                                                    {
                                                        className: 'react-tagsinput-input',
                                                        placeholder: 'Add Version '
                                                    }
                                                }
                                                value={this.state.perfModalCompareVersions}
                                                onChange={this.handlePerfComparison}
                                                onlyUnique="true"
                                        />
                                    </div>
                                    <div style={{border: "1px solid rgb(222, 226, 255)", padding: "5px", margin: "10px 0px 10px 0px"}}>
                                        {this.props.fetchingPreviousPerfMetrics
                                            ? <Loader width="100%" style={{margin: "100px auto"}}/>
                                            : (this.renderGraph(
                                                this.props.previous_perf_metrics,
                                                this.props.performance_metric_data[this.props.match.params.id]["baseline_value"]))}
                                    </div>
                                </Fragment>
                                <Fragment>
                                    <Collapsible trigger={<u><a href="#">Config</a></u>}>
                                        <div style={{overflow: "auto", border: "1px solid rgb(222, 226, 255)", padding: "5px", margin: "10px 0px 10px 0px"}}>
                                            <pre style={{color: "black", margin: "5px 0px 5px 0px"}}>
                                                {JSON.stringify(this.props.performance_metric_data[this.props.match.params.id]['config'], null, 3)}
                                            </pre>
                                        </div>
                                    </Collapsible>
                                    <Collapsible trigger={<u><a href="#">Context</a></u>}>
                                        <div style={{overflow: "auto", border: "1px solid rgb(222, 226, 255)", padding: "5px", margin: "10px 0px 10px 0px"}}>
                                            <pre style={{color: "black", margin: "5px 0px 5px 0px"}}>
                                                {JSON.stringify(this.props.performance_metric_data[this.props.match.params.id]['context'], null, 3)}
                                            </pre>
                                        </div>
                                    </Collapsible>
                                    <div style={{display: "inline-block", marginLeft: "auto"}}>
                                        <span
                                            id="baseline-button"
                                            onClick={() => {
                                                this.props.invalidateMetric(this.props.match.params.id)

                                            }}>
                                            Invalidate
                                        </span>
                                        {this.props.performance_metric_data[this.props.match.params.id]["logs"] !== null &&
                                            <span
                                                id="baseline-button"
                                                onClick={() => {
                                                    window.open(
                                                        this.props.performance_metric_data[this.props.match.params.id]["logs"]);
                                                }}>
                                                Logs
                                            </span>
                                        }
                                        <span
                                            id="baseline-button"
                                            onClick={() => {
                                                if (this.props.fetchingBaseline) {
                                                    return;
                                                }
                                                this.props.toggleBaseline(this.props.match.params.id);
                                                if (this.state.perfVersion !== this.defaultVersion) {
                                                    this.props.handlePerformanceVersionSelection(this.props.branch, this.state.feature, this.defaultVersion, this.defaultTime);
                                                }
                                                this.props.handlePerformanceVersionSelection(this.props.branch, this.state.feature, this.state.perfVersion, this.defaultTime);
                                            }}
                                            style={this.props.fetchingBaseline ? {cursor: "wait", backgroundColor: "rgb(180.180,180)"} : {}}
                                        >
                                            {this.props.performance_metric_data[this.props.match.params.id]["baseline"] ? "Remove as Baseline" : "Add as Baseline"}
                                        </span>
                                    </div>
                                </Fragment>
                            </div>
                        </Modal>
                    </div>
                }
            </div>
        )
    }

    render() {
        return (
            <Fragment>
                <div className="main-container">
                    <div className="flex-container" style={{padding: "24px"}}>
                        {this.getPerfMetricSummary()}
                    </div>
                </div>
            </Fragment>
        );
    }
}

PerformanceMetric.defaultProps = {
    style: {}
};

const mapStateToProps = (state) => ({
    fetchingPreviousPerfMetrics: state.performanceMetric.fetchingPreviousPerfMetrics,
    performance_metric_data: state.performanceMetric.performance_metric_data,
    previous_perf_metrics: state.performanceMetric.previous_perf_metrics,
    fetchingBaseline: state.performanceMetric.fetching_baseline,
});


export default connect(mapStateToProps, {
    toggleBaseline,
    getPerformanceMetricData,
    getPreviousPerfMetrics,
    changePerfMetricJiraTags,
    invalidateMetric,
    redirectFeatureTableauDash,
})(PerformanceMetric);
