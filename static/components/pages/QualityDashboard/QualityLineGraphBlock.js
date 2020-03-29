import React from "react";
import LineGraph from "../../reusable/Charts/LineGraph";


class QualityLineGraphBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="data-card run-graph">
                <div className="big-card-title half-title" style={{paddingTop: "10px"}}>{this.props.title}</div>
                <LineGraph {...this.props}/>
            </div>
        )
    }
}


export default QualityLineGraphBlock;
