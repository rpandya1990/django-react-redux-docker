import React, {Component} from "react";
import {connect} from "react-redux";
import {
    add_datastore,
    add_hypervisor,
    delete_datastore,
    delete_hypervisor,
    toggle_hypervisor_status
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
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import CancelIcon from "@material-ui/icons/Cancel";
import TablePagination from "@material-ui/core/TablePagination";
import MenuItem from "@material-ui/core/MenuItem";
import {InputLabel} from "@material-ui/core";

class HypervisorCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form_modal: false,
            page: 0,
            rowsPerPage: 5
        };

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleRowsPerPageChange = this.handleRowsPerPageChange.bind(this);

        this.initialFormValues = {
            name: '', type: '',
            additional_load: false, concurrency: 2,
            hypervisor_manager: ''
        };

        this.form = [
            {heading: 'Name', name: 'name', type: 'text'},
            {heading: 'Type', name: 'type', type: 'text'},
            {heading: 'Concurrency', name: 'concurrency', type: 'number'},

        ];

        this.datastore_initial_values = {
            name: '', type: '', additional_load: false, for_hypervisor: 0
        };

        this.datastore_form = [
            {heading: 'Name', name: 'name', type: 'text'},
            {heading: 'Type', name: 'type', type: 'text'},
        ];

        this.validationSchema = Yup.object().shape({
            name: Yup.string()
                .required('Required'),
            type: Yup.string()
                .required('Required'),
            additional_load: Yup.boolean(),
            concurrency: Yup.number()
                .required('Required')
                .min(1, 'cannot be less than 1'),
            hypervisor_manager: Yup.string()
                .required('Required')
        });

        this.datastoreValidationSchema = Yup.object().shape({
            name: Yup.string()
                .required('Required'),
            type: Yup.string()
                .required('Required'),
            additional_load: Yup.boolean(),
            for_hypervisor: Yup.number()
                .required('Required')
        });
    }

    handlePageChange(e, newVal) {
        this.setState({page: newVal})
    }

    handleRowsPerPageChange(e) {
        this.setState({rowsPerPage: e.target.value})
    }

    renderAddedHypervisors(classes, hypervisor) {
        const hypervisor_fields = [
            ['Type', 'type'],
            ['Additional Load', 'additional_load'],
            ['Concurrency', 'concurrency']
        ];

        const hypervisor_manager_id_to_name_mapping = {};

        this.props.hypervisor_manager.forEach(manager => {
            hypervisor_manager_id_to_name_mapping[manager.id] = manager.name;
        });

        const {page, rowsPerPage} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, hypervisor.length - page * rowsPerPage);

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Hypervisors</h4>

                <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight: '200px'}}>
                    <Paper className={classes.root}>
                        <Table className={classes.table}>

                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    {hypervisor_fields.map(field => (
                                        <TableCell align="center" key={field[0]}>{field[0]}</TableCell>
                                    ))}
                                    <TableCell align="center">Datastores</TableCell>
                                    <TableCell align="center">Hypervisor Manager</TableCell>
                                    <TableCell align="center">Global status</TableCell>
                                    <TableCell align="center" padding={"checkbox"}>
                                        <Tooltip title="Add Hypervisor" placement="top">
                                            <IconButton aria-label="Add"
                                                        onClick={() => this.setState({form_modal: true})}>
                                                <AddCircleIcon className={classes.addIcon}/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {hypervisor
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(row => (
                                        <TableRow key={row.name}>
                                            <TableCell component="th" scope="row"> {row.name} </TableCell>

                                            {hypervisor_fields.map(field => (
                                                <TableCell align="center"
                                                           key={field[0]}>{row[field[1]].toString()}</TableCell>
                                            ))}

                                            <TableCell align="center">
                                                <Tooltip title="click to view datastores" placement="top"
                                                         style={{padding: 0}}>
                                                    <Button className={classes.button} onClick={() => this.setState({
                                                        [`datastore_details_${row.id}`]: true
                                                    })} align="center">
                                                        {row.datastores.length}
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell align="center">
                                                {hypervisor_manager_id_to_name_mapping[row.hypervisor_manager]}
                                            </TableCell>

                                            <TableCell align="center">
                                                {row.is_global ?
                                                    <Tooltip title="click to make private" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_hypervisor_status(row.id)}
                                                                align="center">
                                                            Public
                                                        </Button>
                                                    </Tooltip>
                                                    :
                                                    <Tooltip title="click to make public" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_hypervisor_status(row.id)}
                                                                align="center">
                                                            Private
                                                        </Button>
                                                    </Tooltip>
                                                }
                                            </TableCell>

                                            <TableCell align="center" padding="checkbox">
                                                <Tooltip title="remove this hypervisor" placement="top">
                                                    <IconButton aria-label="Delete" onClick={() => this.setState({
                                                        [`delete_hypervisor_modal_${row.id}`]: true
                                                    })}>
                                                        <RemoveCircleIcon className={classes.deleteIcon}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            {this.renderDatastoreViewDialog(classes, row)}
                                            {this.renderDeleteHypervisorDialog(classes, row)}
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
                            count={hypervisor.length}
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

                {this.renderAddHypervisorDialog(classes)}
            </div>
        )
    }

    renderDatastoreViewDialog(classes, row) {
        return (
            <Dialog
                open={!!this.state[`datastore_details_${row.id}`]}
                onClose={() => this.setState({
                    [`datastore_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{margin: '0 5px'}}>
                    <DialogTitle> Datastores </DialogTitle>

                    <Paper className={classes.root} style={{marginBottom: '10px'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Type</TableCell>
                                    <TableCell align="center">Additional Load</TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {row.datastores.map((datastore, index) => (
                                    <TableRow key={row.name + index}>
                                        <TableCell component="th" scope="row">{datastore.name}</TableCell>
                                        <TableCell align="center">{datastore.type}</TableCell>
                                        <TableCell align="center">{datastore.additional_load.toString()}</TableCell>

                                        <TableCell align="center" size="small">
                                            <Tooltip title="remove this datastore" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => this.setState({
                                                    [`delete_datastore_modal_${datastore.id}`]: true
                                                })}>
                                                    <CancelIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        {this.renderDeleteDatastoreDialog(classes, datastore.id)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>

                    <InputLabel htmlFor="ds_form" style={{marginTop: '20px'}}> Add Datastore </InputLabel>

                    <Formik
                        initialValues={this.datastore_initial_values}
                        validationSchema={this.datastoreValidationSchema}
                        onSubmit={(values, {setSubmitting, resetForm}) => {
                            values.for_hypervisor = row.id;
                            this.props.add_datastore(values);
                            setSubmitting(false);
                            resetForm(this.datastore_initial_values);
                        }}
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
                            <form onSubmit={handleSubmit} className={classes.datastoreForm}>
                                <Grid container alignItems="flex-start" style={{marginBottom: '10px'}} spacing={1}>
                                    {this.datastore_form.map(field => (
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
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name="additional_load"
                                                    checked={values.additional_load}
                                                    onChange={handleChange}
                                                    value="additional_load"
                                                    color="primary"
                                                    inputProps={{
                                                        'aria-label': 'secondary checkbox',
                                                    }}
                                                />
                                            }
                                            label="Additional load"
                                            labelPlacement="start"
                                            className={classes.checkbox}
                                        />
                                    </Grid>
                                </Grid>

                                <Button color="primary" variant="contained"
                                        type="submit" disabled={isSubmitting}>
                                    Add
                                </Button>
                            </form>
                        )}
                    </Formik>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`datastore_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderAddHypervisorDialog(classes) {
        const {hypervisor_manager} = this.props;

        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.form_modal}
                onClose={() => this.setState({form_modal: false})}
            >
                <Formik
                    initialValues={this.initialFormValues}
                    onSubmit={this.handleFormSubmit}
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
                            <DialogTitle> Add Hypervisor </DialogTitle>

                            <form onSubmit={handleSubmit}>
                                <DialogContent>
                                    <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                        {this.form.map(field => (
                                            <Grid item xs={12} key={field.name}>
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

                                        <Grid item xs={12}>
                                            <TextField
                                                select
                                                name="hypervisor_manager"
                                                label="Hypervisor Manager"
                                                value={values.hypervisor_manager}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.hypervisor_manager && touched.hypervisor_manager)
                                                && errors.hypervisor_manager}
                                                error={errors.hypervisor_manager && touched.hypervisor_manager}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            >
                                                {hypervisor_manager.map(item => (
                                                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                                ))}

                                            </TextField>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="additional_load"
                                                        checked={values.additional_load}
                                                        onChange={handleChange}
                                                        value="additional_load"
                                                        color="primary"
                                                        inputProps={{
                                                            'aria-label': 'secondary checkbox',
                                                        }}
                                                    />
                                                }
                                                label="Additional load"
                                                labelPlacement="start"
                                                className={classes.checkbox}
                                            />
                                        </Grid>
                                    </Grid>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => this.setState({form_modal: false})}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" variant="contained"
                                            type="submit" disabled={isSubmitting}>
                                        Add Hypervisor
                                    </Button>
                                </DialogActions>
                            </form>
                        </div>
                    )}
                </Formik>
            </Dialog>
        )
    }

    renderDeleteHypervisorDialog(classes, fileset) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_hypervisor_modal_${fileset.id}`]}
                onClose={() => this.setState({[`delete_hypervisor_modal_${fileset.id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Hypervisor named '{fileset.name}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_hypervisor_modal_${fileset.id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteHypervisor(fileset.id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeleteDatastoreDialog(classes, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_datastore_modal_${id}`]}
                onClose={() => this.setState({[`delete_datastore_modal_${id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Datastore from Hypervisor ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_datastore_modal_${id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteDatastoreFromHypervisor(id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    handleFormSubmit(values, {setSubmitting, resetForm}) {
        this.props.add_hypervisor(values);
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({form_modal: false})
    }

    deleteHypervisor(id) {
        this.props.delete_hypervisor(id);
        this.setState({
            [`delete_hypervisor_modal_${id}`]: false
        })
    }

    deleteDatastoreFromHypervisor(id) {
        this.props.delete_datastore(id);
        this.setState({
            [`delete_datastore_modal_${id}`]: false
        })
    }

    render() {
        const {classes, hypervisor} = this.props;

        return (
            <div>
                {this.renderAddedHypervisors(classes, hypervisor)}
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
    },
    pathForm: {
        padding: '2px 10px'
    },
    checkbox: {
        position: 'relative',
        left: '-15px',
        top: '5px'
    },
    datastoreForm: {
        padding: '2px 10px'
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {
        add_hypervisor,
        add_datastore,
        delete_hypervisor,
        delete_datastore,
        toggle_hypervisor_status
    }
)(HypervisorCard));