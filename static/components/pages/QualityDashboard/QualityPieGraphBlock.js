import React, {Fragment} from "react";
import {uniqueArrayEquals} from "../../../utils";
import PieChart from "../../reusable/Charts/PieChart";
import Loader from "../../reusable/Loader";
import _ from "lodash";


class QualityPieGraphBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    renderPieContainers = ({graphType, triageTotal, link, triageData, target, failure_reasons, currentData, total}) => {
        return (
            <Fragment>
                <div className="pie-container">
                    <div className="big-card-title half-title">{this.props.title}</div>
                    <PieChart
                        id={this.props.id}
                        branch={this.props.branch}
                        data={currentData}
                        link={link}
                        redirectToProductQuality={this.props.redirectToProductQuality}
                        total={total}
                        removeLabels={true}
                        smallTitle={this.props.smallTitle}
                        failure_reasons={failure_reasons}
                        graphType={graphType}
                    />
                </div>
                {
                    !this.props.hideFailures &&
                    <div className="pie-container" style={{borderLeft: "3px solid rgb(232,232,232)"}}>
                        <div className="big-card-title half-title"
                             style={{paddingLeft: "10px"}}>{this.props.failureTitle(target)}</div>
                        <PieChart
                            id={this.props.id + "failure"}
                            branch={this.props.branch}
                            data={triageData}
                            link={link}
                            smallTitle={true}
                            redirectToProductQuality={this.props.redirectToProductQuality}
                            total={triageTotal}
                            graphType="triage"
                        />
                    </div>
                }
            </Fragment>
        )
    };

    createGraphChildren = (data, prune) => {
        if (this.props.fetching || _.isEmpty(data)) {
            return (
                <div className="data-card" style={{margin: "100px auto"}}>
                    <Loader small/>
                </div>
            );
        }

        const {
            healthData,
            healthDataPassFail,
            triageData,
            healthTotal,
            passFailTotal,
            triageTotal,
            link,
            target,
            failure_reasons
        } = this.props.getPieData(data);

        let currentData = healthDataPassFail;
        let graphType = "pruned";
        let total = passFailTotal;
        if (!prune) {
            currentData = healthData;
            total = healthTotal;
            graphType = "notpruned";
        }
        return (
            <div className="data-card">
                <div style={{display: "flex"}} >
                    {this.renderPieContainers({graphType, triageTotal, link, triageData, target, failure_reasons, currentData, total})}
                </div>
            </div>
        )
    };

    render() {
        return (
            <div style={{position: "relative", display: "flex", ...this.props.style}} className={this.props.className}>
                {this.createGraphChildren(this.props.data, this.props.prune)}
            </div>
        )
    }
}


QualityPieGraphBlock.defaultProps = {
    hideFailures: false,
    smallTitle: false,
    style: {}
};


export default QualityPieGraphBlock;
