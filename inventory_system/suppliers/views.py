from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.http import require_POST
from .models import Supplier
from .forms import SupplierForm


@login_required
def supplier_list(request):
    return render(request, 'suppliers/partials/supplier_list.html')


@login_required
def supplier_table_ajax(request):
    query = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    page_number = request.GET.get('page', 1)
    try:
       page_number = int(page_number)
       if page_number < 1:
        page_number = 1
    except (ValueError, TypeError):
        page_number = 1

    suppliers = Supplier.objects.prefetch_related('products').all()

    if query:
        suppliers = suppliers.filter(name__icontains=query)

    if status:
        suppliers = suppliers.filter(status=status)

    paginator = Paginator(suppliers, 8)
    page_obj = paginator.get_page(page_number)

    html = render_to_string('suppliers/partials/supplier_table.html', {
        'page_obj': page_obj,
        'paginator': paginator,
    }, request=request)

    return JsonResponse({'html': html, 'count': paginator.count})


@login_required
def supplier_form_ajax(request, pk=None):
    supplier = get_object_or_404(Supplier, pk=pk) if pk else None
    form = SupplierForm(instance=supplier)

    html = render_to_string('suppliers/partials/supplier_form.html', {
        'form': form,
        'supplier': supplier,
    }, request=request)

    return JsonResponse({'html': html})


@login_required
@require_POST
def supplier_save_ajax(request, pk=None):
    supplier = get_object_or_404(Supplier, pk=pk) if pk else None
    form = SupplierForm(request.POST, instance=supplier)

    if form.is_valid():
        form.save()
        return JsonResponse({
            'success': True,
            'message': 'Supplier updated successfully.' if pk else 'Supplier added successfully.'
        })
    else:
        html = render_to_string('suppliers/partials/supplier_form.html', {
            'form': form,
            'supplier': supplier,
        }, request=request)
        return JsonResponse({'success': False, 'html': html}, status=400)


@login_required
@require_POST
def supplier_delete_ajax(request, pk):
    supplier = get_object_or_404(Supplier, pk=pk)
    supplier_name = supplier.name
    supplier.delete()
    return JsonResponse({'success': True, 'message': f'"{supplier_name}" deleted successfully.'})