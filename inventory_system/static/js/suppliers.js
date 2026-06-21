$(document).ready(function () {

    let currentPage = 1;
    let deleteTargetId = null;

    const supplierModal = new bootstrap.Modal(document.getElementById('supplierModal'));
    const deleteSupplierModal = new bootstrap.Modal(document.getElementById('deleteSupplierModal'));

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

    // ===== تحميل الجدول =====
    function loadSuppliers(page = 1) {
        currentPage = page;
        const query = $('#supplierSearchInput').val();
        const status = $('#statusFilter').val();

        $('#supplierTableContainer').html('<div class="text-center text-muted py-4">Loading...</div>');

        $.ajax({
            url: '/suppliers/ajax/table/',
            method: 'GET',
            data: { q: query, status: status, page: page },
            success: function (response) {
                $('#supplierTableContainer').html(response.html);
            },
            error: function () {
                $('#supplierTableContainer').html('<div class="text-danger text-center py-4">Failed to load suppliers.</div>');
            }
        });
    }

    loadSuppliers();

    // search
    let searchTimeout;
    $('#supplierSearchInput').on('keyup', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            loadSuppliers(1);
        }, 400);
    });

    // filter
    $('#statusFilter').on('change', function () {
        loadSuppliers(1);
    });

    // pages
    $(document).on('click', '.page-link-ajax-supplier', function (e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (page) loadSuppliers(page);
    });

    // open modal
    $('#btnAddSupplier').on('click', function () {
        $('#supplierModalTitle').text('Add New Supplier');
        $.ajax({
            url: '/suppliers/ajax/form/',
            method: 'GET',
            success: function (response) {
                $('#supplierModalBody').html(response.html);
                $('#supplierForm').data('mode', 'create');
                supplierModal.show();
            }
        });
    });

    // modal update supplier
    $(document).on('click', '.btn-edit-supplier', function () {
        const supplierId = $(this).data('id');
        $('#supplierModalTitle').text('Edit Supplier');
        $.ajax({
            url: '/suppliers/ajax/form/' + supplierId + '/',
            method: 'GET',
            success: function (response) {
                $('#supplierModalBody').html(response.html);
                $('#supplierForm').data('mode', 'edit').data('id', supplierId);
                supplierModal.show();
            }
        });
    });

    // save form
    $(document).on('submit', '#supplierForm', function (e) {
        e.preventDefault();

        const mode = $(this).data('mode');
        const supplierId = $(this).data('id');
        const url = mode === 'edit'
            ? '/suppliers/ajax/save/' + supplierId + '/'
            : '/suppliers/ajax/save/';

        const formData = $(this).serialize();
        const submitBtn = $('#supplierSubmitBtn');
        submitBtn.prop('disabled', true).text('Saving...');

        $.ajax({
            url: url,
            method: 'POST',
            data: formData,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                if (response.success) {
                    supplierModal.hide();
                    loadSuppliers(currentPage);
                    showToast(response.message, 'success');
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON && xhr.responseJSON.html) {
                    $('#supplierModalBody').html(xhr.responseJSON.html);
                }
            },
            complete: function () {
                submitBtn.prop('disabled', false).text(mode === 'edit' ? 'Update Supplier' : 'Add Supplier');
            }
        });
    });

    // modal: ensure delete
    $(document).on('click', '.btn-delete-supplier', function () {
        deleteTargetId = $(this).data('id');
        $('#deleteSupplierName').text($(this).data('name'));
        deleteSupplierModal.show();
    });

    // delete
    $('#confirmDeleteSupplierBtn').on('click', function () {
        if (!deleteTargetId) return;

        $.ajax({
            url: '/suppliers/ajax/delete/' + deleteTargetId + '/',
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                deleteSupplierModal.hide();
                loadSuppliers(currentPage);
                showToast(response.message, 'success');
            },
            error: function () {
                showToast('Failed to delete supplier.', 'danger');
            }
        });
    });

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