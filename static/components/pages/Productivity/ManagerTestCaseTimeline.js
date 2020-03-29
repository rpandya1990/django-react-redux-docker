import React, {Component} from 'react';
import "../../../css/ManagerTestCaseTimeline.css"
import _ from "lodash";
import moment from "moment";
import Loader from "../../reusable/Loader";
import Modal from "../../reusable/Modal";

class ManagerTestCaseTimeline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: props.isLoading,
            tableData: this.getTableData(props.data),
            selectedRow: null,
            selectedCol: null,
            openModal: false,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isLoading: nextProps.isLoading,
            tableData: this.getTableData(nextProps.data),
        });
    }

    getTableData = (data) => {
        let all_timelines = new Set();
        for (const [manager, managerData] of Object.entries(data)) {
            const timeline = managerData['timeline'];
            for (const [year, monthData] of Object.entries(timeline)) {
                const months = Object.keys(monthData);
                months.forEach(month => {
                    all_timelines.add(`${month} ${year}`);
                })
            }
        }

        const sorted_timelines = Array.from(all_timelines).sort((a, b) => {
            return moment(a, "MMM YYYY") - moment(b, "MMM YYYY")
        });

        let rowList = Object.keys(data);
        let columnList = [];
        let startTime = moment(sorted_timelines[0], "MMM YYYY");
        let endTime = moment(sorted_timelines[sorted_timelines.length - 1], "MMM YYYY");
        while (endTime.isSameOrAfter(startTime)) {
            const year = endTime.format("YYYY");
            const month = endTime.format("MMM");
            columnList.push(`${month} ${year}`);
            endTime = moment(endTime).subtract(1, 'M');
        }

        const tableData = {
            'rows': rowList.sort(),
            'columns': columnList,
            'data': {}
        };
        for (const [manager, managerData] of Object.entries(data)) {
            const total_test_cases = managerData['total_test_cases'];
            const timeline = managerData['timeline'];
            tableData['data'][manager] = {
                total_test_cases: total_test_cases
            };
            columnList.forEach(column => {
                const time = moment(column, "MMM YYYY");
                const year = time.format("YYYY");
                const month = time.format("MMM");
                let test_cases = [];
                if (timeline.hasOwnProperty(year) && timeline[year].hasOwnProperty(month)) {
                    test_cases = timeline[year][month];
                }
                tableData['data'][manager][column] = test_cases;
            })
        }

        return tableData;
    };

    renderTestcaseList = (row, col) => {
        this.setState({
            selectedRow: row,
            selectedCol: col,
            openModal: true,
        })
    };

    renderColumns = (tableData) => {
        const columnList = Array.from(tableData['columns']);
        return columnList.map(column => (
            <th key={column} style={{minWidth: "200px", maxWidth: "200px"}}>{column}</th>
        ))
    };

    renderRows = (tableData) => {
        const rowList = Array.from(tableData['rows']);
        const columnList = Array.from(tableData['columns']);
        const data = tableData['data'];

        return rowList.map(row => (
            <tr key={row}>
                <th style={{color: "rgb(0,0,50)", minWidth: "200px", maxWidth: "200px"}}>{row}</th>
                <th style={{
                    color: "rgb(0,0,50)",
                    minWidth: "200px",
                    maxWidth: "200px"
                }}>{data[row].total_test_cases}</th>
                {columnList.map(column => (
                    <td key={row + '-' + column} className="testcase-stats"
                        style={{minWidth: "200px", maxWidth: "200px"}}
                        onClick={(e) => {
                            e.preventDefault();
                            if (data[row][column].length !== 0) {
                                this.renderTestcaseList(row, column)
                            }
                        }}><span
                        style={{
                            fontWeight: 600,
                            margin: "0 auto"
                        }}>{data[row][column].length}</span></td>
                ))}
            </tr>
        ))
    };

    render() {
        const {tableData, isLoading, openModal, selectedRow, selectedCol} = this.state;

        if (_.isEmpty(tableData) || _.isEmpty(tableData['rows']) ||
            _.isEmpty(tableData['columns']) || _.isEmpty(tableData['data']) ||
            isLoading) {
            return <Loader width="100%" height="450px"/>
        }

        return (
            <div>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-sm">
                        <thead>
                        <tr>
                            <th style={{minWidth: "200px", maxWidth: "200px"}}>Manager</th>
                            <th style={{minWidth: "200px", maxWidth: "200px"}}>Total Testcases</th>
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
                                <h5 className="modal-title">{selectedRow + " - " + selectedCol}</h5>
                                <button type="button" className="close" onClick={e => {
                                    e.preventDefault();
                                    this.setState({
                                        openModal: false,
                                        selectedRow: null,
                                        selectedCol: null
                                    })
                                }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered table-sm"
                                           style={{
                                               margin: '0px auto'
                                           }}>
                                        <thead>
                                        <tr>
                                            <th style={{minWidth: "600px", maxWidth: "600px"}}>Test Cases</th>
                                        </tr>
                                        </thead>
                                        <tbody style={{maxHeight: "450px"}}>
                                        {tableData['data'][selectedRow][selectedCol].map(testcase => (
                                            <tr key={testcase}>
                                                <td style={{minWidth: "600px", maxWidth: "600px"}}><span
                                                    title={testcase}
                                                    style={{
                                                        fontWeight: 600,
                                                        margin: "0 auto"
                                                    }}>{testcase.split('.').splice(-2).join('::')}</span></td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>}
            </div>
        );
    }
}

export default ManagerTestCaseTimeline;