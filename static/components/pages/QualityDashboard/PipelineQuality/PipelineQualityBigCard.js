import React, {Component, Fragment} from 'react';
import * as PropTypes from "prop-types";
import * as _ from "lodash";
import ToggleSwitch from "../../../reusable/ToggleSwitch";
import QualityPieGraphBlock from "../QualityPieGraphBlock";
import Filter from "../../../reusable/Filter";
import Loader from "../../../reusable/Loader";
import QualityLineGraphBlock from "../QualityLineGraphBlock";
import BigCard from "../../../reusable/BigCard";
import BuildRegression from "./BuildRegression";

class PipelineQualityBigCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pipelines: {},
            selectedVersion: props.specificBranchVersion,
            openPipelineRunByRun: true,
            openEffectivePipelineRunByRun: !_.isEmpty(props.effective_run_by_run),
            openLastFiveTrend: !_.isEmpty(props.lastFiveTrend),
            prune: true,
        };

        for (const pipeline of props.selectedPipelines) {
            this.state.pipelines[pipeline] = true;
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(_.sortBy(this.props.selectedPipelines), _.sortBy(nextProps.selectedPipelines))) {
            let newPipelineState = {};
            for (const pipeline of nextProps.selectedPipelines) {
                newPipelineState[pipeline] = true;
            }
            this.setState({pipelines: newPipelineState});
        }
        if (!_.isEqual(_.sortBy(this.props.selectedPipelines), _.sortBy(nextProps.selectedPipelines)) ||
            !_.isEqual(this.props.specificBranchVersion, nextProps.specificBranchVersion)) {
            this.setState({
                selectedVersion: nextProps.specificBranchVersion,
                openEffectivePipelineRunByRun: !_.isEmpty(nextProps.effective_run_by_run),
                openPipelineRunByRun: true,
                openLastFiveTrend: !_.isEmpty(nextProps.lastFiveTrend)
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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

    getGraphValues = ({vals, total}) => {
        let rtrn_array = [];
        for (let i = 0; i < vals.length; i++) {
            let perc = 100 * (vals[i] / total);
            perc = Number(Math.round(perc + 'e2') + "e-2");
            rtrn_array.push(perc);
        }
        return rtrn_array;
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

        let healthTotal = passed + notRun + failed + skipped + deploy_and_install_failure;
        let passFailTotal = passed + failed + notRun;
        let triageTotal = prod + test + infr + undet + untri;

        const [success, fail, notrun, skip, deploy_fail] = this.getGraphValues({
            vals: [passed, failed, notRun, skipped, deploy_and_install_failure],
            total: healthTotal
        });
        const [successExec, failExec] = this.getGraphValues({vals: [passed, failed], total: passFailTotal});
        const [product, infra, testcase, undetermined, untriaged] = this.getGraphValues({
            vals: [prod, infr, test, undet, untri],
            total: triageTotal
        });
        return {
            healthTotal,
            passFailTotal,
            triageTotal,
            healthData: [
                {"label": "Success", "value": success, "num": passed},
                {"label": "Skip", "value": skip, "num": skipped},
                {"label": "Fail", "value": fail, "num": failed},
                {"label": "Not Run", "value": notrun, "num": notRun},
                {"label": "Deploy&Install", "value": deploy_fail, "num": deploy_and_install_failure},
            ],
            healthDataPassFail: [
                {"label": "Success", "value": successExec, "num": passed},
                {"label": "Fail", "value": failExec, "num": failed},
                {"label": "Not Run", "value": notrun, "num": notRun},
            ],
            triageData: [
                {"label": "Product", shortLabel: "Prod", "value": product, "num": prod},
                {"label": "Infra", "value": infra, "num": infr},
                {"label": "Test Case", shortLabel: "TC", "value": testcase, "num": test},
                {"label": "Undet", "value": undetermined, "num": undet},
                {"label": "Untriaged", shortLabel: "Untri", "value": untriaged, "num": untri}
            ],
            link,
            target,
            failure_reasons
        }
    };

    getCompletionStatusStyle = (completionStatus) => {
        let defaultStyle = {fontWeight: 400};
        switch (completionStatus) {
            case "Failed":
            case "Aborted":
                return {...defaultStyle, color: "rgba(217, 75, 95,1)"};
            case "Success":
                return {...defaultStyle, color: "rgba(50, 190, 100, 1)"};
            default:
                return {...defaultStyle, color: "rgba(80, 80, 80, 1)"}
        }
    };


    getLatestRunTitle = (data) => {
        return (
            <div>
                <span>Latest Run Summary</span>
                <div
                    className="title-comments"
                    style={{left: "10px"}}
                >
                    {
                        Object.keys(data.meta_data).map(pr => {
                            if (pr === "total") {
                                return null;
                            }
                            let completionStatus = data.meta_data[pr]["pipeline_completion_status"];

                            return (
                                <div key={pr + "latestrunstats"}>{pr}:
                                    <span style={{
                                        marginLeft: "4px",
                                        fontWeight: 400
                                    }}>{data.meta_data[pr]["version"]}</span>
                                    <span style={{
                                        marginLeft: "4px",
                                    }}>
                                        <span> - </span>
                                        <span style={this.getCompletionStatusStyle(completionStatus)}>{completionStatus}</span>
                                    </span>
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
                <div className="title-comments">
                    <div style={{color: "rgb(160,160,160)"}}>Tests passed consecutively in the last 5
                        builds:
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
        let triage_data = data.issue_counter[selection];
        return (
            <div>
                <span>{title}</span>
                {(selection && triage_data) &&
                <div
                    className="title-comments"
                    style={{
                        lineHeight: 1,
                        display: "flex",
                        flexWrap: "wrap",
                    }}
                >
                    {
                        Object.keys(triage_data).map(triage => {
                            if (!triage_data[triage]["count"]) {
                                return;
                            }
                            return (
                                <a href={triage_data[triage]["link"]} className="triage-data"
                                   key={triage + "latestrunstats"} style={{
                                    textDecoration: "none",
                                    marginRight: "3px",
                                    marginBottom: "3px"
                                }}>{triage}:
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
                    <ToggleSwitch checked={this.state.pipelines[pipeline]} title={pipeline}
                                  style={{marginLeft: "8px"}}
                                  onClick={() => this.handlePipelineToggle(pipeline)}/>
                </div>
            )
        });
    };

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
        let healthIcon = (
            <div style={{display: "flex", alignItems: "center"}}>
                <span>{categoryObj["failure_count"]}</span>
                <i className="material-icons error-icon">error_outline</i>
            </div>

        );
        let date = <span/>;
        if (categoryObj["period"]) {
            date = categoryObj["period"];
        }
        return (
            <div className="big-card-title full" style={{backgroundColor, color: "white", borderRadius: "5px"}}>
                <div style={{fontFamily: "Ubuntu"}}>{healthIcon}</div>
                <div style={{fontSize: "15px", marginLeft: "auto"}}>{date}</div>
            </div>
        )
    };

    getBigCardContent = (props) => {
        let title = props.title;
        let data = props.data;
        return (
            <Fragment>
                <div className="col-xs-12" style={{display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
                    <div className="row">
                        <QualityPieGraphBlock
                            id={"effective" + props.branch.split(".").join("-")}
                            className="dashboard-item"
                            data={data}
                            branch={props.branch}
                            style={{width: "320px"}}
                            getPieData={this.getPieData}
                            title={data && this.getEffectiveRunTitle(data, "Effective Summary")}
                            hideFailures={true}
                            smallTitle={true}
                            prune={this.state.prune}
                            fetching={props.fetching_pipeline}
                            redirectToProductQuality={props.redirectToProductQuality}
                        />
                        <QualityPieGraphBlock
                            className="dashboard-item"
                            id={"latest" + props.branch.split(".").join("-")}
                            data={data && data.latest_data}
                            branch={props.branch}
                            style={{width: "641px"}}
                            getPieData={this.getPieData}
                            title={data && this.getLatestRunTitle(data.latest_data)}
                            prune={this.state.prune}
                            fetching={props.fetching_pipeline}
                            failureTitle={(selection) => this.getFailureTitle(data.latest_data, "Failure Breakdown", selection)}
                            redirectToProductQuality={props.redirectToProductQuality}
                        />
                        <div style={{flexBasis: "253px", minWidth: "253px", marginRight: "0px"}}
                             className="dashboard-item">
                            <div className="pie-container">
                                <div className="half-title" style={{paddingTop: "1px"}}>Filters</div>
                                <div className="filter-block">
                                    {this.pipelineButtons(props.selectedPipelines)}
                                    <div className="pipeline-button" style={{
                                        marginBottom: "auto",
                                        paddingTop: "10px"
                                    }}>
                                        <ToggleSwitch checked={this.state.prune}
                                                      title="Prune Skip"
                                                      style={{marginLeft: "8px"}}
                                                      sliderClass="orange-slider"
                                                      onClick={() => {
                                                          this.setState({prune: !this.state.prune});
                                                      }}/>
                                    </div>
                                    <div style={{marginTop: "40px", width: "80%", marginLeft: "8px"}}>
                                        <Filter
                                            style={{marginLeft: "auto", marginRight: "10px"}}
                                            title={"Specify Version " + this.state.selectedVersion}
                                            defaultValue={props.branch}
                                            value={this.state.selectedVersion}
                                            onFocus={(value) => props.getRecentVersions(value, props.branch)}
                                            handleChange={value => {
                                                this.setState({selectedVersion: value});
                                            }}
                                            handleKeyUp={(e) => {
                                                if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "ArrowLeft") {
                                                    return;
                                                }
                                                props.getRecentVersions(e.target.value, props.branch)
                                            }}
                                            dropdownData={props.versionSuggestions}
                                            handleFilterEnter={value => props.handleVersionStartsWith(value)}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div style={{flexBasis: "614px", minWidth: "614px"}} className="dashboard-item">
                            {!this.state.openEffectivePipelineRunByRun &&
                            <div className="graph-button-block" onClick={() => {
                                this.setState({openEffectivePipelineRunByRun: true});
                                props.handleEffectivePipelineRunByRun();
                            }}>
                                <div className="graph-button">Effective Pipeline Run By Run</div>
                            </div>}
                            {this.state.openEffectivePipelineRunByRun &&
                            (!props.fetching_effective_run_by_run && props.effective_run_by_run ?
                                    <QualityLineGraphBlock title="Effective Run by Run"
                                                           data={props.effective_run_by_run.data}
                                                           domain={props.effective_run_by_run.allversions}/> :
                                    <Loader style={{margin: "120px"}} medium={true}/>
                            )
                            }
                        </div>
                        <div style={{flexBasis: "614px", minWidth: "614px", marginRight: "0px"}}
                             className="dashboard-item">
                            {this.state.openPipelineRunByRun &&
                            (!props.fetching_run_by_run && props.run_by_run ?
                                    <QualityLineGraphBlock title="Run by Run" data={props.run_by_run.data}
                                                           domain={props.run_by_run.allversions}/> :
                                    <Loader style={{margin: "120px"}} medium={true}/>
                            )
                            }
                            {!this.state.openPipelineRunByRun &&
                            <div className="graph-button-block" onClick={() => {
                                this.setState({openPipelineRunByRun: true});
                                props.handlePipelineRunByRun();
                            }}>
                                <div className="graph-button">Pipeline Run By Run</div>
                            </div>}
                        </div>
                    </div>
                    <div className="row">
                        <div style={{flexBasis: "1238px", minWidth: "1238px", marginRight: "0px"}}
                             className="dashboard-item">
                            {!this.state.openLastFiveTrend ?
                                <div className="graph-button-block" onClick={() => {
                                    this.setState({openLastFiveTrend: true});
                                    if (!props.lastFiveTrend) {
                                        props.getLastFiveTrend();
                                    }
                                }}>
                                    <div className="graph-button">Test Cases Consecutively Passed Five Times
                                        excluding Infra/Product Failure
                                    </div>
                                </div> : (
                                    props.lastFiveTrend ?
                                        <QualityLineGraphBlock
                                            title="Test Cases Consecutively Passed Five Times excluding Infra/Product Failures"
                                            data={props.lastFiveTrend.data}
                                            width={1210}
                                            domain={props.lastFiveTrend.allversions}/> :
                                        <Loader style={{margin: "80px"}} medium={true}/>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <BuildRegression
                        getRecentVersions={(value) => props.getRecentVersions(value, props.branch)}
                        versionSuggestions={props.versionSuggestions}
                        branch={props.branch}
                        build1={props.build1}
                        build2={props.build2}
                        getBuildByBuildRegression={props.getBuildByBuildRegression}
                        buildByBuildRegression={props.buildByBuildRegression}
                        fetchingBuildByBuildRegression={props.fetchingBuildByBuildRegression}
                        changeRegressionBuild={props.changeRegressionBuild}
                    />
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

PipelineQualityBigCard.propTypes = {
    selectedPipelines: PropTypes.array.isRequired,
    maxPipelineCount: PropTypes.number.isRequired,
    specificBranchVersion: PropTypes.string,
    branch: PropTypes.string.isRequired,
    versionSuggestions: PropTypes.array,
    run_by_run: PropTypes.object,
    effective_run_by_run: PropTypes.object,
    lastFiveTrend: PropTypes.object,
    data: PropTypes.object,
    fetching_pipeline: PropTypes.bool.isRequired,
    fetching_run_by_run: PropTypes.bool.isRequired,
    fetching_effective_run_by_run: PropTypes.bool.isRequired,
    handleEffectivePipelineRunByRun: PropTypes.func.isRequired,
    handlePipelineRunByRun: PropTypes.func.isRequired,
    handleVersionStartsWith: PropTypes.func.isRequired,
    redirectToProductQuality: PropTypes.func.isRequired,
    getRecentVersions: PropTypes.func.isRequired,
    getLastFiveTrend: PropTypes.func.isRequired,
};

PipelineQualityBigCard.defaultProps = {
    title: "Pipeline",
    fetching_pipeline: true,
    fetching_run_by_run: true,
    fetching_effective_run_by_run: true,
};

export default PipelineQualityBigCard;
