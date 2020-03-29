import React, {Component, Fragment} from 'react';
import BigCard from "../../../reusable/BigCard";
import Filter from "../../../reusable/Filter";
import NavTab from "../../../reusable/NavTab";
import PerformanceQualityPieGraphBlock from "./PerformanceQualityPieGraphBlock";
import QualityTableBlock from "../QualityTableBlock";
import ToggleSwitch from "../../../reusable/ToggleSwitch";
import Loader from "../../../reusable/Loader";
import * as PropTypes from "prop-types";
import {getSearchParams} from "../../../../utils";
import {Chart} from "react-google-charts";
import TagsInput from "react-tagsinput";

class PerformanceQualityBigCard extends Component {
    constructor(props) {
        super(props);
        this.categories = ["All metrics", "Summary"];
        this.state = {
            selectedVersion: props.branch,
            selectedCategory: 0,
            prune: false,
            run_by_run_features: [],
            scrollActivated: false,
        };
        this.handleScrollEventClosure = this.handleScrollEvents();
        window.addEventListener("scroll", this.handleScrollEventClosure);
    }

    componentDidMount() {
        this.handlePerformanceSummary();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(_.sortBy(prevProps.branch), _.sortBy(this.props.branch))) {
            this.setState({selectedVersion: this.props.branch});
        }
        if (!_.isEqual(_.sortBy(this.state.selectedVersion), _.sortBy(prevState.selectedVersion))) {
            this.handlePerformanceSummary();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScrollEventClosure);
    }

    handleScrollEvents = () => {
        let scrollCall = null;
        return () => {
            clearTimeout(scrollCall);
            scrollCall = setTimeout(() => {
                if (window.scrollY > 3) {
                    this.setState({scrollActivated: true});
                } else {
                    this.setState({scrollActivated: false});
                }
            }, 50);
        }
    };

    handlePerformanceSummary = () => {
        const selectedBranch = this.props.branch;
        const selectedVersion = this.state.selectedVersion;

        if (_.isEmpty(this.props.performance_run_summary) ||
            !_.has(this.props.performance_run_summary, selectedVersion) ||
            _.isEmpty(this.props.performance_run_summary[selectedVersion])) {
            this.props.getPerformanceRunSummary(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion
            }), selectedVersion);
        }

        if (_.isEmpty(this.props.high_variable_perf_metrics) ||
            !_.has(this.props.high_variable_perf_metrics, selectedVersion) ||
            _.isEmpty(this.props.high_variable_perf_metrics[selectedVersion])) {
            this.props.getHighVariablePerfMetrics(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion
            }), selectedVersion);
        }

        if (_.isEmpty(this.props.performance_run_by_run) ||
            !_.has(this.props.performance_run_by_run, selectedVersion) ||
            _.isEmpty(this.props.performance_run_by_run[selectedVersion])) {
            this.props.getPerformanceRunByRun(getSearchParams({
                'branch': selectedBranch,
                'version-starts-with': selectedVersion
            }), selectedVersion);
        }
    };

    handleRunByRunFeature = (feature_tags) => {
        this.setState({run_by_run_features: feature_tags})
    };

    get_metric_breakdown_data = (props, feature=null) => {
        let title_color_mapping = {
            above_baseline: '#00FF00',
            below_baseline: '#FF0000',
            not_run: '#808080',
            no_baseline: '#FFA500',
        };
        // Prune not run if selected
        let titles = this.state.prune
            ? ['above_baseline', 'below_baseline', 'no_baseline']
            : ['above_baseline', 'below_baseline', 'no_baseline', 'not_run'];
        let result = {data: [['Summary', '#Metrics']], slice_data: {}};
        let context = feature === null
            ? props.performance_run_summary[this.state.selectedVersion]["summary"]
            : props.performance_run_summary[this.state.selectedVersion]["feature_breakdown"][feature]["summary"];
        for (let i = 0; i < titles.length; i++) {
            if (_.has(context, titles[i])) {
                result.data.push([titles[i], context[titles[i]]]);
                result.slice_data[i] = {color: title_color_mapping[titles[i]], textStyle: 'white'}
            }
        }
        return result
    };

    get_feature_breakdown_data = (props) => {
        let result = {data: [['Feature', '#Failures']]};
        for (let [feature, data] of Object.entries(props.performance_run_summary[this.state.selectedVersion]["feature_breakdown"])) {
            if (data['summary'].hasOwnProperty('below_baseline')) {
                result.data.push([feature, data['summary']['below_baseline']])
            }
        }
        return result
    };

    get_high_variable_metric_data = (props) => {
        let result = {data: [['Feature', '#High-Variable-Metrics']]};
        for (let [feature, data] of Object.entries(props.high_variable_perf_metrics[this.state.selectedVersion]["feature_breakdown"])) {
            result.data.push([feature, data['total']])
        }
        return result
    };

    get_performance_run_by_run_data = (props, features=[]) => {
        let result = {data: {}};
        for (let run_info of props.performance_run_by_run[this.state.selectedVersion]) {
            if (features.length === 0)
            {
                if (!('overall' in result['data'])) {
                    result['data']['overall'] = []
                }
                let above_baseline_metrics = 'above_baseline' in run_info['summary']
                    ? run_info['summary']['above_baseline'] : 0;
                let not_run_metrics = 'not_run' in run_info['summary']
                    ? run_info['summary']['not_run'] : 0;
                let total = this.state.prune
                    ? run_info['summary']['total'] - not_run_metrics
                    : run_info['summary']['total'];
                result["data"]["overall"].push(
                    {
                        version: run_info['version'],
                        above_baseline_percent: ((above_baseline_metrics * 100 ) / total).toFixed(1)
                    });
            }
            else {
                for (let feat of features) {
                    if (!(feat in result['data'])) {
                        result['data'][feat] = []
                    }
                    let above_baseline_metrics = 'above_baseline' in run_info['feature_breakdown'][feat]['summary']
                        ? run_info['feature_breakdown'][feat]['summary']['above_baseline'] : 0;
                    let not_run_metrics = 'not_run' in run_info['feature_breakdown'][feat]['summary']
                        ? run_info['feature_breakdown'][feat]['summary']['not_run'] : 0;
                    let total = this.state.prune
                        ? run_info['feature_breakdown'][feat]['summary']['total'] - not_run_metrics
                        : run_info['feature_breakdown'][feat]['summary']['total'];
                    result['data'][feat].push(
                        {
                            version: run_info['version'],
                            above_baseline_percent: ((above_baseline_metrics * 100) / total).toFixed(1)
                        });
                }
            }
        }
        return result
    };

    render_perf_summary_block = (props) => {
        if (this.props.performance_run_summary !== undefined && this.state.selectedVersion in this.props.performance_run_summary) {
            let overall_metric_breakdown_data = this.get_metric_breakdown_data(props);
            let feature_breakdown_data = this.get_feature_breakdown_data(props);
            return (
                <Fragment>
                    <PerformanceQualityPieGraphBlock
                        className="dashboard-item"
                        title="Overall Metric breakdown"
                        measurement="Metrics"
                        data={overall_metric_breakdown_data}
                    />
                    <PerformanceQualityPieGraphBlock
                        className="dashboard-item"
                        title="Feature failure breakdown"
                        measurement="Metrics below baseline"
                        data={feature_breakdown_data}
                    />
                </Fragment>
            )
        }
        else {
            return (<Loader style={{margin: "120px"}} medium={true}/>)
        }
    };

    render_high_variable_metrics_block = (props) => {
        if (this.props.high_variable_perf_metrics !== undefined && this.state.selectedVersion in this.props.high_variable_perf_metrics) {
            let high_variable_metric_data = this.get_high_variable_metric_data(props);
            return (
                <PerformanceQualityPieGraphBlock
                    className="dashboard-item" title="High Variability breakdown"
                    measurement="High Variable metrics" data={high_variable_metric_data}
                />
            )
        }
        else {
            return (<Loader style={{margin: "120px"}} medium={true}/>)
        }
    };

    render_perf_run_by_run_block = (props, features=[]) => {
        let hashKey = this.props.branch + this.props.startDate;
        if (this.props.performance_run_by_run !== undefined && this.state.selectedVersion in this.props.performance_run_by_run) {
            let run_over_run_data = this.get_performance_run_by_run_data(props, features);
            let values = [];
            let compare = true;
            let max_count = 0;
            let columns = [{ label: 'x' }];
            let unit;
            for (let [feat, info] of Object.entries(run_over_run_data.data)){
                columns.push({ type: 'number', label: feat});
                columns.push({ type: 'string', role: 'tooltip'});
                if (info.length > max_count) {
                    max_count = info.length;
                    unit = Object.keys(info[0])[1]
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
                    title: unit,
                    viewWindowMode: "pretty",
                    viewWindow: {min: 0, max: 100}
                }
            };
            if (Object.keys(run_over_run_data.data).length === 1) {
                compare = false;
                columns = [{ type: 'string', label: 'Version'}, { type: 'number', label: unit}];
            }
            values.push(columns);
            if (max_count) {
                for (let i = 1; i <= max_count; i++) {
                    let data_point = [i];
                    for (let [feat, info] of Object.entries(run_over_run_data.data)) {
                        if (compare) {
                            if (i > info.length) {
                                data_point.push(null);
                                data_point.push(null);
                            } else {
                                data_point.push(info[i - 1][unit]);
                                data_point.push(`Version: ${info[i - 1]['version']} \nValue: ${info[i - 1][unit]}`);
                            }
                        } else {
                            data_point = [info[i - 1]['version'], info[i - 1][unit]]
                        }
                    }
                    values.push(data_point);
                }
                return (
                    <div style={{flexBasis: "614px", minWidth: "614px", marginRight: "0px"}}
                         className="dashboard-item">
                        <div className="data-card">
                            <div style={{display: "flex", flexDirection: "column"}}>
                                <div style={{
                                    display: "flex", flexDirection: "row", marginTop: "10px",
                                    marginRight: "10px", marginLeft: "10px"
                                }}>
                                    <div style={{marginTop: "10px", marginRight: "10px", marginLeft: "10px"}}>
                                        Feature:
                                    </div>
                                    <TagsInput
                                        style={{width: "200px"}}
                                        inputProps={
                                            {
                                                className: 'react-tagsinput-input',
                                                placeholder: ''
                                            }
                                        }
                                        value={this.state.run_by_run_features}
                                        onChange={this.handleRunByRunFeature}
                                        onlyUnique="true"
                                    />
                                </div>
                                <div className="pie-container" style={{paddingLeft: "5px", paddingRight: "5px"}}>
                                    <Chart chartType="LineChart" data={values}
                                           options={options}/>
                                </div>
                            </div>
                            <div className="half-title">Performance Run over Run</div>
                        </div>
                    </div>
                )
            }
            else {
                return (<p>No previous data points found</p>)
            }
        }
        else {
            return (<Loader style={{margin: "120px"}} medium={true}/>)
        }
    };

    renderFeatureSummaryChart = (props, feature) => {
        let feature_summary = this.get_metric_breakdown_data(props, feature);
        let options = {
            backgroundColor: 'transparent'
        };
        if (feature_summary.hasOwnProperty('slice_data')) {
            options.slices = feature_summary.slice_data
        }
        return (
                    <div  className="pie-container"
                          style={{paddingLeft: "5px", paddingBottom: "5px"}}>
                        <Chart
                          chartType="PieChart"
                          data={feature_summary.data}
                          options={options}
                          // rootProps={{ 'data-testid': '7' }}
                        />
                    </div>
        )
    };

    render_feature_rows = (props) => {
        if (props.performance_run_summary !== undefined &&
            this.state.selectedVersion in props.performance_run_summary) {
            let result = [];
            for (let [feature, data] of Object.entries(
                props.performance_run_summary[this.state.selectedVersion]["feature_breakdown"])) {
                    result.push([feature, data['summary']['total'], data['summary']])
            }
            return result.map(tr =>
                <tr
                    key={tr[0]}
                    style={{borderTop: "1px solid rgb(208, 208, 208)", borderBottom: "0px"}}>
                    <td style={{minWidth: "500px", maxWidth: "500px", fontSize: "14px"}}>
                        <span>{tr[0]}</span>
                    </td>
                    <td style={{minWidth: "150px", maxWidth: "150px", fontSize: "14px"}}>
                        <span>{tr[1]}</span>
                    </td>
                    <td style={{minWidth: "500px", maxWidth: "500px", fontSize: "14px"}}>
                        <span>{this.renderFeatureSummaryChart(props, tr[0])}</span>
                    </td>
                </tr>
            )
        }
        else {
            return (<Loader style={{margin: "120px"}} medium={true}/>)
        }
    };

    render_perf_feature_summary_block = (props) => {
        return (
            <div style={{flexBasis: "1150px", minWidth: "1150px", marginRight: "0px"}}
                         className="dashboard-item">
                <div className="data-card">
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-sm">
                            <thead>
                            <tr>
                                <th style={{minWidth: "500px", maxWidth: "500px"}}>Feature</th>
                                <th style={{minWidth: "150px", maxWidth: "150px"}}>Total metrics</th>
                                <th style={{minWidth: "500px", maxWidth: "500px"}}>Summary</th>
                            </tr>
                            </thead>
                            <tbody ref={this.tableRef} style={{maxHeight: "380px"}}>
                            {this.render_feature_rows(props)}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*<div className="row">*/}
                {/*    <nav aria-label="Test State Table Navigation" style={{margin: "4px 0"}}>*/}
                {/*        <ul className="pagination justify-content-center"*/}
                {/*            style={{margin: "0 auto"}}>*/}
                {/*            {*/}
                {/*                this.state.index &&*/}
                {/*                this.renderBottomNav(this.state.index)*/}
                {/*            }*/}
                {/*        </ul>*/}
                {/*    </nav>*/}
                {/*</div>*/}
            </div>
        );
    };

    renderSummary = (props) => {
        return (
            <div
                className="col-xs-12"
                style={{display: "flex", justifyContent: "space-between", flexWrap: "wrap"}}>
                <div className="row">
                    {this.render_perf_summary_block(props)}
                    {this.render_high_variable_metrics_block(props)}
                    <div style={{flexBasis: "253px", minWidth: "253px", marginRight: "0px"}}
                         className="dashboard-item">
                        <div className="half-title" style={{paddingTop: "1px"}}>Filters</div>
                        <div className="filter-block">
                            <div className="pipeline-button" style={{
                                marginBottom: "auto",
                                paddingTop: "10px"
                            }}>
                                <ToggleSwitch checked={this.state.prune} title="Prune not run metrics"
                                              style={{marginLeft: "8px"}}
                                              sliderClass="orange-slider"
                                              onClick={() => {
                                                  this.setState({prune: !this.state.prune});
                                              }}
                                />
                            </div>
                            <div style={{marginTop: "40px", width: "80%", marginLeft: "8px"}}>
                                <Filter
                                    style={{marginLeft: "auto", marginRight: "10px"}}
                                    title={"Specify Version"}
                                    defaultValue={props.branch}
                                    value={this.state.selectedVersion}
                                    onFocus={value => {
                                        props.getPreviousPerfMetricVersions(getSearchParams({
                                                branch: props.branch,
                                                version_starts_with: value,
                                                start_date: this.props.startDate
                                            }))
                                    }}
                                    handleKeyUp={(e) => {
                                        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "ArrowLeft") {
                                            return;
                                        }
                                        props.getPreviousPerfMetricVersions(getSearchParams({
                                                branch: props.branch,
                                                version_starts_with: e.target.value,
                                                start_date: this.props.startDate
                                            }));
                                        this.setState({selectedVersion: e.target.value});
                                    }}
                                    dropdownData={props.previous_perf_metric_versions}
                                    handleFilterEnter={value => {
                                        this.setState({selectedVersion: value});
                                    }}
                                    handleChange={value => {
                                        this.setState({selectedVersion: value});
                                    }}
                                />
                            </div>
                            {this.props.performance_run_summary !== undefined
                            && this.state.selectedVersion in this.props.performance_run_summary &&
                                <div style={{padding: "10px", color: "rgb(160,160,160"}}>
                                    Current Version: {this.state.selectedVersion}
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    {this.render_perf_run_by_run_block(props, this.state.run_by_run_features)}
                </div>
                <div className="row">
                    {this.render_perf_feature_summary_block(props)}
                </div>
            </div>
        )
    };

    getMetricView = (props) => {
        let title = props.title;
        let data = props.data;
        return (
            <div className="col-xs-12" style={{display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
                {!props.fetching_performance && !_.isEmpty(data) ?
                    <QualityTableBlock
                        title={title}
                        table_one={data["table_one"]}
                        table_two={data["table_two"]}
                        branch={props.branch}
                        fetching_filtered_performance_context={props.fetching_filtered_performance}
                        filtered_performance_context={props.filtered_performance}
                        handlePerformanceVersionSelection={props.handlePerformanceVersionSelection}
                        performanceMetricData={props.performanceMetricData}
                        getPerformanceMetricData={props.getPerformanceMetricData}
                        redirectFeatureTableauDash={props.redirectFeatureTableauDash}
                        invalidateMetric={props.invalidateMetric}
                        feature={props.feature}
                        updateFeatureState={props.updateFeatureState}
                        fetchingBaseline={props.fetchingBaseline}
                    /> :
                    <Loader width="100%" style={{margin: "100px auto"}}/>}
            </div>
        )
    };

    getBigCardContent = (props) => {
        return (
            <Fragment>
                <div>
                    <NavTab
                        style={{paddingBottom: "10px", backgroundColor: "transparent", borderBottom: "none", width: "auto", justifyContent: "left"}}
                        tabGroupStyle={this.state.scrollActivated ? {transform: "translate(-5px, -20px)"} : {transform: "translate(0px, 35px)"}}
                        categories={this.categories}
                        selectedTab={this.state.selectedCategory}
                        onTabChange={tabIndex => {
                            this.setState({selectedCategory: tabIndex})
                        }}
                    />
                </div>
                <div style={{paddingTop: "30px"}}>
                    {this.state.selectedCategory === 0
                        ? this.getMetricView(props)
                        : this.renderSummary(props)
                    }
                </div>
            </Fragment>
        )
    };

    render() {
        return (
            <BigCard children={this.getBigCardContent(this.props)}/>
        );
    }
}

PerformanceQualityBigCard.propTypes = {
    startDate: PropTypes.string.isRequired,
    branch: PropTypes.string.isRequired,
    data: PropTypes.object,
    filtered_performance: PropTypes.object,
    performanceMetricData: PropTypes.object,
    feature: PropTypes.array,
    fetching_filtered_performance: PropTypes.bool.isRequired,
    redirectFeatureTableauDash: PropTypes.func.isRequired,
    handlePerformanceVersionSelection: PropTypes.func.isRequired,
    updateFeatureState: PropTypes.func.isRequired,
    getPreviousPerfMetricVersions: PropTypes.func.isRequired,
    previous_perf_metric_versions: PropTypes.array,
    getPerformanceRunSummary: PropTypes.func.isRequired,
    getPerformanceRunByRun: PropTypes.func.isRequired,
    getHighVariablePerfMetrics: PropTypes.func.isRequired,
    high_variable_perf_metrics: PropTypes.object.isRequired,
    performance_run_summary: PropTypes.object.isRequired
};

PerformanceQualityBigCard.defaultProps = {
    title: "Performance",
    filtered_performance: true,
    fetching_filtered_performance: true,
};

export default PerformanceQualityBigCard;