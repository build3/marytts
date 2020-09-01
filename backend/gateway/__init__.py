from flask import abort, Blueprint, Response, request
from werkzeug.datastructures import MultiDict

from marytts_processor import get_xml, process_phonemes, process_voice_output

from .forms import MaryTTSForm


gateway_bp = Blueprint('mtts', __name__)


@gateway_bp.route('/audio-voice', methods=['POST'])
def get_voice_output():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    content, mimetype, status = process_voice_output(form.data['input_text'], form.data['locale'], form.data['voice'])
    return Response(content, mimetype=mimetype, status=status)


@gateway_bp.route('/phonemes', methods=['POST'])
def get_phonemes():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    data, status = process_phonemes(form.data['input_text'], form.data['locale'], form.data['voice'])

    return Response(data, mimetype='application/json', status=status)


@gateway_bp.route('/phonemes/xml', methods=['GET'])
def get_xml_from_marytts():
    form = MaryTTSForm(request.args, meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    data, status, mimetype = get_xml(form.data['input_text'], form.data['locale'], form.data['voice'])

    response = Response(data, mimetype=mimetype, status=status)
    response.headers['Content-Disposition'] = f'attachment; filename=marytts.xml'

    return response
