import React from "react";
import Loader from "../../../reusable/Loader";
import {Link} from "react-router-dom";
import _ from "lodash";


class RegressionTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {startsWithFilterString, containsFilterString} = this.props;
        if (this.props.displayLoader) {
            return (
                <Loader small style={{margin: "20px 0px"}}/>
            )
        } else {
            if (!_.isEmpty(this.props.buildByBuildRegression)) {
                return Object.keys(this.props.buildByBuildRegression).sort().map(pipeline => {
                    return (
                        <div key={pipeline} style={{margin: "10px 3px 0px", width: "46%"}}>
                            <div style={{fontWeight: "700", fontSize: "13px", marginBottom: "18px", color: "rgb(60,60,60)"}}>{pipeline}: <span style={{color: "rgb(120,180,120)", fontWeight: 500}}>{this.props.buildByBuildRegression[pipeline].length} regressions</span></div>
                            <div style={{fontWeight: "700", fontSize: "12px", marginBottom: "5px", color: "rgb(130,130,130)", display: "flex"}}>
                                <div style={{flexBasis: "280px"}}>Test Job</div>
                                <div>Test Case</div>
                            </div>
                            <div style={{overflow: "auto", height: "300px", border: "1px solid rgb(220,220,220)", marginBottom: "15px"}}>
                                <table className="regression-table">
                                    <tbody style={{display: "table-row-group"}}>
                                    {this.props.buildByBuildRegression[pipeline].sort((a,b) => {
                                        let rowA = a.suite.toLowerCase()+a.testcase.toLowerCase();
                                        let rowB = b.suite.toLowerCase()+b.testcase.toLowerCase();
                                        if (rowA < rowB) {
                                            return -1;
                                        } else if (rowA > rowB) {
                                            return 1;
                                        }
                                        return 0;

                                    }).map((row, i) => {
                                        if (containsFilterString && (!row.suite.toLowerCase().includes(containsFilterString.toLowerCase()) && !row.testcase.toLowerCase().includes(containsFilterString.toLowerCase()))) {
                                            return null;
                                        }
                                        if (startsWithFilterString && (!row.suite.toLowerCase().startsWith(startsWithFilterString.toLowerCase()) && !row.testcase.split(".").slice(-2).join(".").toLowerCase().startsWith(startsWithFilterString.toLowerCase()))) {
                                            return null;
                                        }
                                        return (
                                            <tr className="regress-tr" key={i}>
                                                <td className="regress-td" style={{paddingRight: "30px"}}>
                                                    <Link to={row.link} target="_blank" style={{display: "flex"}}>
                                                        <div style={{fontSize: "11px", color: "rgb(80,83,81)"}}>{row.suite.split(".").slice(-2).join(".")}</div>
                                                    </Link>
                                                </td>
                                                <td className="regress-td">
                                                    <Link to={row.link} target="_blank" style={{display: "flex"}}>
                                                        <div style={{fontSize: "11px", color: "rgb(80,83,81)"}}>{row.testcase.split(".").slice(-2).join(".")}</div>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                });
            } else {
                return <div style={{color: "rgb(160,160,160)", margin: "10px"}}>No Data</div>;
            }
        }
    }
}


export default RegressionTable;
