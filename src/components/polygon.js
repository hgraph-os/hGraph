import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { easeExp } from 'd3-ease';
import Animate from 'react-move/Animate';
import NodeGroup from 'react-move/NodeGroup';
import Text from 'react-svg-text';

class Polygon extends Component {

  static propTypes = {
    points: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      color: PropTypes.string,
      cx: PropTypes.number.isRequired,
      cy: PropTypes.number.isRequired,
      activeCx: PropTypes.number.isRequired,
      activeCy: PropTypes.number.isRequired,
      unitLabel: PropTypes.string.isRequired
    })).isRequired,
    color: PropTypes.string,
    areaOpacity: PropTypes.number,
    strokeWidth: PropTypes.number,
    strokeColor: PropTypes.string,
    pointRadius: PropTypes.number,
    activePointRadius: PropTypes.number,
    showScore: PropTypes.bool,
    scorecolor: PropTypes.string,
    scoreSize: PropTypes.number,
    isActive: PropTypes.bool
  }

  static defaultProps = {
    color: '#000',
    areaOpacity: 0.25,
    strokeWidth: 1,
    pointRadius: 4,
    activePointRadius: 20,
    showScore: false,
    scoreColor: '#000',
    scoreSize: 80,
    isActive: false
  }

  assemblePointsStr = (points) => {
    let str = "";
    points.forEach((val, i) => {
      str += `${val.cx},${val.cy} `;
    });
    return str;
  }

  handleClick = (e) => {
    e.stopPropagation();
    this.props.onClick();
  }

  handlePointClick = (data) => (e) => {
    e.stopPropagation();
    this.props.onPointClick(data);
  }

  renderArea = () => {
    const pointsStr = this.assemblePointsStr(this.props.points);
    return (
      <Animate
        start={{
          pointsStr: pointsStr,
          fillOpacity: this.props.isActive ? this.props.areaOpacityActive : this.props.areaOpacity
        }}
        enter={{
          pointsStr: pointsStr,
          fillOpacity: this.props.isActive ? this.props.areaOpacityActive : this.props.areaOpacity
        }}
        update={[
          {
            pointsStr: [pointsStr],
            timing: { duration: 750, ease: easeExp }
          },
          {
            fillOpacity: [this.props.isActive ? this.props.areaOpacityActive : this.props.areaOpacity],
            timing: { duration: 250, ease: easeExp }
          }
        ]}
      >
        {(state) => {
          return (
            <polygon
              className="polygon"
              points={ state.pointsStr }
              stroke={ this.props.strokeColor || this.props.color }
              strokeWidth={ this.props.strokeWidth }
              fill={ this.props.color }
              fillOpacity={ state.fillOpacity }
              onClick={ this.handleClick }>
            </polygon>
          );
        }}
      </Animate>
    )
  }

  renderPoints = (data) => {
    return (
      <g className="polygon__points-wrapper">
        <NodeGroup
          data={ data }
          keyAccessor={ (d) => d.key }
          start={(d, index) => {
            // if (c.isChild) {
            //   const
            // }
            return {
              cx: d.cx,
              cy: d.cy,
              activeCx: d.activeCx,
              activeCy: d.activeCy,
              color: d.color || this.props.color,
              fontColor: d.fontColor,
              activeOpacity: this.props.isActive ? 1 : 0
            }
          }}
          enter={(d, index) => ({
            cx: d.cx,
            cy: d.cy,
            activeCx: d.activeCx,
            activeCy: d.activeCy,
            color: d.color || this.props.color,
            fontColor: d.fontColor,
            activeOpacity: this.props.isActive ? 1 : 0
          })}
          update={(d, index) => ([
            {
              cx: [d.cx],
              cy: [d.cy],
              activeCx: [d.activeCx],
              activeCy: [d.activeCy],
              color: [d.color || this.props.color],
              fontColor: [d.fontColor],
              timing: { duration: 750, ease: easeExp }
            },
            {
              activeOpacity: [this.props.isActive ? 1 : 0],
              timing: { duration: 250, ease: easeExp }
            }
          ])}
        >
          {(nodes) => {
            return (
              <g>
                {nodes.map(({ key, data, state }) => {
                  return (
                    <g key={ data.key }>
                      <circle
                        className="polygon__point"
                        r={ this.props.pointRadius }
                        cx={ state.cx }
                        cy={ state.cy }
                        fill={ state.color }
                        onClick={ this.handlePointClick(data) }>
                      </circle>
                      <g opacity={ state.activeOpacity } className="polygon__active-point-wrapper">
                        <Text
                          width={ this.props.pointLabelWrapWidth }
                          x={ state.activeCx }
                          y={ state.activeCy }
                          fontSize={ this.props.fontSize }
                          verticalAnchor={ data.verticalAnchor }
                          textAnchor={ data.textAnchor }
                          fill={ state.fontColor }>
                          { `${data.value} ${data.unitLabel}` }
                        </Text>
                      </g>
                    </g>
                  )
                })}
              </g>
            );
          }}
        </NodeGroup>
      </g>
    );
  }

  renderScore = () => {
    const transitionObj = {
      opacity: [this.props.showScore ? 1 : 0],
      timing: { duration: 250, ease: easeExp }
    };
    return (
      <Animate
        start={transitionObj}
        enter={transitionObj}
        update={transitionObj}
        leave={transitionObj}
      >
        {(state) => {
          return (
            <Text
              opacity={ state.opacity }
              x="0"
              y="0"
              textAnchor="middle"
              verticalAnchor="middle"
              fontSize={ this.props.scoreFontSize }
              fontWeight="bold"
              pointerEvents="none"
              fill={ this.props.scoreFontColor }>
                { this.props.score }
            </Text>
          )
        }}
      </Animate>
    )
  }

  render() {
    return(
      <g className="polygon-wrapper">
        { this.renderArea() }
        { this.renderPoints(this.props.points) }
        { this.renderScore() }
      </g>
    )
  }
}

export default Polygon;
