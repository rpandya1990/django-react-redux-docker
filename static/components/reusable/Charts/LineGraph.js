import React from "react";
import * as d3 from "d3";
import "d3-transition";
import ReactDOM from "react-dom";
import _ from "lodash";


class LineGraph extends React.Component {
    constructor(props) {
        super(props);

        this.shouldRotate = (props.width / 55) <= props.domain.length;

        this.styleParams = {
            width: props.width,
            height: props.height,
            margin: this.shouldRotate ?
                {
                    top: 40,
                    right: 50,
                    bottom: 100,
                    left: 50
                } : {
                    top: 40,
                    right: 50,
                    bottom: 50,
                    left: 50
                },
            duration: props.duration,
            lineOpacity: props.lineOpacity,
            lineOpacityHover: props.lineOpacityHover,
            otherLinesOpacityHover: props.otherLinesOpacityHover,
            lineStroke: props.lineStroke,
            lineStrokeHover: props.lineStrokeHover,
            circleOpacity: props.circleOpacity,
            circleOpacityOnLineHover: props.circleOpacityOnLineHover,
            circleRadius: props.circleRadius,
            circleRadiusHover: props.circleRadiusHover,
            rotateBy: this.shouldRotate ? -65 : 0
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!_.isEqual(this.props.domain, nextProps.domain) || !_.isEqual(this.props.data, nextProps.data)) {
            d3.select(this.node).selectAll("*").remove();
        }
    }

