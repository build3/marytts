/* eslint-disable no-unused-vars */
import { maxIndex } from 'd3'

export function transformRawVoiceTypes(rawVoiceTypes) {
  return rawVoiceTypes
    .trim()
    .split('\n')
    .map(rawVoiceType => {
      const voiceTypeData = (rawVoiceType ?? '').trim().split(' ')

      if (voiceTypeData.some(data => !data)) {
        return null
      }

      const [type, locale, sex] = voiceTypeData

      return {
        type,
        locale,
        sex,
      }
    })
    .filter(rawVoiceType => Boolean(rawVoiceType))
    .sort((voiceA, voiceB) => {
      const voiceLocaleCompare = voiceA.locale.localeCompare(voiceB.locale)
      const voiceSexCompare = voiceA.sex.localeCompare(voiceB.sex)
      const voiceTypeCompare = voiceA.type.localeCompare(voiceB.type)

      return voiceLocaleCompare || voiceSexCompare || voiceTypeCompare
    })
}

export function transformProcessBlobToStream(processBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      resolve(reader.result)
    }

    reader.onerror = () => {
      reject(new Error('Error loading blob'))
    }

    reader.readAsDataURL(processBlob)
  })
}

export function transformAcoustParamsXmlToPhrases(rawAcoustParamsXml) {
  const parser = new DOMParser()

  const [, beginDocumentTags, documentContent, endDocumentTags] =
    rawAcoustParamsXml.match(
      /(<\?xml.+?><maryxml.+?>)([\s\S]+?)(<\/maryxml>)/m,
    ) ?? []

  const acoustParamsDocument = parser.parseFromString(
    documentContent.trim(),
    'text/xml',
  )

  const evaluator = new XPathEvaluator()

  const expression = evaluator.createExpression('//phrase')

  const phraseNodesResult = expression.evaluate(
    acoustParamsDocument,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
  )

  const phraseNodes = []

  for (
    let phraseIndex = 0;
    phraseIndex < phraseNodesResult.snapshotLength;
    phraseIndex += 1
  ) {
    const phraseNode = phraseNodesResult.snapshotItem(phraseIndex)

    phraseNodes.push(phraseNode)
  }

  return {
    beginDocumentTags,
    endDocumentTags,
    acoustParamsDocument,
    phraseNodes,
  }
}

