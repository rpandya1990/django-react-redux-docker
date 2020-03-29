import React, {Component, Fragment} from 'react';
import {withStyles} from "@material-ui/core";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import moment from "moment"
import {Formik} from "formik";
import * as Yup from "yup";
import DateFnsUtils from "@date-io/date-fns";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import {DateTimePicker, MuiPickersUtilsProvider,} from "@material-ui/pickers";
import Grid from "@material-ui/core/Grid";
import axios from "axios";
import ReactJson from 'react-json-view'
import {DESTINY_VERIFY_TEST_RESULT_ENDPOINT} from "../../../api/endpoints";
import {getCookie, getTestResultData} from "../../../utils";
import * as _ from "lodash";

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


class TestResultForm extends Component {
    constructor(props) {
        super(props);

        this.fileRef = React.createRef();

        this.triageResolutionMenu = [
            {
                'value': '0',
                'label': 'Infra'
            },
            {
                'value': '1',
                'label': 'Test Case'
            },
            {
                'value': '2',
                'label': 'Product'
            },
            {
                'value': '3',
                'label': 'Undetermined'
            }
        ];

        this.state = {
            repoMenu: this.getMenuData(props.repositories),
            productMenu: this.getMenuData(props.products),
            branchMenu: this.getMenuData(props.branches),
            versionMenu: this.getMenuData(props.versions),
            statusMenu: this.getMenuData(props.test_status),
            triageMenu: this.getMenuData(props.triage_status),
            categoryMenu: this.getMenuData(props.test_category),
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.repositories, nextProps.repositories)) {
            this.setState({repoMenu: this.getMenuData(nextProps.repositories)})
        }
        if (!_.isEqual(this.props.products, nextProps.products)) {
            this.setState({productMenu: this.getMenuData(nextProps.products)})
        }
        if (!_.isEqual(this.props.branches, nextProps.branches)) {
            this.setState({branchMenu: this.getMenuData(nextProps.branches)})
        }
        if (!_.isEqual(this.props.versions, nextProps.versions)) {
            this.setState({versionMenu: this.getMenuData(nextProps.versions)})
        }
        if (!_.isEqual(this.props.test_status, nextProps.test_status)) {
            this.setState({statusMenu: this.getMenuData(nextProps.test_status)})
        }
        if (!_.isEqual(this.props.triage_status, nextProps.triage_status)) {
            this.setState({triageMenu: this.getMenuData(nextProps.triage_status)})
        }
        if (!_.isEqual(this.props.test_category, nextProps.test_category)) {
            this.setState({categoryMenu: this.getMenuData(nextProps.test_category)})
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
        const {classes, testResult} = this.props;
        const {repoMenu, productMenu, branchMenu, versionMenu, statusMenu, triageMenu, categoryMenu} = this.state;

        console.log(testResult);

        return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Fragment>
                    <DialogTitle id="form-dialog-title">Test Result Details</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={getTestResultData(this.props.testResult)}
                            validate={values => {
                                return axios.post(
                                    DESTINY_VERIFY_TEST_RESULT_ENDPOINT, values, {
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-CSRFToken": getCookie("csrftoken"),
                                        }
                                    }
                                ).then(
                                    res => {
                                        const errors = res.data.errors;
                                        if (Object.keys(errors).length) {
                                            throw errors;
                                        }
                                    }
                                )
                            }}
                            onSubmit={(values, {setSubmitting}) => {
                                setSubmitting(true);
                                axios.post(
                                    DESTINY_VERIFY_TEST_RESULT_ENDPOINT, values, {
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-CSRFToken": getCookie("csrftoken"),
                                        }
                                    }
                                ).then(
                                    res => {
                                        const errors = res.data.errors;
                                        if (Object.keys(errors).length) {
                                            throw errors;
                                        }
                                        this.props.onClickSave(res.data.results);
                                    }
                                ).catch(e => {
                                    console.log(e);
                                    setSubmitting(false);
                                })
                            }}
                            validationSchema={Yup.object().shape({
                                test_case: Yup.string()
                                    .required('Required'),
                                product: Yup.string()
                                    .required('Required'),
                                branch: Yup.string()
                                    .required('Required'),
                                version: Yup.string()
                                    .required('Required'),
                                build_version: Yup.string()
                                    .required('Required'),
                                start_time: Yup.string()
                                    .required('Required'),
                                end_time: Yup.string()
                                    .required('Required'),
                                status: Yup.string()
                                    .required('Required'),
                                data: Yup.object()

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
                                    setFieldValue
                                } = props;
                                return (
                                    <form onSubmit={handleSubmit}>
                                        <Grid container alignItems="flex-start" spacing={4}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    name="test_case"
                                                    label="Test Case"
                                                    className={classes.textField}
                                                    value={values.test_case}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.test_case && touched.test_case) && errors.test_case}
                                                    error={errors.test_case && touched.test_case}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    select
                                                    name="product"
                                                    label="Product"
                                                    className={classes.textField}
                                                    value={values.product}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.product && touched.product) && errors.product}
                                                    error={errors.product && touched.product}
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
                                                    {productMenu.map(option => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={4}>
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
                                            <Grid item xs={4}>
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
                                            <Grid item xs={6}>
                                                <TextField
                                                    name="build_version"
                                                    label="Build Version"
                                                    className={classes.textField}
                                                    value={values.build_version}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.build_version && touched.build_version) && errors.build_version}
                                                    error={errors.build_version && touched.build_version}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    name="status"
                                                    select
                                                    label="Status"
                                                    className={classes.textField}
                                                    value={values.status}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.status && touched.status) && errors.status}
                                                    error={errors.status && touched.status}
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
                                                    {statusMenu.map(option => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <DateTimePicker
                                                    name="start-time"
                                                    label="Start Time"
                                                    inputVariant="outlined"
                                                    value={_.isNull(values.start_time) ? null : moment(values.start_time)}
                                                    onChange={dt => {
                                                        setFieldValue('start_time', dt);
                                                    }}
                                                    onError={(_, error) => form.setFieldError('start_time', errors.start_time)}
                                                    error={errors.start_time && touched.start_time}
                                                    fullWidth
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <DateTimePicker
                                                    name="end-time"
                                                    label="End Time"
                                                    inputVariant="outlined"
                                                    value={_.isNull(values.end_time) ? null : moment(values.end_time)}
                                                    onChange={dt => {
                                                        setFieldValue('end_time', dt);
                                                    }}
                                                    onError={(_, error) => form.setFieldError('end_time', errors.end_time)}
                                                    error={errors.end_time && touched.end_time}
                                                    fullWidth
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    name="status_message"
                                                    label="Status Message"
                                                    multiline
                                                    rowsMax="4"
                                                    value={values.status_message}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.status_message && touched.status_message) && errors.status_message}
                                                    error={errors.status_message && touched.status_message}
                                                    className={classes.textField}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    name="stack_trace"
                                                    label="Stack Trace"
                                                    multiline
                                                    rowsMax="4"
                                                    value={values.stack_trace}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.stack_trace && touched.stack_trace) && errors.stack_trace}
                                                    error={errors.stack_trace && touched.stack_trace}
                                                    className={classes.textField}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    select
                                                    name="triage_status"
                                                    label="Triage Status"
                                                    className={classes.textField}
                                                    value={values.triage_status}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.triage_status && touched.triage_status) && errors.triage_status}
                                                    error={errors.triage_status && touched.triage_status}
                                                    SelectProps={{
                                                        MenuProps: {
                                                            className: classes.menu,
                                                        },
                                                    }}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                >
                                                    {triageMenu.map(option => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    select
                                                    name="triage_resolution"
                                                    label="Triage Resolution"
                                                    className={classes.textField}
                                                    value={values.triage_resolution}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.triage_resolution && touched.triage_resolution) && errors.triage_resolution}
                                                    error={errors.triage_resolution && touched.triage_resolution}
                                                    SelectProps={{
                                                        MenuProps: {
                                                            className: classes.menu,
                                                        },
                                                    }}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                >
                                                    {this.triageResolutionMenu.map(option => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    name="triage_comment"
                                                    label="Triage Comment"
                                                    multiline
                                                    rowsMax="4"
                                                    value={values.triage_comment}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.triage_comment && touched.triage_comment) && errors.triage_comment}
                                                    error={errors.triage_comment && touched.triage_comment}
                                                    className={classes.textField}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    name="issue_tracker_url"
                                                    label="Issue Trackers"
                                                    multiline
                                                    rowsMax="4"
                                                    value={values.issue_tracker_url.join('\n')}
                                                    onChange={(e) => {
                                                        setFieldValue('issue_tracker_url', e.target.value.split('\n'));
                                                        console.log(e.target.value);
                                                    }}
                                                    onBlur={handleBlur}
                                                    className={classes.textField}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <ReactJson src={values.data}
                                                           name={null}
                                                           enableClipboard={true}
                                                           displayDataTypes={true}
                                                           onEdit={data => {
                                                               console.log(data);
                                                               setFieldValue('data', data.updated_src);
                                                           }}
                                                           onAdd={data => {
                                                               console.log(data);
                                                               setFieldValue('data', data.updated_src);
                                                           }}
                                                           onDelete={data => {
                                                               console.log(data);
                                                               setFieldValue('data', data.updated_src);
                                                           }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <DialogActions>
                                                    <Button onClick={e => {
                                                        this.props.onClickCancel()
                                                    }}
                                                            color="primary">
                                                        Cancel
                                                    </Button>

                                                    {_.isEmpty(testResult) && (
                                                        <div>
                                                            <input
                                                                ref={this.fileRef}
                                                                accept=".csv"
                                                                type="file"
                                                                style={{display: 'none'}}
                                                                onChange={e => {
                                                                    this.props.onClickUpload(e.target.files);
                                                                    this.props.onClickCancel();
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={e => {
                                                                    this.fileRef.current.click();
                                                                }}
                                                                color="primary">
                                                                Upload
                                                            </Button>
                                                        </div>
                                                    )}


                                                    <Button type="submit" disabled={isSubmitting} color="primary">
                                                        Save
                                                    </Button>
                                                </DialogActions>
                                            </Grid>
                                        </Grid>
                                    </form>
                                );
                            }}
                        </Formik>
                    </DialogContent>
                </Fragment>
            </MuiPickersUtilsProvider>
        );
    }
}

