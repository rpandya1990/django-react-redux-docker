import React, {Component, Fragment} from 'react';
import BuildSummaryPieChart from "./BuildSummaryPieChart";
import * as PropTypes from "prop-types";
import {Paper} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import * as _ from "lodash";

class BuildSummaryCard extends Component {
    constructor(props) {
        super(props);

    }

    renderContent = (props) => {
        return (
            <Fragment>
                <div className="col-xs-12"
                     style={{
                         display: "flex",
                         justifyContent: "center",
                         flexWrap: "wrap"
                     }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className={props.classes.title}>
                                <Typography variant="h6" id="tableTitle">
                                    {_.isEmpty(props.title) ? "Build Summary" : props.title}
                                </Typography>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <BuildSummaryPieChart data={props.data}
                                              fetching={props.fetching}
                                              handleFetchData={props.handleFetchData}/>
                    </div>
                </div>
            </Fragment>
        );
    };

    render() {
        const {classes} = this.props;

        return (
            <Paper className={classes.root}>
                {this.renderContent(this.props)}
            </Paper>
        );
    }
}

BuildSummaryCard.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string,
    data: PropTypes.array.isRequired,
    fetching: PropTypes.bool.isRequired,
    handleFetchData: PropTypes.func.isRequired
};

const styles = theme => ({
    root: {
        padding: theme.spacing(3, 2),
        width: '100%',
        boxShadow: "0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12)"
    },
    title: {
        flex: '0 0 auto',
    },
});

export default withStyles(styles)(BuildSummaryCard);