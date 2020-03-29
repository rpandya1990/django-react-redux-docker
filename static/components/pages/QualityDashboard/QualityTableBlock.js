import React, {Fragment} from "react";
import DropDown from "../../reusable/DropDown";
import Loader from "../../reusable/Loader";
import 'react-tagsinput/react-tagsinput.css'
import { Chart } from "react-google-charts";
import {getSearchParams, isURL} from "../../../utils";
import {Link} from "react-router-dom";

const getMainPerformanceColor = (failures) => {
    return !failures ? "white" : "rgba(255, 230, 230, 1)";
};

const getSystemStatus = (status) => {
    return status === "Success" ? "P" : "F";
};

const getSystemColor = (data) => {
    return data === "P" ? "none" : "rgba(255, 230, 230, 1)";
};

const performanceConfigCompareFunction = (configAStr,configBStr) => {
    if (!configAStr) {
        return 1;
    }
    if (!configBStr) {
        return -1;
    }
    let configA = JSON.parse(configAStr);
    let configB = JSON.parse(configBStr);
    if (!configB || !configB.type) {
        return -1;
    }
    if (!configA || !configA.type) {
        return 1;
    }
    if (configA.type < configB.type) {
        return -1;
    } else if (configA.type > configB.type) {
        return 1;
    }
    return 0;
};

const BaselineDiff = (props) => {
    let diff = props.diff;
    let failure = props.failure;
    if (diff === "N/A") {
        return <span/>;
    }

    let arrow = diff > 0
        ? <i className="material-icons" style={{marginRight: "1px", fontSize: "13px"}}>arrow_upward</i>
        : <i className="material-icons"
             style={Object.assign({marginRight: "1px", fontSize: "13px"}, getPerformanceColor({'failures': failure, 'diff': diff}))}>
            arrow_downward</i>
    let text = <span
        style={Object.assign({fontSize: "13px"}, getPerformanceColor({'failures': failure, 'diff': diff}))}>
        {Math.abs(diff) + '%'}</span>;
    return <span style={{display: "flex", alignItems: "center", lineHeight: "12px", ...props.style}}>{arrow}{text}</span>;
};

const getPerformanceColor = ({failures, diff}) => {
    if (diff === "N/A") {
        return {color: "rgb(80,80,80)", fontWeight: 500, fontSize: "12px"};
    }
    return diff > 0
        ? {color: "rgb(31, 177, 31)", fontSize: "12px", fontWeight: 500}
        : failures
            ? {color: "rgb(225, 40, 80)", fontWeight: 500, fontSize: "12px"}
            : {color: "rgb(169, 169, 169)", fontWeight: 500, fontSize: "12px"};
};

class QualityTableBlock extends React.Component {
    constructor(props) {
        super(props);
        this.defaultVersion = "latest version";
        this.defaultTime = "all times";
        this.state = {
            expandMetric: null,
            perfModalValue: null,
            perfModalConfig: null,
            perfModalLabel: null,
            perfModalDiff: null,
            perfModalId: null,
            perfModalBaseline: null,
            perfModalCompareVersions: [],
            feature: this.props.feature && this.props.feature.length ? this.props.feature[0] : null ,
            perfVersion: this.defaultVersion,
            perfTime: this.defaultTime,
        };

    }

    renderFeatureRows = (table_one) => {
        return table_one.map(row => {
            let rowHeader = row["header"];
            let failures = row["failures"];
            let metricLess = row["metric_less"] || false;
            let icon = failures ? <Fragment><span style={{fontSize: "20px", marginRight: "6px"}}>{failures}</span><i className="material-icons" style={{color: "rgba(255, 22, 22, 1)", fontSize: "20px", opacity: .5, marginRight: "6px"}}>error</i></Fragment> : <Fragment><span style={{fontSize: "20px", marginRight: "6px"}}>0</span><i className="material-icons" style={{color: "rgb(200, 200, 200)", fontSize: "20px", opacity: .5}}>error_outline</i></Fragment>;
            let backgroundColor = getMainPerformanceColor(failures);
            return (
                <div key={row["header"]} className="table-row" style={{backgroundColor}} onClick={(e) => {
                    if(metricLess){
                        e.stopPropagation();
                        this.setState({feature: rowHeader});
                        this.props.updateFeatureState(rowHeader);
                    } else {
                        this.props.updateFeatureState(rowHeader);
                        this.setState({feature: rowHeader});
                    }
                }}>
                    <div style={{display: "flex", padding: "5px", alignItems: "center", margin: "1px 6px", flexFlow: "column"}}>
                        <div style={{fontSize: "15px", color: "rgb(60,60,70)", fontWeight: 300, fontFamily: "Raleway"}}>{rowHeader}</div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            {icon}
                        </div>
                    </div>
                </div>
            )
        })
    };

