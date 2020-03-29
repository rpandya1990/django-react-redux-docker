import React, {Component} from "react";
import {connect} from "react-redux";
import {
    add_hypervisor_manager,
    delete_hypervisor_manager,
    toggle_hypervisor_manager_status
} from '../../../actions/brahma';
import {Formik} from 'formik';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import withStyles from "@material-ui/core/styles/withStyles";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import * as Yup from "yup";
import TablePagination from "@material-ui/core/TablePagination";

class HypervisorManagerCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form_modal: false,
            page: 0,
            rowsPerPage: 5
        };

        this.validateForm = this.validateForm.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleRowsPerPageChange = this.handleRowsPerPageChange.bind(this);

        this.initialFormValues = {
            name: '', hostname: '',
            type: '', port: 443,
            username: '', password: '',
            confirm_password: ''
        };

        this.form = [
            {heading: 'Name', name: 'name', type: 'text'},
            {heading: 'Hostname', name: 'hostname', type: 'text'},
            {heading: 'Type', name: 'type', type: 'text'},
            {heading: 'Port', name: 'port', type: 'number'},
            {heading: 'Username', name: 'username', type: 'text'},
            {heading: 'Password', name: 'password', type: 'password'},
            {heading: 'Confirm Password', name: 'confirm_password', type: 'password'}
        ];

        this.validationSchema = Yup.object().shape({
            name: Yup.string()
                .required('Required'),
            hostname: Yup.string()
                .required('Required'),
            username: Yup.string()
                .required('Required'),
            password: Yup.string()
                .required('Required'),
            confirm_password: Yup.string()
                .required('Required'),
            type: Yup.string()
                .required('Required'),
            port: Yup.number()
                .required('Required')
                .min(0, 'Port cannot be negative')
        });
    }

    renderRevealPasswordField(classes, row) {
        return (
            <Tooltip title={`click to ${
                this.state[`view_password_${row.id}`] ?
                    'hide'
                    :
                    'reveal'
                } password`} placement="top" style={{padding: 0}}>

                <Button className={classes.button} onClick={() => this.setState({
                    [`view_password_${row.id}`]: !this.state[`view_password_${row.id}`]
                })} align="center">
                    {this.state[`view_password_${row.id}`] ?
                        <div> {row.password} </div>
                        :
                        <div> {new Array(row.password.length + 1).join("*")} </div>
                    }
                </Button>

            </Tooltip>
        )
    }

    handlePageChange(e, newVal) {
        this.setState({page: newVal})
    }

    handleRowsPerPageChange(e) {
        this.setState({rowsPerPage: e.target.value})
    }

    renderAddedHypervisorManager(classes, hypervisor_manager) {
        const hypervisor_manager_fields = [
            ['Hostname', 'hostname'],
            ['Type', 'type'],
            ['Port', 'port'],
            ['Username', 'username']
        ];

        const {page, rowsPerPage} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, hypervisor_manager.length - page * rowsPerPage);

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Hypervisor Managers</h4>

                <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight: '200px'}}>
                    <Paper className={classes.root}>
                        <Table className={classes.table}>

                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    {hypervisor_manager_fields.map(field => (
                                        <TableCell align="center" key={field[0]}>{field[0]}</TableCell>
                                    ))}
                                    <TableCell align="center">Password</TableCell>
                                    <TableCell align="center">Global status</TableCell>

                                    <TableCell align="center" padding={"checkbox"}>
                                        <Tooltip title="Add Hypervisor Manager" placement="top">
                                            <IconButton aria-label="Add"
                                                        onClick={() => this.setState({form_modal: true})}>
                                                <AddCircleIcon className={classes.addIcon}/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {hypervisor_manager
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(row => (
                                        <TableRow key={row.name}>
                                            <TableCell component="th" scope="row">
                                                {row.name}
                                            </TableCell>
                                            {hypervisor_manager_fields.map(field => (
                                                <TableCell align="center" key={field[0]}>{row[field[1]]}</TableCell>
                                            ))}
                                            <TableCell
                                                align="center">{this.renderRevealPasswordField(classes, row)}</TableCell>

                                            <TableCell align="center">
                                                {row.is_global ?
                                                    <Tooltip title="click to make private" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_hypervisor_manager_status(row.id)}
                                                                align="center">
                                                            Public
                                                        </Button>
                                                    </Tooltip>
                                                    :
                                                    <Tooltip title="click to make public" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_hypervisor_manager_status(row.id)}
                                                                align="center">
                                                            Private
                                                        </Button>
                                                    </Tooltip>
                                                }
                                            </TableCell>

                                            <TableCell align="center" padding="checkbox">
                                                <Tooltip title="remove this hypervisor manager" placement="top">
                                                    <IconButton aria-label="Delete" onClick={() => this.setState({
                                                        [`delete_hm_modal_${row.id}`]: true
                                                    })}>
                                                        <RemoveCircleIcon className={classes.deleteIcon}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            {this.renderDeleteHypervisorManagerDialog(classes, row)}
                                        </TableRow>
                                    ))}

                                {emptyRows > 0 && page > 0 && (
                                    <TableRow style={{height: 53 * emptyRows}}>
                                        <TableCell colSpan={6}/>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={hypervisor_manager.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            backIconButtonProps={{
                                'aria-label': 'Previous Page',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'Next Page',
                            }}
                            onChangePage={this.handlePageChange}
                            onChangeRowsPerPage={this.handleRowsPerPageChange}
                        />
                    </Paper>
                </Grid>

                {this.renderAddHypervisorManagerDialog(classes)}
            </div>
        )
    }

    renderAddHypervisorManagerDialog(classes) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.form_modal}
                maxWidth="md"
                onClose={() => this.setState({form_modal: false})}
            >
                <Formik
                    initialValues={this.initialFormValues}
                    onSubmit={this.handleFormSubmit}
                    validate={this.validateForm}
                    validationSchema={this.validationSchema}
                >
                    {({
                          values,
                          touched,
                          errors,
                          isSubmitting,
                          handleChange,
                          handleBlur,
                          handleSubmit
                      }) => (
                        <div className={classes.paper}>
                            <DialogTitle> Add Hypervisor Manager </DialogTitle>

                            <form onSubmit={handleSubmit}>
                                <DialogContent>
                                    <Grid container alignItems="flex-start" spacing={2} style={{marginBottom: '10px'}}>
                                        {this.form.map(field => (
                                            <Grid item xs={6} key={field.name}>
                                                <TextField
                                                    type={field.type}
                                                    name={field.name}
                                                    label={field.heading}
                                                    value={values[field.name]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors[field.name] && touched[field.name]) && errors[field.name]}
                                                    error={errors[field.name] && touched[field.name]}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => this.setState({form_modal: false})}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" variant="contained"
                                            type="submit" disabled={isSubmitting}>
                                        Add Hypervisor Manager
                                    </Button>
                                </DialogActions>
                            </form>
                        </div>
                    )}
                </Formik>
            </Dialog>
        )
    }

    renderDeleteHypervisorManagerDialog(classes, hypervisor_manager) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_hm_modal_${hypervisor_manager.id}`]}
                onClose={() => this.setState({[`delete_hm_modal_${hypervisor_manager.id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Hypervisor Manager named '{hypervisor_manager.name}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_hm_modal_${hypervisor_manager.id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteHypervisorManager(hypervisor_manager.id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    validateForm(values) {
        let errors = {};

        if (values['password'] !== values['confirm_password'])
            errors['confirm_password'] = "Passwords do not match";

        return errors;
    }

    handleFormSubmit(values, {setSubmitting, resetForm}) {
        this.props.add_hypervisor_manager(values);
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({form_modal: false})
    }

    deleteHypervisorManager(id) {
        this.props.delete_hypervisor_manager(id);
        this.setState({
            [`delete_hm_modal_${id}`]: false
        })
    }

    render() {
        const {classes, hypervisor_manager} = this.props;

        return (
            <div>
                {this.renderAddedHypervisorManager(classes, hypervisor_manager)}
            </div>
        )
    }
}

const mapStateToProps = state => ({});

const style = theme => ({
    paper: {
        minWidth: 500,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    root: {
        width: '100%',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
        overflowX: 'auto',
    },
    table: {
        minWidth: 650,
    },
    button: {
        textTransform: 'none'
    },
    deleteIcon: {
        color: '#e10050'
    },
    deleteButton: {
        backgroundColor: '#e10050',
        color: '#FFF'
    },
    addIcon: {
        color: '#009688'
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {
        add_hypervisor_manager,
        delete_hypervisor_manager,
        toggle_hypervisor_manager_status
    }
)(HypervisorManagerCard));