export default function transformAcoustParamsXmlToPhrases(rawAcoustParamsXml) {
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
