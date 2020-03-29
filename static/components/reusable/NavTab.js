import React, {Component} from 'react';
import "../../css/NavTab.css";


const WIDTH_OFFSET = 10;

class NavTab extends Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            marginLeft: 0,
        };

        this.selectedStyle = {
            color: "rgb(60,60,60)",
            transform: "scale(1.03)",
        };

        this.highlightRef = React.createRef();
        this.tabRefs = {};

        this.props.categories.map((category, i) => {
            this.tabRefs[i] = React.createRef();
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.selectedTab !== this.props.selectedTab ||
            prevState.width !== this.state.width ||
            (this.tabRefs !== null && this.tabRefs[this.props.selectedTab] !== null && this.state.width !== this.tabRefs[this.props.selectedTab].current.clientWidth + WIDTH_OFFSET)) {
            this.refreshHighlighting();
        }
        if (!_.isEqual(prevProps.categories, this.props.categories)) {
            this.props.categories.map((category, i) => {
                this.tabRefs[i] = React.createRef();
            })
        }
    }

    componentDidMount() {
        this.refreshHighlighting()
    }

    refreshHighlighting() {
        const {selectedTab} = this.props;
        const marginOffset = 30;
        const widthOffset = WIDTH_OFFSET;

        const width = this.tabRefs[selectedTab].current.clientWidth + widthOffset;
        let marginLeft = marginOffset;
        for (let i = 0; i < selectedTab; ++i) {
            marginLeft += this.tabRefs[i].current.clientWidth + 2 * marginOffset;
        }

        marginLeft -= widthOffset / 2;

        if (this.state.width !== width || this.state.marginLeft !== marginLeft) {
            this.setState({
                width: width,
                marginLeft: marginLeft
            });
        }
    }

    render() {
        const {selectedTab, onTabChange} = this.props;

        return (
            <div className="nav-tab" style={this.props.style}>
                <div className="tab-group" style={this.props.tabGroupStyle}>
                    <div style={{display: "flex", margin: "auto"}}>
                        {this.props.categories.map((category, i) => {
                                return (
                                    <div key={category + "tab"}
                                         className="tab-item"
                                         style={selectedTab == i ? this.selectedStyle : {}}
                                         onClick={() => onTabChange(i)}
                                         ref={this.tabRefs[i]}
                                    >
                                        {category}
                                    </div>
                                );
                            }
                        )}
                    </div>
                    <div
                        ref={this.highlightRef}
                        style={{
                            backgroundColor: "rgb(0, 125, 255)",
                            height: "2px",
                            width: this.state.width,
                            transition: "all 0.3s ease-in-out 0s",
                            marginLeft: this.state.marginLeft,
                            marginBottom: "1px",
                            marginTop: "-5px"
                        }}/>
                </div>
                {this.props.children}
            </div>
        );
    }
}

export default NavTab;