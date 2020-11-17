import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import { format } from 'd3-format'
import { line as d3Line } from 'd3-shape'
import { scaleTime, scaleLinear } from 'd3-scale'
// import { easeExp, easeElastic } from 'd3-ease'
// import Animate from 'react-move/Animate'
// import NodeGroup from 'react-move/NodeGroup'
import Text from 'react-svg-text'

export class History extends Component {
  render() {
    const { width, height } = this.props,
          dates = this.props.data.values.map(d => new Date(d.date)),
          values = this.props.data.values.map(d => d.value),
          margin = 35;

    const xScale = scaleTime()
        .domain([dates[0], dates[dates.length - 1]])
        .range([margin, width - margin]);

    const unhealthilyLowScale = scaleLinear()
      .domain([this.props.data.absoluteMin, this.props.data.healthyMin])
      .range([height - margin, height * .66]);

    const healthyScale = scaleLinear()
      .domain([this.props.data.healthyMin, this.props.data.healthyMax])
      .range([height * .66, height * .33]);

    const unhealthilyHighScale = scaleLinear()
      .domain([this.props.data.healthyMax, this.props.data.absoluteMax])
      .range([height * .33, margin]);

    const line = d3Line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => d.value < this.props.data.healthyMin ? unhealthilyLowScale(d.value)
              : d.value > this.props.data.healthyMax ? unhealthilyHighScale(d.value)
              : healthyScale(d.value));

    return (
      <div className="hgraph-history">
        <svg width={width} height={height}>
          <rect
            x={0}
            y={healthyScale(this.props.data.healthyMax)}
            width={width}
            height={healthyScale(this.props.data.healthyMin) - healthyScale(this.props.data.healthyMax)}
            fill="#98bd8e"
          />
          <path
            className="hgraph-history__line"
            fill="none"
            stroke="#616363"
            d={line(this.props.data.values)}
          />
          <g>
            { this.props.data.values.map(d => {
              const date = new Date(d.date);
              const x = xScale(date);
              const y = d.value < this.props.data.healthyMin ? unhealthilyLowScale(d.value)
              : d.value > this.props.data.healthyMax ? unhealthilyHighScale(d.value)
              : healthyScale(d.value);
              const fontSize = 12;
              const flipText = d.value < this.props.data.healthyMin;
              const dateOffset = flipText ? -fontSize : fontSize;

              return (
                <g>
                  <circle
                    cx={x}
                    cy={y}
                    r={ height < 120 ? 3 : 5 }
                    fill={ d.value > this.props.data.healthyMax || d.value < this.props.data.healthyMin ? '#df6053' : '#616363' }
                  />
                  <Text
                    x={x}
                    y={y + (flipText ? dateOffset * 2 : dateOffset)}
                    fontSize={fontSize}
                    verticalAnchor="middle"
                    textAnchor="middle">
                    { d.value }
                  </Text>
                  <Text
                    className="hgraph-history__date"
                    x={x}
                    y={y + (flipText ? dateOffset : dateOffset * 2)}
                    fontSize={fontSize}
                    verticalAnchor="middle"
                    textAnchor="middle">
                    { `${date.getDate()}.${date.toLocaleString('default', { month: 'short' })}.${date.getFullYear().toString().substr(-2)}` }
                  </Text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>
    )
  }
}
