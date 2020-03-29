import React, {Component, Fragment} from 'react';
import _ from "lodash";
import SystemBarGraphBlock from "./SystemBarGraphBlock";
import SystemClusterHealth from "./SystemClusterHealth";
import * as PropTypes from "prop-types";
import BigCard from "../../../reusable/BigCard";
import Loader from "../../../reusable/Loader";
import QualityTableBlock from "../QualityTableBlock";
import QualityLineGraphBlock from "../QualityLineGraphBlock";
import Filter from "../../../reusable/Filter";
import ToggleSwitch from "../../../reusable/ToggleSwitch";
import QualityPieGraphBlock from "../QualityPieGraphBlock";

class SystemQualityBigCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedVersion: props.specificBranchVersion,
            openSystemRunByRun: true,
            openEffectiveSystemRunByRun: !_.isEmpty(props.effective_run_by_run),
            prune: true
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.specificBranchVersion, nextProps.specificBranchVersion)) {
            this.setState({
                selectedVersion: nextProps.specificBranchVersion,
                openEffectiveSystemRunByRun: !_.isEmpty(nextProps.effective_run_by_run),
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

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
                            let completionStatus = _.has(data.meta_data[pr], "completion_status") ? data.meta_data[pr]["completion_status"] : "Completed";
                            return (
                                <div key={pr + "latestrunstats"}>Build:
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
        let passFailTotal = passed + failed;
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
                {/*<div style={{marginRight: "8px", fontFamily: "Ubuntu"}}>{this.props.branch}</div>*/}
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
                            data={data && data.chart_data}
                            branch={props.branch}
                            getPieData={this.getPieData}
                            title={data && this.getEffectiveRunTitle(data.chart_data, "Effective Summary")}
                            hideFailures={true}
                            smallTitle={true}
                            style={{width: "320px"}}
                            prune={this.state.prune}
                            fetching={props.fetching_system}
                            redirectToProductQuality={props.redirectToProductQuality}
                        />
                        <QualityPieGraphBlock
                            className="dashboard-item"
                            id={"latest" + props.branch.split(".").join("-")}
                            data={data && data.chart_data.latest_data}
                            style={{width: "641px"}}
                            branch={props.branch}
                            fetching={props.fetching_system}
                            getPieData={this.getPieData}
                            title={data && this.getLatestRunTitle(data.chart_data.latest_data)}
                            prune={this.state.prune}
                            failureTitle={(selection) => this.getFailureTitle(data.chart_data.latest_data, "Failure Breakdown", selection)}
                            redirectToProductQuality={props.redirectToProductQuality}
                        />
                        <div style={{flexBasis: "253px", minWidth: "253px", marginRight: "0px"}}
                             className="dashboard-item">
                            <div className="pie-container">
                                <div className="half-title" style={{paddingTop: "1px"}}>Filters</div>
                                <div className="filter-block">
                                    <div className="pipeline-button" style={{
                                        marginBottom: "auto",
                                        paddingTop: "10px"
                                    }}>
                                        <ToggleSwitch checked={this.state.prune} title="Prune not run and skip"
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
                            {!this.state.openEffectiveSystemRunByRun &&
                            <div className="graph-button-block" onClick={() => {
                                this.setState({openEffectiveSystemRunByRun: true});
                                props.handleEffectiveSystemRunByRun();
                            }}>
                                <div className="graph-button">Effective Pipeline Run By Run</div>
                            </div>}
                            {this.state.openEffectiveSystemRunByRun &&
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
                            {this.state.openSystemRunByRun &&
                            (!props.fetching_run_by_run && props.run_by_run ?
                                    <QualityLineGraphBlock title="Run by Run" data={props.run_by_run.data}
                                                           domain={props.run_by_run.allversions}/> :
                                    <Loader style={{margin: "120px"}} medium={true}/>
                            )
                            }
                            {!this.state.openSystemRunByRun &&
                            <div className="graph-button-block" onClick={() => {
                                this.setState({openSystemRunByRun: true});
                                props.handleSystemRunByRun();
                            }}>
                                <div className="graph-button">Pipeline Run By Run</div>
                            </div>}
                        </div>
                    </div>
                    <div className="row">
                        <div
                            style={{
                                flexBasis: "1238px",
                                minWidth: "1238px",
                                marginRight: "0px",
                                paddingTop: '14px'
                            }}
                            className="dashboard-item">
                            <div className="big-card-title half-title"
                                 style={{padding: "0 10px 16px 16px"}}>Categories
                            </div>
                            {!props.fetching_system && data ?
                                <QualityTableBlock
                                    title={title}
                                    table_one={data["table_one"]}
                                    table_two={data["table_two"]}/> :
                                <Loader width="100%" style={{margin: "100px auto"}}/>
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div style={{
                            flexBasis: "1238px",
                            minWidth: "1238px",
                            marginRight: "0px",
                            paddingTop: '16px'
                        }}
                             className="dashboard-item">
                            <div className="big-card-title half-title"
                                 style={{padding: "0 10px 16px 16px"}}>{"Cluster Health"}</div>
                            <SystemClusterHealth branch={props.branch}
                                                 fetching_data={props.fetching_system_clusters}
                                                 fetching_breakdown={props.fetching_system_clusters_breakdown}
                                                 data={props.system_clusters}
                                                 breakdown={props.system_clusters_breakdown}
                                                 handleFetchData={props.handleClusterBreakdown}/>
                        </div>
                    </div>
                    <div className="row">
                        <div style={{
                            flexBasis: "1238px",
                            minWidth: "1238px",
                            marginRight: "0px",
                            paddingTop: '16px'
                        }}
                             className="dashboard-item">
                            <div className="big-card-title half-title"
                                 style={{padding: "0 10px 16px 16px"}}>{"System Tests Across Builds"}</div>
                            {!props.fetching_system_test_across_builds && !_.isEmpty(props.system_test_across_builds) ?
                                <SystemBarGraphBlock domain={props.system_test_across_builds.domain}
                                                     data={props.system_test_across_builds.data}
                                                     redirectToProductQuality={props.redirectToProductQuality}/> :
                                <Loader width="100%" style={{margin: "100px auto"}}/>
                            }
                        </div>
                    </div>
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

SystemQualityBigCard.propTypes = {
    branch: PropTypes.string.isRequired,
    specificBranchVersion: PropTypes.string,
    versionSuggestions: PropTypes.array,
    run_by_run: PropTypes.object,
    effective_run_by_run: PropTypes.object,
    data: PropTypes.object,
    system_test_across_builds: PropTypes.object,
    system_clusters: PropTypes.object,
    system_clusters_breakdown: PropTypes.object,
    fetching_system: PropTypes.bool.isRequired,
    fetching_system_test_across_builds: PropTypes.bool.isRequired,
    fetching_system_clusters: PropTypes.bool.isRequired,
    fetching_system_clusters_breakdown: PropTypes.object.isRequired,
    fetching_run_by_run: PropTypes.bool.isRequired,
    fetching_effective_run_by_run: PropTypes.bool.isRequired,
    handleClusterBreakdown: PropTypes.func.isRequired,
    handleEffectiveSystemRunByRun: PropTypes.func.isRequired,
    handleSystemRunByRun: PropTypes.func.isRequired,
    handleVersionStartsWith: PropTypes.func.isRequired,
    redirectToProductQuality: PropTypes.func.isRequired,
    getRecentVersions: PropTypes.func.isRequired,
};

SystemQualityBigCard.defaultProps = {
    title: "System",
};

export default SystemQualityBigCard;