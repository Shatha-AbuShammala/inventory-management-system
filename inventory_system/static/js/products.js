$(document).ready(function () {

    let currentPage = 1;
    let deleteTargetId = null;

    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    function loadProducts(page = 1) {
        currentPage = page;
        const query = $('#searchInput').val();
        const category = $('#categoryFilter').val();

        $('#productTableContainer').html('<div class="text-center text-muted py-4">Loading...</div>');

        $.ajax({
            url: '/inventory/ajax/table/',
            method: 'GET',
            data: { q: query, category: category, page: page },
            success: function (response) {
                $('#productTableContainer').html(response.html);
            },
            error: function () {
                $('#productTableContainer').html('<div class="text-danger text-center py-4">Failed to load products.</div>');
            }
        });
    }

    loadProducts(); 

    let searchTimeout;
    $('#searchInput').on('keyup', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            loadProducts(1);
        }, 400);
    });

    $('#categoryFilter').on('change', function () {
        loadProducts(1);
    });

    $(document).on('click', '.page-link-ajax', function (e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (page) loadProducts(page);
    });

    $('#btnAddProduct').on('click', function () {
        $('#productModalTitle').text('Add New Product');
        $.ajax({
            url: '/inventory/ajax/form/',
            method: 'GET',
            success: function (response) {
                $('#productModalBody').html(response.html);
                $('#productForm').data('mode', 'create');
                productModal.show();
            }
        });
    });

    $(document).on('click', '.btn-edit', function () {
        const productId = $(this).data('id');
        $('#productModalTitle').text('Edit Product');
        $.ajax({
            url: '/inventory/ajax/form/' + productId + '/',
            method: 'GET',
            success: function (response) {
                $('#productModalBody').html(response.html);
                $('#productForm').data('mode', 'edit').data('id', productId);
                productModal.show();
            }
        });
    });

    
    $(document).on('submit', '#productForm', function (e) {
        e.preventDefault();

        const mode = $(this).data('mode');
        const productId = $(this).data('id');
        const url = mode === 'edit'
            ? '/inventory/ajax/save/' + productId + '/'
            : '/inventory/ajax/save/';

        const formData = $(this).serialize();
        const submitBtn = $('#productSubmitBtn');
        submitBtn.prop('disabled', true).text('Saving...');

        $.ajax({
            url: url,
            method: 'POST',
            data: formData,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                if (response.success) {
                    productModal.hide();
                    loadProducts(currentPage);
                    showToast(response.message, 'success');
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON && xhr.responseJSON.html) {
                    $('#productModalBody').html(xhr.responseJSON.html);
                }
            },
            complete: function () {
                submitBtn.prop('disabled', false).text(mode === 'edit' ? 'Update Product' : 'Add Product');
            }
        });
    });

    // ===== Modal: ensure delete=====
    $(document).on('click', '.btn-delete', function () {
        deleteTargetId = $(this).data('id');
        $('#deleteProductName').text($(this).data('name'));
        deleteModal.show();
    });

    
    $('#confirmDeleteBtn').on('click', function () {
        if (!deleteTargetId) return;

        $.ajax({
            url: '/inventory/ajax/delete/' + deleteTargetId + '/',
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                deleteModal.hide();
                loadProducts(currentPage);
                showToast(response.message, 'success');
            },
            error: function () {
                showToast('Failed to delete product.', 'danger');
            }
        });
    });

    // ===== Toast for notification =====
    function showToast(message, type) {
        const toastHtml = `
            <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3" style="z-index:9999;" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`;
        $('body').append(toastHtml);
        setTimeout(function () {
            $('.alert').alert('close');
        }, 3000);
    }

});