import React, {Component} from 'react';
import "../../../css/ManagerSuiteBuildByBuildTable.css"
import Loader from "../../reusable/Loader";
import _ from "lodash";
import Modal from "../../reusable/Modal";
import ManagerSuiteBreakdownTable from "./ManagerSuiteBreakdownTable";


class ManagerSuiteBuildByBuildTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: props.isLoading,
            tableData: this.getTableData(props.data),
            selectedManager: null,
            selectedVersion: null,
            openModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isLoading: nextProps.isLoading,
            tableData: this.getTableData(nextProps.data),
        });
    }

    getTableData = (data) => {
        const tableData = {
            'rows': [],
            'columns': [],
            'data': {}
        };

        if (_.isEmpty(data)) {
            return tableData;
        }

        tableData['columns'] = Array.from(data.allversions).reverse();
        data.data.graph_data.map(row => {
            tableData['rows'].push(row.name);
            tableData['data'][row.name] = {};
            tableData['columns'].map(column => {
                tableData['data'][row.name][column] = {
                    "title": `${row.name} ${column}`,
                    "untriaged": 0,
                    "value": 0,
                    "version": column,
                    "pass": 0,
                    "fail": 0,
                    "total": 0,
                    "notrun": 0,
                    "breakdown": []
                };
            });
            Array.from(row.values).map(stats => {
                    tableData['data'][row.name][stats.version] = stats;
                }
            )
        });

        tableData['rows'].sort();

        data.data.table_data.map(row => {
            row.values.map(column => {
                tableData['data'][row.name][column.name]["breakdown"] = column.values;
            });
        });

        return tableData;
    };

    renderManagerSuiteBreakdown = (manager, version) => {
        this.setState({
            selectedManager: manager,
            selectedVersion: version,
            openModal: true,
        })
    };

    renderColumns = tableData => {
        const columnList = Array.from(tableData['columns']);
        return columnList.map(column => (
            <th key={column} style={{minWidth: "200px", maxWidth: "200px"}}>{column}</th>
        ))
    };

    renderRows = tableData => {
        const rowList = Array.from(tableData['rows']);
        const columnList = Array.from(tableData['columns']);
        const data = tableData['data'];

        return rowList.map(row => (
            <tr key={row} className="manager-build-row">
                <th style={{color: "rgb(0,0,50)", minWidth: "200px", maxWidth: "200px"}}>{row}</th>
                <td style={{color: "rgb(0, 0, 50)", minWidth: "200px", maxWidth: "200px"}}>
                    <div className="build-stats">
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Pass</span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Skip</span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Not Run</span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Fail</span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Untriaged</span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Testcase</span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Product</span>
                        </div>
                        <div className="build-stats-odd-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Infra</span>
                        </div>
                        <div className="build-stats-even-row">
                            <span style={{fontWeight: 600, margin: "0 auto"}}>Undetermined</span>
                        </div>
                    </div>
                </td>
                {columnList.map(column => (
                    <td key={row + '-' + column} className="manager-cell"
                        onClick={(e) => {
                            e.preventDefault();
                            this.renderManagerSuiteBreakdown(row, column)
                        }}
                        style={{minWidth: "200px", maxWidth: "200px"}}>
                        <div className="build-stats">
                            <div className="build-stats-even-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].pass || 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].pass || 0) / (data[row][column].total || 1))}%</span>
                            </div>
                            <div className="build-stats-odd-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].skip || 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].skip || 0) / (data[row][column].total || 1))}%</span>
                            </div>
                            <div className="build-stats-even-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].notrun || 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].notrun || 0) / (data[row][column].total || 1))}%</span>
                            </div>
                            <div className="build-stats-odd-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].fail || 0}</span> <span
                                className="bold-and-left-align">{Math.round(100 * (data[row][column].fail || 0) / (data[row][column].total || 1))}%</span>
                            </div>
                            <div className="build-stats-even-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].untriaged && data[row][column].untriaged.count ? data[row][column].untriaged.count : 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].untriaged && data[row][column].untriaged.count ? data[row][column].untriaged.count : 0) / (data[row][column].fail || 1))}%</span>
                            </div>
                            <div className="build-stats-odd-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].testcase && data[row][column].testcase.count ? data[row][column].testcase.count : 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].testcase && data[row][column].testcase.count ? data[row][column].testcase.count : 0) / (data[row][column].fail || 1))}%</span>
                            </div>
                            <div className="build-stats-even-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].product && data[row][column].product.count ? data[row][column].product.count : 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].product && data[row][column].product.count ? data[row][column].product.count : 0) / (data[row][column].fail || 1))}% </span>
                            </div>
                            <div className="build-stats-odd-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].infra && data[row][column].infra.count ? data[row][column].infra.count : 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].infra && data[row][column].infra.count ? data[row][column].infra.count : 0) / (data[row][column].fail || 1))}% </span>
                            </div>
                            <div className="build-stats-even-row">
                                <span style={{
                                    marginRight: "auto",
                                    marginLeft: "4px"
                                }}>{data[row][column].undetermined && data[row][column].undetermined.count ? data[row][column].undetermined.count : 0}</span>
                                <span
                                    className="bold-and-left-align">{Math.round(100 * (data[row][column].undetermined && data[row][column].undetermined.count ? data[row][column].undetermined.count : 0) / (data[row][column].fail || 1))}%</span>
                            </div>
                        </div>
                    </td>
                ))}
            </tr>
        ))
    };

    render() {
        const {tableData, isLoading, openModal, selectedManager, selectedVersion} = this.state;

        if (_.isEmpty(tableData) || _.isEmpty(tableData['rows']) ||
            _.isEmpty(tableData['columns']) || _.isEmpty(tableData['data']) ||
            isLoading) {
            return <Loader width="100%" height="450px"/>
        }

        return (
            <div>
                <div className="big-card-title half-title"
                     style={{
                         fontWeight: 700,
                         justifyContent: 'center'
                     }}>Test Suites Build by Build
                </div>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-sm">
                        <thead>
                        <tr>
                            <th style={{minWidth: "200px", maxWidth: "200px"}}>Manager</th>
                            <th style={{minWidth: "200px", maxWidth: "200px"}}>State</th>
                            {this.renderColumns(tableData)}
                        </tr>
                        </thead>
                        <tbody style={{maxHeight: "450px"}}>
                        {this.renderRows(tableData)}
                        </tbody>
                    </table>
                </div>
                {openModal &&
                <Modal>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedManager} {selectedVersion}</h5>
                                <button type="button" className="close" onClick={e => {
                                    e.preventDefault();
                                    this.setState({
                                        openModal: false,
                                        selectedManager: null,
                                        selectedVersion: null
                                    })
                                }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <ManagerSuiteBreakdownTable manager={selectedManager} version={selectedVersion}
                                                            data={tableData['data'][selectedManager][selectedVersion]["breakdown"]}/>
                            </div>
                        </div>
                    </div>
                </Modal>
                }
            </div>
        );
    }
}

export default ManagerSuiteBuildByBuildTable;