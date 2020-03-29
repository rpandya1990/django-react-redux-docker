import React, {Component} from "react";
import {connect} from "react-redux";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import {Formik} from "formik";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DialogActions from "@material-ui/core/DialogActions";
import * as Yup from "yup";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import List from "@material-ui/core/List";
import {Divider} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import _ from "lodash";

class WizardFormSecondPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false
        };

        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        this.initialFormValues = {
            filesets: [],
            vm: '',
            count: 1,
            start_from: 0,
            name_prefix: '',
            power_on: false,
            deploy_counts: []
        };

        const {hypervisors} = this.props;

        hypervisors.forEach(hypervisor => {
            let obj = {
                count: 0,
                name: hypervisor.name,
                datastores: hypervisor.datastores.map(datastore => {
                    return {
                        count: 0,
                        name: datastore.name,
                    }
                })
            };

            this.initialFormValues.deploy_counts.push(obj);
        });

        this.validationSchema = Yup.object().shape({
            vm: Yup.string()
                .required('Required'),
            filesets: Yup.array(),
            count: Yup.number()
                .required('Required')
                .min(1, 'count should be atleast 1'),
            name_prefix: Yup.string()
                .required("Required"),
            start_from: Yup.number()
                .required('Required')
                .min(0, 'min value of start_from allowed is 0'),
            power_on: Yup.boolean(),
            deploy_counts: Yup.array()
                .of(
                    Yup.object().shape({
                        count: Yup.number()
                            .min(0, 'cannot be negative'),
                        name: Yup.string(),
                        datastores: Yup.array()
                            .of(
                                Yup.object().shape({
                                    count: Yup.number()
                                        .min(0, 'cannot be negative'),
                                    name: Yup.string()
                                })
                            )
                    })
                )
        })
    }

    handleFormSubmit = (values, {setSubmitting, resetForm}) => {
        console.log(values);

        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({modal: false});
        this.props.handleAddVmToConfig(values);
    };

    renderAddedVM(classes, vm, deleteVM) {
        return (
            <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight: '200px'}}>
                {vm.length === 0 ?
                    <p> No VMs Added </p>
                    :
                    <Paper className={classes.root}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Hypervisor Manager</TableCell>
                                    <TableCell align="center">Count</TableCell>
                                    <TableCell align="center">Start From</TableCell>
                                    <TableCell align="center">Power on</TableCell>
                                    <TableCell align="center">Filesets</TableCell>
                                    <TableCell align="center">Modify</TableCell>
                                    <TableCell align="center">Deploy Counts</TableCell>
                                    <TableCell align="center">Other details</TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vm.map(row => (
                                    <TableRow key={row.name}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="center">{row.hypervisors_manager_reference}</TableCell>
                                        <TableCell align="center">{row.count}</TableCell>
                                        <TableCell align="center">{row.start_from}</TableCell>
                                        <TableCell align="center">{row.power_on.toString()}</TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="click to view filesets" placement="top">
                                                <Button className={classes.button} onClick={() => this.setState({
                                                    [`fileset_details_${row.id}`]: true
                                                })} align="center">
                                                    {row.fileset_reference.length}
                                                </Button>
                                            </Tooltip>
                                        </TableCell>

                                        {row.modify ?
                                            <TableCell align="center">
                                                <Tooltip title="click to view modification details" placement="top"
                                                         style={{padding: 0}}>
                                                    <Button color="primary" className={classes.button}
                                                            onClick={() => this.setState({
                                                                [`modify_details_${row.id}`]: true
                                                            })} align="center">
                                                        view
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                            :
                                            <TableCell align="center">
                                                False
                                            </TableCell>
                                        }

                                        <TableCell align="center">
                                            <Button color="primary" className={classes.button}
                                                    onClick={() => this.setState({
                                                        [`deploy_count_details_${row.id}`]: true
                                                    })}>
                                                view
                                            </Button>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Button color="primary" className={classes.button}
                                                    onClick={() => this.setState({
                                                        [`vm_details_${row.id}`]: true
                                                    })}>
                                                view
                                            </Button>
                                        </TableCell>

                                        <TableCell align="right" padding="checkbox">
                                            <Tooltip title="remove this vm" placement="top">
                                                <IconButton aria-label="Delete"
                                                            onClick={() => deleteVM(row.id)}>
                                                    <RemoveCircleIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        {this.renderFilesetViewDialog(row, classes)}
                                        {this.renderVmOtherDetailsDialog(row, classes)}
                                        {this.renderModifyDialog(classes, row)}
                                        {this.renderDeployCountDetails(classes, row)}

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                }
            </Grid>
        )
    }

    renderFilesetViewDialog(row, classes) {
        return (
            <Dialog
                open={!!this.state[`fileset_details_${row.id}`]}
                onClose={() => this.setState({
                    [`fileset_details_${row.id}`]: false
                })}
                maxWidth="md"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{minWidth: '500px'}}>
                    <DialogTitle> Fileset References </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {row.fileset_reference.map((fileset, index) => (
                            <div key={index}>
                                <ListItem>
                                    <ListItemText primary={fileset}/>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`fileset_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderVmOtherDetailsDialog(row, classes) {
        const vm_details_fields = [
            ['Template', 'template'],
            ['OS', 'os'],
            ['Name Prefix', 'name_prefix'],
            ['Username', 'username'],
            ['Machine Type', 'machine_type'],
            ['Snappable', 'snappable']
        ];

        return (
            <Dialog
                open={!!this.state[`vm_details_${row.id}`]}
                onClose={() => this.setState({
                    [`vm_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{minWidth: '500px'}}>
                    <DialogTitle> VM Details </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {vm_details_fields.map((field) => (
                            <div key={field[0]}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={6}>
                                            <ListItemText primary={field[0]}/>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <ListItemText primary={row[field[1]]}/>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`vm_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderModifyDialog(classes, row) {
        const fields = [
            ['Cpu Count', 'cpu_count'],
            ['Socket Count', 'socket_count'],
            ['Memory (in MB)', 'memory']
        ];

        return (
            <Dialog
                open={!!this.state[`modify_details_${row.id}`]}
                onClose={() => this.setState({
                    [`modify_details_${row.id}`]: false
                })}
                maxWidth="md"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{margin: '0 5px', minWidth: '600px'}}>
                    <DialogTitle> Modification Details </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {fields.map((field) => (
                            <div key={field[0]}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"} spacing={2}>
                                        <Grid item xs={6}>
                                            <ListItemText primary={field[0]}/>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <ListItemText primary={row[field[1]]}/>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <InputLabel htmlFor="ds_form" style={{marginTop: '10px'}}> Disks </InputLabel>

                    <Paper className={classes.root} style={{marginBottom: '10px'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>id</TableCell>
                                    <TableCell align="center">Size</TableCell>
                                    <TableCell align="center">Thin Provision</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {row.disks.map((disk, index) => (
                                    <TableRow key={row.name + index}>
                                        <TableCell component="th" scope="row">{disk.id}</TableCell>
                                        <TableCell align="center">{disk.size}</TableCell>
                                        <TableCell align="center">{disk.thin_provision.toString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`modify_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeployCountDetails(classes, row) {
        // filter empty count hypervisors
        let filteredCounts = row.deploy_counts.filter(hypervisor => {
            return hypervisor.count > 0 ||
                hypervisor.datastores.filter(datastore => datastore.count > 0).length > 0
        });

        // remove empty count datastores
        filteredCounts = filteredCounts.map(hypervisor => {
            return {
                ...hypervisor,
                datastores: hypervisor.datastores.filter(datastore => datastore.count > 0)
            }
        });

        return (
            <Dialog
                open={!!this.state[`deploy_count_details_${row.id}`]}
                onClose={() => this.setState({
                    [`deploy_count_details_${row.id}`]: false
                })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{minWidth: '500px'}}>
                    <DialogTitle> Deploy Counts </DialogTitle>

                    <div>
                        {filteredCounts.map(hypervisor => (
                            <Grid item xs={12} key={hypervisor.id} style={{marginBottom: '10px'}}>
                                <ExpansionPanel>

                                    <ExpansionPanelSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <Typography className={classes.heading}>
                                            {hypervisor.name}
                                        </Typography>
                                    </ExpansionPanelSummary>

                                    <ExpansionPanelDetails style={{borderTop: '2px solid lightgray'}}>
                                        <Grid container alignItems="flex-start" spacing={2}>

                                            <Grid item xs={12} style={{textDecoration: 'underline'}}>Hypervisor:</Grid>

                                            <Grid item xs={6}>
                                                {hypervisor.name} : {hypervisor.count}
                                            </Grid>

                                            <Grid item xs={12} style={{textDecoration: 'underline'}}>Datastores:</Grid>

                                            <ol>
                                                {hypervisor.datastores.map((datastore, index_2) => (
                                                    <li key={index_2}>
                                                        {datastore.name} : {datastore.count}
                                                    </li>
                                                ))}
                                            </ol>
                                        </Grid>
                                    </ExpansionPanelDetails>

                                </ExpansionPanel>
                            </Grid>
                        ))}
                    </div>

                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`deploy_count_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    validateDeployCount(values) {
        let errors = {};

        let deploy_count_sums = 0;

        values.deploy_counts.forEach(hypervisor => {
            deploy_count_sums += hypervisor.count;

            hypervisor.datastores.forEach(datastore => {
                deploy_count_sums += datastore.count;
            });
        });

        if (deploy_count_sums > values.count)
            errors.count = "Sum of deploy counts cannot be greater than number of VMs";

        return errors;
    }

    renderAddVMDialog(classes, availableVM, availableFileset) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.modal}
                maxWidth="md"
                onClose={() => this.setState({modal: false})}
            >
                <Formik
                    initialValues={this.initialFormValues}
                    onSubmit={this.handleFormSubmit}
                    validate={this.validateDeployCount}
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
                            <DialogTitle> Choose VM details </DialogTitle>

                            <form onSubmit={handleSubmit}>
                                <DialogContent>
                                    <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}
                                          spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                select
                                                name="vm"
                                                label="VM"
                                                value={values.vm}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.vm && touched.vm) && errors.vm}
                                                error={errors.vm && touched.vm}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            >
                                                {availableVM.map(item => (
                                                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <TextField
                                                name="count"
                                                label="Count of VMs"
                                                type="number"
                                                value={values.count}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.count && touched.count) && errors.count}
                                                error={errors.count && touched.count}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={6}>
                                            <TextField
                                                name="start_from"
                                                label="Start from"
                                                type="number"
                                                value={values.start_from}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.start_from && touched.start_from) && errors.start_from}
                                                error={errors.start_from && touched.start_from}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={6}>
                                            <TextField
                                                name="name_prefix"
                                                label="Name prefix"
                                                value={values.name_prefix}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.name_prefix && touched.name_prefix) && errors.name_prefix}
                                                error={errors.name_prefix && touched.name_prefix}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} style={{margin: '20px 2px'}}>
                                            <InputLabel htmlFor="vm_fileset">
                                                Filesets
                                            </InputLabel>
                                            <Select
                                                multiple
                                                name="filesets"
                                                value={values.filesets}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                variant="outlined"
                                                fullWidth
                                                input={<Input id="vm_fileset"/>}
                                                renderValue={selected => (
                                                    <div>
                                                        {selected.map(value => (
                                                            <Chip key={value} label={value}/>
                                                        ))}
                                                    </div>
                                                )}
                                            >
                                                {availableFileset.map(item => (
                                                    <MenuItem key={item.template_name} value={item.template_name}>
                                                        <Checkbox
                                                            checked={values.filesets.indexOf(item.template_name) > -1}/>
                                                        <ListItemText primary={item.template_name}/>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="power_on"
                                                        checked={values.power_on}
                                                        onChange={handleChange}
                                                        value="overwrite"
                                                        color="primary"
                                                        inputProps={{
                                                            'aria-label': 'secondary checkbox',
                                                        }}
                                                    />
                                                }
                                                label="Power on"
                                                labelPlacement="start"
                                                className={classes.checkbox}
                                            />
                                        </Grid>

                                        {this.renderDeployCountFields({
                                            values,
                                            touched,
                                            errors,
                                            handleChange,
                                            handleBlur,
                                        })}
                                    </Grid>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => this.setState({modal: false})}>
                                        Cancel
                                    </Button>

                                    <Button color="primary" variant="contained"
                                            type="submit" disabled={isSubmitting}>
                                        Add
                                    </Button>
                                </DialogActions>
                            </form>
                        </div>
                    )}
                </Formik>
            </Dialog>
        )
    }

    renderDeployCountFields(
        {
            values,
            touched,
            errors,
            handleChange,
            handleBlur,
        }) {

        const {classes, hypervisors} = this.props;

        return (
            <Grid item container xs={12} justify="flex-start">

                <InputLabel htmlFor="vm_fileset">
                    Deploy Counts
                </InputLabel>

                {hypervisors.map((hypervisor, index) =>
                    (
                        <Grid item xs={12} key={hypervisor.id} style={{marginBottom: '10px'}}>
                            <ExpansionPanel>

                                <ExpansionPanelSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography className={classes.heading}>
                                        {hypervisor.name}
                                    </Typography>
                                </ExpansionPanelSummary>

                                <ExpansionPanelDetails style={{borderTop: '2px solid lightgray'}}>
                                    <Grid container alignItems="flex-start" spacing={2}>

                                        <Grid item xs={12}>Hypervisor:</Grid>

                                        <Grid item xs={6}>
                                            <TextField
                                                name={`deploy_counts[${index}].count`}
                                                label={hypervisor.name}
                                                type="number"
                                                value={values.deploy_counts[index].count}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(
                                                    _.get(errors, `deploy_counts[${index}].count`, '') !== '' &&
                                                    _.get(touched, `deploy_counts[${index}].count`, '') !== ''
                                                ) && errors.deploy_counts[index].count
                                                }
                                                error={
                                                    _.get(errors, `deploy_counts[${index}].count`, '') !== '' &&
                                                    _.get(touched, `deploy_counts[${index}].count`) !== ''
                                                }
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12}>Datastores:</Grid>

                                        {hypervisor.datastores.map((datastore, index_2) => (
                                            <Grid item xs={4} key={index_2}>
                                                <TextField
                                                    name={`deploy_counts[${index}].datastores[${index_2}].count`}
                                                    label={datastore.name}
                                                    type="number"
                                                    value={values.deploy_counts[index].datastores[index_2].count}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={(
                                                        _.get(errors, `deploy_counts[${index}].datastores[${index_2}].count`, '') !== '' &&
                                                        _.get(touched, `deploy_counts[${index}].datastores[${index_2}].count`, '') !== ''
                                                    ) && errors.deploy_counts[index].datastores[index_2].count
                                                    }
                                                    error={
                                                        _.get(errors, `deploy_counts[${index}].datastores[${index_2}].count`, '') !== '' &&
                                                        _.get(touched, `deploy_counts[${index}].datastores[${index_2}].count`, '') !== ''
                                                    }
                                                    margin="normal"
                                                    variant="outlined"
                                                    fullWidth
                                                    required
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </ExpansionPanelDetails>

                            </ExpansionPanel>
                        </Grid>
                    ))}
            </Grid>
        )
    }

    render() {
        const {classes, availableVM, availableFileset, addedVM, deleteVM} = this.props;

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Added VMs</h4>
                {this.renderAddedVM(classes, addedVM, deleteVM)}

                <Button variant="contained" color="primary" onClick={() => this.setState({modal: true})}>
                    Add VM to config
                </Button>

                {this.renderAddVMDialog(classes, availableVM, availableFileset)}
            </div>
        )
    }
}

const mapStateToProps = state => ({});

const style = theme => ({
    paper: {
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
    checkbox: {
        position: 'relative',
        left: '-15px',
        top: '5px'
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
)(WizardFormSecondPage));