import React, {Fragment} from "react";
import BigCard from "../../reusable/BigCard";
import QualityPieGraphBlock from "./QualityPieGraphBlock";
import QualityTableBlock from"./QualityTableBlock";
import QualityLineGraphBlock from "./QualityLineGraphBlock";
import Loader from "../../reusable/Loader";
import {getPerformanceMetricData} from "../../../actions/qualityDashboard";
import ToggleSwitch from "../../reusable/ToggleSwitch";
import Filter from "../../reusable/Filter";
import {getSearchParams, uniqueArrayEquals} from "../../../utils";
import BuildRegression from "./PipelineQuality/BuildRegression";


const getGraphValues = ({vals, total}) => {
    let rtrn_array = [];
    for (let i = 0; i < vals.length; i++) {
        let perc = 100*(vals[i]/total);
        perc = Number(Math.round(perc+'e2')+"e-2");
        rtrn_array.push(perc);
    }
    return rtrn_array;
};


class QualityBigCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pipelines: {},
            openPipelineRunByRun: true,
            openEffectivePipelineRunByRun: false,
            openLastFiveTrend: false,
            prune: true
        };
        for (const pipeline of this.props.selectedPipelines) {
            this.state.pipelines[pipeline] = true;
        }
    }

    checkPipelines = (pipelines) => {
        let pipelineSet = new Set();
        for (const pipeline of Object.keys(pipelines)) {
            if (pipelines[pipeline]) {
                pipelineSet.add(pipeline);
            }
        }
        return pipelineSet;
    };

    componentDidUpdate(prevProps) {
        if (!uniqueArrayEquals(this.props.selectedPipelines, prevProps.selectedPipelines) || ((this.props.specificBranchVersion && prevProps.specificBranchVersion) && this.props.specificBranchVersion[this.props.branch] != prevProps.specificBranchVersion[this.props.branch])) {
            this.setState({openEffectivePipelineRunByRun: false, openPipelineRunByRun: true, openLastFiveTrend: false});
        }
        if (!uniqueArrayEquals(prevProps.selectedPipelines, this.props.selectedPipelines)) {
            let newPipelineState = {};
            for (const pipeline of this.props.selectedPipelines) {
                newPipelineState[pipeline] = true;
            }
            this.setState({pipelines: newPipelineState});
        }
    }

    getBigCardTitle = (props) => {
        let title = props.title;
        let categoryObj = props.data;
        if (!categoryObj) {
            return <div className="big-card-title full">{title}</div>;
        }
        let health = categoryObj["health"];
        let color = "rgb(22,185,50)";
        let backgroundColor = "rgba(22,185,50, .84)";
        if (health < 60 || health === "fail") {
            color = "#f22613";
            backgroundColor = "rgba(228, 57, 57, 0.85)";
        } else if (health < 90) {
            color = "rgb(255, 153, 20)";
            backgroundColor = "rgba(239, 157, 49, 0.9)";
        }
        let healthIcon = health + "%";
        if (props.title === "Performance" || props.title === "System") {
            healthIcon = (
                <div style={{display: "flex", alignItems: "center"}}>
                    <span>{categoryObj["failure_count"]}</span>
                    <i className="material-icons error-icon">error_outline</i>
                </div>

            )
        }
        let date = <span/>;
        if (categoryObj["period"]) {
            date = categoryObj["period"];
        }
        return (
            <div className="big-card-title full" style={{backgroundColor, color: "white", borderRadius: "5px"}}>
                {/*<div style={{marginRight: "8px", fontFamily: "Ubuntu"}}>{this.props.branch}</div>*/}
                <div style={{fontFamily: "Ubuntu"}}>{healthIcon}</div>
                <div style={{fontSize: "15px", marginLeft: "auto"}}>{date}</div>
            </div>
        )
    };

    getPieData = (data) => {
        let {status_counter, triage_counter, links, meta_data, failure_reasons} = data;
        let target = "total";
        let selectedPipelines = this.checkPipelines(this.state.pipelines);
        if (selectedPipelines.size !== this.props.maxPipelineCount) {
            target = Array.from(selectedPipelines)[0];
        }
        let passed = 0;
        let notRun = 0;
        let failed = 0;
        let skipped = 0;
        let deploy_and_install_failure = 0;
        if (status_counter[target]) {
            passed = status_counter[target].pass || 0;
            notRun = status_counter[target].notrun || 0;
            failed = status_counter[target].fail || 0;
            skipped = status_counter[target].skip || 0;
            deploy_and_install_failure = status_counter[target].deploy_and_install_failure || 0;
        }

        if (failure_reasons && failure_reasons[target]) {
            failure_reasons = failure_reasons[target];
        } else {
            failure_reasons = {}
        }

        let prod = 0;
        let test = 0;
        let infr = 0;
        let undet = 0;
        let untri = 0;
        let link = links[target];
        if (meta_data && meta_data[target]) {
            for (const version of meta_data[target]["version"]) {
                link += "&version-starts-with=" + version;
            }
        }
        if (triage_counter[target]) {
            prod = triage_counter[target].product || 0;
            test = triage_counter[target].testcase || 0;
            infr = triage_counter[target].infra || 0;
            undet = triage_counter[target].undetermined || 0;
            untri = triage_counter[target].untriaged || 0;
        }

        let healthTotal = passed+notRun+failed+skipped+deploy_and_install_failure;
        let passFailTotal = passed+failed+notRun;
        let triageTotal = prod + test + infr + undet + untri;

        const [success, fail, notrun, skip, deploy_fail] = getGraphValues({vals: [passed, failed, notRun, skipped, deploy_and_install_failure], total: healthTotal});
        const [successExec, failExec] = getGraphValues({vals: [passed, failed], total: passFailTotal});
        const [product, infra, testcase, undetermined, untriaged] = getGraphValues({vals: [prod, infr, test, undet, untri], total: triageTotal});
        return {
            healthTotal,
            passFailTotal,
            triageTotal,
            healthData: [
                {"label":"Success", "value": success, "num": passed},
                {"label":"Skip", "value": skip, "num": skipped},
                {"label":"Fail", "value": fail, "num": failed},
                {"label":"Not Run", "value": notrun, "num": notRun},
                {"label":"Deploy&Install", "value": deploy_fail, "num": deploy_and_install_failure},
            ],
            healthDataPassFail: [
                {"label":"Success", "value": successExec, "num": passed},
                {"label":"Fail", "value": failExec, "num": failed},
            ],
            triageData: [
                {"label":"Product", shortLabel: "Prod", "value": product, "num": prod},
                {"label":"Infra", "value": infra, "num": infr},
                {"label":"Test Case", shortLabel: "TC", "value": testcase, "num": test},
                {"label":"Undet", "value": undetermined, "num": undet},
                {"label":"Untriaged", shortLabel: "Untri", "value": untriaged, "num": untri}
            ],
            link,
            target,
            failure_reasons
        }
    };

    getLatestRunTitle = (data) => {
        return (
            <div>
                <span>Latest Run Summary</span>
                <div style={{position: "absolute", zIndex: 5, marginTop: "5px", color: "rgb(180,180,180)", fontFamily: "Source Sans Pro"}}>
                    {
                        Object.keys(data.latest_data.meta_data).map(pr => {
                            if (pr === "total") {
                                return null;
                            }
                            return (
                                <div key={pr + "latestrunstats"} style={{fontSize: ".75em"}}>{pr}:
                                    <span style={{
                                        marginLeft: "4px",
                                        fontWeight: 400
                                    }}>{data.latest_data.meta_data[pr]["version"]}</span>
                                    <span style={{
                                        fontSize: ".92em",
                                        marginLeft: "4px",
                                        color: "rgb(50,130,150)"
                                    }}>- {data.latest_data.meta_data[pr]["pipeline_completion_status"]}</span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    };

    getEffectiveRunTitle = (data, title) => {
        return (
            <div>
                <span>{title}</span>
                <div style={{position: "absolute", zIndex: 5, marginTop: "5px", fontFamily: "Source Sans Pro"}}>
                    <div style={{fontSize: "13px", color: "rgb(180,180,180)"}}>Tests passed consecutively in the last 5 builds:
                        <span style={{
                            marginLeft: "4px",
                            fontWeight: 400
                        }}>{data.last_five_success}%</span>
                    </div>
                </div>
            </div>
        );
    };

    getFailureTitle = (data, title, selection) => {
        let triage_data = data.latest_data.issue_counter[selection];
        return (
            <div>
                <span>{title}</span>
                {(selection && triage_data) &&
                <div style={{position: "absolute", zIndex: 5, lineHeight: 1, marginTop: "5px", display: "flex", flexWrap: "wrap", fontFamily: "Source Sans Pro"}}>
                    {
                        Object.keys(triage_data).map(triage => {
                            if (!triage_data[triage]["count"]) {
                                return;
                            }
                            return (
                                <a href={triage_data[triage]["link"]} className="triage-data" key={triage + "latestrunstats"} style={{fontSize: "13px", textDecoration: "none", marginRight: "3px", marginBottom: "3px"}}>{triage}:
                                    <span target="_blank" style={{
                                        marginLeft: "3px",
                                        fontWeight: 400,
                                        padding: "5px 5px 5px 2px"
                                    }}>{triage_data[triage]["count"]}</span>
                                </a>
                            )
                        })
                    }
                </div>
                }
            </div>
        )
    };

    handlePipelineToggle = (pipeline) => {
        let currentPipelineState = {...this.state.pipelines};
        currentPipelineState[pipeline] = !this.state.pipelines[pipeline];
        this.setState({
            pipelines: currentPipelineState
        });
    };

    pipelineButtons = (pipelines) => {
        return pipelines.map(pipeline => {
            return (
                <div key={pipeline} className="pipeline-button">
                    <ToggleSwitch checked={this.state.pipelines[pipeline]} title={pipeline} onClick={() => this.handlePipelineToggle(pipeline)}/>
                </div>
            )
        });
    };

    getBigCardContent = (props) => {
        let title = props.title;
        let data = props.data;
        if (title === "Pipeline") {
            return (
                <Fragment>
                    <div className="col-xs-12" style={{display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
                        {!props.fetching_pipeline && data ?
                            <div className="row">
                                <QualityPieGraphBlock
                                    id={"effective"+props.branch.split(".").join("-")}
                                    className="dashboard-item"
                                    data={data}
                                    branch={props.branch}
                                    getPieData={this.getPieData}
                                    title={this.getEffectiveRunTitle(data, "Effective Summary")}
                                    hideFailures={true}
                                    smallTitle={true}
                                    prune={this.state.prune}
                                    redirectToProductQuality={this.props.redirectToProductQuality}
                                />
                                <QualityPieGraphBlock
                                    className="dashboard-item"
                                    id={"latest"+props.branch.split(".").join("-")}
                                    data={data.latest_data}
                                    branch={props.branch}
                                    getPieData={this.getPieData}
                                    title={this.getLatestRunTitle(data)}
                                    prune={this.state.prune}
                                    failureTitle={(selection) => this.getFailureTitle(data, "Failure Breakdown", selection)}
                                    redirectToProductQuality={this.props.redirectToProductQuality}
                                />
                                <div style={{flexBasis: "253px", minWidth: "253px", marginRight: "0px"}} className="filter-block dashboard-item">
                                    {this.pipelineButtons(props.selectedPipelines)}
                                    <div className="pipeline-button" style={{marginBottom: "auto", borderTop: "1px solid rgb(220,220,220)", paddingTop: "10px"}}>
                                        <ToggleSwitch checked={this.state.prune} title="Prune Skip" onClick={() => {
                                            this.setState({prune: !this.state.prune});
                                        }}/>
                                    </div>
                                    <div>
                                        <Filter
                                            style={{marginLeft: "auto", marginRight: "10px"}}
                                            title={"Specify Version "+this.props.branch}
                                            value={this.props.branch}
                                            onFocus={(value) => this.props.getRecentVersions(value, this.props.branch)}
                                            handleKeyUp={(e) => {
                                                if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "ArrowLeft") {
                                                    return;
                                                }
                                                this.props.getRecentVersions(e.target.value, this.props.branch)
                                            }}
                                            dropdownData={this.props.versionSuggestions}
                                            handleFilterEnter={this.props.handleVersionStartsWith}/>
                                    </div>
                                </div>
                            </div> :
                            <Loader width="100%" style={{margin: "100px auto"}}/>
                        }
                        <div className="row">
                            <div style={{flexBasis: "614px", minWidth: "614px"}} className="dashboard-item">
                                {!this.state.openEffectivePipelineRunByRun &&
                                <div className="graph-button-block" onClick={()=>{
                                    this.setState({openEffectivePipelineRunByRun: true});
                                    this.props.handleEffectivePipelineRunByRun(this.props.branch);
                                }}><div className="graph-button">Effective Pipeline Run By Run</div></div>}
                                {this.state.openEffectivePipelineRunByRun &&
                                    (!props.fetching_effective_run_by_run && props.effective_run_by_run ?
                                            <QualityLineGraphBlock title="Effective Run by Run"
                                                                   data={props.effective_run_by_run.data}
                                                                   domain={props.effective_run_by_run.allversions}/> :
                                            <Loader style={{margin: "80px"}} medium={true}/>
                                    )
                                }
                            </div>
                            <div style={{flexBasis: "614px", minWidth: "614px", marginRight: "0px"}} className="dashboard-item">
                                {this.state.openPipelineRunByRun &&
                                    (!props.fetching_run_by_run && props.run_by_run ?
                                            <QualityLineGraphBlock title="Run by Run" data={props.run_by_run.data}
                                                                   domain={props.run_by_run.allversions}/> :
                                            <Loader style={{margin: "80px"}} medium={true}/>
                                    )
                                }
                                {!this.state.openPipelineRunByRun &&
                                <div className="graph-button-block" onClick={()=> {
                                    this.setState({openPipelineRunByRun: true});
                                    this.props.handlePipelineRunByRun(this.props.branch);
                                }}><div className="graph-button">Pipeline Run By Run</div></div>}
                            </div>
                        </div>
                        <div className="row">
                            <div style={{flexBasis: "1238px", minWidth: "1238px", marginRight: "0px"}} className="dashboard-item">
                                {!this.state.openLastFiveTrend ?
                                    <div className="graph-button-block" onClick={()=>{
                                        this.setState({openLastFiveTrend: true});
                                        if (!this.props.lastFiveTrend) {
                                            this.props.getLastFiveTrend();
                                        }
                                    }}>
                                        <div className="graph-button">Test Cases Consecutively Passed Five Times excluding Infra/Product Failure</div>
                                    </div> : (
                                        this.props.lastFiveTrend ?
                                        <QualityLineGraphBlock title="Test Cases Consecutively Passed Five Times excluding Infra/Product Failures"
                                                               data={this.props.lastFiveTrend.data}
                                                               width={1250}
                                                               domain={this.props.lastFiveTrend.allversions}/> :
                                        <Loader style={{margin: "80px"}} medium={true}/>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </Fragment>
            )
        } else if (title === "System") {
            return !props.fetching_system && data ?
                <QualityTableBlock title={title} table_one={data["table_one"]} table_two={data["table_two"]}/> :
                <Loader width="100%" style={{margin: "100px auto"}}/>

        } else {
            return !props.fetching_performance && data ?
                <QualityTableBlock
                    title={title}
                    table_one={data["table_one"]}
                    table_two={data["table_two"]}
                    branch={this.props.branch}
                    fetching_filtered_performance_context={this.props.fetching_filtered_performance_context}
                    filtered_performance_context={this.props.filtered_performance_context}
                    handlePerformanceVersionSelection={this.props.handlePerformanceVersionSelection}
                    performanceMetricData={this.props.performanceMetricData}
                    toggleBaseline={this.props.toggleBaseline}
                    getPerformanceMetricData={this.props.getPerformanceMetricData}
                    featureTableauLink={this.props.featureTableauLink}
                    getFeatureTableauLink={this.props.getFeatureTableauLink}
                    feature={this.props.feature}
                    handleSubmit={this.props.handleSubmit}
                /> :
                <Loader width="100%" style={{margin: "100px auto"}}/>
        }
    };

    render() {
        if (this.props.title !== "Pipeline") {
            return (
                <BigCard>
                    {this.getBigCardContent(this.props)}
                </BigCard>
            )
        } else {
            return (
                <div style={{animation: ".5s fade-in"}}>
                    {this.getBigCardContent(this.props)}
                </div>
            )
        }
    }
}


export default QualityBigCard;
