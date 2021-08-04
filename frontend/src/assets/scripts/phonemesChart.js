import * as d3 from 'd3'
import { computed } from 'vue'

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

function isPause({ type }) {
  return type === 'pause'
}

function debounce(fn, duration) {
  let durationTimeout

  return () => {
    if (durationTimeout) {
      clearTimeout(durationTimeout)
    }

    durationTimeout = setTimeout(() => {
      fn()
    }, duration)
  }
}

const margin = {
  left: 50,
  top: 10,
  right: 10,
  bottom: 30,
  input: 4,
}

const axisLabelFontSize = 12

function getChartCurve({ chartWidth, initialContainerHeight, xScale, yScale }) {
  return d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(
      ({ x }) =>
        margin.left +
        (x * (chartWidth - margin.left - margin.right)) / xScale.domain()[1],
    )
    .y(
      ({ y }) =>
        initialContainerHeight -
        margin.bottom -
        (y * (initialContainerHeight - margin.top - margin.bottom)) /
          yScale.domain()[0],
    )
}

function drawOriginalPhraseData({
  chartSvg,
  phonemes,
  chartWidth,
  initialContainerHeight,
  xScale,
  yScale,
}) {
  chartSvg
    .append('path')
    .datum(phonemes)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(0, 0, 0, 0.25)')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4 1')
    .style('user-select', 'none')
    .attr(
      'd',
      getChartCurve({ chartWidth, initialContainerHeight, xScale, yScale }),
    )
}

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
  debouncedRegenerateAudio,
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
    (
      {
        x,
        y,
        datasetIndex,
        editable: pointEditable,
        phonemeName,
        repeated,
        duration,
        originalNode,
      },
      pointIndex,
    ) => {
      const centerY =
        initialContainerHeight -
        margin.bottom -
        (y * (initialContainerHeight - margin.top - margin.bottom)) /
          yScale.domain()[0]

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
        .attr('cy', centerY)
        .attr('starting-cy', centerY)

      if (!repeated && editable) {
        const selectorX =
          margin.left +
          (x * (chartWidth - margin.left - margin.right)) / xScale.domain()[1]

        const selectorWidth =
          ((chartWidth - margin.left - margin.right) * duration) /
          xScale.domain()[1]

        const phonemeSwitcherContainer = chartSvg
          .append('foreignObject')
          .attr('x', selectorX)
          .attr('y', initialContainerHeight - margin.bottom)
          .attr('height', margin.bottom)
          .attr('width', selectorWidth)
          .append('xhtml:div')
          .style('height', '100%')
          .style('padding', '4px 2px')
          .style('width', '100%')

        const phonemeSwitcherSelect = phonemeSwitcherContainer
          .append('xhtml:div')
          .attr('class', 'phoneme-selector')
          .text(phonemeName)

        phonemeSwitcherSelect.on('click', function onPhonemeSwitcherClick() {
          this.classList.add('selected')

          store.openPhonemeSelector({
            node: originalNode,
            phonemeName: phonemes[pointIndex].phonemeName,
            datasetIndex,
            selectorX,
            selectorWidth,
            onPhonemeChange({ newPhoneme }) {
              phonemes[pointIndex].phonemeName = newPhoneme
              phonemeSwitcherSelect.text(newPhoneme)
              debouncedRegenerateAudio()
            },
          })
        })
      }
    },
  )

  const chartPathAreaGradient = chartSvg
    .append('defs')
    .append('linearGradient')
    .attr('id', `test-area-gradient-${phraseIndex}`)

  const colorGradient1 = `${color}08`
  const colorGradient2 = `${color}32`

  phonemes
    .filter(({ repeated }) => !repeated)
    .forEach(({ x }, xIndex) => {
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
      getChartCurve({
        chartWidth,
        initialContainerHeight,
        xScale,
        yScale,
      }),
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
    const chartY =
      ((initialContainerHeight - margin.bottom - pointY) * yScale.domain()[0]) /
      (initialContainerHeight - margin.top - margin.bottom)

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
  originalDataset,
  color,
  editable,
  initialContainerHeight,
  store,
  phonemeDictionary,
  proportionalEditRange,
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

  if (editable) {
    chartSvg
      .append('g')
      .append('path')
      .attr(
        'd',
        `M${margin.left},${initialContainerHeight - margin.bottom + 0.5} h${
          chartWidth - margin.left - margin.right
        }`,
      )
      .attr('stroke', 'black')
  } else {
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
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left}, ${initialContainerHeight - margin.bottom})`,
      )
      .call(xAxis)

    chartSvg
      .append('text')
      .attr('x', margin.left + (chartWidth - margin.left - margin.right) / 2)
      .attr('y', initialContainerHeight - margin.bottom)
      .attr('dy', axisLabelFontSize * 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', axisLabelFontSize)
      .text('Phoneme name')
  }

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
      .attr('stroke', 'rgba(200, 200, 200, 0.4)')
      .attr('stroke-width', 1)
      .attr('x1', gridLineX)
      .attr('y1', margin.top)
      .attr('x2', gridLineX)
      .attr('y2', initialContainerHeight - margin.bottom)
  })

  // Y AXIS HORIZONTAL GRID LINES

  yScale.ticks(yTickCount).forEach(y => {
    if (y === 0) {
      return
    }

    const gridLineY =
      initialContainerHeight -
      margin.bottom -
      (y * (initialContainerHeight - margin.top - margin.bottom)) /
        yScale.domain()[0]

    chartSvg
      .append('line')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(200, 200, 200, 0.4)')
      .attr('stroke-width', 1)
      .attr('x1', margin.left)
      .attr('y1', gridLineY)
      .attr('x2', chartWidth - margin.right)
      .attr('y2', gridLineY)
  })

  const debouncedRegenerateAudio = debounce(() => {
    store
      .getAudioStream({
        inputType: 'ACOUSTPARAMS',
        simplified: true,
        autoplay: false,
      })
      .then(() => {
        store.regenerateXmlDownloadUrl()
      })
  }, 250)

  // PAUSE DATA

  const pauseContainer = chartSvg.append('g')

  pauseContainer
    .append('defs')
    .append('pattern')
    .attr('id', 'pause-pattern')
    .attr('width', 10)
    .attr('height', 10)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('patternTransform', 'rotate(45)')
    .append('line')
    .attr('stroke', 'rgba(0, 0, 0, 0.5)')
    .attr('stroke-width', 4)
    .attr('stroke-linecap', 'square')
    .attr('x1', 5)
    .attr('y1', 0)
    .attr('x2', 5)
    .attr('y2', 10)

  const pausePoints = dataset.filter(isPause)

  pausePoints.forEach(({ x, duration, node }) => {
    pauseContainer
      .append('rect')
      .attr('fill', 'url(#pause-pattern)')
      .attr(
        'x',
        margin.left +
          (x * (chartWidth - margin.left - margin.right)) / xScale.domain()[1],
      )
      .attr('y', margin.top)
      .attr(
        'width',
        (100 * (chartWidth - margin.left - margin.right)) / xScale.domain()[1],
      )
      .attr('height', initialContainerHeight - margin.top - margin.bottom)

    const pauseInputContainer = pauseContainer
      .append('foreignObject')
      .attr(
        'x',
        margin.left +
          margin.input +
          (x * (chartWidth - margin.left - margin.right)) / xScale.domain()[1],
      )
      .attr('y', margin.top + initialContainerHeight / 2 - 32)
      .attr(
        'width',
        (100 * (chartWidth - margin.left - margin.right)) / xScale.domain()[1] -
          margin.input * 2,
      )
      .attr('height', 32)
      .append('xhtml:div')
      .style('background-color', 'white')
      .style('border', `2px solid ${color}`)
      .style('border-radius', '8px')
      .style('height', '100%')
      .style('width', '100%')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('justify-content', 'space-evenly')
      .style('padding', '0 4px')

    const pauseDurationInput = pauseInputContainer
      .append('xhtml:input')
      .attr('value', duration)
      .style('background-color', 'white')
      .style('border', '0')
      .style('width', '100%')
      .style('font-size', '0.8rem')
      .style('box-shadow', 'none')
      .style('outline', 'none')
      .style('line-height', '1.15')
      .style('margin', '0')
      .style('padding', '0')
      .on('keydown', event => {
        if (!editable) {
          return
        }

        const disallowedKeys = /^[\WA-Za-z]$/

        if (disallowedKeys.test(event.key)) {
          event.preventDefault()
        }
      })
      .on('input', event => {
        if (!editable) {
          return
        }

        const newPauseDuration = Math.max(
          parseInt(event.target.value, 10) || 0,
          0,
        )

        event.target.value = String(newPauseDuration)

        node.setAttribute('duration', newPauseDuration)

        debouncedRegenerateAudio()
      })

    if (!editable) {
      pauseDurationInput
        .attr('readonly', true)
        .attr('disabled', true)
        .style('cursor', 'not-allowed')
    }

    pauseInputContainer
      .append('xhtml:div')
      .text('ms')
      .style('color', 'rgb(200, 200, 200)')
      .style('font-size', '0.8rem')
      .style('line-height', '1.15')
  })

  // PHRASE DATA

  const phraseContainer = chartSvg.append('g')

  const chartPointContainer = chartSvg.append('g')

  if (originalDataset) {
    originalDataset
      .reduce((accumulatedPointData, pointData, datasetIndex) => {
        accumulatedPointData[pointData.phraseIndex] = [
          ...(accumulatedPointData[pointData.phraseIndex] ?? []),
          {
            ...pointData,
            datasetIndex,
          },
        ]
        return accumulatedPointData
      }, [])
      .forEach(phonemes => {
        drawOriginalPhraseData({
          chartSvg: phraseContainer,
          phonemes: phonemes.filter(isPhoneme),
          chartWidth,
          initialContainerHeight,
          xScale,
          yScale,
        })
      })
  }

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
      debouncedRegenerateAudio,
      phonemeDictionary,
    }),
  )

  // TOOLTIP

  const tooltip = chartSvg.append('foreignObject')

  const tooltipContainer = tooltip
    .append('xhtml:div')
    .attr(
      'style',
      'background-color: #444444; border-radius: 4px; padding: 2px 4px; width: max-content; transform: translate(25%, -50%); transition: opacity 0.5s ease;',
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

  // CHART POINT DRAGGING EVENT

  let startingY = null

  function proportionalEditFunction({ indexDiff }) {
    if (Math.abs(indexDiff) > proportionalEditRange.value) {
      return 0
    }

    return (
      0.1 *
      Math.exp(
        -(Math.log(10) / proportionalEditRange.value ** 2) *
          (indexDiff - proportionalEditRange.value) *
          (indexDiff + proportionalEditRange.value),
      )
    )
  }

  function handleProportionalEdit({
    indexDiff,
    phraseIndex,
    pointIndex,
    datasetIndex,
    pointYDiff,
  }) {
    const dragPoint = document.querySelector(
      `circle[phrase-index="${phraseIndex}"][point-index="${
        pointIndex + indexDiff
      }"][point-editable="true"]`,
    )

    if (dragPoint) {
      const { recalculateChartPath } = phraseChartData[phraseIndex]

      const currentPointY = parseInt(dragPoint.getAttribute('starting-cy'), 10)

      const proportionalEditDiff = proportionalEditFunction({
        indexDiff,
      })

      if (proportionalEditDiff === 0) {
        return false
      }

      const pointY = Math.max(
        margin.top,
        Math.min(
          initialContainerHeight - margin.bottom,
          currentPointY - pointYDiff * proportionalEditDiff,
        ),
      )

      dragPoint.setAttribute('cy', pointY)
      recalculateChartPath(
        pointIndex + indexDiff,
        pointY,
        datasetIndex + indexDiff,
      )

      return true
    }

    return false
  }

  function onDragEvent(event) {
    const phraseIndex = parseInt(this.getAttribute('phrase-index'), 10)
    const pointIndex = parseInt(this.getAttribute('point-index'), 10)
    const datasetIndex = parseInt(this.getAttribute('dataset-index'), 10)

    const { recalculateChartPath } = phraseChartData[phraseIndex]

    const pointY = Math.max(
      margin.top,
      Math.min(initialContainerHeight - margin.bottom, event.y),
    )

    this.setAttribute('cy', pointY)
    recalculateChartPath(pointIndex, pointY, datasetIndex)
    handleTooltipText.bind(this)()

    const pointYDiff = startingY - event.y

    for (
      let rangeStep = 1;
      rangeStep <= proportionalEditRange.value;
      rangeStep += 1
    ) {
      const proportionalEditResult = handleProportionalEdit({
        indexDiff: rangeStep,
        phraseIndex,
        pointIndex,
        datasetIndex,
        pointYDiff,
      })

      if (!proportionalEditResult) {
        break
      }
    }

    for (
      let rangeStep = -1;
      rangeStep >= -proportionalEditRange.value;
      rangeStep -= 1
    ) {
      const proportionalEditResult = handleProportionalEdit({
        indexDiff: rangeStep,
        phraseIndex,
        pointIndex,
        datasetIndex,
        pointYDiff,
      })

      if (!proportionalEditResult) {
        break
      }
    }
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
      ].replace(/^(\d+),\d+$/, `$1,${Math.round(y)}`)

      node.setAttribute('f0', `(${currentFrequencyList.join(')(')})`)

      debouncedRegenerateAudio()
    }

    document
      .querySelectorAll('circle[point-editable="true"]')
      .forEach(chartPoint => {
        chartPoint.setAttribute('starting-cy', chartPoint.getAttribute('cy'))
      })
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
          .on('start', function onDragStart(event) {
            startingY = event.y
            onDragEvent.bind(this)(event)
          })
          .on('drag', onDragEvent)
          .on('end', function onDragEnd(event) {
            onDragEvent.bind(this)(event)
            handleTooltipHiding.bind(this)(event)
            onDragEndEvent.bind(this)(event)
            startingY = null
          }),
      )
  }
}

export default function getChartGenerator() {
  const store = useStore()

  const phonemeDictionary = computed(() => store.phonemeDictionary)
  const proportionalEditRange = computed(() => store.proportionalEditRange)

  return ({ dataset, originalDataset, color, editable }) => {
    function onResizeHandler() {
      const initialContainerHeight = parseInt(
        getComputedStyle(document.querySelector('#main-chart-container'))
          .height,
        10,
      )
      const chartWidth = getChartWidth()

      const chartSvg = d3.select('#main-chart-container svg')

      chartSvg.attr('viewBox', [0, 0, chartWidth, initialContainerHeight])

      redrawChart({
        dataset,
        originalDataset,
        color,
        editable,
        initialContainerHeight,
        store,
        phonemeDictionary: phonemeDictionary.value,
        proportionalEditRange,
      })

      store.closePhonemeSelector()
    }

    onResizeHandler()

    window.addEventListener('resize', onResizeHandler)
  }
}
