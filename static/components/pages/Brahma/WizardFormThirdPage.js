import React, {Component} from "react";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import {Formik} from "formik";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import * as Yup from "yup";
import _ from 'lodash';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import List from "@material-ui/core/List";
import {Divider} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

class WizardFormThirdPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false
        };

        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        this.initialFormValues = {
            sla: '',
            counts: []
        };

        this.props.addedVM.forEach(vm => {
            this.initialFormValues.counts.push({
                name: vm.name,
                count: 0
            });
        });

        this.validationSchema = Yup.object().shape({
            sla: Yup.string()
                .required('Required'),
            counts: Yup.array()
                .of(
                    Yup.object().shape({
                        name: Yup.string(),
                        count: Yup.number()
                            .required('Required')
                            .min(0, 'cannot be -ve')
                    })
                )
        })
    }

    handleFormSubmit = (values, {setSubmitting, resetForm}) => {
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({modal: false});
        this.props.handleAddSlaToConfig(values);
    };

    renderAddedSLA(classes, sla, deleteSla) {
        return (
            <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight: '200px'}}>
                {sla.length === 0 ?
                    <p> No SLAs Added </p>
                    :
                    <Paper className={classes.root}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Overwrite</TableCell>
                                    <TableCell align="right">Frequencies</TableCell>
                                    <TableCell align="right">Protect Counts</TableCell>
                                    <TableCell align="right" size="small"></TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sla.map(row => (
                                    <TableRow key={row.name}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">{row.overwrite.toString()}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="click to view sla policy" placement="top">
                                                <Button className={classes.button} onClick={() => this.setState({
                                                    [`frequency_details_${row.id}`]: true
                                                })} align="right">
                                                    {row.frequency.length}
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button color="primary" className={classes.button}
                                                    onClick={() => this.setState({
                                                        [`sla_details_${row.id}`]: true
                                                    })}>
                                                view
                                            </Button>
                                        </TableCell>
                                        <TableCell align="right" size="small"></TableCell>
                                        <TableCell align="right" padding="checkbox">
                                            <Tooltip title="remove this sla" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => deleteSla(row.id)}>
                                                    <RemoveCircleIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        {this.renderFrequencyDetailDialog(row, classes)}
                                        {this.renderProtectCountDialog(row, classes)}

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                }
            </Grid>
        )
    }

    renderFrequencyDetailDialog(row, classes) {
        return (
            <Dialog
                open={!!this.state[`frequency_details_${row.id}`]}
                onClose={() => this.setState({
                    [`frequency_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper}>
                    <DialogTitle> SLA Policy </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        <ListItem>
                            <Grid container alignItems={"flex-start"}>
                                <Grid item xs={6}>
                                    <ListItemText primary={"Frequency"}/>
                                </Grid>
                                <Grid item xs={6}>
                                    <ListItemText primary={"Retention"}/>
                                </Grid>
                            </Grid>
                        </ListItem>
                        <Divider/>
                        {row.frequency.map((frequency, index) => (
                            <div key={index}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={6}>
                                            <ListItemText primary={`${frequency.frequency} ${frequency.time_unit}`}/>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <ListItemText primary={`${frequency.retention} ${frequency.time_unit}`}/>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`frequency_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderProtectCountDialog(row, classes) {
        return (
            <Dialog
                open={!!this.state[`sla_details_${row.id}`]}
                onClose={() => this.setState({
                    [`sla_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper}>
                    <DialogTitle> Protect Counts </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {row.protect_counts.map((field) => (
                            <div key={field.name}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={6}><ListItemText
                                            primary={field.name}/></Grid>
                                        <Grid item xs={6}><ListItemText
                                            primary={field.count}/></Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`sla_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    render() {
        const {classes, addedSla, availableSla, addedVM, deleteSla} = this.props;

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Added SLAs</h4>
                {this.renderAddedSLA(classes, addedSla, deleteSla)}

                <Button variant="contained" color="primary" onClick={() => this.setState({modal: true})}>
                    Add Sla to config
                </Button>

                <Dialog
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={this.state.modal}
                    onClose={() => this.setState({modal: false})}
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
                                <DialogTitle id="alert-dialog-title"> Choose Sla details </DialogTitle>

                                <form onSubmit={handleSubmit}>
                                    <DialogContent>

                                        <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    select
                                                    name="sla"
                                                    label="Sla"
                                                    value={values.sla}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.sla && touched.sla) && errors.sla}
                                                    error={errors.sla && touched.sla}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                    required
                                                >
                                                    {availableSla.map(item => (
                                                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>

                                            {addedVM.map((vm, index) => (
                                                <Grid item xs={12} key={vm.name}>
                                                    <TextField
                                                        type="number"
                                                        name={`counts[${index}].count`}
                                                        label={vm.name}
                                                        value={values.counts[index].count}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        helperText={
                                                            (
                                                                _.get(errors, `counts[${index}].count`, '') !== '' &&
                                                                _.get(touched, `counts[${index}].count`, '') !== ''
                                                            ) &&
                                                            errors.counts[index].count
                                                        }
                                                        error={
                                                            _.get(errors, `counts[${index}].count`, '') !== '' &&
                                                            _.get(touched, `counts[${index}].count`, '') !== ''
                                                        }
                                                        margin="normal"
                                                        variant="outlined"
                                                        fullWidth
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </DialogContent>

                                    <DialogActions>
                                        <Button onClick={() => this.setState({modal: false})}>
                                            Cancel
                                        </Button>
                                        <Button onClick={() => this.setState({modal: false})}
                                                color="primary" variant="contained" autoFocus
                                                type="submit" disabled={isSubmitting}>
                                            Add
                                        </Button>
                                    </DialogActions>
                                </form>
                            </div>
                        )}
                    </Formik>
                </Dialog>
            </div>
        )
    }
}

const mapStateToProps = state => ({});

const style = theme => ({
    paper: {
        width: 400,
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
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {}
)(WizardFormThirdPage));