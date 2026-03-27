from django.shortcuts import render, redirect
from django.db.models import Q
from .models import Asset
from .forms import AssetForm
import base64
from django.core.files.base import ContentFile
from django.utils import timezone
from django.core.paginator import Paginator
from django.contrib import messages

#def about(request):
#    return HttpResponse("Курс Web структуры")

def home(request):
    search_query = request.GET.get('q', '')
    ordering = request.GET.get('ordering', 'new')

    #assets = Asset.objects.all().order_by('-created_at')
    assets = Asset.objects.all()

    if search_query:
        assets = assets.filter(title__icontains=search_query)

    if ordering == 'old':
        assets = assets.order_by('created_at')
    elif ordering == 'name':
        assets = assets.order_by('title')
    #elif ordering == 'timezone':
        #assets.filter(created_at__gte=timezone.now() - timedelta(days=1))
    else:
        assets = assets.order_by('-created_at')

    paginator = Paginator(assets, 8)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context_data ={
        'page_title': 'Главная Галерея',
        #'assets': assets,
        'page_obj': page_obj,
    }

    return render(request, 'gallery/index.html', context_data)

def about(request):
    return render(request, 'gallery/about.html')

#def upload(request):
#    return render(request, 'gallery/upload.html')

def upload(request):
    if request.method == 'POST':
        form = AssetForm(request.POST, request.FILES)

        if form.is_valid():
            new_asset = form.save(commit = False)
            image_data = request.POST.get('image_data')
            if image_data:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1]
                data = base64.b64decode(imgstr)
                file_name = f"{new_asset.title}_thumb.{ext}"
                new_asset.image.save(file_name, ContentFile(data), save=False)
            new_asset.save()
            #form.save()
            messages.success(request, f'Модель "{new_asset.title}" успешно загружена!')
            return redirect('home')
    else:
        form = AssetForm()
    
    return render(request, 'gallery/upload.html', {'form': form})