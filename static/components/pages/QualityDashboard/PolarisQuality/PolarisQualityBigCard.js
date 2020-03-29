import QualityPieGraphBlock from "../QualityPieGraphBlock";
import React from "react";
import QualityLineGraphBlock from "../QualityLineGraphBlock";
import Loader from "../../../reusable/Loader";
import _ from "lodash";


class PolarisQualityBigCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

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

    getRunTitle = (data, title, branch) => {
        return (
            <div>
                <span>{title}</span>
                <div className="title-comments" style={{width: "320px", bottom: "2px", left: "7px"}}>
                    <div>{"Latest " + branch + " Build(s):"}</div>
                    <div style={{color: "rgb(160,160,160)", display: "flex", flexWrap: "wrap"}}>
                        {
                            (data && !_.isEmpty(data)) &&
                            Object.keys(data.latest_data.meta_data).map((ele) => {
                                if (ele === "total") return;
                                return (
                                    <div style={{padding: "0px 2px", borderLeft: "1px solid rgb(220,220,220)"}}>
                                        <span style={{marginRight: "1px", color: "rgb(130,135,135)"}}>{ele.split("/")[0]}:</span><span style={{fontWeight: 400}}>{data.latest_data.meta_data[ele].version[0].split("-")[1]}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const {data} = this.props;
        const props = this.props;
        let canaryPieId = ("canary" +  props.branch + props.category).split(" ").join("");
        let weeklyPieId = ("effective" + props.latestBranch + props.category).split(" ").join("");
        let masterPieId = ("effective" + props.branch + props.category).split(" ").join("");
        return (
            <div className="row">
                <QualityPieGraphBlock
                    id={masterPieId}
                    className="dashboard-item"
                    data={data[this.props.masterId]}
                    branch={props.branch}
                    style={{width: "641px"}}
                    getPieData={this.getPieData}
                    title={this.getRunTitle(data[this.props.masterId], "Master Build Summary", props.branch)}
                    smallTitle={true}
                    prune={true}
                    failureTitle={() => "Triage"}
                    redirectToProductQuality={props.redirectToProductQuality}
                />
                <QualityPieGraphBlock
                    className="dashboard-item"
                    id={weeklyPieId}
                    data={data[this.props.latestBranchId]}
                    branch={props.latestBranch}
                    style={{width: "641px"}}
                    getPieData={this.getPieData}
                    title={this.getRunTitle(data[this.props.latestBranchId],"Weekly Build Summary", props.latestBranch)}
                    prune={true}
                    fetching={props.fetching_pipeline}
                    failureTitle={() => "Triage"}
                    redirectToProductQuality={props.redirectToProductQuality}
                />
                {Boolean(this.props.canaryId) && <QualityPieGraphBlock
                    className="dashboard-item"
                    id={canaryPieId}
                    data={data[this.props.canaryId]}
                    branch={props.branch}
                    style={{width: "641px"}}
                    getPieData={this.getPieData}
                    title={this.getRunTitle(data[this.props.canaryId],"Canary Status", props.branch)}
                    prune={true}
                    fetching={props.fetching_pipeline}
                    failureTitle={() => "Triage"}
                    redirectToProductQuality={props.redirectToProductQuality}
                />}
                {this.props.category !== "All" &&
                    <div style={{flexBasis: "1244px", minWidth: "1244px", marginRight: "0px", overFlow: "auto"}} className="dashboard-item">
                        {Boolean(this.props.graphData[this.props.masterId]) ?
                            <QualityLineGraphBlock
                                title="Pass % Trend"
                                data={this.props.graphData[this.props.masterId].data}
                                width={this.props.canaryId ? 1492 : 1492}
                                domain={this.props.graphData[this.props.masterId].allversions}
                            /> :
                            <Loader style={{margin: "80px"}} medium={true}/>
                        }
                    </div>
                }
            </div>
        )
    }
}


export default PolarisQualityBigCard;