    renderSystemTableTwo = (feature, featureData) => {
        return (
            <table className="system-table" style={{marginTop: "-40px"}}>
                <caption>{feature}</caption>
                <thead>
                <tr>
                    <th className="horizontal-tb-label" style={{paddingLeft: "10px", fontWeight: 700}}>Cluster Type:</th>
                    {featureData["labels"].map(type_detail => (
                        <th key={type_detail[0]} colSpan={type_detail[1].length} style={{borderRight: "1px solid rgb(238,240,245)", borderBottom: "1px solid rgb(238,240,245)", borderTop: "1px solid rgb(238,240,245)"}}>{type_detail[0]}</th>
                    ))}
                </tr>
                <tr>
                    <th className="horizontal-tb-label" style={{paddingLeft: "10px", borderRight: "1px solid rgb(238,240,245)", fontWeight: 700}}>
                        <div>Cluster Name:</div>
                        <div style={{color: "rgb(140,140,140)", fontWeight: 400}}>(Effective Version)</div>
                    </th>
                    {featureData["labels"].map((type_detail, j) =>
                        type_detail[1].map((cluster_detail, i) => (
                                <th key={cluster_detail[0]} style={{borderRight: i === type_detail[1].length-1 ? "1px solid rgb(238,240,245)" : ""}}>
                                    <div>{cluster_detail[0]}</div>
                                    <div>({cluster_detail[1]})</div>
                                </th>
                            )
                        ))}
                </tr>
                </thead>
                <tbody className="tbody">
                {Object.keys(featureData["data"]).map(tc =>
                    <tr key={tc}>
                        <th className="horizontal-tb-label" style={{paddingLeft: "10px"}}>{tc}</th>
                        {featureData["labels"].map(type_detail =>
                            type_detail[1].map(cluster_detail => {
                                    let systemStatus = getSystemStatus(featureData["data"][tc][type_detail[0]][cluster_detail[0]]["status"]);
                                    if (!featureData["data"][tc].hasOwnProperty(type_detail[0]) || !featureData["data"][tc][type_detail[0]].hasOwnProperty(cluster_detail[0])) {
                                        return <td/>;
                                    }
                                    return <td key={type_detail[0]+cluster_detail[0]} style={{backgroundColor: getSystemColor(systemStatus)}}>{systemStatus}</td>;
                                }
                            ))}
                    </tr>
                )}
                </tbody>
            </table>
        )
    };

    handlePerfVersionClick = (selectedVersion) => {
        this.setState({perfVersion: selectedVersion, perfTime: "all times"});
        this.props.handlePerformanceVersionSelection(this.props.branch, this.state.feature, selectedVersion, "all times");
    };

    handlePerfTimeClick = (selectedTime) => {
        this.setState({perfTime: selectedTime});
        this.props.handlePerformanceVersionSelection(this.props.branch, this.state.feature, this.state.perfVersion, selectedTime);
    };

    renderPerfTitle = (feature, branch) => {
        return (
            <div className="perf-title">
                <div style={{fontSize: "25px"}}>
                    <div style={{color: "rgb(60,60,60)", marginBottom: "-14px", fontSize: "25px", fontFamily: "Roboto", display: "flex", alignItems: "center"}}><span style={{marginRight: "15px", fontWeight: "500"}}>{feature}</span><i className="material-icons" style={{color: "rgb(234, 180, 19)", cursor: "pointer"}} onClick={
                        (e) => {
                            e.stopPropagation();
                            this.props.redirectFeatureTableauDash(feature, getSearchParams({feature: feature, branch: branch}));
                        }
                    }>timeline</i></div>
                    <span className="perf-version">{this.state.perfVersion}</span>
                    <span style={{color: "rgb(140,140,140)", fontSize: "17px", margin: "0 5px"}}>|</span>
                    <span className="perf-time">{this.state.perfTime}</span>
                </div>
            </div>
        )
    };

