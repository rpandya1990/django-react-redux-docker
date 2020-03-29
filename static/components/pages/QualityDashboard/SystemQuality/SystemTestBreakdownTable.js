import React, {Component, Fragment} from 'react';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import * as PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import DialogTitle from "@material-ui/core/DialogTitle";
import {BugReport, ChangeHistory, CheckCircle, Repeat, Warning} from '@material-ui/icons';
import DialogContent from "@material-ui/core/DialogContent";
import Tooltip from "@material-ui/core/Tooltip";
import Loader from "../../../reusable/Loader";

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(1),
        overflowX: 'auto',
    },
    table: {
        minWidth: 650,
    },
});

class SystemTestBreakdownTable extends Component {
    constructor(props) {
        super(props);

        this.iconMap = {
            'pass': <CheckCircle style={{color: "rgb(67, 160, 71)"}}/>,
            'fail': <BugReport style={{color: "rgb(229, 115, 115)"}}/>,
            'skip': <Warning style={{color: "rgb(251, 192, 45)"}}/>,
            'notrun': <ChangeHistory style={{color: "rgb(117, 117, 117)"}}/>,
            'rerun': <Repeat style={{color: "rgb(192, 202, 51)"}}/>,
        }
    }

    render() {
        const {classes, title, fetching, rows, columns, data} = this.props;

        return (
            <Fragment>
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    {!fetching ?
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell variant="head">Test Cases</TableCell>
                                    {columns.map(column =>
                                        <TableCell
                                            key={column}
                                            style={{minWidth: 150, maxWidth: 150}}
                                            align="center">{column}</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map(row =>
                                    <TableRow key={row}>
                                        <TableCell component="th" scope="row">{row}</TableCell>
                                        {columns.map(column =>
                                            <TableCell
                                                key={row + '::' + column}
                                                style={{minWidth: 150, maxWidth: 150}}
                                                align="center">
                                                <Tooltip title={data[row][column].status}>
                                                    {this.iconMap[data[row][column].status]}
                                                </Tooltip>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table> :
                        <Loader width="100%" style={{margin: "100px auto"}}/>
                    }
                </DialogContent>
            </Fragment>
        );
    }
}

SystemTestBreakdownTable.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    fetching: PropTypes.bool.isRequired,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
};

export default withStyles(styles)(SystemTestBreakdownTable)