    componentDidMount() {
        this.createRunOverRunGraph(this.props.data, this.props.domain);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(this.props.domain, prevProps.domain) || !_.isEqual(this.props.data, prevProps.data)) {
            this.createRunOverRunGraph(this.props.data, this.props.domain);
        }
    }

    createRunOverRunGraph = (data, domain) => {
        const {
            width,
            height,
            margin,
            duration,
            lineOpacity,
            lineOpacityHover,
            otherLinesOpacityHover,
            lineStroke,
            lineStrokeHover,
            circleOpacity,
            circleOpacityOnLineHover,
            circleRadius,
            circleRadiusHover,
            rotateBy
        } = this.styleParams;

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        data = data.sort((a,b) => {
            if ( a.name > b.name ){
                return -1;
            }
            if ( a.name < b.name ){
                return 1;
            }
            return 0;
        });

        /* Scale */
        let xScale = d3.scalePoint()
            .domain(domain)
            .range([15, chartWidth]);

        let yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);

        let color = d3.scaleOrdinal(d3.schemeCategory10);

        /* Add SVG */
        let svg = d3.select(this.node)
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr("transform", `translate(${margin.left}, ${margin.top+3})`);

        ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
        let tooltip = d3.select("#tooltip");
        tooltip.style("position", "absolute");

        /* Add Axis into SVG */
        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale).ticks(5).tickSize(-chartWidth);

        if (rotateBy !== 0) {
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0, ${chartHeight})`)
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
        } else {
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${chartHeight})`)
                .call(xAxis)
                .append("text")
                .attr("x", chartHeight)
                .attr("y", 40)
                .attr("fill", "#000");
        }

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .append('text')
            .attr("y", -28)
            .attr("x", -50)
            .attr("transform", "rotate(-90)")
            .style("fill", "rgb(120,120,120)")
            .text("Pass %");

        /* Add line into SVG */
        let line = d3.line()
            .x(d => xScale(d.version))
            .y(d => yScale(d.value));

        let lines = svg.append('g')
            .attr('class', 'lines');

        lines.selectAll('.line-group')
            .data(data).enter()
            .append('g')
            .attr('class', 'line-group')
            .on("mouseover", function (d, i) {
                svg.append("text")
                    .attr("class", "title-text")
                    .style("fill", color(i))
                    .text(d.name)
                    .attr("text-anchor", "middle")
                    .attr("x", chartWidth / 2)
                    .attr("y", -20);
            })
            .on("mouseout", function (d) {
                svg.select(".title-text").remove();
            })
            .append('path')
            .attr('class', 'line')
            .attr('d', d => line(d.values))
            .style("stroke-width", lineStroke)
            .style('stroke', (d, i) => color(i))
            .style('opacity', lineOpacity)
            .style("fill", "none")
            .on("mouseover", function (d) {
                d3.selectAll('.line')
                    .style('opacity', otherLinesOpacityHover);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacityOnLineHover);
                d3.select(this)
                    .style('opacity', lineOpacityHover)
                    .style("stroke-width", lineStrokeHover)
                    .style("cursor", "pointer");
            })
            .on("mouseout", function (d) {
                d3.selectAll(".line")
                    .style('opacity', lineOpacity);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacity);
                d3.select(this)
                    .style("stroke-width", lineStroke)
                    .style("cursor", "none");
            });

        /* Add circles in the line */
        lines.selectAll("circle-group")
            .data(data).enter()
            .append("g")
            .style("fill", (d, i) => {
                return color(i);
            })
            .selectAll("circle")
            .data(d => d.values).enter()
            .append("g")
            .attr("class", "circle")
            .on("mouseover", function (d) {
                let heading = d.title ? `<div class="graph-text-format" style="align-self: center;"><span class="graph-tooltip-title">${d.title}</span></div>` : ``;
                let topInfo = d.start_time ? `<span class="graph-tooltip-title">${d.value}%</span><span> on ${d.start_time} by ${d.title}</span>` : `<span class="graph-tooltip-title">${d.value}%</span>`;
                let textContent = `<div>
                ${heading}
                <div class="graph-text-format">${topInfo}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Total #:</span> ${d.total}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Pass #:</span> ${d.pass}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Fail #:</span> ${d.fail}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Skip #:</span> ${d.skip}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Rerun #:</span> ${d.rerun}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Notrun #:</span> ${d.notrun}</div>
                <div class="graph-text-format" style="margin-top: 10px; border-bottom: 1px solid white;"><span class="graph-tooltip-title">Issues</span></div>
                <div style="display: flex">
                <div class="graph-text-format"><span class="graph-tooltip-title">TC #:</span> ${d.testcase && d.testcase.count ? d.testcase.count : 0}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Prod #:</span> ${d.product && d.product.count ? d.product.count : 0}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Infra #:</span> ${d.infra && d.infra.count ? d.infra.count : 0}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Undet #:</span> ${d.undetermined && d.undetermined.count ? d.undetermined.count : 0}</div>
                <div class="graph-text-format"><span class="graph-tooltip-title">Untri #:</span> ${d.untriaged && d.untriaged.count ? d.untriaged.count : 0}</div>
                </div>
            </div>`;
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.style("position", "absolute");
                if (window.innerWidth - 500 < d3.event.pageX) {
                    tooltip
                        .html(textContent)
                        .style("right", (window.innerWidth - d3.event.pageX + 12) + "px")
                        .style("top", (d3.event.pageY - 180) + "px")
                        .style("opacity", 1)
                        .style("display", "block")
                        .style("transform-origin", "bottom right");
                } else {
                    tooltip
                        .html(textContent)
                        .style("left", (d3.event.pageX + 12) + "px")
                        .style("top", (d3.event.pageY - 180) + "px")
                        .style("opacity", 1)
                        .style("display", "block")
                        .style("transform-origin", "bottom left");
                }
            })
            .on("mouseout", function (d) {
                ReactDOM.unmountComponentAtNode(document.getElementById("tooltip"));
                tooltip.attr("style", null);
            })
            .on("click", (d, i) => {
                window.open(d.link, "_blank");
            })
            .append("circle")
            .attr("cx", d => xScale(d.version))
            .attr("cy", d => yScale(d.value))
            .attr("r", circleRadius)
            .style('opacity', circleOpacity)
            .on("mouseover", function (d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadiusHover);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadius);
            });

        let legend = svg.append("g")
            .selectAll().data(data).enter();

        legend
            .append("text")
            .attr("x", (d,i) => {
                return width - 260 - Math.floor(i/2)*170
            })
            .attr("y", (d, i) => {
                return -27 + i % 2 * 20;
            })
            .style("font-size", "12px")
            .style("fill", "rgb(140,140,140)")
            .html((d, i) => {
                if (data[i].name.length <= 25) {
                    return data[i].name;
                } else {
                    return data[i].name.substring(0,25) + "..."
                }
            });

        legend
            .append("circle")
            .attr("cx",(d,i) => {
                return width - 270 - Math.floor(i/2)*170
            })
            .attr("r", 5)
            .style("fill", (d, i) => {
                return color(i);
            })
            .attr("cy", (d, i) => {
                return -31 + i % 2 * 20;
            });
        d3.selectAll(".x-axis").selectAll(".tick").select("line").attr("y2", (d, i, f) => {
            if (i % 2 !== 0) {
                return 17;
            }
            return 6;
        });
    };

    render() {
        return (
            <div>
                <svg ref={node => this.node = node}>
                </svg>
            </div>
        )
    }
}

LineGraph.defaultProps = {
    width: 600,
    height: 280,
    margin: {
        top: 40,
        right: 50,
        bottom: 50,
        left: 50
    },
    duration: 250,
    lineOpacity: "0.8",
    lineOpacityHover: "1",
    otherLinesOpacityHover: "0.1",
    lineStroke: "3px",
    lineStrokeHover: "7px",
    circleOpacity: '1',
    circleOpacityOnLineHover: "0.1",
    circleRadius: 5,
    circleRadiusHover: 8
};

export default LineGraph;
