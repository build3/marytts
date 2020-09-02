from flask_wtf import FlaskForm

from wtforms import StringField
from wtforms.validators import DataRequired


class MaryTTSForm(FlaskForm):
    input_text = StringField(validators=[DataRequired()])
    locale = StringField(default='en_US')
    voice = StringField(default='cmu-bdl-hsmm')
