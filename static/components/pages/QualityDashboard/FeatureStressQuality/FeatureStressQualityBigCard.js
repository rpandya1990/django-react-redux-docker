import React, {Component, Fragment} from 'react';
import _ from "lodash";
import {connect} from "react-redux";
import {
    getFeatureStressTestResults
} from "../../../../actions/qualityDashboard";
// import SystemBarGraphBlock from "./SystemBarGraphBlock";
// import SystemClusterHealth from "./SystemClusterHealth";
import * as PropTypes from "prop-types";
import BigCard from "../../../reusable/BigCard";
import Loader from "../../../reusable/Loader";
import QualityTableBlock from "../QualityTableBlock";
import QualityLineGraphBlock from "../QualityLineGraphBlock";
import Filter from "../../../reusable/Filter";
import ToggleSwitch from "../../../reusable/ToggleSwitch";
import QualityPieGraphBlock from "../QualityPieGraphBlock";
import "../../../../css/DestinyDashboard.css";
import  { Redirect } from 'react-router-dom'
class FeatureStressQualityBigCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pipelines: {},
            selectedVersion: props.specificBranchVersion,
            openSystemRunByRun: true,
            prune: true,
            feature: ""
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.specificBranchVersion, nextProps.specificBranchVersion)) {
            this.setState({
                selectedVersion: nextProps.specificBranchVersion,
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    renderFeatureRow = (table_one) => {
        return(
            <div className="content-block" style={{display: this.state.feature ? "block" : "flex", justifyContent: "flex-start", width: this.state.feature ? "100%" : "85%", margin: "0 auto", overflow: "auto", minHeight: "300px"}}>
                {table_one.map(row => {
                let rowHeader = row["header"];
                let failures = row["failures"];
                let icon = failures ? <Fragment><span style={{fontSize: "20px", marginRight: "6px"}}>{failures}</span><i className="material-icons" style={{color: "rgba(255, 22, 22, 1)", fontSize: "20px", opacity: .5, marginRight: "6px"}}>error</i></Fragment> : <Fragment><span style={{fontSize: "20px", marginRight: "6px"}}>0</span><i className="material-icons" style={{color: "rgb(200, 200, 200)", fontSize: "20px", opacity: .5}}>error_outline</i></Fragment>;
                // let backgroundColor = getMainPerformanceColor(failures);
                return (
                    <div className="table-row" onClick={(e) => {window.open("http://google.com");}}>
                        <div style={{display: "flex", padding: "5px", alignItems: "center", margin: "1px 6px", flexFlow: "column"}}>
                            <div style={{fontSize: "15px", color: "rgb(60,60,70)", fontWeight: 300, fontFamily: "Raleway"}}>{rowHeader}</div>
                            <div style={{display: "flex", alignItems: "center"}}>
                                {icon}
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        )
    };

    renderFeatureStressTable = (res_data) => {
        return(
            <table className="system-table" style={{boxShadow: "rgba(0, 0, 0, 0.14) 0px 1px 6px 0px, rgba(0, 0, 0, 0.12) 0px 3px 5px 0px"}}>
                <thead>
                    <tr>
                        <th style={{fontSize: "22px"}}>Build</th>
                        <th style={{fontSize: "22px"}}>Feature</th>
                        <th style={{fontSize: "22px"}}>Pass %</th>
                        <th style={{fontSize: "22px"}}>Start Time</th>
                        <th style={{fontSize: "22px"}}>End Time</th>
                        <th style={{fontSize: "22px"}}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        res_data.map(result =>
                            <tr>
                                <td style={{fontSize: "16px"}}>{result.build}</td>
                                <td style={{fontSize: "16px"}}>{result.feature}</td>
                                <td style={{fontSize: "16px"}}>{result.pass_percentage}%</td>
                                <td style={{fontSize: "16px"}}>{result.start_time}</td>
                                <td style={{fontSize: "16px"}}>{result.end_time}</td>
                                <td style={{fontSize: "16px"}}>{result.status}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        )
    }

    renderRunsTable = (run_by_run) => {
        return (
            <div className="dashboard-item">
                <QualityLineGraphBlock title="Run by Run" data={run_by_run.data}
                domain={run_by_run.allversions}/>
            </div>
        )
    }

    redirectToElk = () => {
        return <Redirect to='google.com'/>
    }

    //Donut Chart

    getGraphValues = ({vals, total}) => {
        let rtrn_array = [];
        for (let i = 0; i < vals.length; i++) {
            let perc = 100 * (vals[i] / total);
            perc = Number(Math.round(perc + 'e2') + "e-2");
            rtrn_array.push(perc);
        }
        return rtrn_array;
    };

    checkPipelines = (pipelines) => {
        let pipelineSet = new Set();
        for (const pipeline of Object.keys(pipelines)) {
            if (pipelines[pipeline]) {
                pipelineSet.add(pipeline);
            }
        }
        return pipelineSet;
    };

    getPieData = (data) => {
        let {status_counter, triage_counter, links, meta_data, failure_reasons} = data;
        let target = 'total';
        let selectedPipelines = this.checkPipelines(this.state.pipelines);

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
        let passFailTotal = passed+failed;
        let triageTotal = prod + test + infr + undet + untri;

        const [success, fail, notrun, skip, deploy_fail] = this.getGraphValues({vals: [passed, failed, notRun, skipped, deploy_and_install_failure], total: healthTotal});
        const [successExec, failExec] = this.getGraphValues({vals: [passed, failed], total: passFailTotal});
        const [product, infra, testcase, undetermined, untriaged] = this.getGraphValues({vals: [prod, infr, test, undet, untri], total: triageTotal});
        let result =  {
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

        return result
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
                        }}>{5}%</span>

                    </div>
                </div>
            </div>
        );
    };

    getBigCardContent = (props) => {
        let title = props.title;
        let res_data = !_.isEmpty(props.stressResults) ? props.stressResults.all_results : []
        let table_one = !_.isEmpty(props.stressResults) ? props.stressResults.table_one : []
        let effective_summary = !_.isEmpty(props.stressResults) ? props.stressResults.chart_data : []
        // TODO:Rishab Wait to calculate this from API given the uuid and feature

        return (
            <div className="col-xs-12" style={{display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
                <div className="row" style={{display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
                        <QualityPieGraphBlock
                            id={"effective"+props.branch.split(".").join("-")}
                            className="dashboard-item"
                            data={props.stressResults && effective_summary}
                            branch={props.branch}
                            getPieData={this.getPieData}
                            title={effective_summary && this.getEffectiveRunTitle(props.chart_data, "Effective Summary")}
                            hideFailures={true}
                            smallTitle={true}
                            prune={false}
                            redirectToProductQuality={this.props.redirectToProductQuality}
                        />
                        <div style={{flexBasis: "153px", minWidth: "223px", marginLeft: "0px"}}
                            className="dashboard-item">
                            <div className="half-title" style={{paddingTop: "10px"}}>Filters</div>
                                <div className="filter-block">
                                    <div style={{marginTop: "80px", width: "80%", marginLeft: "8px"}}>
                                        <Filter
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
                    {
                        !_.isEmpty(props.run_by_run) ? this.renderRunsTable(props.run_by_run) : console.log("Cannot render Runs Table")
                    }
                    {
                        !_.isEmpty(table_one) ? this.renderFeatureRow(table_one): null
                    }
                    {
                        !_.isEmpty(res_data) ? this.renderFeatureStressTable(res_data): null
                    }
            </div>
        )
    };

    render() {
        return (
            <BigCard children={
                this.getBigCardContent(this.props)
            }/>
        );
    };
}

FeatureStressQualityBigCard.propTypes = {
    branch: PropTypes.string.isRequired,
    specificBranchVersion: PropTypes.string,
    versionSuggestions: PropTypes.array,
    run_by_run: PropTypes.object,
    fetching_system: PropTypes.bool.isRequired,
    handleVersionStartsWith: PropTypes.func.isRequired,
    getRecentVersions: PropTypes.func.isRequired,
    stressResults: PropTypes.object
};

FeatureStressQualityBigCard.defaultProps = {
    title: "Feature Stress"
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(FeatureStressQualityBigCard);
