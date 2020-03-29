import React, {Component} from "react";
import NavItem from "../../reusable/NavItem";
import "../../../css/TopNav.css";
import {getAppList} from "../../../actions/topNav";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import ReactDOM from "react-dom";


let tooltip = document.getElementById("tooltip");


class TopNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedApp: null,
            appList: [],
            user: null,
        };
    }

    handleDocClick = event => {
        window.removeEventListener("click", this.handleDocClick);
        tooltip.removeAttribute("style");
    };

    showSettings = () => {
        return (
            <div onClick={this.stopPropagation}>
                <div style={{
                    fontSize: "14px",
                    fontFamily: "Roboto",
                    marginBottom: "5px",
                    padding: "4px 10px",
                    borderRadius: "3px",
                    color: "rgb(150, 205, 255)",
                    border: "1px solid white"
                }}>{this.props.appItems.user}</div>
                <a className="tooltip-nav-items" href="/integration">
                    <span>Integration</span>
                </a>
                <a className="tooltip-nav-items" href="/logout">
                    <span>Logout</span>
                </a>
            </div>
        );
    };

    handleNavClick = (e, dropDown) => {
        let rect = e.currentTarget.getBoundingClientRect();
        tooltip.style.top = rect.top - 53 + "px";
        tooltip.style.left = (window.innerWidth >= 2000 ? rect.left + 177 : rect.left + 72) + "px";
        tooltip.style.display = "block";
        tooltip.style.position = "fixed";
        if (dropDown === "settings") {
            if (tooltip.innerHTML) {
                ReactDOM.unmountComponentAtNode(tooltip);
            }
            ReactDOM.render(
                this.showSettings(),
                tooltip,
            )
        }
        window.addEventListener("click", this.handleDocClick);
    };

    stopPropagation = e => {
        e.stopPropagation();
    };

    componentDidMount() {
        this.props.getAppList();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const pathname = this.props.pathname.split('/').splice(0, 2).join('/');
        if (this.props.pathname !== prevProps.pathname ||
            this.props.appItems.query_set.length !== prevProps.appItems.query_set.length) {
            let appFound = false;
            for (let i = 0; i < this.props.appItems.query_set.length; i++) {
                let app = this.props.appItems.query_set[i];
                if (app.link === this.props.pathname || app.link + "/" === this.props.pathname || app.link === this.props.pathname + "/") {
                    appFound = true;
                    this.setState({selectedApp: i});
                    break;
                }
            }
            if (!appFound) {
                for (let i = 0; i < this.props.appItems.query_set.length; i++) {
                    let app = this.props.appItems.query_set[i];
                    if (app.link === pathname || app.link + "/" === pathname || app.link === pathname + "/") {
                        appFound = true;
                        this.setState({selectedApp: i});
                        break;
                    }
                }
            }
            if (!appFound) {
                this.setState({selectedApp: null});
            }
        }
    }

    removeToolTip = () => {
        document.getElementById("tooltip").removeAttribute("style");
        ReactDOM.unmountComponentAtNode(tooltip);
    };

    handleNavEnter = (e, name) => {
        if (window.innerWidth >= 2000) {
            return;
        }
        ReactDOM.unmountComponentAtNode(tooltip);
        let rect = e.currentTarget.getBoundingClientRect();
        tooltip.style.top = rect.top + 10 + "px";
        tooltip.style.left = rect.left + 72 + "px";
        tooltip.style.fontSize = "12px";
        tooltip.style.display = "block";
        tooltip.style.position = "fixed";
        tooltip.innerHTML = name;
    };

    handleNavLeave = () => {
        ReactDOM.unmountComponentAtNode(tooltip);
        tooltip.removeAttribute("style");
    };


    render() {
        return (
            <div className="navbar">
                <div className="side-nav">
                    <Link to="/" className="logo-block">
                        {/*<span className="nav-item-label">Atlantis</span>*/}
                    </Link>
                    <div style={{marginTop: "50px", overflowY: "auto", position: "relative", height: "100%"}}>
                        {this.props.appItems.query_set.map((obj, i) => (
                            <NavItem {...obj} handleMouseLeave={this.handleNavLeave}
                                     handleMouseEnter={this.handleNavEnter}
                                     handleClick={() => this.setState({selectedApp: i})} key={obj.name}/>))}
                        {this.state.selectedApp !== null &&
                        <div className="moving-vertical-border" style={{
                            borderLeft: "2px solid rgba(0, 210, 255, 1)",
                            backgroundColor: "rgba(0, 210, 255, .17)",
                            height: "48px",
                            top: "0px",
                            margin: "0 2px",
                            transform: `translateY(${48 * this.state.selectedApp + "px"})`
                        }}/>
                        }
                    </div>
                    <div style={{marginTop: "auto", marginBottom: "5px"}} onClick={this.stopPropagation}>
                        {this.props.appItems.user && (
                            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                <div
                                    className="profile-icon"
                                    style={{display: "flex", alignItems: "center", justifyContent: "center"}}
                                    onClick={e => this.handleNavClick(e, "settings")}
                                >
                                    <div>{this.props.appItems.user[0]}</div>
                                </div>
                                <div className="nav-item-label" style={{marginLeft: "15px"}}>{this.props.appItems.user}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => ({
    appItems: state.topNav.appItems
});


export default connect(
    mapStateToProps,
    {getAppList}
)(TopNav);