export default function transformProcessBlobToStream(processBlob) {
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
