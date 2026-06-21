from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.http import require_POST
from .models import Product, Category
from .forms import ProductForm


@login_required
def product_list(request):
    categories = Category.objects.all()
    context = {'categories': categories}
    return render(request, 'inventory/partials/product_list.html', context)


@login_required
def product_table_ajax(request):
    query = request.GET.get('q', '').strip()
    category_id = request.GET.get('category', '')
    page_number = request.GET.get('page', 1)
    try:
        page_number = int(page_number)
        if page_number < 1:
           page_number = 1
    except (ValueError, TypeError):
        page_number = 1

    products = Product.objects.select_related('category', 'supplier', 'updated_by').all()

    if query:
        products = products.filter(name__icontains=query)

    if category_id:
        products = products.filter(category_id=category_id)

    paginator = Paginator(products, 8)  
    page_obj = paginator.get_page(page_number)

    html = render_to_string('inventory/partials/product_table.html', {
        'page_obj': page_obj,
        'paginator': paginator,
    }, request=request)

    return JsonResponse({
        'html': html,
        'count': paginator.count,
    })


@login_required
def product_form_ajax(request, pk=None):
    product = get_object_or_404(Product, pk=pk) if pk else None
    form = ProductForm(instance=product)

    html = render_to_string('inventory/partials/product_form.html', {
        'form': form,
        'product': product,
    }, request=request)

    return JsonResponse({'html': html})


@login_required
@require_POST
def product_save_ajax(request, pk=None):
    product = get_object_or_404(Product, pk=pk) if pk else None
    form = ProductForm(request.POST, instance=product)

    if form.is_valid():
        new_product = form.save(commit=False)
        new_product.updated_by = request.user
        new_product.save()
        return JsonResponse({
            'success': True,
            'message': 'Product updated successfully.' if pk else 'Product added successfully.'
        })
    else:
        html = render_to_string('inventory/partials/product_form.html', {
            'form': form,
            'product': product,
        }, request=request)
        return JsonResponse({'success': False, 'html': html}, status=400)


@login_required
@require_POST
def product_delete_ajax(request, pk):
    product = get_object_or_404(Product, pk=pk)
    product_name = product.name
    product.delete()
    return JsonResponse({'success': True, 'message': f'"{product_name}" deleted successfully.'})