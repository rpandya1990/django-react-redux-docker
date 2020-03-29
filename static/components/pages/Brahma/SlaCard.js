import React, {Component} from "react";
import {connect} from "react-redux";
import {
    add_frequency_to_sla,
    add_sla,
    delete_frequency,
    delete_sla,
    toggle_sla_status
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
import CancelIcon from "@material-ui/icons/Cancel";
import withStyles from "@material-ui/core/styles/withStyles";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import * as Yup from "yup";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TablePagination from "@material-ui/core/TablePagination";

class SlaCard extends Component {
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

        this.initialFreqFormValues = {
            time_unit: '', frequency: 1, retention: 1
        };

        this.freq_form = [
            {heading: 'Unit', name: 'time_unit', type: 'text'},
            {heading: 'Frequency', name: 'frequency', type: 'number'},
            {heading: 'Retention', name: 'retention', type: 'number'},
        ];

        this.validationSchema = Yup.object().shape({
            name: Yup.string()
                .required('Required'),
            overwrite: Yup.boolean(),
        });

        this.frequencyValidationSchema = Yup.object().shape({
            time_unit: Yup.string()
                .required('Required'),
            frequency: Yup.number()
                .required('Required')
                .min(1, 'cannot be less than 1'),
            retention: Yup.number()
                .required('Required')
                .min(1, 'cannot be less than 1')
        });
    }

    handlePageChange(e, newVal) {
        this.setState({page: newVal})
    }

    handleRowsPerPageChange(e) {
        this.setState({rowsPerPage: e.target.value})
    }

    renderAddedSla(classes, sla) {
        const {page, rowsPerPage} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, sla.length - page * rowsPerPage);

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>SLAs</h4>

                <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight: '200px'}}>
                    <Paper className={classes.root}>
                        <Table className={classes.table}>

                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Overwrite</TableCell>
                                    <TableCell align="center">Frequencies</TableCell>
                                    <TableCell align="center">Global status</TableCell>
                                    <TableCell align="center" padding={"checkbox"}>
                                        <Tooltip title="Add Sla" placement="top">
                                            <IconButton aria-label="Add"
                                                        onClick={() => this.setState({form_modal: true})}>
                                                <AddCircleIcon className={classes.addIcon}/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {sla
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(row => (
                                        <TableRow key={row.name}>
                                            <TableCell component="th" scope="row"> {row.name} </TableCell>
                                            <TableCell align="center"> {row.overwrite.toString()} </TableCell>

                                            <TableCell align="center">
                                                <Tooltip title="click to view frequencies" placement="top"
                                                         style={{padding: '0'}}>
                                                    <Button className={classes.button} onClick={() => this.setState({
                                                        [`policy_details_${row.id}`]: true
                                                    })} align="center">
                                                        {row.frequency.length}
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell align="center">
                                                {row.is_global ?
                                                    <Tooltip title="click to make private" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_sla_status(row.id)} align="center">
                                                            Public
                                                        </Button>
                                                    </Tooltip>
                                                    :
                                                    <Tooltip title="click to make public" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_sla_status(row.id)} align="center">
                                                            Private
                                                        </Button>
                                                    </Tooltip>
                                                }
                                            </TableCell>

                                            <TableCell align="center" padding="checkbox">
                                                <Tooltip title="remove this sla" placement="top">
                                                    <IconButton aria-label="Delete" onClick={() => this.setState({
                                                        [`delete_sla_modal_${row.id}`]: true
                                                    })}>
                                                        <RemoveCircleIcon className={classes.deleteIcon}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            {this.renderPolicyViewDialog(classes, row)}
                                            {this.renderDeleteSlaDialog(classes, row)}
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
                            count={sla.length}
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

                {this.renderAddSlaDialog(classes)}
            </div>
        )
    }

    renderPolicyViewDialog(classes, row) {
        return (
            <Dialog
                open={!!this.state[`policy_details_${row.id}`]}
                onClose={() => this.setState({
                    [`policy_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{margin: '0 5px'}}>
                    <DialogTitle> SLA Policy </DialogTitle>

                    <Paper className={classes.root} style={{marginBottom: '10px'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Time Unit</TableCell>
                                    <TableCell align="center">Frequency</TableCell>
                                    <TableCell align="center">Retention</TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {row.frequency.map((frequency, index) => (
                                    <TableRow key={row.name + index}>
                                        <TableCell component="th" scope="row">{frequency.time_unit}</TableCell>
                                        <TableCell align="center">{frequency.frequency}</TableCell>
                                        <TableCell align="center">{frequency.retention}</TableCell>

                                        <TableCell align="center" size="small">
                                            <Tooltip title="remove this row" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => this.setState({
                                                    [`delete_frequency_modal_${frequency.id}`]: true
                                                })}>
                                                    <CancelIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        {this.renderDeleteFrequencyDialog(classes, frequency.id)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>

                    <Formik
                        initialValues={this.initialFreqFormValues}
                        validationSchema={this.frequencyValidationSchema}
                        onSubmit={(values, {setSubmitting, resetForm}) => {
                            this.props.add_frequency_to_sla(values, row.id);
                            setSubmitting(false);
                            resetForm(this.initialFreqFormValues);
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
                            <form onSubmit={handleSubmit} className={classes.frequencyForm}>
                                <Grid container alignItems="flex-start" style={{marginBottom: '10px'}} spacing={1}>
                                    {this.freq_form.map(field => (
                                        <Grid item xs={4} key={field.name}>
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

                                <Button color="primary" variant="contained"
                                        type="submit" disabled={isSubmitting}>
                                    Add Frequency
                                </Button>
                            </form>
                        )}
                    </Formik>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`policy_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderAddSlaDialog(classes) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.form_modal}
                onClose={() => this.setState({form_modal: false})}
            >
                <Formik
                    initialValues={{name: '', overwrite: false}}
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
                            <DialogTitle> Add Sla </DialogTitle>

                            <form onSubmit={handleSubmit}>
                                <DialogContent>
                                    <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="name"
                                                label="Name"
                                                value={values.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.name && touched.name) && errors.name}
                                                error={errors.name && touched.name}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="overwrite"
                                                        checked={values.overwrite}
                                                        onChange={handleChange}
                                                        value="overwrite"
                                                        color="primary"
                                                        inputProps={{
                                                            'aria-label': 'secondary checkbox',
                                                        }}
                                                    />
                                                }
                                                label="Overwrite"
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
                                        Add Sla
                                    </Button>
                                </DialogActions>
                            </form>
                        </div>
                    )}
                </Formik>
            </Dialog>
        )
    }

    renderDeleteSlaDialog(classes, fileset) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_sla_modal_${fileset.id}`]}
                onClose={() => this.setState({[`delete_sla_modal_${fileset.id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Sla named '{fileset.name}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_sla_modal_${fileset.id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteSla(fileset.id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeleteFrequencyDialog(classes, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_frequency_modal_${id}`]}
                onClose={() => this.setState({[`delete_frequency_modal_${id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Frequency from sla ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_frequency_modal_${id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteFrequencyFromSla(id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    handleFormSubmit(values, {setSubmitting, resetForm}) {
        this.props.add_sla(values);
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({form_modal: false})
    }

    deleteSla(id) {
        this.props.delete_sla(id);
        this.setState({
            [`delete_sla_modal_${id}`]: false
        })
    }

    deleteFrequencyFromSla(freq_id) {
        this.props.delete_frequency(freq_id);
        this.setState({
            [`delete_frequency_modal_${freq_id}`]: false
        })
    }

    render() {
        const {classes, sla} = this.props;

        return (
            <div>
                {this.renderAddedSla(classes, sla)}
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
    frequencyForm: {
        padding: '2px 10px'
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {
        add_sla,
        add_frequency_to_sla,
        delete_sla,
        delete_frequency,
        toggle_sla_status
    }
)(SlaCard));