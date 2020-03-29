import React, {Component} from 'react';
import SystemLineGraph from "./SystemLineGraph";
import {Dialog} from "@material-ui/core";
import * as _ from "lodash";
import SystemTestBreakdownTable from "./SystemTestBreakdownTable";
import * as PropTypes from "prop-types";


class SystemLineGraphBlock extends Component {
    constructor(props) {
        super(props);

        this.state = {
            openBreakdownDialog: false,
            selectedTestCategory: null,
            selectedCluster: null,
        }
    }

    render() {
        const {title, category, fetching, breakdown, handleFetchData} = this.props;
        const {openBreakdownDialog, selectedTestCategory, selectedCluster} = this.state;

        return (
            <div className="data-card run-graph">
                {!_.isEmpty(title) &&
                <div className="big-card-title half-title"
                     style={{paddingTop: "10px"}}>{title}</div>
                }
                <SystemLineGraph {...this.props}
                                 title={category}
                                 handleClick={(test_category, cluster_name) => {
                                     handleFetchData(test_category, cluster_name);
                                     this.setState({
                                         openBreakdownDialog: true,
                                         selectedTestCategory: test_category,
                                         selectedCluster: cluster_name
                                     });
                                 }}/>
                <Dialog aria-labelledby="form-dialog-title"
                        open={openBreakdownDialog}
                        onClose={() => {
                            this.setState({
                                openBreakdownDialog: false,
                                selectedTestCategory: null,
                                selectedCluster: null
                            });
                        }}
                        fullWidth={true}
                        maxWidth={'md'}>
                    {!_.isEmpty(selectedTestCategory) &&
                    !_.isEmpty(selectedCluster) &&
                    <SystemTestBreakdownTable
                        title={selectedCluster}
                        fetching={fetching}
                        rows={
                            !_.isEmpty(breakdown) &&
                            _.has(breakdown, selectedTestCategory) &&
                            _.has(breakdown[selectedTestCategory], selectedCluster) ?
                                breakdown[selectedTestCategory][selectedCluster]['rows'] : []
                        }
                        columns={
                            !_.isEmpty(breakdown) &&
                            _.has(breakdown, selectedTestCategory) &&
                            _.has(breakdown[selectedTestCategory], selectedCluster) ?
                                breakdown[selectedTestCategory][selectedCluster]['columns'] : []
                        }
                        data={
                            !_.isEmpty(breakdown) &&
                            _.has(breakdown, selectedTestCategory) &&
                            _.has(breakdown[selectedTestCategory], selectedCluster) ?
                                breakdown[selectedTestCategory][selectedCluster]['data'] : {}
                        }/>
                    }
                </Dialog>
            </div>
        )
    }
}


SystemLineGraphBlock.propTypes = {
    title: PropTypes.string,
    category: PropTypes.string.isRequired,
    domain: PropTypes.array,
    data: PropTypes.array,
    breakdown: PropTypes.object,
    handleFetchData: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
};

export default SystemLineGraphBlock;
