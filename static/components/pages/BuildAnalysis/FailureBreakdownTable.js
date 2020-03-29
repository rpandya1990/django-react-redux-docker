import React, {Component} from 'react';
import "../../../css/TestStateBreakdown.css"
import Loader from "../../reusable/Loader";
import * as _ from "lodash";

const labelMap = {
    success: "Success",
    skip: "Skip",
    notrun: "Not Run",
    xfail: "XFail",
    uxpass: "#UXPass",
    error: "Error",
    fail: "Fail"
};

class FailureBreakdownTable extends Component {
    constructor(props) {
        super(props);
    }

    renderStatus = status => {
        return <td style={{minWidth: "150px", maxWidth: "150px"}}>{labelMap[status]}</td>;
    };

    renderJiras = jiras => {
        let url = "";
        if (jiras && jiras.length > 0) {
            url = `https://rubrik.atlassian.net/issues/?jql=issue%20in%20(${jiras.join(',')})`
        }
        return (
            <td style={{minWidth: "150px", maxWidth: "150px"}}>
                <a {...url ? {href: url} : {}}
                   target="_blank">{jiras.length}</a>
            </td>
        );
    };

    renderReasons = reasons => {
        let reasonBlocks = [];
        for (const reason in reasons) {
            const totalCount = reasons[reason]["count"];
            const bigBoxId = reasons[reason]["id"];

            let dupeList = [];
            for (const dupe in reasons[reason]["dupe_counter"]) {
                let dupeCount = reasons[reason]["dupe_counter"][dupe].length;

                let dupeDetails = [];
                let littleBoxId = "test-list";
                for (const test of reasons[reason]["dupe_counter"][dupe]) {
                    let testId = test['id'];
                    let testName = test['name'].split('.').slice(-2).join('<br>&nbsp;&nbsp;');
                    littleBoxId += testId;

                    dupeDetails.push(
                        <a key={testId} className="list-group-item"
                           href={"/destiny/testresult/" + testId + "/change/"}
                           target="_blank" dangerouslySetInnerHTML={{__html: testName}}/>
                    );
                }

                dupeList.push(
                    <details key={littleBoxId} className="collection-item list-group-item">
                        <summary>{dupe + " (" + dupeCount + ")"}</summary>
                        <ul className="list-group">
                            {dupeDetails}
                        </ul>
                    </details>
                );
            }
            reasonBlocks.push(
                <details key={bigBoxId} className="collection-item">
                    <summary>{reason.slice(-100) + " (" + totalCount + ")"}</summary>
                    <ul className="list-group">
                        {dupeList}
                    </ul>
                </details>
            );
        }

        return (
            <td style={{minWidth: "800px", maxWidth: "800px"}}>{reasonBlocks}</td>
        );
    };

    renderResolution = resolutions => {
        let resolutionCollection = [];
        if (resolutions && Object.keys(resolutions).length > 0) {
            for (const resolution in resolutions) {
                resolutionCollection.push(
                    <div key={resolution} className="collection-item">
                        <i className="material-icons" style={{fontSize: "30px", color: "transparent"}}>&zwnj;</i>
                        <span style={{
                            marginRight: "auto",
                            display: "block"
                        }}>{`${resolution} (${resolutions[resolution]})`}</span>
                    </div>
                );
            }
        }
        return (
            <td style={{minWidth: "150px", maxWidth: "150px"}}>
                <div className="collection">{resolutionCollection}</div>
            </td>
        );
    };

    renderPending = pending => {
        return (
            <td style={{minWidth: "150px", maxWidth: "150px"}}>{pending}</td>
        );
    };

    renderRow = (status, jiras, reasons, resolutions, pending) => {
        return (
            <tr key={status} style={{borderTop: "1px solid rgb(208, 208, 208)", borderBottom: "0px"}}>
                {this.renderStatus(status)}
                {this.renderJiras(jiras)}
                {this.renderReasons(reasons)}
                {this.renderResolution(resolutions)}
                {this.renderPending(pending)}
            </tr>
        )
    };

    renderBody = data => {
        let tableBody = [];
        for (const state of data) {
            const status = state['status'];
            const jiras = state['jira'];
            const reasons = state['reasons'];
            const resolutions = state['triage_resolution'];
            const pending = state['triage_pending'];
            tableBody.push(this.renderRow(status, jiras, reasons, resolutions, pending));
        }
        return tableBody;
    };

    render() {
        if (!this.props.fetching && _.isEmpty(this.props.data)) {
            return <div className="load-data-button-container"
                        onClick={() => {
                            this.props.handleFetchData();
                        }}>
                <div className="load-data-button">Render Error Breakdown</div>
            </div>
        }
        if (!this.props.data || Object.keys(this.props.data).length === 0) {
            return <Loader width="100%" height="400px"/>
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-sm">
                                <thead>
                                <tr>
                                    <th style={{minWidth: "150px", maxWidth: "150px"}}>Test Case State</th>
                                    <th style={{minWidth: "150px", maxWidth: "150px"}}>Jira(s)</th>
                                    <th style={{minWidth: "800px", maxWidth: "800px", overflow: "auto"}}>Failure
                                        Reasons
                                    </th>
                                    <th style={{minWidth: "150px", maxWidth: "150px"}}>Triage Complete</th>
                                    <th style={{minWidth: "150px", maxWidth: "150px"}}>Triage Pending</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.renderBody(this.props.data)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FailureBreakdownTable;