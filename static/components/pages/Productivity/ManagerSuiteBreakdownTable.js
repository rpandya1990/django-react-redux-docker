import React, {Component} from 'react';
import _ from "lodash";
import Loader from "../../reusable/Loader";

class ManagerSuiteBreakdownTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            manager: props.manager,
            version: props.version,
            tableData: props.data,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            manager: nextProps.manager,
            version: nextProps.version,
            tableData: nextProps.data,
        });
    }

    renderRows = data => {
        return data.map(stats => (
            <tr key={stats.name} className="manager-build-row">
                <th style={{color: "rgb(0,0,50)", minWidth: "400px", maxWidth: "400px"}}>{stats.name}</th>
                <td style={{minWidth: "200px", maxWidth: "200px"}} className="manager-cell">
                    <div className="build-stats">
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: "600"}}>P:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.pass || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.pass || 0) / (stats.total || 1))}%</span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: "600"}}>S:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.skip || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.skip || 0) / (stats.total || 1))}%</span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: "600"}}>NR:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.notrun || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.notrun || 0) / (stats.total || 1))}%</span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: "600"}}>F:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.fail || 0}</span> <span
                            className="bold-and-left-align">{Math.round(100 * (stats.fail || 0) / (stats.total || 1))}%</span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: "600"}}>Untri:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.untriaged || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.testcase || 0) / (stats.fail || 1))}%</span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: "600"}}>TC:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.testcase || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.testcase || 0) / (stats.fail || 1))}%</span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: "600"}}>Prod:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.product || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.product || 0) / (stats.fail || 1))}% </span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: "600"}}>Infra:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.infra || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.infra || 0) / (stats.fail || 1))}% </span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: "600"}}>Undet:</span>
                            <span style={{
                                marginRight: "auto",
                                marginLeft: "4px"
                            }}>{stats.undetermined || 0}</span>
                            <span
                                className="bold-and-left-align">{Math.round(100 * (stats.undetermined || 0) / (stats.fail || 1))}%</span>
                        </div>
                    </div>
                </td>
            </tr>
        ))
    };

    render() {
        const {tableData, manager, version} = this.state;

        if (_.isEmpty(tableData) || _.isEmpty(manager) || _.isEmpty(version)) {
            return <Loader width="100%" height="450px"/>
        }

        return (
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-sm" style={{
                    margin: '0px auto'
                }}>
                    <thead>
                    <tr>
                        <th style={{minWidth: "400px", maxWidth: "400px"}}>Suite</th>
                        <th style={{minWidth: "200px", maxWidth: "200px"}}>State</th>
                    </tr>
                    </thead>
                    <tbody style={{maxHeight: "450px"}}>
                    {this.renderRows(tableData)}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ManagerSuiteBreakdownTable;