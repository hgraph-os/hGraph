import metrics from '../data/metrics.json';
import { scaleLinear } from 'd3-scale';

const hGraphConvert = (gender, metric, data) => {
  const metricObj = metrics[gender][metric];
  const sortedValues = data.values.sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    label: data.label || metricObj.label,
    value: sortedValues[sortedValues.length - 1].value,
    values: sortedValues,
    healthyMin: data.healthyMin || metricObj.healthyRange[0],
    healthyMax: data.healthyMax || metricObj.healthyRange[1],
    absoluteMin: data.absoluteMin || metricObj.absoluteRange[0],
    absoluteMax: data.absoluteMax || metricObj.absoluteRange[1],
    weight: data.weight || metricObj.weight,
    unitLabel: data.unitLabel || metricObj.unitLabel
  }
}

const calculateScoreFromMetric = (metric) => {
  let scale;

  // TODO: Review score calcs
  if (metric.value > metric.healthyMax) {
    // if it's high, healthyMax to absoluteMax, 1 to 0
    scale = scaleLinear()
      .domain([metric.healthyMax, metric.absoluteMax])
      .range([1, 0]);
  } else if (metric.value < metric.healthyMin) {
    // if it's low, healthyMin to absolute Min, 1 to 0
    scale = scaleLinear()
      .domain([metric.healthyMin, metric.absoluteMin])
      .range([1, 0]);
  } else {
    // if it's healthy, perfect score
    return 1;
  }

  return scale(metric.value);
}

const calculateHealthScore = (data) => {
  // TODO: Review score calcs
  let totalWeight = 0;
  data.map(d => {
    totalWeight += d.weight;
  });

  if (totalWeight !== 100) {
    throw "Total weight of values does not equal 100%";
  }

  let scoreTotal = 0;

  data.map(d => {
    const score = calculateScoreFromMetric(d);
    const weightPercentage = d.weight / 100;
    const weightedScore = weightPercentage * score;
    scoreTotal += weightedScore;
  });

  return scoreTotal * 100;
}

export {
  hGraphConvert,
  calculateHealthScore
};
