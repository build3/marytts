import json
from flask import abort, Blueprint, Response, request
from werkzeug.datastructures import MultiDict

from marytts_processor import *

from .forms import MaryTTSForm


gateway_bp = Blueprint('mtts', __name__)


@gateway_bp.route('/audio-voice', methods=['POST'])
def get_voice_output():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    content, mimetype, status = process_voice_output(*_get_form_data(form))

    return Response(content, mimetype=mimetype, status=status)


@gateway_bp.route('/audio-voice/simplify', methods=['POST'])
def get_simplified_voice_output():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    content, mimetype, status = process_simplified_voice_output(*_get_form_data(form))
    return Response(content, mimetype=mimetype, status=status)


@gateway_bp.route('/audio-voice/edited', methods=['POST'])
def get_simplified_voice_output_with_modifiers():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})
    modifiers = request.json.get('modifiers')

    if not form.validate():
        abort(400, form.errors)

    modifiers = [
        Point(
            phoneme=modifier['phoneme_name'],
            ms=modifier['ms'],
            hz=modifier['hertz']
        ) for modifier in modifiers
    ]

    text, locale, voice = _get_form_data(form)
    content, mimetype, status = process_voice_output_from_text_and_points(text, modifiers, locale, voice)
    return Response(content, mimetype=mimetype, status=status)


@gateway_bp.route('/phonemes', methods=['POST'])
def get_phonemes():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    data, status = process_phonemes(*_get_form_data(form))

    return Response(data, mimetype='application/json', status=status)

@gateway_bp.route('/phonemes/simplify', methods=['POST'])
def get_simplified_phonemes():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    data, status = process_simplified_phonemes(*_get_form_data(form))

    return Response(data, mimetype='application/json', status=status)


@gateway_bp.route('/phonemes/xml', methods=['POST'])
def get_xml_from_marytts():
    form = MaryTTSForm(MultiDict(request.json), meta={'csrf': False})

    if not form.validate():
        abort(400, form.errors)

    data, status, mimetype = get_xml(*_get_form_data(form))

    response = Response(data, mimetype=mimetype, status=status)
    response.headers['Content-Disposition'] = f'attachment; filename=marytts.xml'

    return response


@gateway_bp.route('/phonemes/xml/edited', methods=['POST'])
def get_xml_from_marytts_with_modifiers():
    form = MaryTTSForm(request.form, meta={'csrf': False})
    modifiers = json.loads(request.form.get('modifiers'))

    if not form.validate():
        abort(400, form.errors)

    modifiers = [
        Point(
            phoneme=modifier['phoneme_name'],
            ms=modifier['ms'],
            hz=modifier['hertz']
        ) for modifier in modifiers
    ]

    text, locale, voice = _get_form_data(form)
    data, status, mimetype = get_xml_from_text_and_modifiers(text, modifiers, locale, voice)

    response = Response(data, mimetype=mimetype, status=status)
    response.headers['Content-Disposition'] = f'attachment; filename=marytts.xml'

    return response


@gateway_bp.route('/xml/phonemes/xml/edited', methods=['POST'])
def get_xml_from_xml_with_modifiers():
    xml_file = request.files.get('xml')
    locale = request.form.get('locale', 'en_US')
    voice = request.form.get('voice', 'cmu-bdl-hsmm')
    modifiers = json.loads(request.form.get('modifiers'))

    modifiers = [
        Point(
            phoneme=modifier['phoneme_name'],
            ms=modifier['ms'],
            hz=modifier['hertz']
        ) for modifier in modifiers
    ]

    xml = xml_file.read().decode('utf-8')
    data, status, mimetype = get_xml_from_xml_and_modifiers(xml, modifiers, locale, voice)

    response = Response(data, mimetype=mimetype, status=status)
    response.headers['Content-Disposition'] = f'attachment; filename=marytts.xml'

    return response


def _get_form_data(form: MaryTTSForm) -> tuple:
    return form.data['input_text'], form.data['locale'], form.data['voice']


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


@gateway_bp.route('/xml/audio-voice/simplify', methods=['POST'])
def get_simplified_voice_output_from_xml():
    xml_file = request.files.get('xml')

    locale = request.form.get('locale', 'en_US')
    voice = request.form.get('voice', 'cmu-bdl-hsmm')

    if not xml_file:
        abort(400, {"xml": ["XML file is required."]})

    xml = xml_file.read().decode('utf-8')

    content, mimetype, status = process_simplified_voice_output_from_xml(xml, locale, voice)
    return Response(content, mimetype=mimetype, status=status)


@gateway_bp.route('/xml/audio-voice/edited', methods=['POST'])
def get_simplified_voice_output_from_xml_with_modifiers():
    xml_file = request.files.get('xml')
    locale = request.form.get('locale', 'en_US')
    voice = request.form.get('voice', 'cmu-bdl-hsmm')
    modifiers = json.loads(request.form.get('modifiers'))

    if not xml_file:
        abort(400, {"xml": ["XML file is required."]})

    modifiers = [
        Point(
            phoneme=modifier['phoneme_name'],
            ms=modifier['ms'],
            hz=modifier['hertz']
        ) for modifier in modifiers
    ]

    xml = xml_file.read().decode('utf-8')
    content, mimetype, status = process_voice_output_from_xml_and_modifiers(xml, modifiers, locale, voice)

    return Response(content, mimetype=mimetype, status=status)


@gateway_bp.route('/xml/phonemes', methods=['POST'])
def get_phonemes_from_xml():
    xml_file = request.files.get('xml')

    if not xml_file:
        abort(400, {"xml": ["XML file is required."]})

    data, status = process_phonemes_from_xml(xml_file.read())
    return Response(data, mimetype='application/json', status=status)


@gateway_bp.route('/xml/phonemes/simplify', methods=['POST'])
def get_simplified_phonemes_from_xml():
    xml_file = request.files.get('xml')

    if not xml_file:
        abort(400, {"xml": ["XML file is required."]})

    data, status = process_simplified_phonemes_from_xml(xml_file.read())
    return Response(data, mimetype='application/json', status=status)
