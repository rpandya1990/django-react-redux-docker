import React, {Component} from 'react';
import * as d3 from "d3";
import "d3-transition";
import _ from "lodash";
import * as PropTypes from "prop-types";
import SystemLineGraph from "./SystemLineGraph";
import ReactDOM from "react-dom";
import {focusStatusMap} from "../../../../utils";


class SystemBarGraph extends Component {
    constructor(props) {
        super(props);

        this.createGraph = this.createGraph.bind(this);

        this.styleParams = {
            width: props.width,
            height: props.height,
            margin: props.margin,
            padding: props.padding,
            rotateBy: props.rotateBy,
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.domain, nextProps.domain) ||
            !_.isEqual(this.props.data, nextProps.data)) {
            d3.select(this.node).selectAll("*").remove();
        }
    }

    componentDidMount() {
        this.createGraph(this.props);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(this.props.domain, prevProps.domain) ||
            !_.isEqual(this.props.data, prevProps.data) ||
            !_.isEqual(this.props.handleClick, prevProps.handleClick)) {
            this.createGraph(this.props);
        }
    }

    createGraph = props => {
        const {data, domain} = props;
        if (!_.isEmpty(this.node)) {
            d3.select(this.node).selectAll("*").remove();
        }

        const {
            width,
            height,
            margin,
            padding,
            rotateBy
        } = this.styleParams;

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        /* Add SVG */
        let svg = d3.select(this.node)
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
        let tooltip = d3.select("#tooltip");
        tooltip.style("position", "absolute");

        // Transpose the data into layers
        let dataset = d3.stack()
            .keys(domain)(data);

        // Set x, y and colors
        let xScale = d3.scaleBand()
            .domain(data.map(d => d.build))
            .rangeRound([padding, chartWidth - padding])
            .padding([0.2]);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function (d) {
                return d3.max(d, d => d[1])
            })])
            .range([chartHeight, 0]);

        let colors = [
            "rgb(67, 160, 71)",
            "rgb(229, 115, 115)",
            "rgb(251, 192, 45)",
            "rgb(117, 117, 117)",
            "rgb(192, 202, 51)"
        ];

        // Define and draw axes
        let yAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-chartWidth, 0, 0)
            .tickFormat(d => d);

        let xAxis = d3.axisBottom(xScale)
            .tickFormat(d => d);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append('text')
            .attr("y", -28)
            .attr("x", -100)
            .attr("transform", "rotate(-90)")
            .style("fill", "rgb(120,120,120)")
            .text("Test Cases");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chartHeight + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", `rotate(${rotateBy})`)
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .append("text")
            .attr("x", chartHeight)
            .attr("y", 40)
            .attr("fill", "#000");


        // Create groups for each series, rects for each segment
        let groups = svg.selectAll("g.cost")
            .data(dataset)
            .enter().append("g")
            .attr("class", "cost")
            .style("fill", function (d, i) {
                return colors[i];
            });

        let rect = groups.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return xScale(d.data.build);
            })
            .attr("y", function (d) {
                return yScale(d[1]);
            })
            .attr("height", function (d) {
                return yScale(d[0]) - yScale(d[1]);
            })
            .attr("width", xScale.bandwidth())
            .on("mouseover", function (d, i) {
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                const textContent = `<div class="graph-text-format">
                                        <span class="graph-tooltip-title">${d[1]}</span>
                                     </div>`;
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.style("position", "absolute");
                if (window.innerWidth - 50 < d3.event.pageX) {
                    tooltip
                        .html(textContent)
                        .style("right", (window.innerWidth - d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 25) + "px")
                        .style("opacity", 1)
                        .style("display", "block");
                } else {
                    tooltip
                        .html(textContent)
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 25) + "px")
                        .style("opacity", 1)
                        .style("display", "block");
                }
            })
            .on("mouseout", function () {
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.attr("style", null);
            })
            .on("mousemove", function (d, i) {
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                const textContent = `<div class="graph-text-format">
                                        <span class="graph-tooltip-title">${d[1] - d[0]}</span>
                                     </div>`;
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.style("position", "absolute");
                if (window.innerWidth - 50 < d3.event.pageX) {
                    tooltip
                        .html(textContent)
                        .style("right", (window.innerWidth - d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 25) + "px")
                        .style("opacity", 1)
                        .style("display", "block");
                } else {
                    tooltip
                        .html(textContent)
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 25) + "px")
                        .style("opacity", 1)
                        .style("display", "block");
                }
            })
            .on("click", function (d, i) {
                const link = new URLSearchParams();

                const params = {
                    "version-starts-with": d.data.build,
                    "filters": focusStatusMap(["Success", "Fail", "Skip", "Not Run"])
                };

                for (const [status, testcases] of Object.entries(d.data.breakdown)) {
                    testcases.forEach(tc => {
                        link.append("testcase", tc)
                    });
                }

                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.attr("style", null);
                props.redirectToProductQuality(params, link.toString());
            });


        // Draw legend
        let legend = svg.selectAll(".legend")
            .data(colors)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(30," + i * 19 + ")";
            });

        legend.append("rect")
            .attr("x", chartWidth - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d, i) {
                return colors.slice().reverse()[i];
            });

        legend.append("text")
            .attr("x", chartWidth + 5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d, i) {
                switch (i) {
                    case 0:
                        return "Re-run Needed";
                    case 1:
                        return "Not Run";
                    case 2:
                        return "Skip";
                    case 3:
                        return "Fail";
                    case 4:
                        return "Pass";
                }
            });
    };

    render() {
        return (
            <div>
                <svg ref={node => this.node = node}>
                </svg>
            </div>
        );
    }
}

SystemLineGraph.propTypes = {
    title: PropTypes.string.isRequired,
    domain: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    redirectToProductQuality: PropTypes.func.isRequired,
};

SystemBarGraph.defaultProps = {
    width: 1220,
    height: 400,
    margin: {
        top: 40,
        right: 200,
        bottom: 100,
        left: 50
    },
    padding: 15,
    rotateBy: -65
};

export default SystemBarGraph;