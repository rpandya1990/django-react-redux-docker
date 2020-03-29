import React, {Component} from "react";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import {Formik} from "formik";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import * as Yup from "yup";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import InputLabel from "@material-ui/core/InputLabel";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {Divider} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import FormControlLabel from "@material-ui/core/FormControlLabel";

class WizardFormFirstPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false
        };

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.renderModifyDialog = this.renderModifyDialog.bind(this);

        this.initialFormValues = {
            filesets: [],
            vm: '',
            hypervisor_manager: '',
            count: 1,
            start_from: 0,
            power_on: false
        };

        this.validationSchema = Yup.object().shape({
            vm: Yup.string()
                .required('Required'),
            hypervisor_manager: Yup.string()
                .required('Required'),
            filesets: Yup.array(),
            count: Yup.number()
                .required('Required')
                .min(1, 'count should be atleast 1'),
            start_from: Yup.number()
                .required('Required')
                .min(0, 'min value of start_from allowed is 0'),
            power_on: Yup.boolean()
        })
    }

    handleFormSubmit = (values, {setSubmitting, resetForm}) => {
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

    render() {
        const {classes, addedVM, availableVM, availableHypervisorManager, availableFileset, deleteVM} = this.props;

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>Added VMs</h4>
                {this.renderAddedVM(classes, addedVM, deleteVM)}

                <Button variant="contained" color="primary" onClick={() => this.setState({modal: true})}>
                    Add VM to config
                </Button>

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

                                            <Grid item xs={6}>
                                                <TextField
                                                    name="count"
                                                    label="Count"
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
                                                        <MenuItem key={item.name} value={item.name}>
                                                            <Checkbox
                                                                checked={values.filesets.indexOf(item.name) > -1}/>
                                                            <ListItemText primary={item.name}/>
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
)(WizardFormFirstPage));