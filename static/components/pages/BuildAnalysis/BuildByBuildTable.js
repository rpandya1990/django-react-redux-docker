import React, {Component} from "react";
import "../../../css/TestStateTable.css";
import {BrikVersion, PolarisVersion} from "../../../utils"

import Loader from "../../reusable/Loader";
import BuildByBuildCard from "./BuildByBuildCard";


const statusIconMap = {
    success: "beenhere",
    skip: "low_priority",
    notrun: "panorama_fish_eye",
    xfail: "healing",
    uxpass: "add_alert",
    error: "remove_circle_outline",
    fail: "adb"
};


const statusColorMap = {
    success: "#43a047",
    skip: "#c0ca33",
    notrun: "#757575",
    xfail: "#cddc39",
    uxpass: "#ef9a9a",
    error: "#d32f2f",
    fail: "#e57373"
};


const triageIconMap = {
    '0': 'hourglass_empty',
    '1': 'check_circle_outline',
    'TestTriageStatus.pending': 'hourglass_empty',
    'TestTriageStatus.done': 'check_circle_outline',
};


const triageColorMap = {
    '0': '#fbc02d',
    '1': '#43a047',
    'TestTriageStatus.pending': '#fbc02d',
    'TestTriageStatus.done': '#43a047',
};


export default class BuildByBuildTable extends Component {
    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
        this.rowRefs = {};
        this.state = {
            isLoading: props.isLoading,
            filters: props.filters,
            product: props.product,
            index: this.getIndex(props.data['results'], props.filters),
            rowList: this.getRowList(props.data['results']),
            columnList: this.getColumnList(props.data['results']),
            tableData: this.getTableData(props.data['results']),
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isLoading: nextProps.isLoading,
            filters: nextProps.filters,
            product: nextProps.product,
            index: this.getIndex(nextProps.data['results'], nextProps.filters),
            rowList: this.getRowList(nextProps.data['results']),
            columnList: this.getColumnList(nextProps.data['results']),
            tableData: this.getTableData(nextProps.data['results'])
        });
    }

    getIndex = (data, filters) => {
        if (!data) {
            return null;
        }

        let index = {};
        for (const tr of data) {
            if (!filters.includes(tr['state']['status'])) {
                continue;
            }
            const alphabet = tr['job_name'][0].toUpperCase();
            if (!index.hasOwnProperty(alphabet)) {
                index[alphabet] = [tr['job_name'], tr['name']];
            }
        }
        return index;
    };

    getRowList = data => {
        if (!data) {
            return null;
        }

        let rowList = new Set();
        for (const tr of data) {
            rowList.add([tr['job_name'], tr['name']]);
            this.rowRefs[[tr['job_name'], tr['name']]] = React.createRef();
        }
        return Array.from(rowList).sort((a, b) => {
            return a.toString().toLowerCase() < b.toString().toLowerCase() ? -1 : 1;
        })
    };

    getColumnList = data => {
        if (!data) {
            return null;
        }

        let columnList = new Set();
        for (const tr of data) {
            for (const build of tr['builds']) {
                columnList.add(build['version']);
            }
        }

        const columns = Array.from(columnList);
        columns.sort((a, b) => {
            // array compare in javascript makes array into string which is incorrect
            // to factor out into utils.js
            let versionA = [];
            let versionB = [];
            if (this.props.product[0] === 'brik') {
                versionA = BrikVersion(a);
                versionB = BrikVersion(b);
            } else {
                versionA = PolarisVersion(a);
                versionB = PolarisVersion(b);
            }
            for (const i in versionA) {
                if (versionA[i] > versionB[i]) {
                    return -1;
                } else if (versionA[i] < versionB[i]) {
                    return 1;
                }
            }
            return 0;
        });

        return columns;
    };

    getTableData = data => {
        if (!data) {
            return null;
        }

        let tableData = {};
        for (const tr of data) {
            tableData[[tr['job_name'], tr['name']]] = {
                'name': tr['name'],
                'job_url': tr['job_url'],
                'short_name': tr['short_name'],
                'job_name': tr['job_name'],
                'state': {'id': tr['state']['id'], 'status': tr['state']['status']},
                'builds': {}
            };
            for (const build of tr['builds']) {
                tableData[[tr['job_name'], tr['name']]]['builds'][build['version']] = {
                    'id': build['id'],
                    'status': build['status'],
                    'triage_status': build['triage_status'],
                    'status_message': build['status_message']
                };
            }
        }
        return tableData;
    };

    getStatusIcon = status => {
        return statusIconMap[status];
    };

    getStatusColor = status => {
        return statusColorMap[status];
    };

    getTriageIcon = status => {
        return triageIconMap[status];
    };

    getTriageColor = status => {
        return triageColorMap[status];
    };

    getTooltip = (status, message) => {
        let tooltip = "";
        if (status && message) {
            tooltip = status + ":" + message;
        } else if (status) {
            tooltip = status;
        }
        return tooltip;
    };

    renderColumns = () => {
        return this.state.columnList.map(build =>
            <th
                key={build}
                style={{minWidth: "150px", maxWidth: "150px"}}
            >
                {build}
            </th>
        )
    };

    renderRows = () => {
        const {tableData, rowList, filters} = this.state;
        const filteredRowList = rowList.filter(tr => filters.includes(tableData[tr]["state"]["status"]));

        return filteredRowList.map(tr =>
            <tr
                key={`${tr[0]}-${tr[1]}`}
                ref={this.rowRefs[tr]}
                style={{borderTop: "1px solid rgb(208, 208, 208)", borderBottom: "0px"}}
            >
                {this.renderTestJobName(tr)}
                {this.renderTestCaseName(tr)}
                {this.renderEffectiveState(tr)}
                {this.state.columnList.map(build =>
                    this.renderBuildData(tr, build)
                )}
            </tr>
        );
    };

    renderTestJobName = (tr) => {
        return (
            <td style={{minWidth: "500px", maxWidth: "500px", fontSize: "14px"}}>
                <a href={"/destiny/testjob/?q=" + this.state.tableData[tr]['job_name']}
                   target="_blank">
                    <span>{this.state.tableData[tr]['job_name']}</span>
                </a>
            </td>
        );
    };

    renderTestCaseName = (tr) => {
        return (
            <td style={{minWidth: "500px", maxWidth: "500px", fontSize: "14px"}}>
                <a href={"/destiny/testresult/?q=" + this.state.tableData[tr]['name']}
                   target="_blank"
                   dangerouslySetInnerHTML={{__html: this.state.tableData[tr]['short_name'].split('.').slice(-2).join('<br>&nbsp;&nbsp;')}}/>
            </td>
        );
    };

    renderEffectiveState = (tr) => {
        const effectiveState = this.state.tableData[tr]["state"];
        const effectiveStateId = effectiveState["id"];
        const effectiveStateIcon = this.getStatusIcon(effectiveState["status"]);
        const effectiveStateColor = this.getStatusColor(effectiveState["status"]);
        const effectiveStateTooltip = this.getTooltip(effectiveState["status"], effectiveState["status_message"]);
        const effectiveStateLink = effectiveStateId ? "/destiny/testresult/" + effectiveStateId + "/change/" : "";
        const effectiveStateTarget = effectiveStateId ? "_blank" : "_self";

        return (
            <td style={{minWidth: "150px", maxWidth: "150px"}}>
                <a className={"btn-floating waves-effect waves-light tooltipped"}
                   data-position="bottom"
                   data-delay="50"
                   data-tooltip={effectiveStateTooltip}
                   href={effectiveStateLink}
                   target={effectiveStateTarget}
                   style={{color: effectiveStateColor}}>
                    <i className="material-icons">{effectiveStateIcon}</i>
                </a>
            </td>
        );
    };

    renderBuildData = (tr, build) => {
        const testResultId = this.state.tableData[tr]["builds"].hasOwnProperty(build) ? this.state.tableData[tr]["builds"][build]['id'] : null;
        const status = this.state.tableData[tr]["builds"].hasOwnProperty(build) ? this.state.tableData[tr]["builds"][build]['status'] : "notrun";
        const triage = this.state.tableData[tr]["builds"].hasOwnProperty(build) ? this.state.tableData[tr]["builds"][build]['triage_status'] : "0";
        const statusMessage = this.state.tableData[tr]["builds"].hasOwnProperty(build) ? this.state.tableData[tr]["builds"][build]['status_message'] : "";
        const statusIcon = this.getStatusIcon(status);
        const statusColor = this.getStatusColor(status);
        const triageIcon = this.getTriageIcon(triage);
        const triageColor = this.getTriageColor(triage);
        const tooltip = this.getTooltip(status, statusMessage);
        const link = testResultId ? "/destiny/testresult/" + testResultId + "/change/" : null;

        return (
            <td key={`${tr[0]}-${tr[1]}-${build}`}
                style={{minWidth: "150px", maxWidth: "150px"}}>
                <a className={"btn-floating waves-effect waves-light tooltipped"}
                   data-position="bottom"
                   data-delay="50"
                   data-tooltip={tooltip}
                   {...link ? {href: link} : {}}
                   {...link ? {target: "_blank"} : {}}
                   style={{color: statusColor}}>
                    <i className="material-icons">{statusIcon}</i>
                </a>
                {status !== "success" &&
                <a className={"btn-floating waves-effect waves-light tooltipped"}
                   data-position="bottom"
                   data-delay="50"
                   style={{color: triageColor}}>
                    <i className="material-icons" style={{fontSize: "16px"}}>{triageIcon}</i>
                </a>
                }
            </td>
        );
    };

    scrollToRow = (tr) => {
        if (this.rowRefs.hasOwnProperty(tr)) {
            this.rowRefs[tr].current.scrollIntoView();
            window.scrollTo(0, 190 + this.tableRef.current.offsetTop);
        }
    };

    renderBottomNav = (index) => {
        let bottomNav = [];
        for (let i = 0; i < 26; ++i) {
            const alphabet = String.fromCharCode(65 + i);
            const state = index.hasOwnProperty(alphabet);

            bottomNav.push(
                <li key={alphabet} className={state ? "page-item" : "page-item disabled"}>
                    <a className="page-link" href="#" onClick={(e) => {
                        e.preventDefault();
                        if (index.hasOwnProperty(alphabet)) {
                            this.scrollToRow(index[alphabet]);
                        }
                    }}>{alphabet}</a>
                </li>
            );
        }
        return bottomNav;
    };

    render() {
        const {tableData, isLoading} = this.state;

        if (isLoading) {
            return <Loader width="100%" height="400px"/>
        }

        if (!tableData || Object.keys(tableData).length === 0) {
            return <div style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "60px",
                color: "rgb(150,150,150)",
                fontWeight: "300",
            }}>No Data</div>
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-sm">
                            <thead>
                            <tr>
                                <th style={{minWidth: "500px", maxWidth: "500px"}}>Test Job Name</th>
                                <th style={{minWidth: "500px", maxWidth: "500px"}}>Test Case Name</th>
                                <th style={{minWidth: "150px", maxWidth: "150px"}}>Effective State</th>
                                {this.renderColumns()}
                            </tr>
                            </thead>
                            <tbody ref={this.tableRef} style={{maxHeight: "380px"}}>
                            {this.renderRows()}
                            </tbody>
                        </table>
                    </div>
                    {this.props.addingTableRows ? <div className="loading-bar"/> :
                        <div style={{height: "4px", width: "1px"}}/>}
                </div>
                <div className="row">
                    <nav aria-label="Test State Table Navigation" style={{margin: "4px 0"}}>
                        <ul className="pagination justify-content-center"
                            style={{margin: "0 auto"}}>
                            {
                                this.state.index &&
                                this.renderBottomNav(this.state.index)
                            }
                        </ul>
                    </nav>
                </div>
            </div>
        );
    }
}

BuildByBuildTable.defaultProps = {
    filters: ['success', 'skip', 'xfail', 'error', 'fail', 'uxpass', 'notrun'],
    isLoading: false,
};