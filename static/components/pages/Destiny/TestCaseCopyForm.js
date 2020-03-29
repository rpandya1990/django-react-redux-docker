import React, {Component, Fragment} from 'react';
import {Formik} from "formik";
import * as Yup from "yup";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";


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

class TestCaseCopyForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            branchMenu: this.getMenuData(props.branches),
            versionMenu: this.getMenuData(props.versions),
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.branches, nextProps.branches)) {
            this.setState({branchMenu: this.getMenuData(nextProps.branches)})
        }
        if (!_.isEqual(this.props.versions, nextProps.versions)) {
            this.setState({versionMenu: this.getMenuData(nextProps.versions)})
        }
    }

    createMenuData = (item) => {
        return {
            'value': item.id,
            'label': item.label
        }
    };

    getMenuData = (data) => {
        const menuData = [];
        data.forEach(item => {
            menuData.push(this.createMenuData(item));
        });
        return menuData;
    };

    render() {
        const {classes} = this.props;
        const {branchMenu, versionMenu} = this.state;

        return (
            <Fragment>
                <DialogTitle id="alert-dialog-title">{"Are you Sure?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This will copy the selected Test Cases.
                    </DialogContentText>
                    <Formik
                        initialValues={{
                            branch: '',
                            version: ''
                        }}
                        onSubmit={(values, {setSubmitting}) => {
                            setSubmitting(true);
                            try {
                                this.props.onClickCopy(values.branch, values.version);
                            } catch (e) {
                                console.log(e);
                                setSubmitting(false);
                            }
                        }}
                        validationSchema={Yup.object().shape({
                            branch: Yup.string()
                                .required('Required'),
                            version: Yup.string()
                                .required('Required')
                        })}
                    >
                        {props => {
                            const {
                                values,
                                touched,
                                errors,
                                isSubmitting,
                                handleChange,
                                handleBlur,
                                handleSubmit,
                            } = props;
                            return (
                                <form onSubmit={handleSubmit}>
                                    <Grid container alignItems="flex-start" spacing={4}>
                                        <Grid item xs={6}>
                                            <TextField
                                                select
                                                name="branch"
                                                label="Branch"
                                                className={classes.textField}
                                                value={values.branch}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.branch && touched.branch) && errors.branch}
                                                error={errors.branch && touched.branch}
                                                SelectProps={{
                                                    MenuProps: {
                                                        className: classes.menu,
                                                    },
                                                }}
                                                margin="normal"
                                                variant="outlined"
                                                required
                                                fullWidth
                                            >
                                                {branchMenu.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                select
                                                name="version"
                                                label="Version"
                                                className={classes.textField}
                                                value={values.version}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.version && touched.version) && errors.version}
                                                error={errors.version && touched.version}
                                                SelectProps={{
                                                    MenuProps: {
                                                        className: classes.menu,
                                                    },
                                                }}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            >
                                                {versionMenu.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <DialogActions>
                                                <Button
                                                    onClick={() => {
                                                        this.props.onClickCancel();
                                                    }}
                                                    color="primary">
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    color="primary"
                                                    autoFocus>
                                                    Copy
                                                </Button>
                                            </DialogActions>
                                        </Grid>
                                    </Grid>
                                </form>
                            )
                        }}
                    </Formik>
                </DialogContent>
            </Fragment>
        )
    }
}

TestCaseCopyForm.propTypes = {
    classes: PropTypes.object.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onClickCopy: PropTypes.func.isRequired,
};

export default withStyles(styles)(TestCaseCopyForm);