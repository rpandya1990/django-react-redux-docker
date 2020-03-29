import React, {Component, Fragment} from 'react';
import BigCard from "../../reusable/BigCard";
import BuildByBuildTable from "./BuildByBuildTable";
import * as PropTypes from "prop-types";
import {Paper} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import * as _ from "lodash";

const STATE_FILTERS = {
    'Success': {'status': 'success', 'icon': 'beenhere'},
    'Not Run': {'status': 'notrun', 'icon': 'panorama_fish_eye'},
    'Skip': {'status': 'skip', 'icon': 'low_priority'},
    'XFail': {'status': 'xfail', 'icon': 'healing'},
    'UXPass': {'status': 'uxpass', 'icon': 'add_alert'},
    'Error': {'status': 'error', 'icon': 'remove_circle_outline'},
    'Fail': {'status': 'fail', 'icon': 'adb'},
};

class BuildByBuildCard extends Component {
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
                        <div className="col-md-9">
                            <div className={props.classes.title}>
                                <Typography variant="h6" id="tableTitle">
                                    {_.isEmpty(props.title) ? "Test State Across Build(s)" : props.title}
                                </Typography>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="dropdown"
                                 style={{
                                     float: "right",
                                     margin: "2px",
                                     fontSize: "13px"
                                 }}>
                                <button className="dropbtn">
                                    <span>Effective State Filter <i
                                        className="material-icons drop arrow"
                                        style={{
                                            fontSize: "22px",
                                            verticalAlign: "middle"
                                        }}
                                    >chevron_right</i></span>
                                </button>
                                <div className="dropdown-content">
                                    {Object.keys(STATE_FILTERS).map(filter => {
                                        const status = STATE_FILTERS[filter]['status'];
                                        const icon = STATE_FILTERS[filter]['icon'];
                                        return (
                                            <div key={"filter-" + status}
                                                 style={props.filters && props.filters.includes(status) ? {
                                                     backgroundColor: "rgb(45, 52, 69)",
                                                     color: "rgb(230, 234, 242)"
                                                 } : {}}
                                                 onClick={(e) => {
                                                     e.preventDefault();
                                                     props.handleChangeFilters(status);
                                                 }}
                                            >
                                                <i className="material-icons check"
                                                   style={{
                                                       fontSize: "16px",
                                                       verticalAlign: "middle",
                                                       marginBottom: "2px",
                                                       marginLeft: "8px"
                                                   }}>{props.filters.includes(status) ? "check_box" : "check_box_outline_blank"}</i><span
                                                style={{
                                                    margin: "0 auto",
                                                }}> {filter} <i
                                                className="material-icons"
                                                style={{
                                                    fontSize: "18px",
                                                    verticalAlign: "middle",
                                                    marginBottom: "5px"
                                                }}>{icon}</i></span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <BuildByBuildTable data={props.data}
                                               product={props.product}
                                               isLoading={props.fetching}
                                               addingTableRows={props.addingTableRows}
                                               filters={props.filters}/>
                        </div>
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

BuildByBuildCard.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string,
    data: PropTypes.object.isRequired,
    product: PropTypes.array.isRequired,
    fetching: PropTypes.bool.isRequired,
    addingTableRows: PropTypes.bool.isRequired,
    handleChangeFilters: PropTypes.func.isRequired,
};

BuildByBuildCard.defaultProps = {
    filters: ['success', 'skip', 'xfail', 'error', 'fail', 'uxpass', 'notrun'],
};

const styles = theme => ({
    root: {
        padding: theme.spacing(3, 2),
        width: '100%',
        minHeight: 400,
        boxShadow: "0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12)"
    },
    title: {
        flex: '0 0 auto',
    },
});

export default withStyles(styles)(BuildByBuildCard);