export function transformPhraseNodesToDataset(phraseNodes) {
  const evaluator = new XPathEvaluator()
  const phonemeExpression = evaluator.createExpression(
    'descendant::ph | descendant::boundary',
  )

  return phraseNodes
    .reduce((accumulatedDataset, phraseNode, phraseNodeIndex) => {
      const phonemeNodesResult = phonemeExpression.evaluate(
        phraseNode,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      )

      const previousPhraseData = accumulatedDataset[phraseNodeIndex - 1]
      const phonemesList = []

      for (
        let phonemeIndex = 0;
        phonemeIndex < phonemeNodesResult.snapshotLength;
        phonemeIndex += 1
      ) {
        const phonemeNode = phonemeNodesResult.snapshotItem(phonemeIndex)

        phonemesList.push(phonemeNode)
      }

      const phonemesData = []
      let accumulatedPhonemeStart = previousPhraseData?.duration ?? 0

      phonemesList.forEach((phonemeNode, phonemeIndex) => {
        const lastPhonemeData = phonemesData[phonemesData.length - 1]
        const lastPhonemeNotDrawn =
          lastPhonemeData?.voiced && lastPhonemeData?.notDrawn

        const nextPhonemeNode = phonemesList[phonemeIndex + 1]

        if (phonemeNode.nodeName === 'ph') {
          const duration = parseFloat(phonemeNode.getAttribute('d'))
          const phonemeName = phonemeNode.getAttribute('p')
          const frequencyList = phonemeNode.getAttribute('f0')

          if (frequencyList) {
            const parsedFrequencies = frequencyList
              .replace(/^\(|\)$/g, '')
              .split(')(')
              .map(frequencyPair =>
                frequencyPair.split(',').map(value => parseFloat(value)),
              )

            phonemesData.push({
              x: accumulatedPhonemeStart,
              y: lastPhonemeNotDrawn ? lastPhonemeData.y : 0,
              phonemeName,
              node: lastPhonemeNotDrawn ? lastPhonemeData.node : phonemeNode,
              nodeFrequencyIndex: lastPhonemeNotDrawn
                ? lastPhonemeData.nodeFrequencyIndex
                : null,
              type: 'phoneme',
              phraseIndex: phraseNodeIndex,
              voiced: true,
              editable: lastPhonemeNotDrawn,
            })

            parsedFrequencies.forEach(
              ([progress, frequency], frequencyIndex) => {
                phonemesData.push({
                  x: accumulatedPhonemeStart + 0.01 * progress * duration,
                  y: frequency,
                  node: phonemeNode,
                  nodeFrequencyIndex: frequencyIndex,
                  phonemeName,
                  repeated: progress !== 0,
                  type: 'phoneme',
                  phraseIndex: phraseNodeIndex,
                  notDrawn:
                    progress === 100 &&
                    nextPhonemeNode?.nodeName !== 'boundary',
                  voiced: true,
                  editable: true,
                })
              },
            )

            accumulatedPhonemeStart += duration
          } else {
            phonemesData.push({
              x: accumulatedPhonemeStart,
              y:
                lastPhonemeData?.voiced && lastPhonemeData?.notDrawn
                  ? lastPhonemeData.y
                  : 0,
              node: lastPhonemeNotDrawn ? lastPhonemeData.node : phonemeNode,
              nodeFrequencyIndex: lastPhonemeNotDrawn
                ? lastPhonemeData.nodeFrequencyIndex
                : null,
              phonemeName,
              type: 'phoneme',
              phraseIndex: phraseNodeIndex,
              voiced: false,
              editable: lastPhonemeNotDrawn,
            })

            if (nextPhonemeNode?.nodeName !== 'boundary') {
              accumulatedPhonemeStart += duration
            }
          }
        }

        if (phonemeNode.nodeName === 'boundary') {
          const duration = parseFloat(phonemeNode.getAttribute('duration'))

          if (phraseNodeIndex < phraseNodes.length - 1) {
            phonemesData.push({
              x: accumulatedPhonemeStart,
              duration,
              node: phonemeNode,
              type: 'pause',
              phraseIndex: phraseNodeIndex,
            })

            accumulatedPhonemeStart += 100
          }
        }
      })

      return [
        ...accumulatedDataset,
        { phonemesData, duration: accumulatedPhonemeStart },
      ]
    }, [])
    .flatMap(({ phonemesData }) => phonemesData)
}

export function getInputTextFromType({
  inputType,
  inputText,
  inputXmlFile,
  simplifiedExportXmlContent,
  simplified,
}) {
  return new Promise((resolve, reject) => {
    switch (inputType) {
      case 'TEXT': {
        resolve(inputText)
        break
      }
      case 'ACOUSTPARAMS': {
        if (simplified) {
          resolve(simplifiedExportXmlContent)
          break
        }

        const fileReader = new FileReader()

        fileReader.addEventListener('load', () => {
          resolve(fileReader.result)
        })

        fileReader.addEventListener('error', () => {
          reject(new Error('Failed to read XML file'))
        })

        fileReader.readAsText(inputXmlFile)

        break
      }
      default: {
        reject(new Error('Invalid input type provided'))
        break
      }
    }
  })
}

export function getExportXmlContent({
  beginDocumentTags,
  endDocumentTags,
  acoustParamsDocument,
}) {
  const serializer = new XMLSerializer()

  const documentContent = serializer.serializeToString(acoustParamsDocument)

  return beginDocumentTags + documentContent + endDocumentTags
}

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
  return pointList.reduce((accumulatedPoints, point, pointIndex) => {
    const previousPoint = accumulatedPoints[accumulatedPoints.length - 1]

    if (!previousPoint) {
      return [point]
    }

    const pointDistance = distanceFromPointToPoint(point, previousPoint)

    if (pointDistance < epsilon && pointIndex !== pointList.length - 1) {
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

export function simplifyAcoustParamsDocument(acoustParamsDocument) {
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
        points => douglasPeuckerSimplification(points, 1),
        points => removeDuplicatePoints(points, 10),
        points =>
          removeDuplicatePhonemeBoundaryPoints(points, previousPhonemeNode, 10),
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
