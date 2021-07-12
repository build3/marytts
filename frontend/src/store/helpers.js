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

      phonemesList.forEach(phonemeNode => {
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
              y: parsedFrequencies[0][1] ?? 0,
              phonemeName,
              node: phonemeNode,
              nodeFrequencyIndex: null,
              type: 'phoneme',
              phraseIndex: phraseNodeIndex,
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
                })
              },
            )
          } else {
            phonemesData.push({
              x: accumulatedPhonemeStart,
              y: phonemesData[phonemesData.length - 1]?.y ?? 0,
              node: phonemeNode,
              phonemeName,
              hasNoFrequencies: true,
              type: 'phoneme',
              phraseIndex: phraseNodeIndex,
            })
          }

          accumulatedPhonemeStart += duration
        }

        if (phonemeNode.nodeName === 'boundary') {
          const duration = parseFloat(phonemeNode.getAttribute('duration'))

          phonemesData.push({
            x: accumulatedPhonemeStart,
            duration,
            node: phonemeNode,
            type: 'pause',
            phraseIndex: phraseNodeIndex,
          })

          accumulatedPhonemeStart += 100
        }
      })

      return [
        ...accumulatedDataset,
        { phonemesData, duration: accumulatedPhonemeStart },
      ]
    }, [])
    .flatMap(({ phonemesData }) => phonemesData)
}
