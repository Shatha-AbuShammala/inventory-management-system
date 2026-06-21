from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from inventory.models import Product, StockMovement
from suppliers.models import Supplier


@login_required
def index(request):
    total_products = Product.objects.count()

    total_stock_in = StockMovement.objects.filter(
        movement_type=StockMovement.MovementType.STOCK_IN
    ).count()

    total_stock_out = StockMovement.objects.filter(
        movement_type=StockMovement.MovementType.STOCK_OUT
    ).count()

    active_suppliers = Supplier.objects.filter(
        status=Supplier.Status.ACTIVE
    ).count()

    recent_activity = StockMovement.objects.select_related(
        'product', 'updated_by'
    ).order_by('-date')[:6]

    low_stock_products = [p for p in Product.objects.all() if p.is_low_stock]

    context = {
        'total_products': total_products,
        'total_stock_in': total_stock_in,
        'total_stock_out': total_stock_out,
        'active_suppliers': active_suppliers,
        'recent_activity': recent_activity,
        'low_stock_products': low_stock_products,
        'low_stock_count': len(low_stock_products),
    }
    return render(request, 'dashboard/index.html', context)