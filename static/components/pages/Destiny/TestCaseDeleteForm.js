import React, {Component, Fragment} from 'react';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {withStyles} from "@material-ui/core";
import PropTypes from "prop-types";


const styles = theme => ({
    paper: {
        position: 'absolute',
        width: '900px',
        maxHeight: '750px',
        overflow: 'auto',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(4),
        outline: 'none',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    dense: {
        marginTop: theme.spacing(2),
    },
    menu: {
        minWidth: 400,
    },
});

class TestCaseDeleteForm extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes} = this.props;

        return (
            <Fragment>
                <DialogTitle id="alert-dialog-title">{"Are you Sure?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This will delete the selected Test Cases permanently.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        this.props.onClickCancel();
                    }}
                            color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        this.props.onClickDelete();
                    }}
                            color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Fragment>
        );
    }

}

TestCaseDeleteForm.propTypes = {
    classes: PropTypes.object.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onClickDelete: PropTypes.func.isRequired,
};

export default withStyles(styles)(TestCaseDeleteForm);