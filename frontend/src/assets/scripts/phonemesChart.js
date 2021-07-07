import * as d3 from 'd3'

import useStore from '../../store'

function getChartWidth() {
  const rootStyling = getComputedStyle(
    document.querySelector('#main-chart-container'),
  )
  return parseInt(rootStyling.width, 10)
}

function redrawChart({
  dataset,
  ms,
  color,
  editable,
  initialContainerHeight,
  store,
}) {
  const chartWidth = getChartWidth()

  const root = d3.select('#main-chart-container')

  root.html('')

  const chartSvg = root
    .append('svg')
    .attr('preserveAspectRatio', 'none')
    .attr('width', '100%')

  const margin = {
    left: 50,
    top: 10,
    right: 10,
    bottom: 30,
  }

  const axisLabelFontSize = 12

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(ms.value)])
    .range([0, chartWidth - margin.left - margin.right])

  const xAxis = d3
    .axisBottom()
    .tickValues(ms.value)
    .tickFormat((_, index) => dataset.value[index].phonem)
    .scale(xScale)

  chartSvg
    .append('text')
    .attr('x', margin.left + (chartWidth - margin.left - margin.right) / 2)
    .attr('y', initialContainerHeight - margin.bottom)
    .attr('dy', axisLabelFontSize * 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', axisLabelFontSize)
    .text('Phoneme name')

  chartSvg
    .append('g')
    .attr(
      'transform',
      `translate(${margin.left}, ${initialContainerHeight - margin.bottom})`,
    )
    .call(xAxis)

  const frequencyValues = dataset.value.map(({ y }) => y)
  const maxYValue = d3.max(frequencyValues)

  let divisorYBase = 10

  if (maxYValue >= 250) {
    divisorYBase = 20
  }

  if (maxYValue >= 500) {
    divisorYBase = 40
  }

  const yTickCount = Math.round(maxYValue / divisorYBase)

  const yScale = d3
    .scaleLinear()
    .domain([
      Math.ceil(maxYValue / divisorYBase) * divisorYBase,
      Math.floor(d3.min(frequencyValues) / divisorYBase) * divisorYBase,
    ])
    .range([0, initialContainerHeight - margin.top - margin.bottom])

  const yAxis = d3.axisLeft().ticks(yTickCount).scale(yScale)

  chartSvg
    .append('text')
    .attr('x', 0)
    .attr('y', margin.left)
    .attr(
      'transform',
      `matrix(0 -1 1 0 0 ${
        (initialContainerHeight - margin.top - margin.bottom) / 2
      })`,
    )
    .attr('dy', -axisLabelFontSize * 3)
    .attr('text-anchor', 'middle')
    .attr('font-size', axisLabelFontSize)
    .text('Hz')

  chartSvg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis)

  yScale.ticks(yTickCount).forEach(y => {
    const gridLineY =
      initialContainerHeight -
      margin.bottom -
      (y * (initialContainerHeight - margin.top - margin.bottom)) /
        yScale.domain()[0]

    chartSvg
      .append('line')
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1)
      .attr('x1', margin.left)
      .attr('y1', gridLineY)
      .attr('x2', chartWidth - margin.right)
      .attr('y2', gridLineY)
  })

  ms.value.forEach(x => {
    const gridLineX =
      margin.left +
      (x * (chartWidth - margin.left - margin.right)) / xScale.domain()[1]

    chartSvg
      .append('line')
      .attr('fill', 'none')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1)
      .attr('x1', gridLineX)
      .attr('y1', margin.top)
      .attr('x2', gridLineX)
      .attr('y2', initialContainerHeight - margin.bottom)
  })

  const testAreaGradient = chartSvg
    .append('defs')
    .append('linearGradient')
    .attr('id', 'test-area-gradient')

  const colorGradient1 = `${color}08`
  const colorGradient2 = `${color}32`

  ms.value.forEach((xValue, xIndex) => {
    const xChartValue = xValue / xScale.domain()[1]

    testAreaGradient
      .append('stop')
      .attr('offset', xChartValue - 0.001)
      .attr('stop-color', xIndex % 2 === 0 ? colorGradient1 : colorGradient2)

    testAreaGradient
      .append('stop')
      .attr('offset', xChartValue + 0.0001)
      .attr('stop-color', xIndex % 2 === 0 ? colorGradient2 : colorGradient1)
  })

  const testArea = chartSvg
    .append('path')
    .attr('fill', 'url(#test-area-gradient)')

  const chartPath = chartSvg
    .append('path')
    .datum(dataset.value)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)

  const chartPointContainer = chartSvg.append('g')

  dataset.value.forEach(({ x, y }, pointIndex) => {
    chartPointContainer
      .append('circle')
      .attr('fill', color)
      .attr('stroke', 'none')
      .attr('r', editable ? 6 : 4)
      .attr('point-index', pointIndex)
      .attr(
        'cx',
        margin.left +
          (x * (chartWidth - margin.left - margin.right)) / xScale.domain()[1],
      )
      .attr(
        'cy',
        initialContainerHeight -
          margin.bottom -
          (y * (initialContainerHeight - margin.top - margin.bottom)) /
            yScale.domain()[0],
      )
  })

  const tooltip = chartSvg.append('foreignObject')

  const tooltipContainer = tooltip
    .append('xhtml:div')
    .attr(
      'style',
      'background-color: #444444; border-radius: 4px; padding: 4px; width: max-content; transform: translate(-50%, 50%); transition: opacity 0.5s ease;',
    )
    .text('')
    .style('opacity', 0)

  const tooltipText = tooltipContainer
    .append('xhtml:div')
    .attr('style', 'font-size: 12px; color: white; white-space: nowrap;')

  function calculateChartPath() {
    chartPath.attr(
      'd',
      d3
        .line()
        .curve(d3.curveMonotoneX)
        .x(
          ({ x }) =>
            margin.left +
            (x * (chartWidth - margin.left - margin.right)) /
              xScale.domain()[1],
        )
        .y(
          ({ y }) =>
            initialContainerHeight -
            margin.bottom -
            (y * (initialContainerHeight - margin.top - margin.bottom)) /
              yScale.domain()[0],
        ),
    )

    const area = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x(
        ({ x }) =>
          margin.left +
          (x * (chartWidth - margin.left - margin.right)) / xScale.domain()[1],
      )
      .y0(initialContainerHeight - margin.bottom)
      .y1(
        ({ y }) =>
          initialContainerHeight -
          margin.bottom -
          (y * (initialContainerHeight - margin.top - margin.bottom)) /
            yScale.domain()[0],
      )

    testArea.attr('d', area(dataset.value))
  }

  calculateChartPath()

  function recalculateChartPath(pointIndex, pointY) {
    const chartY = Math.round(
      ((initialContainerHeight - margin.bottom - pointY) * yScale.domain()[0]) /
        (initialContainerHeight - margin.top - margin.bottom),
    )

    store.updateDatasetPoint({
      pointIndex,
      pointValue: chartY,
    })

    chartPath.datum(dataset.value)
    calculateChartPath()
  }

  let tooltipHideTimeout

  function handleTooltipText() {
    clearTimeout(tooltipHideTimeout)

    const pointIndex = parseInt(this.getAttribute('point-index'), 10)

    const frequency = Math.round(dataset.value[pointIndex]?.y)
    const msLabel = Math.round(dataset.value[pointIndex]?.x)

    const x =
      margin.left +
      (msLabel * (chartWidth - margin.left - margin.right)) / xScale.domain()[1]
    const y =
      initialContainerHeight -
      margin.bottom -
      (frequency * (initialContainerHeight - margin.top - margin.bottom)) /
        yScale.domain()[0]

    tooltip.attr('x', x).attr('y', y)

    tooltipContainer.style('opacity', 1)

    tooltipText.text(`${Math.round(frequency)}Hz`)
  }

  function handleTooltipHiding() {
    clearTimeout(tooltipHideTimeout)

    tooltipHideTimeout = setTimeout(() => {
      tooltipContainer.style('opacity', 0)
    }, 3000)
  }

  function onDragEvent(event) {
    const pointIndex = parseInt(this.getAttribute('point-index'), 10)
    const pointY = Math.round(
      Math.max(
        margin.top,
        Math.min(initialContainerHeight - margin.bottom, event.y),
      ),
    )
    this.setAttribute('cy', pointY)
    recalculateChartPath(pointIndex, pointY)
    handleTooltipText.bind(this)()
  }

  chartPointContainer
    .selectAll('circle')
    .on('mouseover', handleTooltipText)
    .on('mouseout', handleTooltipHiding)

  if (editable) {
    chartPointContainer
      .selectAll('circle')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', onDragEvent)
          .on('drag', onDragEvent)
          .on('end', function onDragEnd(event) {
            onDragEvent.bind(this)(event)
            handleTooltipHiding.bind(this)(event)
          }),
      )
  }
}

export default function getChartGenerator() {
  const store = useStore()

  return ({ dataset, ms, color, editable }) => {
    const initialContainerHeight = parseInt(
      getComputedStyle(document.querySelector('#main-chart-container')).height,
      10,
    )

    function onResizeHandler() {
      const chartWidth = getChartWidth()

      const chartSvg = d3.select('#main-chart-container svg')

      chartSvg.attr('viewBox', [0, 0, chartWidth, initialContainerHeight])

      redrawChart({
        dataset,
        ms,
        color,
        editable,
        initialContainerHeight,
        store,
      })
    }

    onResizeHandler()

    window.addEventListener('resize', onResizeHandler)
  }
}
