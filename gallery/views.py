from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Привет, это 3D хранилище<h1><p>Система работает.</p>")

def about(request):
    return HttpResponse("Курс Web структуры")

def test(request):
    return HttpResponse("тест")