TestResultForm.defaultProps = {
    testResult: {
        'id': null,
        'url': '',
        'label': '',
        'test_case': {
            'id': null,
            'url': '',
            'name': '',
        },
        'repo': {
            'id': null,
            'url': '',
            'name': '',
        },
        'product': {
            'id': null,
            'url': '',
            'name': '',
        },
        'branch': {
            'id': null,
            'url': '',
            'name': '',
        },
        'version': {
            'id': null,
            'url': '',
            'name': '',
        },
        'owner': {
            'id': null,
            'url': '',
            'name': '',
        },
        'start_time': '',
        'end_time': '',
        'status': '',
        'status_message': '',
        'stack_trace': '',
        'triage_status': '',
        'triage_resolution': '',
        'triage_comment': '',
        'issue_tracker_url': [],
        'build_version_str': '',
        'data': {}
    }
};

TestResultForm.defaultProps = {
    repositories: [],
    products: [],
    branches: [],
    versions: [],
    test_status: [],
    triage_status: [],
    test_category: []
};

TestResultForm.propTypes = {
    classes: PropTypes.object.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onClickUpload: PropTypes.func.isRequired,
    onClickSave: PropTypes.func.isRequired,
    testResult: PropTypes.object,
};

export default withStyles(styles)(TestResultForm);