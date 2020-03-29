import React, {Component} from "react";
import {connect} from "react-redux";
import {
    add_command_to_vm,
    add_disk,
    add_vm,
    delete_disk,
    delete_vm,
    remove_command_from_vm,
    toggle_vm_status
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
import CancelIcon from '@material-ui/icons/Cancel';
import withStyles from "@material-ui/core/styles/withStyles";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import * as Yup from "yup";
import TablePagination from "@material-ui/core/TablePagination";
import List from "@material-ui/core/List";
import {Divider, InputLabel} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

class VMCard extends Component {
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
            name: '', template: '', os: '',
            name_prefix: '', machine_type: '', snappable: '',
            username: '', password: '', confirm_password: '',
            modify: false, cpu_count: 1, socket_count: 1, memory: 1024
        };

        this.form = [
            {heading: 'Name', name: 'name', type: 'text'},
            {heading: 'Template', name: 'template', type: 'text'},
            {heading: 'OS', name: 'os', type: 'text'},
            {heading: 'Name Prefix', name: 'name_prefix', type: 'text'},
            {heading: 'Machine Type', name: 'machine_type', type: 'text'},
            {heading: 'Snappable', name: 'snappable', type: 'text'},
            {heading: 'Username', name: 'username', type: 'text'},
            {heading: 'Password', name: 'password', type: 'password'},
            {heading: 'Confirm Password', name: 'confirm_password', type: 'password'}
        ];

        this.validationSchema = Yup.object().shape({
            name: Yup.string()
                .required('Required'),
            template: Yup.string()
                .required('Required'),
            os: Yup.string()
                .required('Required'),
            name_prefix: Yup.string()
                .required('Required'),
            machine_type: Yup.string()
                .required('Required'),
            snappable: Yup.string()
                .required('Required'),
            username: Yup.string()
                .required('Required'),
            password: Yup.string()
                .required('Required'),
            confirm_password: Yup.string()
                .required('Required'),
            modify: Yup.boolean(),
            cpu_count: Yup.number()
                .min(1, 'min count allowed is 1')
                .max(8, 'max count allowed is 8'),
            socket_count: Yup.number()
                .min(1, 'min count allowed is 1')
                .max(8, 'max count allowed is 8'),
            memory: Yup.number()
                .min(128, 'min memory allowed is 128 MB')
                .max(16384, 'max memory allowed is 16384 MB'),
        });

        this.initialDiskFormValues = {
            size: 1, thin_provision: false
        };

        this.diskValidationSchema = Yup.object().shape({
            size: Yup.number()
                .min(1, 'min size allowed is 1')
                .max(100, 'max size allowed is 100'),
            thin_provision: Yup.boolean()
        })
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

    renderAddedVM(classes, vm) {
        const vm_details_fields = [
            ['Template', 'template'],
            ['OS', 'os'],
            ['Name Prefix', 'name_prefix'],
            ['Machine Type', 'machine_type'],
            ['Snappable', 'snappable'],
            ['Username', 'username'],
        ];

        const {page, rowsPerPage} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, vm.length - page * rowsPerPage);

        return (
            <div style={{padding: '20px 5px'}}>
                <h4>VMs</h4>

                <Grid container alignItems={"flex-start"} spacing={1} style={{minHeight: '200px'}}>
                    <Paper className={classes.root}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>

                                    {vm_details_fields.map(field => (
                                        <TableCell align="center" key={field[0]}>{field[0]}</TableCell>
                                    ))}

                                    <TableCell align="center">Password</TableCell>
                                    <TableCell align="center">Commands</TableCell>
                                    <TableCell align="center">Modification Details</TableCell>
                                    <TableCell align="center">Global status</TableCell>

                                    <TableCell align="center" padding={"checkbox"}>
                                        <Tooltip title="Add VM" placement="top">
                                            <IconButton aria-label="Add"
                                                        onClick={() => this.setState({form_modal: true})}>
                                                <AddCircleIcon className={classes.addIcon}/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vm
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(row => (
                                        <TableRow key={row.name}>
                                            <TableCell component="th" scope="row">
                                                {row.name}
                                            </TableCell>

                                            {vm_details_fields.map(field => (
                                                <TableCell align="center" key={field[0]}>{row[field[1]]}</TableCell>
                                            ))}

                                            <TableCell align="center">
                                                {this.renderRevealPasswordField(classes, row)}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Tooltip title="click to view commands" placement="top"
                                                         style={{padding: 0}}>
                                                    <Button className={classes.button} onClick={() => this.setState({
                                                        [`command_details_${row.id}`]: true
                                                    })} align="center">
                                                        {row.commands.length}
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
                                                {row.is_global ?
                                                    <Tooltip title="click to make private" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_vm_status(row.id)}
                                                                align="center">
                                                            Public
                                                        </Button>
                                                    </Tooltip>
                                                    :
                                                    <Tooltip title="click to make public" placement="top"
                                                             style={{padding: '0'}}>
                                                        <Button className={classes.button}
                                                                onClick={() => this.props.toggle_vm_status(row.id)}
                                                                align="center">
                                                            Private
                                                        </Button>
                                                    </Tooltip>
                                                }
                                            </TableCell>

                                            <TableCell align="center" padding="checkbox">
                                                <Tooltip title="remove this vm" placement="top">
                                                    <IconButton aria-label="Delete" onClick={() => this.setState({
                                                        [`delete_vm_modal_${row.id}`]: true
                                                    })}>
                                                        <RemoveCircleIcon className={classes.deleteIcon}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            {this.renderDeleteVMDialog(classes, row)}
                                            {this.renderCommandsViewDialog(classes, row)}
                                            {this.renderModifyDialog(classes, row)}
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
                            count={vm.length}
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

                {this.renderAddVmDialog(classes)}
            </div>
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
                                    <TableCell align="center">Size (in GB)</TableCell>
                                    <TableCell align="center">Thin Provision</TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {row.disks.map((disk, index) => (
                                    <TableRow key={row.name + index}>
                                        <TableCell component="th" scope="row">{disk.id}</TableCell>
                                        <TableCell align="center">{disk.size}</TableCell>
                                        <TableCell align="center">{disk.thin_provision.toString()}</TableCell>

                                        <TableCell align="right" size="small">
                                            <Tooltip title="remove this disk" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => this.setState({
                                                    [`delete_disk_modal_${disk.id}`]: true
                                                })}>
                                                    <CancelIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        {this.renderDeleteDiskDialog(classes, disk.id)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>

                    <InputLabel htmlFor="ds_form" style={{marginTop: '20px'}}> Add Disk </InputLabel>

                    <Formik
                        initialValues={this.initialDiskFormValues}
                        validationSchema={this.diskValidationSchema}
                        onSubmit={(values, {setSubmitting, resetForm}) => {
                            values.for_vm = row.id;
                            this.props.add_disk(values);
                            setSubmitting(false);
                            resetForm(this.initialDiskFormValues);
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
                                <Grid container alignItems="flex-start" style={{marginBottom: '10px'}} spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            type="number"
                                            name="size"
                                            label="Size (in GB)"
                                            value={values.size}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            helperText={(errors.size && touched.size) && errors.size}
                                            error={errors.size && touched.size}
                                            margin="normal"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name="thin_provision"
                                                    checked={values.thin_provision}
                                                    onChange={handleChange}
                                                    value="thin_provision"
                                                    color="primary"
                                                    inputProps={{
                                                        'aria-label': 'secondary checkbox',
                                                    }}
                                                />
                                            }
                                            label="Thin Provision"
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
                            [`modify_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeleteDiskDialog(classes, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_disk_modal_${id}`]}
                onClose={() => this.setState({[`delete_disk_modal_${id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete Disk from VM ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_disk_modal_${id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteDisk(id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderCommandsViewDialog(classes, row) {
        return (
            <Dialog
                open={!!this.state[`command_details_${row.id}`]}
                onClose={() => this.setState({
                    [`command_details_${row.id}`]: false
                })}
                maxWidth="md"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className={classes.paper} style={{minWidth: '500px'}}>
                    <DialogTitle> Commands </DialogTitle>

                    <List component="nav" aria-label="Secondary mailbox folders">
                        <Divider/>
                        {row.commands.map((command, index) => (
                            <div key={index}>
                                <ListItem>
                                    <Grid container alignItems={"flex-start"}>
                                        <Grid item xs={11}>
                                            <ListItemText primary={command}/>
                                        </Grid>

                                        <Grid item xs={1}>
                                            <Tooltip title="remove this command" placement="top">
                                                <IconButton aria-label="Delete" onClick={() => this.setState({
                                                    [`delete_command_modal_${row.id}_${index}`]: true
                                                })}>
                                                    <CancelIcon className={classes.deleteIcon}/>
                                                </IconButton>
                                            </Tooltip>

                                            {this.renderDeleteCommandDialog(classes, index, row.id)}
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider/>
                            </div>
                        ))}
                    </List>

                    <Formik
                        initialValues={{command: ''}}
                        validationSchema={Yup.object().shape({
                            command: Yup.string()
                                .required('Required')
                        })}
                        onSubmit={({command}, {setSubmitting, resetForm}) => {
                            this.props.add_command_to_vm(command, row.id);
                            setSubmitting(false);
                            resetForm({command: ''});
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
                            <form onSubmit={handleSubmit} className={classes.pathForm}>
                                <Grid container alignItems="flex-start" style={{marginBottom: '10px'}}>
                                    <Grid item xs={12}>
                                        <TextField
                                            name="command"
                                            label="Command"
                                            value={values.command}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            helperText={(errors.command && touched.command) && errors.command}
                                            error={errors.command && touched.command}
                                            margin="normal"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>

                                <Button color="primary" variant="contained"
                                        type="submit" disabled={isSubmitting}>
                                    Add command
                                </Button>
                            </form>
                        )}
                    </Formik>


                    <DialogActions>
                        <Button onClick={() => this.setState({
                            [`command_details_${row.id}`]: false
                        })}>
                            close
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderDeleteCommandDialog(classes, index, id) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_command_modal_${id}_${index}`]}
                onClose={() => this.setState({[`delete_command_modal_${id}_${index}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete command from this vm?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_command_modal_${id}_${index}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteCommand(index, id)}>
                            Delete
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    renderAddVmDialog(classes) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.form_modal}
                onClose={() => this.setState({form_modal: false})}
                maxWidth="md"
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
                            <DialogTitle> Add VM </DialogTitle>

                            <form onSubmit={handleSubmit}>
                                <DialogContent>
                                    <Grid container alignItems="flex-start" style={{marginBottom: '10px'}} spacing={2}>
                                        {this.form.map(field => (
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

                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="modify"
                                                        checked={values.modify}
                                                        onChange={handleChange}
                                                        value="modify"
                                                        color="primary"
                                                        inputProps={{
                                                            'aria-label': 'secondary checkbox',
                                                        }}
                                                    />
                                                }
                                                label="Modify"
                                                labelPlacement="start"
                                                className={classes.checkbox}
                                            />
                                        </Grid>

                                        {values.modify &&
                                        <Grid item xs={4}>
                                            <TextField
                                                type="number"
                                                name="cpu_count"
                                                label="Cpu Count"
                                                value={values.cpu_count}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.cpu_count && touched.cpu_count) && errors.cpu_count}
                                                error={errors.cpu_count && touched.cpu_count}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>}

                                        {values.modify &&
                                        <Grid item xs={4}>
                                            <TextField
                                                type="number"
                                                name="socket_count"
                                                label="Socket Count"
                                                value={values.socket_count}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.socket_count && touched.socket_count) && errors.socket_count}
                                                error={errors.socket_count && touched.socket_count}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>}

                                        {values.modify &&
                                        <Grid item xs={4}>
                                            <TextField
                                                type="number"
                                                name="memory"
                                                label="Memory (in MB)"
                                                value={values.memory}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                helperText={(errors.memory && touched.memory) && errors.memory}
                                                error={errors.memory && touched.memory}
                                                margin="normal"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>}
                                    </Grid>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => this.setState({form_modal: false})}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" variant="contained"
                                            type="submit" disabled={isSubmitting}>
                                        Add VM
                                    </Button>
                                </DialogActions>
                            </form>
                        </div>
                    )}
                </Formik>
            </Dialog>
        )
    }

    renderDeleteVMDialog(classes, vm) {
        return (
            <Dialog
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={!!this.state[`delete_vm_modal_${vm.id}`]}
                onClose={() => this.setState({[`delete_vm_modal_${vm.id}`]: false})}
                style={{padding: '20px'}}
            >
                <div className={classes.paper}>
                    <DialogTitle> Delete VM named '{vm.name}' ?</DialogTitle>
                    <DialogContent> Once deleted, it cannot be recovered. </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({[`delete_vm_modal_${vm.id}`]: false})}>
                            Cancel
                        </Button>
                        <Button className={classes.deleteButton} variant="contained"
                                type="submit" onClick={() => this.deleteVM(vm.id)}>
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
        values.commands = [];
        this.props.add_vm(values);
        setSubmitting(false);
        resetForm(this.initialFormValues);
        this.setState({form_modal: false})
    }

    deleteVM(id) {
        this.props.delete_vm(id);
        this.setState({
            [`delete_vm_modal_${id}`]: false
        })
    }

    deleteCommand(index, id) {
        this.props.remove_command_from_vm(index, id);
        this.setState({
            [`delete_command_modal_${id}_${index}`]: false
        })
    }

    deleteDisk(id) {
        this.props.delete_disk(id);
        this.setState({
            [`delete_disk_modal_${id}`]: false
        })
    }

    render() {
        const {classes, vm} = this.props;

        return (
            <div>
                {this.renderAddedVM(classes, vm)}
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
    }
});

export default withStyles(style)(connect(
    mapStateToProps,
    {
        add_vm,
        add_disk,
        delete_vm,
        delete_disk,
        add_command_to_vm,
        remove_command_from_vm,
        toggle_vm_status
    }
)(VMCard));