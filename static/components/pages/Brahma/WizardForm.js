import React, {Component} from 'react';
import {connect} from "react-redux";
import WizardFormFirstPage from "./WizardFormFirstPage";
import WizardFormSecondPage from "./WizardFormSecondPage";
import WizardFormThirdPage from "./WizardFormThirdPage";
import WizardFormFourthPage from "./WizardFormFourthPage";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Divider from "@material-ui/core/Divider";
import generateConfig from './generateConfig';
import {add_config} from "../../../actions/brahma";
import Grid from "@material-ui/core/Grid";

class WizardForm extends Component {
    constructor(props) {
        super(props);

        this.prevStep = this.prevStep.bind(this);
        this.nextStep = this.nextStep.bind(this);

        this.handleGenerateConfig = this.handleGenerateConfig.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleAddVmToConfig = this.handleAddVmToConfig.bind(this);
        this.handleAddSlaToConfig = this.handleAddSlaToConfig.bind(this);
        this.handleAddHypervisorsToConfig = this.handleAddHypervisorsToConfig.bind(this);
        this.handleResetHypervisors = this.handleResetHypervisors.bind(this);
        this.handleConfigNameChange = this.handleConfigNameChange.bind(this);

        this.handleDeleteVMFromConfig = this.handleDeleteVMFromConfig.bind(this);
        this.handleDeleteSlaFromConfig = this.handleDeleteSlaFromConfig.bind(this);

        this.state = {
            vm: [],
            hypervisor: [],
            hypervisor_manager: '',
            fileset: [],
            sla: [],
            config: {
                vm: {},
                protection: {},
                fileset: {},
                resources: {
                    hypervisor: {},
                    hypervisors_manager: {}
                }
            },
            step: 1,
            config_name: ''
        };

        this.step_names = [
            'Choose Hypervisors and Datastores',
            'Choose VMs',
            'Choose SLAs',
            'Preview Config'
        ];

        this.steps = this.step_names.length;

        this.data_at_step = ['hypervisor', 'vm', 'sla', 'config'];
    }

    prevStep() {
        if (this.state.step === 4)
            this.setState({
                config: {
                    vm: {},
                    protection: {},
                    fileset: {},
                    resources: {
                        hypervisor: {},
                        hypervisors_manager: {}
                    }
                }
            });
        else
            this.setState({
                [this.data_at_step[this.state.step - 1]]: []
            });

        this.setState({step: this.state.step - 1});
    }

    nextStep() {
        this.setState({step: this.state.step + 1});
    }

    handleSubmit() {
        this.props.add_config(this.state.config_name, JSON.stringify(this.state.config));

        // reset wizard form
        this.setState({
            vm: [],
            hypervisor: [],
            hypervisor_manager: '',
            fileset: [],
            sla: [],
            config: {
                vm: {},
                protection: {},
                fileset: {},
                resources: {
                    hypervisor: {},
                    hypervisors_manager: {}
                }
            },
            step: 1,
            config_name: ''
        });
    }

    handleConfigNameChange(new_name) {
        this.setState({
            config_name: new_name
        })
    }

    handleGenerateConfig() {
        let config = generateConfig(this.state, this.props);

        this.setState({
            config: config,
            step: this.state.step + 1
        });
    }

    handleAddHypervisorsToConfig(values) {
        let hypervisor_manager = this.props.hypervisor_manager.find(item => item.id === values.hypervisor_manager);

        let hypervisors = [];

        values.hypervisor.forEach(item => {
            let hypervisor = this.props.hypervisor.find(hyp => hyp.id === item.id);

            if (!item.selected || hypervisor.hypervisor_manager !== hypervisor_manager.id)
                return;

            hypervisor.datastores = hypervisor.datastores.filter(
                (ds, index) => item.datastores[index].selected
            );

            hypervisors.push(hypervisor);
        });

        this.setState({
            hypervisor: hypervisors,
            hypervisor_manager: hypervisor_manager
        });
    }

    handleResetHypervisors() {
        this.setState({
            hypervisor: [],
            hypervisor_manager: ''
        })
    }

    handleAddVmToConfig(values) {
        let vm_index = this.props.vm.findIndex(item => item.id === values.vm);
        let vm = this.props.vm[vm_index];

        vm.hypervisors_manager_reference = this.state.hypervisor_manager.name;
        vm.fileset_reference = values.filesets;
        vm.count = values.count;
        vm.start_from = values.start_from;
        vm.power_on = values.power_on;
        vm.name_prefix = values.name_prefix;
        vm.deploy_counts = values.deploy_counts;

        this.setState({
            vm: [...this.state.vm, vm]
        })
    }

