import { maxIndex } from 'd3'

function distanceFromPointToPoint(point1, point2) {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2)
}

function distanceFromPointToLine(point1, point2, queriedPoint) {
  return (
    Math.abs(
      (point2.x - point1.x) * (point1.y - queriedPoint.y) -
        (point2.y - point1.y) * (point1.x - queriedPoint.x),
    ) / distanceFromPointToPoint(point1, point2)
  )
}

function douglasPeuckerSimplification(pointList, epsilon) {
  const firstPoint = pointList[0]
  const lastPoint = pointList[pointList.length - 1]

  const pointListDistances = pointList.map(queriedPoint =>
    distanceFromPointToLine(firstPoint, lastPoint, queriedPoint),
  )

  const pointListMaxDistanceIndex = maxIndex(pointListDistances)

  const pointListMaxDistance = pointListDistances[pointListMaxDistanceIndex]

  if (pointListMaxDistance > epsilon) {
    return [
      ...douglasPeuckerSimplification(
        pointList.slice(0, pointListMaxDistanceIndex),
        epsilon,
      ),
      ...douglasPeuckerSimplification(
        pointList.slice(pointListMaxDistanceIndex),
        epsilon,
      ),
    ]
  }
  return [firstPoint, lastPoint]
}

function removeDuplicatePoints(pointList, epsilon) {
  return pointList.reduce((accumulatedPoints, point) => {
    const previousPoint = accumulatedPoints[accumulatedPoints.length - 1]

    if (!previousPoint) {
      return [point]
    }

    const pointDistance = distanceFromPointToPoint(point, previousPoint)

    if (pointDistance < epsilon) {
      return accumulatedPoints
    }

    return [...accumulatedPoints, point]
  }, [])
}

function getPhonemeNodeAbsolutePoints(phonemeNode) {
  const frequencyAttribute = phonemeNode.getAttribute('f0')
  const duration = parseFloat(phonemeNode.getAttribute('d'))
  const endMilliseconds = 1000 * parseFloat(phonemeNode.getAttribute('end'))

  const startMilliseconds = endMilliseconds - duration

  return frequencyAttribute
    .replace(/^\(|\)$/g, '')
    .split(')(')
    .map(rawPointString => rawPointString.split(','))
    .map(([x, y]) => ({
      x: startMilliseconds + 0.01 * parseFloat(x) * duration,
      y: parseFloat(y),
    }))
}

function removeDuplicatePhonemeBoundaryPoints(
  pointList,
  previousPhonemeNode,
  epsilon,
) {
  const previousFrequencyAttribute = previousPhonemeNode?.getAttribute('f0')

  if (previousFrequencyAttribute) {
    const previousFrequencyPoints =
      getPhonemeNodeAbsolutePoints(previousPhonemeNode)

    const lastPreviousPhonemePoint =
      previousFrequencyPoints[previousFrequencyPoints.length - 1]
    const [firstPhonemePoint, ...otherPoints] = pointList

    const previousPhonemeDistance = distanceFromPointToPoint(
      firstPhonemePoint,
      lastPreviousPhonemePoint,
    )

    if (previousPhonemeDistance < epsilon) {
      return otherPoints
    }
  }

  return pointList
}

export default function simplifyAcoustParamsDocument(acoustParamsDocument) {
  const clonedAcoustParamsDocument = acoustParamsDocument.cloneNode(true)

  const evaluator = new XPathEvaluator()

  const expression = evaluator.createExpression('//ph')

  const phonemeNodesResult = expression.evaluate(
    clonedAcoustParamsDocument,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
  )

  for (
    let phonemeIndex = 0;
    phonemeIndex < phonemeNodesResult.snapshotLength;
    phonemeIndex += 1
  ) {
    const phonemeNode = phonemeNodesResult.snapshotItem(phonemeIndex)
    const previousPhonemeNode =
      phonemeIndex - 1 >= 0
        ? phonemeNodesResult.snapshotItem(phonemeIndex - 1)
        : null

    const frequencyAttribute = phonemeNode.getAttribute('f0')

    if (frequencyAttribute) {
      const frequencyPoints = getPhonemeNodeAbsolutePoints(phonemeNode)

      const simplifiedFrequencyPoints = [
        points => douglasPeuckerSimplification(points, 5),
        points => removeDuplicatePoints(points, 15),
        points =>
          removeDuplicatePhonemeBoundaryPoints(points, previousPhonemeNode, 15),
      ].reduce((points, fn) => fn(points), frequencyPoints)

      const duration = parseFloat(phonemeNode.getAttribute('d'))
      const endMilliseconds = 1000 * parseFloat(phonemeNode.getAttribute('end'))

      const startMilliseconds = endMilliseconds - duration

      phonemeNode.setAttribute(
        'f0',
        `(${simplifiedFrequencyPoints
          .map(
            ({ x, y }) =>
              `${Math.round(((x - startMilliseconds) * 100) / duration)},${y}`,
          )
          .join(')(')})`,
      )
    }
  }

  return clonedAcoustParamsDocument
}