    handleExpandMetricClick = (id) => {
        this.props.getPerformanceMetricData(id);
        this.setState({expandMetric: id});
    };

    metricMouseOut = () => {
        let perfToolBar = document.getElementById("tooltip");
        perfToolBar.style.display = "none";

    };


    childMetricMouseMove = (e) => {
        let perfToolBar = document.getElementById("tooltip");
        perfToolBar.style.top = e.pageY-30 + "px";
        perfToolBar.style.left = e.pageX+30 + "px";
        perfToolBar.style.display = "block";
        perfToolBar.innerHTML = `<div>View child metrics</div>`;
    };

    metricMouseMove = (e, time, version) => {
        if (!time && !version) {
            return;
        }
        let perfToolBar = document.getElementById("tooltip");
        perfToolBar.style.top = e.pageY-30 + "px";
        perfToolBar.style.left = e.pageX+30 + "px";
        perfToolBar.style.display = "block";
        perfToolBar.innerHTML = `<div>${time}</div><div>${version}</div>`;
    };

    processConfigRowElement = (row) => {
        let rowElements = row.split(":");
        rowElements.splice(1, 0, <div className="divider" style={{margin: "0px 10px"}}/>);
        return rowElements.map((ele, i) => {
                if (i === 0) {
                    return <span style={{color: "rgb(70,70,70)"}} key={ele}>{ele.replace(/\"/g, '')}</span>;
                } else if(i === 2) {
                    return <span style={{color: "rgb(145, 145, 145)", fontWeight: 400}} key={ele}>{ele.replace(/\"/g, '')}</span>;
                }
                return ele;
            }
        )
    };

    handlePerfComparison = (compare_tags) => {

        this.setState({perfModalCompareVersions: compare_tags});
        this.props.getPreviousPerfMetrics(this.state.perfModalId, 10, compare_tags)
    };

    renderJira = (id, previous_metrics) => {
        if (previous_metrics !== undefined && previous_metrics.hasOwnProperty(this.props.branch)) {
            // Merge metric specific JIRAs with previous metrics JIRAs
            let prev_jiras = new Set();
            let cur_jiras = new Set(this.props.performanceMetricData[this.state.perfModalId + "jira_tags"]);
            for (let metric of previous_metrics[this.props.branch]) {
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

    renderPerformanceTableTwo = (feature, featureData) => {
        if (featureData !== undefined) {
            return (
        <div style={{overflowX: "auto", marginTop: "-2px"}}>
            {Object.keys(featureData["data"]).map((testcase, i) =>
                <Fragment>
                    <div className="table-caption">
                        <div style={{}}><span style={{color: "rgb(90, 90, 90)"}}>{testcase}</span><span style={{color: "rgb(160, 160, 160)", marginLeft: "5px"}}>{this.state.perfVersion}</span></div>
                    </div>
                    <div key={testcase + i} style={{overflowX: "auto", boxShadow: "rgba(0, 0, 0, 0.14) 0px 1px 6px 0px, rgba(0, 0, 0, 0.12) 0px 3px 5px 0px", marginBottom: "10px"}}>
                        <table key={testcase} className="performance-table">
                            <thead>
                            <tr>
                                <th style={{color: "rgb(165, 165, 170)", fontSize: "12px",  fontFamily: "Roboto", borderBottom: "1px solid rgb(210,210,210)", borderRight: "1px solid rgb(243,243,243)"}}>configs</th>
                                {featureData["labels"].map((label, i) => {
                                    let unit = featureData["units"][i] ? featureData["units"][i] : "";
                                    return <th key={label+i} style={{minWidth: "260px", padding: "18px 50px 10px", fontSize: "12px", fontFamily: "Roboto", borderRight: "1px solid rgb(243,243,243)", borderBottom: "1px solid rgb(205,205,205)"}}><span style={{color: "rgb(165, 165, 170)",}}>{label.toLowerCase()}</span><div style={{fontSize: "11px", fontWeight: 500, color: "rgb(80, 80, 80)"}}>{unit}</div></th>;
                                })}
                            </tr>
                            </thead>
                            <tbody className="tbody">
                            {Object.keys(featureData.data[testcase]).sort(performanceConfigCompareFunction).map(
                                (config, i) => {
                                    let configJSON = config.replace(/{|}/g, '').split(/", "|, "/);
                                    let rowBaselined = featureData.data[testcase][config].find((labelConfig) => labelConfig && labelConfig["baseline"] !== "N/A");
                                    return (
                                        <tr key={testcase+"config"+i}>
                                            <th className="horizontal-tb-label performance" style={{fontSize: "12px"}}>
                                                <div style={{fontWeight: 500, padding: "14px", fontFamily: "Roboto", fontSize: "11px", minHeight: "120px"}}>
                                                    {
                                                        configJSON.map(row =>
                                                            <div style={{display: "flex", alignItems: "center"}} key={row}>
                                                                {
                                                                    this.processConfigRowElement(row)
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </th>
                                            {featureData.data[testcase][config].map((labelConfig, j, d) => {
                                                let data = [];
                                                let baseline = rowBaselined ? <div style={{height: "34px"}}/>: <span/>;
                                                if (labelConfig) {
                                                    let k = 0;
                                                    for (const value of labelConfig["values"]) {
                                                        let expand_link = value["is_parent"]
                                                            ? <div
                                                                    className={"clickable"}
                                                                    onMouseOut={this.metricMouseOut}
                                                                    onMouseMove={(e) => this.childMetricMouseMove(e)}
                                                                    onClick={(e)=> {
                                                                        e.stopPropagation();
                                                                        this.handleExpandMetricClick(value["id"]);
                                                                    }}>
                                                                    <u><a href="#">Expand</a></u>
                                                              </div>
                                                            : <span/>;
                                                        data.push(
                                                            <div>
                                                                <Link to={{pathname: `/perf_metric/${value["id"]}`}} target="_blank">
                                                                    <div
                                                                        key={"configLabel"+i+j+k}
                                                                        className={"clickable " + (labelConfig["baseline"] !== "N/A" ? "light-underline" : "")}
                                                                        onClick={(e)=> {
                                                                            e.stopPropagation();
                                                                            this.handlePerfMetricClick(value["id"])
                                                                        }}
                                                                        onMouseOut={this.metricMouseOut}
                                                                        onMouseMove={(e) => this.metricMouseMove(e, value["time"], labelConfig["version_string"])}
                                                                        style={
                                                                            Object.assign(
                                                                                getPerformanceColor({'failures': value['failure'], 'diff': value['diff']}),
                                                                                k === labelConfig["values"].length-1 && labelConfig["baseline"] !== "N/A" ? {} : {}
                                                                            )
                                                                        }>
                                                                        <BaselineDiff diff={value["diff"]} failure={value["failure"]} style={{paddingRight: "10px"}}/>
                                                                        {labelConfig["baseline"] !== "N/A" && <div className="divider"/>}
                                                                        <span style={Object.assign({lineHeight: "12px", paddingLeft: "10px", marginLeft: labelConfig["baseline"] !== "N/A" ? "0px" : "auto"}, getPerformanceColor({'failures': value['failure'], 'diff': value['diff']}))}>{value["val"]}</span>
                                                                    </div>
                                                                </Link>
                                                                {expand_link}
                                                            </div>
                                                        );
                                                        k += 1;
                                                    }
                                                    if (labelConfig["baseline"] !== "N/A") {
                                                        baseline = <div style={{fontFamily: "Roboto", margin: "5px 30px 10px", fontSize: "12px", fontWeight: 500, border: "2px solid rgb(135, 140, 150)", color: "rgb(90,90,90)", borderRadius: "50px"}}>Baseline: <span style={{marginLeft: "3px", fontWeight: 400, color: "rgb(150, 170, 200)"}}>{labelConfig["baseline"]}</span></div>;
                                                    }
                                                    return <td key={"configLabel"+i+j}>{baseline}{data}</td>;
                                                } else {
                                                    return <td style={{backgroundColor: "rgb(245, 241, 250)"}}/>
                                                }
                                            })}
                                        </tr>
                                    )
                                }
                            )}
                            </tbody>
                        </table>
                    </div>
                </Fragment>
            )}
            </div>
        )
        }
    };


    renderTableTwo = (feature, table_two) => {
        let featureData = table_two[feature];
        if (this.props.title === "System") {
            return this.renderSystemTableTwo(feature, featureData);
        } else {
            let filteredPerformanceContext = this.props.filtered_performance_context[this.state.feature+this.state.perfVersion];
            let fetchingFilteredPerformanceContext = this.props.fetching_filtered_performance_context[this.props.branch];
            if (fetchingFilteredPerformanceContext) {
                return <Loader style={{margin: "100px auto"}}/>;
            }

            if (!fetchingFilteredPerformanceContext && !filteredPerformanceContext) {
                return this.renderPerformanceTableTwo(feature, featureData);
            }
            if (!fetchingFilteredPerformanceContext && filteredPerformanceContext) {
                return this.renderPerformanceTableTwo(feature, filteredPerformanceContext);
            }
        }
    };

    renderPerfFilter = (feature, versions, perfVersion) => {
        let versionsData = {};
        for (const version of ["latest version"].concat(versions)) {
            versionsData[version] = false;
        }
        versionsData[perfVersion] = true;
        let time_set = perfVersion !== this.defaultVersion && this.props.filtered_performance_context[feature+perfVersion]?
            this.props.filtered_performance_context[feature+perfVersion].time_set : [];
        let timesData = {};
        for (const time of [this.defaultTime].concat(time_set)) {
            if (!time) {
                continue;
            }
            timesData[time] = false;
        }
        timesData[this.state.perfTime] = true;
        return (
            <div className="perf-filter">
                <DropDown style={{position: "relative", marginLeft: "auto"}} dropDownStyle={{right: "0px"}} closedButtonStyle={{backgroundColor: "rgb(250, 210, 150)", color: "rgb(60,60,60)", boxShadow: "0px 1px 3px -1px rgb(80,80,80)"}} handleClick={this.handlePerfVersionClick} data={versionsData} title="Version"/>
                <DropDown closedButtonStyle={{backgroundColor: "rgb(250, 210, 150)", color: "rgb(60,60,60)", boxShadow: "0px 1px 3px -1px rgb(80,80,80)"}} handleClick={this.handlePerfTimeClick} data={timesData} title="Times"/>
            </div>
        )
    };

    componentWillUnmount() {
        this.props.updateFeatureState(null);
    }

    render() {
        return (
            <div className="content-block" style={{display: this.state.feature ? "block" : "flex", justifyContent: "flex-start", width: this.state.feature ? "100%" : "85%", margin: "0 auto", overflow: "auto", minHeight: "300px"}}>
                {(this.state.feature && this.props.table_two && this.props.table_two[this.state.feature] && this.props.title === "Performance") && this.renderPerfFilter(
                    this.state.feature,
                    this.props.table_two[this.state.feature].versions,
                    this.state.perfVersion
                )}
                {this.state.feature &&
                <div className="arrow-back"
                     style={{marginTop: this.props.title === "Performance" ? "-30px" : "0px"}}
                     onClick={() => {
                        if (this.state.expandMetric !== null) {
                            this.setState({expandMetric: null});
                        }
                        else {
                            this.props.updateFeatureState(null);
                            this.setState({feature: null, expandMetric: null, perfVersion: this.defaultVersion, perfTime: this.defaultTime});
                        }}}>
                    <i className="material-icons" style={{fontSize: "50px", marginTop: "-10px", color: "rgb(200, 204, 220)"}}>keyboard_backspace</i></div>}
                {(this.state.feature && this.props.title === "Performance") && this.renderPerfTitle(
                    this.state.feature, this.props.branch
                )}
                {!this.state.feature
                    ? this.renderFeatureRows(this.props.table_one)
                    : (this.state.expandMetric !== null) ? this.renderPerformanceTableTwo(this.state.feature,
                        this.props.performanceMetricData[this.state.expandMetric+'children_info'])
                    : this.renderTableTwo(this.state.feature, this.props.table_two)}
            </div>
        )
    }
}


QualityTableBlock.defaultProps = {
    updateFeatureState: () => {}
};

export default QualityTableBlock;
