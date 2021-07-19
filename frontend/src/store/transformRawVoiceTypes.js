export default function transformRawVoiceTypes(rawVoiceTypes) {
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
