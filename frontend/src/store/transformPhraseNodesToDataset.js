export default function transformPhraseNodesToDataset(phraseNodes) {
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
              originalNode: phonemeNode,
              nodeFrequencyIndex: lastPhonemeNotDrawn
                ? lastPhonemeData.nodeFrequencyIndex
                : null,
              type: 'phoneme',
              duration,
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
                  duration,
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
              duration,
              phraseIndex: phraseNodeIndex,
              voiced: false,
              editable: lastPhonemeNotDrawn,
            })

            accumulatedPhonemeStart += duration

            if (nextPhonemeNode?.nodeName === 'boundary') {
              phonemesData.push({
                x: accumulatedPhonemeStart,
                y: 0,
                node: phonemeNode,
                nodeFrequencyIndex: null,
                phonemeName,
                type: 'phoneme',
                duration,
                phraseIndex: phraseNodeIndex,
                repeated: true,
                voiced: false,
                editable: false,
              })
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
