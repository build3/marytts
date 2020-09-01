from flask import abort, Blueprint, Response, request

from marytts_processor import process_phonemes, process_voice_output


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


@gateway_bp.route('/phonemes', methods=['POST'])
def get_xml_from_marytts():
    text = request.json.get('input_text')
    locale = request.json.get('locale', 'en_US')
    voice = request.json.get('voice', 'cmu-bdl-hsmm')

    if not text:
        abort(400, 'input_text property is required')

    return Response(data, mimetype='application/xml', status=status)
