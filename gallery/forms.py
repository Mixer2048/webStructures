import os
from django.core.exceptions import ValidationError

from django import forms
from .models import Asset

class AssetForm(forms.ModelForm):
    class Meta:
        model = Asset
        fields = ['title', 'file']
        widgets = {'title': forms.TextInput(attrs={'placeholder': 'Название модели'}),}

    def clean_file(self):
        file = self.cleaned_data['file']
        ext = os.path.splitext(file.name)[1].lower()
        valid_extensions = ['.glb', '.gltf']
        if ext not in valid_extensions:
            raise ValidationError('Не тот файл. Пойдёт только .glb или .gltf')
        return file
