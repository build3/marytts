/* eslint-disable camelcase */

const parser = new DOMParser()
const evaluator = new XPathEvaluator()

const allophoneDictionaries = {
  de: () => import('../allophones/allophones.de.xml'),
  en_GB: () => import('../allophones/allophones.en_GB.xml'),
  en_US: () => import('../allophones/allophones.en_US.xml'),
  fr: () => import('../allophones/allophones.fr.xml'),
  it: () => import('../allophones/allophones.it.xml'),
  ru: () => import('../allophones/allophones.ru.xml'),
  te: () => import('../allophones/allophones.te.xml'),
  tr: () => import('../allophones/allophones.tr.xml'),
}

export default async function processAllophoneDictionaries() {
  const allophoneDictionaryData = await Promise.all(
    Object.entries(allophoneDictionaries).map(
      async ([locale, dictionaryXmlImport]) => {
        const vowels = []
        const consonants = []

        const { default: dictionaryXml } = await dictionaryXmlImport()

        const dictionaryDocument = parser.parseFromString(
          dictionaryXml,
          'text/xml',
        )

        const vowelExpression = evaluator.createExpression('//vowel')

        const vowelResult = vowelExpression.evaluate(
          dictionaryDocument,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        )

        for (
          let vowelIndex = 0;
          vowelIndex < vowelResult.snapshotLength;
          vowelIndex += 1
        ) {
          const vowelNode = vowelResult.snapshotItem(vowelIndex)

          vowels.push(vowelNode.getAttribute('ph'))
        }

        const consonantExpression = evaluator.createExpression('//consonant')

        const consonantResult = consonantExpression.evaluate(
          dictionaryDocument,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        )

        for (
          let consonantIndex = 0;
          consonantIndex < consonantResult.snapshotLength;
          consonantIndex += 1
        ) {
          const consonantNode = consonantResult.snapshotItem(consonantIndex)

          consonants.push(consonantNode.getAttribute('ph'))
        }

        return { vowels, consonants, locale }
      },
    ),
  )

  return allophoneDictionaryData.reduce(
    (accumulatedDictionaries, { vowels, consonants, locale }) => ({
      ...accumulatedDictionaries,
      [locale]: {
        vowels,
        consonants,
      },
    }),
    {},
  )
}
