function adjustSyllablePhonemes(acoustParamsDocument) {
  const evaluator = new XPathEvaluator()
  const syllableExpression = evaluator.createExpression('descendant::syllable')

  const phonemeExpression = evaluator.createExpression('descendant::ph')

  const syllableResult = syllableExpression.evaluate(
    acoustParamsDocument,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
  )

  for (
    let syllableIndex = 0;
    syllableIndex < syllableResult.snapshotLength;
    syllableIndex += 1
  ) {
    const syllableNode = syllableResult.snapshotItem(syllableIndex)

    const phonemeResult = phonemeExpression.evaluate(
      syllableNode,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    )

    const phonemeNames = []

    for (
      let phonemeIndex = 0;
      phonemeIndex < phonemeResult.snapshotLength;
      phonemeIndex += 1
    ) {
      const phonemeNode = phonemeResult.snapshotItem(phonemeIndex)

      phonemeNames.push(phonemeNode.getAttribute('p'))
    }

    syllableNode.setAttribute('ph', phonemeNames.join(' '))
  }
}

function adjustTokenPhonemes(acoustParamsDocument) {
  const evaluator = new XPathEvaluator()
  const tokenExpression = evaluator.createExpression('descendant::t')

  const syllableExpression = evaluator.createExpression('descendant::syllable')

  const tokenResult = tokenExpression.evaluate(
    acoustParamsDocument,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
  )

  for (
    let tokenIndex = 0;
    tokenIndex < tokenResult.snapshotLength;
    tokenIndex += 1
  ) {
    const tokenNode = tokenResult.snapshotItem(tokenIndex)

    const syllableResult = syllableExpression.evaluate(
      tokenNode,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    )

    if (syllableResult.snapshotLength > 0) {
      const syllablePhonemes = []

      for (
        let syllableIndex = 0;
        syllableIndex < syllableResult.snapshotLength;
        syllableIndex += 1
      ) {
        const syllableNode = syllableResult.snapshotItem(syllableIndex)
        const hasStress = Boolean(
          parseInt(syllableNode.getAttribute('stress'), 10),
        )

        syllablePhonemes.push(
          `${hasStress ? "' " : ''}${syllableNode.getAttribute('ph')}`,
        )
      }

      tokenNode.setAttribute('ph', syllablePhonemes.join(' - '))
    }
  }
}

export default function getExportXmlContent({
  beginDocumentTags,
  endDocumentTags,
  acoustParamsDocument,
}) {
  const serializer = new XMLSerializer()

  adjustSyllablePhonemes(acoustParamsDocument)
  adjustTokenPhonemes(acoustParamsDocument)

  const documentContent = serializer.serializeToString(acoustParamsDocument)

  return beginDocumentTags + documentContent + endDocumentTags
}
