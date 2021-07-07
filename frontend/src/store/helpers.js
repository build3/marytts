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
