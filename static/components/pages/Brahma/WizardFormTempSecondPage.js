import React, {Component} from "react";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import {Formik} from "formik";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import * as Yup from "yup";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import _ from "lodash";
import {InputLabel} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

class WizardFormSecondPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false
        };

        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        this.initialFormValues = {
            hypervisor: '',
            hypervisor_manager: '',
            counts: []
        };

        const {availableHypervisor, addedVM} = this.props;

        let vm_counts = addedVM.map(vm => {
            return {
                name: vm.name,
                count: 0
            }
        });

        availableHypervisor.forEach(hypervisor => {
            let obj = {
                name: hypervisor.name,
                count: vm_counts,
                counts: hypervisor.datastores.map(datastore => {
                    return {
                        name: datastore.name,
                        count: vm_counts
                    }
                })
            };

            this.initialFormValues.counts.push(obj);
        });

        this.validationSchema = Yup.object().shape({
            hypervisor: Yup.string()
                .required('Required'),
            hypervisor_manager: Yup.string()
                .required('Required'),
            counts: Yup.array()
                .of(
                    Yup.object().shape({
                        name: Yup.string(),
                        count: Yup.array()
                            .of(
                                Yup.object().shape({
                                    name: Yup.string(),
                                    count: Yup.number()
                                        .required('Required')
                                        .min(0, 'cannot be -ve')
                                })
                            ),
                        counts: Yup.array()
                            .of(
                                Yup.object().shape({
                                    name: Yup.string(),
                                    count: Yup.array()
                                        .of(
                                            Yup.object().shape({
                                                name: Yup.string(),
                                                count: Yup.number()
                                                    .required('Required')
                                                    .min(0, 'cannot be -ve')
                                            })
                                        )
                                })
                            )
                    })
                )
        })
    }

    handleFormSubmit = (values, {setSubmitting, resetForm}) => {
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({modal: false});
        this.props.handleAddHypervisorToConfig(values);
    };

    renderAddedHypervisor(classes, hypervisor, deleteHypervisor) {
        return (
            <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight:'200px'}}>
                {hypervisor.length === 0 ?
                    <p> No Hypervisors Added </p>
                    :
                    <Paper className={classes.root}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Hypervisor Manager</TableCell>
                                    <TableCell align="right">Type</TableCell>
                                    <TableCell align="right">Additional Load</TableCell>
                                    <TableCell align="right">Concurrency</TableCell>
                                    <TableCell align="right">Datastores</TableCell>
                                    <TableCell align="right">Deploy Counts</TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {hypervisor.map(row => (
                                    <TableRow key={row.name}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">{row.hypervisors_manager_reference}</TableCell>
                                        <TableCell align="right">{row.type}</TableCell>
                                        <TableCell align="right">{row.additional_load.toString()}</TableCell>
                                        <TableCell align="right">{row.concurrency}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="click to view datastores" placement="top">
                                                <Button className={classes.button} onClick={() => this.setState({
                                                    [`datastore_details_${row.id}`]: true
                                                })} align="right">
                                                    {row.datastores.length}
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button color="primary" className={classes.button}
                                                    onClick={() => this.setState({
                                                        [`hypervisor_details_${row.id}`]: true
                                                    })}>
                                                view
                                            </Button>
                                        </TableCell>
                                        <TableCell align="right" padding="checkbox">
                                            <Tooltip title="remove this hypervisor" placement="top">
                                                <IconButton aria-label="Delete"
                                                            onClick={() => deleteHypervisor(row.id)}>
                                                    <RemoveCircleIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        {this.renderDatastoreViewDialog(row, classes)}
                                        {this.renderDeployCountDialog(row, classes)}

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                }
            </Grid>
        )
    }

    renderDatastoreViewDialog(row, classes) {
        return (
            <Dialog
                open={!!this.state[`datastore_details_${row.id}`]}
                onClose={() => this.setState({
                    [`datastore_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper}>
                    <DialogTitle> Datastores </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        <ListItem>
                            <Grid container alignItems={"flex-start"}>
                                <Grid item xs={6}>
                                    <ListItemText primary={"Name"}/>
                                </Grid>
                                <Grid item xs={6}>
                                    <ListItemText primary={"Type"}/>
                                </Grid>
                            </Grid>
                        </ListItem>
                        <Divider/>
                        {row.datastores.map((datastore, index) => (
                            <div key={index}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={6}>
                                            <ListItemText primary={datastore.name}/>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <ListItemText primary={datastore.type}/>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

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

    renderDeployCountDialog(row, classes) {
        return (
            <Dialog
                open={!!this.state[`hypervisor_details_${row.id}`]}
                onClose={() => this.setState({
                    [`hypervisor_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper}>
                    <DialogTitle> Deploy Counts </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        <ListItem>
                            <Grid container alignItems={"flex-start"}>
                                <Grid item xs={12}><ListItemText
                                    primary={"Hypervisor"}/></Grid>
                            </Grid>
                        </ListItem>
                        <Divider/>

                        <div className={classes.borderBoxDialog}>
                            <ListItem>
                                <Grid container alignItems={"flex-start"}>
                                    <Grid item xs={12}><ListItemText
                                        primary={row.deploy_counts.name}/></Grid>
                                </Grid>
                            </ListItem>
                            <Divider/>

                            {row.deploy_counts.count.map(vm => (
                                <ListItem key={vm.name}>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={6}><ListItemText primary={vm.name}/></Grid>
                                        <Grid item xs={6}><ListItemText
                                            primary={vm.count}/></Grid>
                                    </Grid>
                                </ListItem>
                            ))}
                        </div>

                        <Divider/>
                        <ListItem>
                            <Grid container alignItems={"flex-start"}>
                                <Grid item xs={12}><ListItemText
                                    primary={"Datastore"}/></Grid>
                            </Grid>
                        </ListItem>
                        <Divider/>

                        {row.deploy_counts.counts.map((datastore) => (
                            <div key={datastore.name} className={classes.borderBoxDialog}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={12}><ListItemText
                                            primary={datastore.name}/></Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>

                                {datastore.count.map(vm => (
                                    <ListItem key={vm.name}>
                                        <Grid container alignItems={"flex-start"}>
                                            <Grid item xs={6}><ListItemText primary={vm.name}/></Grid>
                                            <Grid item xs={6}><ListItemText
                                                primary={vm.count}/></Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </div>
                        ))}
                    </List>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`hypervisor_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDatastoreFields(
        availableHypervisor,
        addedVM,
        values,
        handleChange,
        handleBlur,
        errors,
        touched,
        classes
    ) {

        let index = availableHypervisor.findIndex(item => item.id === values.hypervisor);
        let Hypervisor = availableHypervisor[index];

        return (
            <div>
                <Divider style={{margin: '10px 0'}}/>
                <Typography variant="h6" gutterBottom> Deploy counts </Typography>
                <InputLabel htmlFor="ds_form" style={{marginTop: '10px'}}> Hypervisor </InputLabel>

                <Grid container alignItems={"flex-start"} className={classes.borderBox}>

                    <InputLabel htmlFor="ds_form" style={{marginTop: '10px'}}> {Hypervisor.name} </InputLabel>

                    {addedVM.map((vm, vm_index) => (
                        <Grid item xs={12} key={vm_index}>

                            <TextField
                                type="number"
                                name={`counts[${index}].count[${vm_index}].count`}
                                label={vm.name}
                                value={values.counts[index].count[vm_index].count}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                helperText={
                                    (
                                        _.get(errors, `counts[${index}].count[${vm_index}].count`, '') !== '' &&
                                        _.get(touched, `counts[${index}].count[${vm_index}].count`, '') !== ''
                                    ) &&
                                    errors.counts[index].count[vm_index].count
                                }
                                error={
                                    _.get(errors, `counts[${index}].count[${vm_index}].count`, '') !== '' &&
                                    _.get(touched, `counts[${index}].count[${vm_index}].count`, '') !== ''
                                }
                                margin="normal"
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                    ))}

                </Grid>

                <InputLabel htmlFor="ds_form" style={{marginTop: '10px'}}> Datastores </InputLabel>

                <Grid container alignItems="flex-start" id="ds_form">
                    {Hypervisor.datastores.map((datastore, index_2) => (
                        <Grid item xs={12} key={index_2} container alignItems={"flex-start"}
                              className={classes.borderBox}>

                            <InputLabel htmlFor="ds_form" style={{marginTop: '10px'}}> {datastore.name} </InputLabel>

                            {addedVM.map((vm, vm_index) => (
                                <Grid item xs={12} key={vm_index}>
                                    <TextField
                                        type="number"
                                        name={`counts[${index}].counts[${index_2}].count[${vm_index}].count`}
                                        label={vm.name}
                                        value={values.counts[index].counts[index_2].count[vm_index].count}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        helperText={
                                            (
                                                _.get(errors, `counts[${index}].counts[${index_2}].count[${vm_index}].count`, '') !== '' &&
                                                _.get(touched, `counts[${index}].counts[${index_2}].count[${vm_index}].count`, '') !== ''
                                            ) &&
                                            errors.counts[index].counts[index_2].count[vm_index].count
                                        }
                                        error={
                                            _.get(errors, `counts[${index}].counts[${index_2}].count[${vm_index}].count`, '') !== '' &&
                                            _.get(touched, `counts[${index}].counts[${index_2}].count[${vm_index}].count`, '') !== ''
                                        }
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                    />
                                </Grid>
                            ))}

                        </Grid>
                    ))
                    }
                </Grid>
                <Divider style={{marginBottom: '10px'}}/>
            </div>
        )
    }

    render() {
        const {classes, addedVM, addedHypervisor, availableHypervisor, availableHypervisorManager, deleteHypervisor} = this.props;

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Added Hypervisors</h4>
                {this.renderAddedHypervisor(classes, addedHypervisor, deleteHypervisor)}

                <Button variant="contained" color="primary" onClick={() => this.setState({modal: true})}>
                    Add Hypervisor to config
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
                                <DialogTitle> Choose Hypervisor details </DialogTitle>

                                <form onSubmit={handleSubmit}>
                                    <DialogContent>

                                        <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    select
                                                    name="hypervisor"
                                                    label="Hypervisor"
                                                    value={values.hypervisor}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(errors.hypervisor && touched.hypervisor) && errors.hypervisor}
                                                    error={errors.hypervisor && touched.hypervisor}
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                    required
                                                >
                                                    {availableHypervisor.map(item => (
                                                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>

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
                                                    {availableHypervisorManager.map(item => (
                                                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                                    ))}

                                                </TextField>
                                            </Grid>

                                            {values.hypervisor && this.renderDatastoreFields(
                                                availableHypervisor, addedVM, values,
                                                handleChange, handleBlur,
                                                errors, touched, classes
                                            )}
                                        </Grid>
                                    </DialogContent>

                                    <DialogActions>
                                        <Button onClick={() => this.setState({modal: false})}>
                                            Cancel
                                        </Button>
                                        <Button color="primary" variant="contained" autoFocus
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
        minWidth: 500,
        padding: theme.spacing(1),
        outline: 'none'
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
    borderBox: {
        padding: '5px 15px 5px 15px',
        border: '2px solid lightgray',
        borderRadius: '5px',
        marginBottom: '15px',
        marginTop: '5px'
    },
    borderBoxDialog: {
        padding: '5px',
        border: '2px solid lightgray',
        borderRadius: '5px',
        margin: '15px 10px',
        marginTop: '5px'
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {}
)(WizardFormSecondPage));