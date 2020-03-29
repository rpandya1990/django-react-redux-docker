import React from "react";
import * as d3 from "d3";
import "../../../css/Dashboard.css";
import ReactDOM from "react-dom";
import {clearChildren, focusStatusMap} from "../../../utils";


class PieChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.width = 320;
        this.height = 200;
        this.radius = Math.min(this.width, this.height-40) / 2.5;
        this.labelRadius = this.radius + 8;
    }

    componentDidMount() {
        clearChildren(this.node);
        this.createPieChart()
    }
    componentDidUpdate() {
        clearChildren(this.node);
        this.createPieChart()
    }

    createPieChart = () => {
        let data = this.props.data;
        let total = this.props.total;
        let link = this.props.link;
        let branch = this.props.branch;
        let id = this.props.id;
        let r = this.radius;
        let w = this.width;
        let h = this.height;
        let labelr = this.labelRadius;

        ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
        let tooltip = d3.select("#tooltip");

        const node = this.node;
        let donut = d3.pie();
        let arc = d3.arc().innerRadius(r *.82).outerRadius(r);

        d3.select(node)
            .data([data])
            .attr("width", w)
            .attr("height", h)
            .attr("class", "pie-adjust");

        let arcs = d3.select(node)
            .selectAll("g.arc")
            .data(donut.value(function(d) {
                return d.value
            }).sort(null))
            .enter().append("svg:g")
            .attr("class", "arc")
            .attr("id", (d, i) => {
                return id + data[i].num
            })
            .attr('stroke', 'rgb(36,25,36)')
            .attr('stroke-width', '.15')
            .on("mousemove", (d, i) => {
                if (data[i].value == 0 || window.pieMiddleActivated) {
                    return;
                }
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.style("position", "absolute");
                let tooltipData = `
                    <div>
                        <span class="graph-tooltip-title">${data[i].shortLabel || data[i].label}:</span> ${data[i].value}%
                    </div>
                    <div>
                        <span class="graph-tooltip-title">Count:</span> ${data[i].num}
                    </div>`;

                if (this.props.failure_reasons && Object.keys(this.props.failure_reasons).length) {
                    if (data[i].label === "Fail" || data[i].label === "Not Run") {
                        let label = data[i].label === "Fail" ? "fail" : "notrun";
                        tooltipData += `<div style="padding: 4px"></div>`;
                        for (const reason of Object.keys(this.props.failure_reasons[label])) {
                            let count = this.props.failure_reasons[label][reason];
                        tooltipData += `
                            <div>
                                <span class="graph-tooltip-title">${reason}:</span> ${count} <span style="margin-left: 5px; font-weight: 600"> ${Number(Math.round(100*count/data[i].num+'e2')+"e-2")}%</span>
                            </div>`;
                        }
                    }
                }
                tooltip
                    .html(tooltipData)
                    .style("left", (d3.event.pageX+12) + "px")
                    .style("top", (d3.event.pageY-10) + "px")
                    .style("opacity", 1)
                    .style("display","block");
                let parent = this;
                d3.selectAll(".arc").style("opacity", function () {
                    return (this === parent) ? 1.0 : 0.4;
                });
            })
            .on("mouseout",function(){
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.attr("style", null);
                d3.selectAll(".arc").style("opacity", 1.0);
            })
            .on("click", (d,i) => {
                if (data[i].value == 0 || window.pieMiddleActivated || data[i].label == "Deploy&Install") {
                    return;
                }
                let params = {
                    branch: branch,
                    filters: focusStatusMap(["Fail"]),
                    triage: data[i].label
                };
                if (this.props.graphType !== "triage") {
                    params = {
                        branch: branch,
                        filters: focusStatusMap([data[i].label]),
                    };
                }
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.attr("style", null);
                this.props.redirectToProductQuality(params, link);
            })
            .attr("transform", "translate(" + (r + 82) + "," + (r+46) + ")");

        arcs.append("svg:path")
            .attr("fill", function(d, i) {
                if (data[i].label == "Success") {
                    return "rgba(50,190,100, .72)";
                }
                if (data[i].label == "Not Run") {
                    return "rgba(218,184,44, .78)";
                }
                if (data[i].label == "Fail") {
                    return "rgba(217, 75, 95, .77)";
                }
                if (data[i].label == "Skip") {
                    return "rgba(253, 253, 16, .77)";
                }
                if (data[i].label == "Deploy&Install") {
                    return "rgba(250, 150, 150, .77)";
                }
                if (data[i].label === "Product") {
                    return "rgba(235,210,200, 1)";
                }
                if (data[i].label === "Test Case") {
                    return "rgba(200,210,225, 1)";
                }
                if (data[i].label === "Infra") {
                    return "rgba(175,55,150, .5)";
                }
                if (data[i].label === "Undet") {
                    return "rgba(210,150,25, .5)";
                }
                if (data[i].label === "Untriaged") {
                    return "rgba(20, 168, 168, .5)";
                }
            })
            .attr("d", arc);

        if (!this.props.removeLabels) {
            arcs.append("svg:text")
                .attr("transform", function (d) {
                    var c = arc.centroid(d),
                        x = c[0],
                        y = c[1],
                        // pythagorean theorem for hypotenuse
                        h = Math.sqrt(x * x + y * y);
                    return "translate(" + (x / h * labelr) + ',' +
                        (y / h * labelr) + ")";
                })
                .attr("class", "pie-text")
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    // are we past the center?
                    return (d.endAngle + d.startAngle) / 2 > Math.PI ?
                        "end" : "start";
                })
                .attr('stroke-width', '0')
                .html(function (d, i) {
                    return d.value ? `<tspan style="margin-right: 4px">${data[i].shortLabel || data[i].label}: </tspan> ${d.value}%` : "";

                });
        }

        d3.select("#" + id + data[0].num).append("svg:text")
            .attr("text-anchor", "middle")
            .attr('class', 'middle-pie-text')
            .html(() => {
                return (
                    `<tspan style="margin-right: 4px">${
                    this.props.graphType !== "triage" ?
                        `<tspan style="font-weight: 500">${typeof data[0].value !== "undefined" && data[0].value !== null && !isNaN(data[0].value) ? (Math.round(data[0].value) + "%") : ""}</tspan><tspan style="fill:rgb(120,120,120)"> ${typeof data[0].value !== "undefined" && data[0].value !== null && !isNaN(data[0].value) ? "Passed" : "No Results Available"}</tspan>` :
                        `<tspan style="font-weight: 500">${typeof data[4].value !== "undefined" && data[4].value !== null && !isNaN(data[4].value) ? (Math.round(100-data[4].value) + "%") : ""}</tspan><tspan style="fill:rgb(120,120,120)"> ${typeof data[4].value !== "undefined" && data[4].value !== null && !isNaN(data[4].value) ? "Triaged" : "No Failures"}</tspan>`
                    }</tspan>`
                )
            })
            .on("mouseover", () => {
                window.pieMiddleActivated = true;
            })
            .on("mouseout", () => {
                window.pieMiddleActivated = false;
            })
            .on("click", () => {
                let filters = focusStatusMap(["Success", "Fail"]);
                if (this.props.graphType === "notpruned") {
                    filters = focusStatusMap(["Success", "Fail", "Not Run", "Skip"]);
                }
                let params = {
                    branch: branch,
                    filters: filters
                };
                tooltip.attr("style", null);
                this.props.redirectToProductQuality(params, link)
            });
    };

    render() {
        return (
            <svg
                ref={node => this.node = node}
                width={this.width}
                height={this.height}>
            </svg>
        );
    }
}

export default PieChart;
