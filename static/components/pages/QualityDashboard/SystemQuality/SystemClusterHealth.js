import React, {Component} from 'react';
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import * as PropTypes from "prop-types";
import SystemLineGraphBlock from "./SystemLineGraphBlock";
import _ from "lodash";
import Loader from "../../../reusable/Loader";
import {withStyles} from "@material-ui/core";

const styles = theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
});

class SystemClusterHealth extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const {classes, branch, fetching_data, fetching_breakdown, data, breakdown} = this.props;

        return (
            <div className={classes.root}>
                {!fetching_data && !_.isEmpty(data) ?
                    Object.entries(data).map(([category, datum]) => {
                        return (
                            <ExpansionPanel key={category}
                                            TransitionProps={{unmountOnExit: true}}>
                                <ExpansionPanelSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography style={{color: "rgb(60,60,60)"}} className={classes.heading}>{category}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <SystemLineGraphBlock category={category}
                                                          domain={datum['domain']}
                                                          data={datum['data']}
                                                          handleFetchData={this.props.handleFetchData}
                                                          fetching={Boolean(
                                                              _.isEmpty(fetching_breakdown) ||
                                                              !_.has(fetching_breakdown, branch) ||
                                                              fetching_breakdown[branch]
                                                          )}
                                                          breakdown={
                                                              !_.isEmpty(breakdown) ? breakdown : {}
                                                          }/>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        )
                    }) :
                    <Loader width="100%" style={{margin: "100px auto"}}/>
                }
            </div>
        );
    }
}

SystemClusterHealth.propTypes = {
    branch: PropTypes.string.isRequired,
    fetching_data: PropTypes.bool,
    fetching_breakdown: PropTypes.object,
    data: PropTypes.object,
    breakdown: PropTypes.object,
    handleFetchData: PropTypes.func.isRequired,
};

export default withStyles(styles)(SystemClusterHealth);