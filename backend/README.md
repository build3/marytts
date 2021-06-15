## MaryTTS Backend

Following document describes MaryTTS API. It consists of
a few endpoints to generate an audio from text or xml file,
simplify the audio and generated audio with modified frequency
phonemes. It provides endpoints listing all phonemes with their
parameters.

<details>
<summary>Generate audio from text</summary>

### Generate audio from text

METHOD: `POST`

URL: `/audio-voice`

#### Sample Body:
```JSON
{
  "input_text": "<text>",
  "locale": "<locale>",
  "voice": "<voice>"
}
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Response:

The audio file

</details>
<details>

<summary>Generate simplified audio from text</summary>

### Generate simplified audio from text

METHOD: `POST`

URL: `/audio-voice/simplify`

#### Sample Body:
```JSON
{
  "input_text": "<text>",
  "locale": "<locale>",
  "voice": "<voice>"
}
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Response:

The simplified audio file

</details>
<details>

<summary>Generate audio with modified frequence of phonemes based on text</summary>

### Generate audio with modified frequence of phonemes based on text

METHOD: `POST`

URL: `/audio-voice/simplify`

#### Sample Body:
```JSON
{
  "input_text": "<text>",
  "locale": "<locale>",
  "voice": "<voice>",
  "modifiers": [
    {
      "phoneme_name": "<phoneme_name>",
      "ms": 200,
      "hertz": 60
    }
  ]
}
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

`modifiers` has to contain at least one modifier for every phoneme

#### Response:

The audio file with modified frequency of phonemes

</details>
<details>

<summary>Get phonemes for given text</summary>

### Get phonemes for given text

METHOD: `POST`

URL: `/phonemes`

#### Sample Body:
```JSON
{
  "input_text": "<text>",
  "locale": "<locale>",
  "voice": "<voice>",
}
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Sample Response:

```JSON
[
  {
    "phoneme_name": "<phoneme_name>",
    "ms": 200,
    "hertz": 60
  }
]
```

</details>
<details>

<summary>Get simplified phonemes for given text</summary>

### Get simplified phonemes for given text

METHOD: `POST`

URL: `/phonemes/simplify`

#### Sample Body:
```JSON
{
  "input_text": "<text>",
  "locale": "<locale>",
  "voice": "<voice>",
}
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Sample Response:

```JSON
[
  {
    "phoneme_name": "<phoneme_name>",
    "ms": 200,
    "hertz": 60
  }
]
```

</details>
<details>

<summary>Get XML file for audio generated based on text</summary>

### Get XML file for audio generated based on text

METHOD: `POST`

URL: `/phonemes/xml`

#### Sample Body:
```
Mulitpart form
"input_text": "<text>"
"locale": "<locale>"
"voice": "<voice>"
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Response:

The XML file

</details>
<details>

<summary>Get XML file for audio generated based on text and modified phonemes</summary>

### Get XML file for audio generated based on text and modified phonemes

METHOD: `POST`

URL: `/phonemes/xml/edited`

#### Sample Body:
```
Mulitpart form
"input_text": "<text>"
"locale": "<locale>"
"voice": "<voice>"
"modifiers": [
  {
    "phoneme_name": "<phoneme_name>",
    "ms": 200,
    "hertz": 60
  }
]
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

`modifiers` has to contain at least one modifier for every phoneme

#### Response:

The XML file

</details>
<details>

<summary>Get XML file for audio generated based on other xml and modified phonemes</summary>

### Get XML file for audio generated based on other xml and modified phonemes

METHOD: `POST`

URL: `xml/phonemes/xml/edited`

#### Sample Body:
```
Mulitpart form
"xml": "xml file"
"locale": "<locale>"
"voice": "<voice>"
"modifiers": [
  {
    "phoneme_name": "<phoneme_name>",
    "ms": 200,
    "hertz": 60
  }
]
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

`modifiers` has to contain at least one modifier for every phoneme

#### Response:

The XML file

</details>
<details>

<summary>Generate audio from xml</summary>

### Generate audio from xml

METHOD: `POST`

URL: `/xml/audio-voice`

#### Sample Body:
```
Mulitpart form
"xml": "xml file",
"locale": "<locale>",
"voice": "<voice>"
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Response:

The audio file

</details>
<details>

<summary>Generate simplified audio from xml</summary>

### Generate simplified audio from xml

METHOD: `POST`

URL: `/xml/audio-voice/simplify`

#### Sample Body:
```
Mulitpart form
"xml": "xml file",
"locale": "<locale>",
"voice": "<voice>"
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Response:

The audio file

</details>
<details>

<summary>Generate simplified audio with modified frequency of phonemes based on xml</summary>

### Generate simplified audio with modified frequency of phonemes based on xml

METHOD: `POST`

URL: `/xml/audio-voice/simplify`

#### Sample Body:
```
Mulitpart form
"xml": "xml file",
"locale": "<locale>",
"voice": "<voice>"
"modifiers": [
  {
    "phoneme_name": "<phoneme_name>",
    "ms": 200,
    "hertz": 60
  }
]
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

`modifiers` has to contain at least one modifier for every phoneme

#### Response:

The audio file

</details>
<details>

<summary>Get phonemes for given xml</summary>

### Get phonemes for given xml

METHOD: `POST`

URL: `/xml/phonemes`

#### Sample Body:
```
Mulitpart form
"xml": "xml file",
"locale": "<locale>",
"voice": "<voice>",
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

`modifiers` has to contain at least one modifier for every phoneme

#### Sample Response:

```JSON
[
  {
    "phoneme_name": "<phoneme_name>",
    "ms": 200,
    "hertz": 60
  }
]
```

</details>
<details>

<summary>Get simplfied phonemes for given xml</summary>

### Get simplfied phonemes for given xml

METHOD: `POST`

URL: `/xml/phonemes`

#### Sample Body:
```
Mulitpart form
"xml": "xml file",
"locale": "<locale>",
"voice": "<voice>",
```

Default values:
* `locale`: `en_US`
* `voice`: `cmu-bdl-hsmm`

`input_text` is mandatory

#### Sample Response:

```JSON
[
  {
    "phoneme_name": "<phoneme_name>",
    "ms": 200,
    "hertz": 60
  }
]
```
</details>
