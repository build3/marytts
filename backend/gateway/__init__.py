from flask import abort, Blueprint, Response, request

from marytts_processor import process_voice_output


gateway_bp = Blueprint('mtts', __name__)


@gateway_bp.route('/audio-voice', methods=['POST'])
def get_voice_output():
    text = request.json.get('input_text')

    if not text:
        abort(400, 'input_text property is required')

    content, mimetype = process_voice_output(text)
    return Response(content, mimetype=mimetype)
