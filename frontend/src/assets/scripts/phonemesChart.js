import * as d3 from 'd3'

import { useStore } from '../../store/createStore'

function getChartWidth() {
  const rootStyling = getComputedStyle(
    document.querySelector('#main-chart-container'),
  )
  return parseInt(rootStyling.width, 10)
}

function isPhoneme({ type, notDrawn }) {
  return type === 'phoneme' && !notDrawn
}

const margin = {
  left: 50,
  top: 10,
  right: 10,
  bottom: 30,
}

const axisLabelFontSize = 12

function getPhraseData({
  chartSvg,
  phonemes,
  color,
  editable,
  chartWidth,
  xScale,
  yScale,
  initialContainerHeight,
  store,
  chartPointContainer,
  phraseIndex,
}) {
  const timeValues = phonemes.map(({ x }) => x)
  const minTimeValue = d3.min(timeValues)
  const maxTimeValue = d3.max(timeValues)
  const timeRange = maxTimeValue - minTimeValue

  const chartPathArea = chartSvg
    .append('path')
    .attr('fill', `url(#test-area-gradient-${phraseIndex})`)
    .style('user-select', 'none')

  const chartPath = chartSvg
    .append('path')
    .datum(phonemes)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .style('user-select', 'none')

  phonemes.forEach(
    ({ x, y, datasetIndex, editable: pointEditable }, pointIndex) => {
      chartPointContainer
        .append('circle')
        .attr('fill', color)
        .attr('stroke', 'none')
        .attr('r', editable && pointEditable ? 6 : 4)
        .attr('point-index', pointIndex)
        .attr('phrase-index', phraseIndex)
        .attr('dataset-index', datasetIndex)
        .attr('point-editable', pointEditable)
        .attr(
          'cx',
          margin.left +
            (x * (chartWidth - margin.left - margin.right)) /
              xScale.domain()[1],
        )
        .attr(
          'cy',
          initialContainerHeight -
            margin.bottom -
            (y * (initialContainerHeight - margin.top - margin.bottom)) /
              yScale.domain()[0],
        )
    },
  )

  const chartPathAreaGradient = chartSvg
    .append('defs')
    .append('linearGradient')
    .attr('id', `test-area-gradient-${phraseIndex}`)

  const colorGradient1 = `${color}08`
  const colorGradient2 = `${color}32`

  phonemes.forEach(({ x }, xIndex) => {
    const xChartValue = (x - minTimeValue) / timeRange

    chartPathAreaGradient
      .append('stop')
      .attr('offset', xChartValue - 0.001)
      .attr('stop-color', xIndex % 2 === 0 ? colorGradient1 : colorGradient2)

    chartPathAreaGradient
      .append('stop')
      .attr('offset', xChartValue + 0.0001)
      .attr('stop-color', xIndex % 2 === 0 ? colorGradient2 : colorGradient1)
  })

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

    chartPathArea.attr('d', area(phonemes))
  }

  calculateChartPath()

  function recalculateChartPath(pointIndex, pointY, datasetIndex) {
    const chartY = Math.round(
      ((initialContainerHeight - margin.bottom - pointY) * yScale.domain()[0]) /
        (initialContainerHeight - margin.top - margin.bottom),
    )

    store.updateDatasetPoint({
      pointIndex: datasetIndex,
      pointValue: chartY,
    })

    phonemes[pointIndex].y = chartY

    chartPath.datum(phonemes)
    calculateChartPath()
  }

  function getTooltipTexts(pointIndex) {
    const point = phonemes[pointIndex]

    return {
      frequency: Math.round(point?.y),
      msLabel: Math.round(point?.x),
    }
  }

  return {
    recalculateChartPath,
    getTooltipTexts,
  }
}

