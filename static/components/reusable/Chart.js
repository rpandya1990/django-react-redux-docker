import React from "react";
import {PieChart} from "react-d3";


export const ReactD3PieChart = (props) => {
    return (
        <PieChart
            data={props.data}
            width={props.width}
            height={props.height}
        />
    );
};


