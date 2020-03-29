import React, {Component} from "react";
import {connect} from "react-redux";
import TopSelect from "../../reusable/TopSelect";
import NavTab from "../../reusable/NavTab";
import {
    get_vms,
    get_filesets,
    get_hypervisors,
    get_hypervisor_managers,
    get_sla,
    get_configs,
    get_deployed_systems
} from '../../../actions/brahma';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import WizardForm from "./WizardForm";
import HypervisorManagerCard from "./HypervisorManagerCard";
import HypervisorCard from "./HypervisorCard";
import FilesetCard from "./FilesetCard";
import SlaCard from "./SlaCard";
import VMCard from "./VMCard";
import SystemDeploy from "./SystemDeploy";
import Loader from "../../reusable/Loader";

class Brahma extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedCategory: 0
        };

        this.categories = [
            "Configuration",
            "Generate Config",
            "System Deploy",
            "Cluster Configure"
        ];
    }

    componentDidMount() {
        this.props.get_sla();
        this.props.get_vms();
        this.props.get_filesets();
        this.props.get_hypervisors();
        this.props.get_hypervisor_managers();

        this.props.get_configs();
        this.props.get_deployed_systems();
    }

    checkIfAllEntitiesLoaded(fetching) {
        return fetching.VM || fetching.HYPERVISOR || fetching.HYPERVISOR_MANAGER
            || fetching.FILESET || fetching.SLA || fetching.CONFIG;
    }

    renderTab = (
        {
            selectedCategory
        }) => {

        const theme = createMuiTheme({
                palette: {
                    primary: {
                        main: '#009688'
                    }
                }
            },
        );

        const {fetching, vm, hypervisor_manager, hypervisor, fileset, sla, config, deployed_system} = this.props;

        return (
            <div className="row">
                <div className="col-xs-11">
                    {this.categories[selectedCategory] === "Configuration" ?
                        <MuiThemeProvider theme={theme}>

                            <div>
                                {fetching.VM ?
                                    <Loader width="100%"
                                            style={{padding: "100px", backgroundColor: 'white', marginBottom: '40px'}}/>
                                    :
                                    <VMCard vm={vm}/>
                                }

                                {fetching.HYPERVISOR_MANAGER ?
                                    <Loader width="100%"
                                            style={{padding: "100px", backgroundColor: 'white', marginBottom: '40px'}}/>
                                    :
                                    <HypervisorManagerCard hypervisor_manager={hypervisor_manager}/>
                                }

                                {fetching.HYPERVISOR ?
                                    <Loader width="100%"
                                            style={{padding: "100px", backgroundColor: 'white', marginBottom: '40px'}}/>
                                    :
                                    <HypervisorCard hypervisor={hypervisor}
                                                    hypervisor_manager={hypervisor_manager}/>}

                                {fetching.FILESET ?
                                    <Loader width="100%"
                                            style={{padding: "100px", backgroundColor: 'white', marginBottom: '40px'}}/>
                                    :
                                    <FilesetCard fileset={fileset}/>
                                }

                                {fetching.SLA ?
                                    <Loader width="100%"
                                            style={{padding: "100px", backgroundColor: 'white', marginBottom: '20px'}}/>
                                    :
                                    <SlaCard sla={sla}/>
                                }
                            </div>

                        </MuiThemeProvider>
                        : <div/>
                    }
                    {this.categories[selectedCategory] === "Generate Config" ?
                        <div>
                            <MuiThemeProvider theme={theme}>
                                {this.checkIfAllEntitiesLoaded(fetching) ?
                                    <Loader width="100%" style={{margin: "100px auto"}}/>
                                    :
                                    <WizardForm/>
                                }
                            </MuiThemeProvider>
                        </div>
                        : <div/>
                    }
                    {this.categories[selectedCategory] === "System Deploy" ?
                        <div>
                            <MuiThemeProvider theme={theme}>
                                {fetching.CONFIG || fetching.DEPLOYED_SYSTEM ?
                                    <Loader width="100%" style={{margin: "100px auto"}}/>
                                    :
                                    <SystemDeploy config={config}
                                                  deployed_system={deployed_system}/>
                                }
                            </MuiThemeProvider>
                        </div>
                        : <div/>
                    }
                    {this.categories[selectedCategory] === "Cluster Configure" ?
                        <div>
                            Cluster Configure
                        </div>:
                        <div/>
                    }
                </div>
            </div>
        )
    };

    render() {
        return (
            <div>
                <TopSelect title={
                    <span>
                        <span style={{fontFamily: "Raleway", color: "teal"}}>
                            Brahma
                        </span>
                        <span style={{
                            fontSize: "24px", marginLeft: "7px", color: "black", fontFamily: "Montserrat"
                        }}>
                            v1.0
                        </span>
                    </span>
                }/>

                <NavTab categories={this.categories}
                        selectedTab={this.state.selectedCategory}
                        onTabChange={tabIndex => {
                            this.setState({selectedCategory: tabIndex})
                        }}
                />

                <div className="main-container">
                    <div className="flex-container">
                        {this.renderTab({
                            selectedCategory: this.state.selectedCategory
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    vm: state.brahma.vm,
    hypervisor_manager: state.brahma.hypervisor_manager,
    hypervisor: state.brahma.hypervisor,
    fileset: state.brahma.fileset,
    sla: state.brahma.sla,
    config: state.brahma.config,
    deployed_system: state.brahma.deployed_system,
    fetching: state.brahma.fetching,
});


export default connect(
    mapStateToProps,
    {
        get_vms,
        get_sla,
        get_filesets,
        get_hypervisors,
        get_hypervisor_managers,
        get_configs,
        get_deployed_systems
    }
)(Brahma);