function redrawChart({
  dataset,
  color,
  editable,
  initialContainerHeight,
  store,
}) {
  const root = d3.select('#main-chart-container')

  root.html('')

  if (!dataset) {
    return
  }

  const datasetPhonemes = dataset.filter(isPhoneme)
  const allTimeValues = datasetPhonemes.map(({ x }) => x)
  const allFrequencyValues = datasetPhonemes.map(({ y }) => y)

  const maxXValue = d3.max(allTimeValues)
  const minYValue = d3.min(allFrequencyValues)
  const maxYValue = d3.max(allFrequencyValues)

  const chartWidth = getChartWidth()

  const chartSvg = root
    .append('svg')
    .attr('preserveAspectRatio', 'none')
    .attr('width', '100%')

  // X AXIS

  const xScale = d3
    .scaleLinear()
    .domain([0, maxXValue])
    .range([0, chartWidth - margin.left - margin.right])

  const xAxis = d3
    .axisBottom()
    .tickValues(allTimeValues)
    .tickFormat((_, index) =>
      datasetPhonemes[index]?.repeated
        ? ''
        : datasetPhonemes[index]?.phonemeName,
    )
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

  // Y AXIS

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
      Math.floor(minYValue / divisorYBase) * divisorYBase,
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

  // X AXIS VERTICAL GRID LINES

  allTimeValues.forEach(x => {
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

  // Y AXIS HORIZONTAL GRID LINES

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

  // PHRASE DATA

  const phraseContainer = chartSvg.append('g')

  const chartPointContainer = chartSvg.append('g')

  const datasetsGroupedByPhrase = dataset.reduce(
    (accumulatedPointData, pointData, datasetIndex) => {
      accumulatedPointData[pointData.phraseIndex] = [
        ...(accumulatedPointData[pointData.phraseIndex] ?? []),
        {
          ...pointData,
          datasetIndex,
        },
      ]
      return accumulatedPointData
    },
    [],
  )

  const phraseChartData = datasetsGroupedByPhrase.map((phonemes, phraseIndex) =>
    getPhraseData({
      chartSvg: phraseContainer,
      chartPointContainer,
      phonemes: phonemes.filter(isPhoneme),
      color,
      editable,
      chartWidth,
      xScale,
      yScale,
      initialContainerHeight,
      store,
      phraseIndex,
    }),
  )

  // TOOLTIP

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

  let tooltipHideTimeout

  function handleTooltipText() {
    clearTimeout(tooltipHideTimeout)

    const phraseIndex = parseInt(this.getAttribute('phrase-index'), 10)
    const pointIndex = parseInt(this.getAttribute('point-index'), 10)

    const { getTooltipTexts } = phraseChartData[phraseIndex]

    const { msLabel, frequency } = getTooltipTexts(pointIndex)

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
    const phraseIndex = parseInt(this.getAttribute('phrase-index'), 10)
    const pointIndex = parseInt(this.getAttribute('point-index'), 10)
    const datasetIndex = parseInt(this.getAttribute('dataset-index'), 10)

    const { recalculateChartPath } = phraseChartData[phraseIndex]

    const pointY = Math.round(
      Math.max(
        margin.top,
        Math.min(initialContainerHeight - margin.bottom, event.y),
      ),
    )
    this.setAttribute('cy', pointY)
    recalculateChartPath(pointIndex, pointY, datasetIndex)
    handleTooltipText.bind(this)()
  }

  function onDragEndEvent() {
    const datasetIndex = parseInt(this.getAttribute('dataset-index'), 10)

    const { node, nodeFrequencyIndex, y } = dataset[datasetIndex]

    if (nodeFrequencyIndex != null) {
      const currentFrequencyList = node
        .getAttribute('f0')
        .replace(/^\(|\)$/g, '')
        .split(')(')

      currentFrequencyList[nodeFrequencyIndex] = currentFrequencyList[
        nodeFrequencyIndex
      ].replace(/^(\d+),\d+$/, `$1,${y}`)

      node.setAttribute('f0', `(${currentFrequencyList.join(')(')})`)

      store
        .getAudioStream({
          inputType: 'ACOUSTPARAMS',
          simplified: true,
          autoplay: false,
        })
        .then(() => {
          store.regenerateXmlDownloadUrl()
        })
    }
  }

  chartPointContainer
    .selectAll('circle')
    .on('mouseover', handleTooltipText)
    .on('mouseout', handleTooltipHiding)

  if (editable) {
    chartPointContainer
      .selectAll('circle[point-editable="true"]')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', onDragEvent)
          .on('drag', onDragEvent)
          .on('end', function onDragEnd(event) {
            onDragEvent.bind(this)(event)
            handleTooltipHiding.bind(this)(event)
            onDragEndEvent.bind(this)(event)
          }),
      )
  }
}

export default function getChartGenerator() {
  const store = useStore()

  return ({ dataset, color, editable }) => {
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