    handleAddSlaToConfig(values) {
        let sla_index = this.props.sla.findIndex(item => item.id === values.sla);
        let sla = this.props.sla[sla_index];
        sla.protect_counts = values.counts;

        this.setState({
            ...this.state,
            sla: [...this.state.sla, sla]
        })
    }

    handleDeleteSlaFromConfig(id) {
        this.setState({
            sla: this.state.sla.filter(item => item.id !== id)
        })
    }

    handleDeleteVMFromConfig(id) {
        this.setState({
            vm: this.state.vm.filter(item => item.id !== id)
        })
    }

    renderNextButton(step) {
        let button;

        if (step === 1)
            button = <Button variant="contained" color="primary" onClick={this.nextStep} style={{float: 'right'}}
                             disabled={this.state.hypervisor_manager === ''}> Next </Button>
        else if (step === 2)
            button = <Button variant="contained" color="primary" onClick={this.nextStep} style={{float: 'right'}}
                             disabled={this.state.vm.length === 0}> Next </Button>

        else if (step === 4)
            button = <Button variant="contained" color="primary" onClick={this.handleSubmit} style={{float: 'right'}}
                             disabled={this.state.config_name === ''}> Save Config </Button>
        else
            button =
                <Button variant="contained" color="primary" onClick={this.handleGenerateConfig}
                        style={{float: 'right'}}>
                    {this.state.sla.length === 0 ?
                        "Skip"
                        :
                        "Preview Config"
                    }
                </Button>;

        return button;
    }

    render() {
        return (
            <Paper style={{padding: '5px 30px 25px 30px'}}>
                <Stepper activeStep={this.state.step - 1} alternativeLabel>
                    {this.step_names.map((label, index) => {
                        const stepProps = {};
                        const labelProps = {};

                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>

                <Divider/>

                {{
                    1: <WizardFormFirstPage
                        addedVM={this.state.vm}
                        hypervisor_manager={this.state.hypervisor_manager}
                        hypervisors={this.state.hypervisor}
                        availableHypervisor={this.props.hypervisor}
                        availableHypervisorManager={this.props.hypervisor_manager}
                        handleAddHypervisors={this.handleAddHypervisorsToConfig}
                        resetPage={this.handleResetHypervisors}/>,

                    2: <WizardFormSecondPage
                        addedVM={this.state.vm}
                        hypervisor_manager={this.state.hypervisor_manager}
                        hypervisors={this.state.hypervisor}
                        availableFileset={this.props.fileset}
                        handleAddVmToConfig={this.handleAddVmToConfig}
                        deleteVM={this.handleDeleteVMFromConfig}
                        availableVM={this.props.vm.filter(vm => (
                            this.state.vm.findIndex(
                                item => item.id === vm.id
                            ) <= -1
                        ))}/>,

                    3: <WizardFormThirdPage
                        addedSla={this.state.sla}
                        addedVM={this.state.vm}
                        handleAddSlaToConfig={this.handleAddSlaToConfig}
                        deleteSla={this.handleDeleteSlaFromConfig}
                        availableSla={this.props.sla.filter(sla => (
                            this.state.sla.findIndex(
                                item => item.id === sla.id
                            ) <= -1
                        ))}/>,

                    4: <WizardFormFourthPage
                        config={this.state.config}
                        changeConfigName={this.handleConfigNameChange}
                        configName={this.state.config_name}/>,

                }[this.state.step] || <div/>}

                <Divider style={{marginBottom: '15px'}}/>

                <Grid container alignItems="flex-end" justify="flex-end">
                    <Grid item>
                        <Button disabled={this.state.step === 1} onClick={this.prevStep}
                                style={{marginRight: '10px', float: 'right'}}> Back </Button>
                    </Grid>

                    <Grid item>
                        {this.renderNextButton(this.state.step)}
                    </Grid>
                </Grid>
            </Paper>
        )
    }
}

const mapStateToProps = state => ({
    vm: state.brahma.vm,
    hypervisor_manager: state.brahma.hypervisor_manager,
    hypervisor: state.brahma.hypervisor,
    fileset: state.brahma.fileset,
    sla: state.brahma.sla
});

export default connect(
    mapStateToProps,
    {
        add_config
    }
)(WizardForm);
