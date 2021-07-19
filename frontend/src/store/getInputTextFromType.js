export default function getInputTextFromType({
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
