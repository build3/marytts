from flask import abort, Blueprint, Response, request

from marytts_processor import process_phonemes, process_voice_output, process_voice_output_from_xml


gateway_bp = Blueprint('mtts', __name__)


@gateway_bp.route('/audio-voice', methods=['POST'])
def get_voice_output():
    text = request.json.get('input_text')
    locale = request.json.get('locale', 'en_US')
    voice = request.json.get('voice', 'cmu-bdl-hsmm')

    if not text:
        abort(400, 'input_text property is required')

    content, mimetype, status = process_voice_output(text, locale, voice)
    return Response(content, mimetype=mimetype, status=status)


@gateway_bp.route('/phonemes', methods=['POST'])
def get_phonemes():
    text = request.json.get('input_text')
    locale = request.json.get('locale', 'en_US')
    voice = request.json.get('voice', 'cmu-bdl-hsmm')

    if not text:
        abort(400, 'input_text property is required')

    data, status = process_phonemes(text, locale, voice)

    return Response(data, mimetype='application/json', status=status)


@gateway_bp.route('/xml/audio-voice', methods=['POST'])
def get_voice_output_from_xml():
    xml_file = request.files.get('xml')

    locale = request.form.get('locale', 'en_US')
    voice = request.form.get('voice', 'cmu-bdl-hsmm')

    if not xml_file:
        abort(400, {"xml": ["XML file is required."]})

    xml = xml_file.read().decode('utf-8')

    content, mimetype, status = process_voice_output_from_xml(xml, locale, voice)
    return Response(content, mimetype=mimetype, status=status)
