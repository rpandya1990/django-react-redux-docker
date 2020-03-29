import React, {Component, Fragment} from 'react';
import {withStyles} from "@material-ui/core";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import DialogContent from "@material-ui/core/DialogContent";
import {Formik} from "formik";
import * as Yup from 'yup';
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import ReactJson from 'react-json-view'
import axios from "axios";
import {DESTINY_VERIFY_TEST_CASE_ENDPOINT} from "../../../api/endpoints";
import {getCookie, getTestCaseData} from "../../../utils";
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

class TestCaseForm extends Component {
    constructor(props) {
        super(props);

        this.fileRef = React.createRef();

        this.state = {
            ownerMenu: this.getMenuData(props.users),
            repoMenu: this.getMenuData(props.repositories),
            productMenu: this.getMenuData(props.products),
            branchMenu: this.getMenuData(props.branches),
            versionMenu: this.getMenuData(props.versions),
            statusMenu: this.getMenuData(props.test_status),
            frameworkMenu: this.getMenuData(props.test_framworks),
            categoryMenu: this.getMenuData(props.test_category),
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.users, nextProps.users)) {
            this.setState({ownerMenu: this.getMenuData(nextProps.users)})
        }
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
        if (!_.isEqual(this.props.test_framworks, nextProps.test_framworks)) {
            this.setState({frameworkMenu: this.getMenuData(nextProps.test_framworks)})
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
        const {classes, testCase} = this.props;
        const {ownerMenu, repoMenu, productMenu, branchMenu, versionMenu, statusMenu, frameworkMenu, categoryMenu} = this.state;

        console.log(testCase);

        return (
            <Fragment>
                <DialogTitle id="form-dialog-title">Test Case Details</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={getTestCaseData(testCase)}
                        validate={values => {
                            return axios.post(
                                DESTINY_VERIFY_TEST_CASE_ENDPOINT, values, {
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
                                DESTINY_VERIFY_TEST_CASE_ENDPOINT, values, {
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
                            });
                        }}
                        validationSchema={Yup.object().shape({
                            name: Yup.string()
                                .required('Required'),
                            product: Yup.string()
                                .required('Required'),
                            branch: Yup.string()
                                .required('Required'),
                            version: Yup.string()
                                .required('Required'),
                            owner: Yup.string()
                                .required('Required'),
                            test_category: Yup.string()
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
                                setFieldValue,
                            } = props;
                            return (
                                <form onSubmit={handleSubmit}>
                                    <Grid container alignItems="flex-start" spacing={4}>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="name"
                                                label="Name"
                                                className={classes.textField}
                                                value={values.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.name && touched.name) && errors.name}
                                                error={errors.name && touched.name}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="description"
                                                label="Description"
                                                multiline
                                                rowsMax="4"
                                                value={values.description}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={classes.textField}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
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
                                                required
                                                fullWidth
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
                                                required
                                                fullWidth
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
                                                select
                                                name="owner"
                                                label="Owner"
                                                className={classes.textField}
                                                value={values.owner}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.owner && touched.owner) && errors.owner}
                                                error={errors.owner && touched.owner}
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
                                                {ownerMenu.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                select
                                                name="effective_status"
                                                label="Effective Status"
                                                className={classes.textField}
                                                value={values.effective_status}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                SelectProps={{
                                                    MenuProps: {
                                                        className: classes.menu,
                                                    },
                                                }}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            >
                                                {statusMenu.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="steps"
                                                label="Steps"
                                                multiline
                                                rowsMax="4"
                                                value={values.steps}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={classes.textField}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="test_module"
                                                label="Module"
                                                className={classes.textField}
                                                value={values.test_module}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.test_module && touched.test_module) && errors.test_module}
                                                error={errors.test_module && touched.test_module}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="test_class"
                                                label="Class"
                                                className={classes.textField}
                                                value={values.test_class}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.test_class && touched.test_class) && errors.test_class}
                                                error={errors.test_class && touched.test_class}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="test_method"
                                                label="Method"
                                                className={classes.textField}
                                                value={values.test_method}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.test_method && touched.test_method) && errors.test_method}
                                                error={errors.test_method && touched.test_method}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                select
                                                name="test_category"
                                                label="Category"
                                                className={classes.textField}
                                                value={values.test_category}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.test_category && touched.test_category) && errors.test_category}
                                                error={errors.test_category && touched.test_category}
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
                                                {categoryMenu.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                select
                                                name="test_type"
                                                label="Type"
                                                className={classes.textField}
                                                value={values.test_type}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                SelectProps={{
                                                    MenuProps: {
                                                        className: classes.menu,
                                                    },
                                                }}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            >
                                                {frameworkMenu.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                name="flakiness_percentage"
                                                label="Flakiness Percentage"
                                                value={values.flakiness_percentage}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                type="number"
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                name="last_five_fail_percentage"
                                                label="Last Five Fail Percentage"
                                                value={values.last_five_fail_percentage}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                type="number"
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
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
                                                           setFieldValue('data', data.updated_src);
                                                       }}
                                                       onAdd={data => {
                                                           setFieldValue('data', data.updated_src);
                                                       }}
                                                       onDelete={data => {
                                                           setFieldValue('data', data.updated_src);
                                                       }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <DialogActions>
                                                <Button
                                                    onClick={e => {
                                                        this.props.onClickCancel()
                                                    }}
                                                    color="primary">
                                                    Cancel
                                                </Button>

                                                {_.isEmpty(testCase) && (
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

                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    color="primary">
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
        );
    }
}

TestCaseForm.defaultProps = {
    testCase: {
        'id': null,
        'url': '',
        'name': '',
        'repo': {
            'id': null,
            'url': '',
            'name': '',
        },
        'product': {
            'id': null,
            'url': '',
            'name': ''
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
        'description': '',
        'steps': '',
        'test_category': '',
        'test_module': '',
        'test_class': '',
        'test_method': '',
        'test_spec': {},
        'data': {},
        'effective_status': '',
        'flakiness_percentage': '',
        'last_five_fail_percentage': '',
        'test_type': '',
        'test_tags': []
    }
};

TestCaseForm.defaultProps = {
    users: [],
    repositories: [],
    products: [],
    branches: [],
    versions: [],
    test_status: [],
    test_framworks: [],
    test_category: []
};

TestCaseForm.propTypes = {
    classes: PropTypes.object.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onClickUpload: PropTypes.func.isRequired,
    onClickSave: PropTypes.func.isRequired,
    testCase: PropTypes.object,
};

export default withStyles(styles)(TestCaseForm);